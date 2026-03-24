import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { toast } from "sonner";
import { Camera, Trash2, AlertTriangle, ImagePlus, X } from "lucide-react";
import { saveStudentPhoto, getStudentPhotos, deleteStudentPhoto, LocalPhoto } from "@/lib/localPhotos";
import { motion, AnimatePresence } from "framer-motion";

interface StudentPhotosProps {
  studentId: string;
  studentName: string;
}

export function StudentPhotos({ studentId, studentName }: StudentPhotosProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPhoto, setViewPhoto] = useState<LocalPhoto | null>(null);

  useEffect(() => {
    getStudentPhotos(studentId).then(p => {
      setPhotos(p);
      setLoading(false);
    });
  }, [studentId]);

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(isAr ? "حجم الصورة كبير جداً (أقصى 5MB)" : "Image too large (max 5MB)");
        continue;
      }
      try {
        const photo = await saveStudentPhoto(studentId, file);
        setPhotos(prev => [photo, ...prev]);
        toast.success(isAr ? "تم حفظ الصورة محلياً ✅" : "Photo saved locally ✅");
      } catch {
        toast.error(isAr ? "خطأ في حفظ الصورة" : "Error saving photo");
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (photoId: string) => {
    await deleteStudentPhoto(photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    setViewPhoto(null);
    toast.success(isAr ? "تم حذف الصورة" : "Photo deleted");
  };

  return (
    <div className="space-y-3" dir={isAr ? "rtl" : "ltr"}>
      {/* Local storage warning */}
      <Card className="border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {isAr
              ? "⚠️ الصور مخزنة محلياً فقط على هذا الجهاز. في حال حذف التطبيق أو مسح بيانات المتصفح، لن يمكن استرجاعها."
              : "⚠️ Photos are stored locally on this device only. If the app is deleted or browser data is cleared, they cannot be recovered."}
          </div>
        </CardContent>
      </Card>

      {/* Add Photo Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddPhoto}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-11 gap-2 text-sm"
      >
        <ImagePlus className="h-4 w-4" />
        {isAr ? "إضافة صور" : "Add Photos"}
        <Badge variant="secondary" className="text-[10px]">{photos.length}</Badge>
      </Button>

      {/* Photo Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>
      ) : photos.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-6 text-center space-y-2">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {isAr ? "لا توجد صور بعد" : "No photos yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAr ? "أضيفي صوراً لتوثيق أنشطة الطفل" : "Add photos to document child activities"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-border"
              onClick={() => setViewPhoto(photo)}
            >
              <img
                src={photo.dataUrl}
                alt={studentName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                <p className="text-[8px] text-white">
                  {new Date(photo.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full screen photo viewer */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={() => setViewPhoto(null)}
          >
            <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
              <Button variant="ghost" size="icon" onClick={() => setViewPhoto(null)} className="text-white hover:bg-white/20 rounded-full">
                <X className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleDelete(viewPhoto.id); }}
                className="text-red-400 hover:bg-red-500/20 rounded-full"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            <img
              src={viewPhoto.dataUrl}
              alt={studentName}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/70 text-xs mt-3">
              {new Date(viewPhoto.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
