import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { addSurvey } from "@/lib/database";
import { DbStudent } from "@/lib/database";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Share2, ImagePlus, X } from "lucide-react";

interface DailyCheckInProps {
  student: DbStudent;
  onComplete: () => void;
}

const dailyQuestions = [
  {
    id: "mood",
    titleAr: "مزاج الطفل اليوم",
    titleEn: "Child's mood today",
    options: [
      { emoji: "😄", labelAr: "سعيد جداً", labelEn: "Very Happy", value: 5 },
      { emoji: "🙂", labelAr: "سعيد", labelEn: "Happy", value: 4 },
      { emoji: "😐", labelAr: "عادي", labelEn: "Neutral", value: 3 },
      { emoji: "😟", labelAr: "حزين", labelEn: "Sad", value: 2 },
      { emoji: "😢", labelAr: "منزعج جداً", labelEn: "Very Upset", value: 1 },
    ],
  },
  {
    id: "energy",
    titleAr: "مستوى الطاقة والنشاط",
    titleEn: "Energy & activity level",
    options: [
      { emoji: "⚡", labelAr: "نشيط جداً", labelEn: "Very Active", value: 5 },
      { emoji: "🏃", labelAr: "نشيط", labelEn: "Active", value: 4 },
      { emoji: "🚶", labelAr: "عادي", labelEn: "Normal", value: 3 },
      { emoji: "🧘", labelAr: "هادئ", labelEn: "Calm", value: 2 },
      { emoji: "😴", labelAr: "متعب", labelEn: "Tired", value: 1 },
    ],
  },
  {
    id: "social",
    titleAr: "التفاعل مع الأقران",
    titleEn: "Interaction with peers",
    options: [
      { emoji: "🤝", labelAr: "تعاوني جداً", labelEn: "Very Cooperative", value: 5 },
      { emoji: "👫", labelAr: "تفاعل جيد", labelEn: "Good Interaction", value: 4 },
      { emoji: "🧒", labelAr: "تفاعل عادي", labelEn: "Normal", value: 3 },
      { emoji: "🤫", labelAr: "منعزل قليلاً", labelEn: "Slightly Isolated", value: 2 },
      { emoji: "😶", labelAr: "منعزل", labelEn: "Isolated", value: 1 },
    ],
  },
  {
    id: "eating",
    titleAr: "تناول الوجبة",
    titleEn: "Meal intake",
    options: [
      { emoji: "🍽️", labelAr: "أكل جيداً", labelEn: "Ate well", value: 5 },
      { emoji: "🥗", labelAr: "أكل معظمها", labelEn: "Ate most", value: 4 },
      { emoji: "🍴", labelAr: "أكل قليلاً", labelEn: "Ate little", value: 3 },
      { emoji: "🚫", labelAr: "لم يأكل", labelEn: "Didn't eat", value: 1 },
    ],
  },
  {
    id: "participation",
    titleAr: "المشاركة في الأنشطة",
    titleEn: "Activity participation",
    options: [
      { emoji: "🌟", labelAr: "مشاركة ممتازة", labelEn: "Excellent", value: 5 },
      { emoji: "👍", labelAr: "مشاركة جيدة", labelEn: "Good", value: 4 },
      { emoji: "🤷", labelAr: "مشاركة محدودة", labelEn: "Limited", value: 3 },
      { emoji: "😶", labelAr: "لم يشارك", labelEn: "Didn't participate", value: 1 },
    ],
  },
  {
    id: "following_rules",
    titleAr: "الالتزام بالقواعد",
    titleEn: "Following rules",
    options: [
      { emoji: "✅", labelAr: "ملتزم تماماً", labelEn: "Fully compliant", value: 5 },
      { emoji: "👌", labelAr: "ملتزم غالباً", labelEn: "Mostly compliant", value: 4 },
      { emoji: "⚠️", labelAr: "يحتاج تذكير", labelEn: "Needs reminders", value: 3 },
      { emoji: "❌", labelAr: "صعوبة في الالتزام", labelEn: "Difficulty complying", value: 1 },
    ],
  },
  {
    id: "independence",
    titleAr: "الاستقلالية (ملابس، حمام، ترتيب)",
    titleEn: "Independence (dressing, toilet, organizing)",
    options: [
      { emoji: "💪", labelAr: "مستقل تماماً", labelEn: "Fully independent", value: 5 },
      { emoji: "👍", labelAr: "يحتاج مساعدة بسيطة", labelEn: "Needs little help", value: 4 },
      { emoji: "🤲", labelAr: "يحتاج مساعدة متوسطة", labelEn: "Needs moderate help", value: 3 },
      { emoji: "🧑‍🤝‍🧑", labelAr: "يحتاج مساعدة كاملة", labelEn: "Needs full help", value: 1 },
    ],
  },
];

function buildDailyReportMessage(student: DbStudent, answers: Record<string, number>, isAr: boolean): string {
  const date = new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  
  const getLabel = (qId: string, value: number) => {
    const q = dailyQuestions.find(dq => dq.id === qId);
    const opt = q?.options.find(o => o.value === value);
    if (!opt) return "";
    return `${opt.emoji} ${isAr ? opt.labelAr : opt.labelEn}`;
  };

  if (isAr) {
    return `🌈 *التقرير اليومي - روضة كيندر BH*
📅 ${date}

👶 *الطفل/ة:* ${student.name}

📊 *ملخص اليوم:*

😊 المزاج: ${getLabel("mood", answers.mood)}
⚡ الطاقة: ${getLabel("energy", answers.energy)}
👥 التفاعل: ${getLabel("social", answers.social)}
🍽️ الوجبة: ${getLabel("eating", answers.eating)}
🎯 المشاركة: ${getLabel("participation", answers.participation)}
📏 الالتزام: ${getLabel("following_rules", answers.following_rules)}
💪 الاستقلالية: ${getLabel("independence", answers.independence)}

✨ نتمنى لطفلكم يوماً سعيداً!
مع تحيات المعلمة 🌸
روضة كيندر BH`;
  }

  return `🌈 *Daily Report - Kinder BH*
📅 ${date}

👶 *Child:* ${student.name}

📊 *Today's Summary:*

😊 Mood: ${getLabel("mood", answers.mood)}
⚡ Energy: ${getLabel("energy", answers.energy)}
👥 Social: ${getLabel("social", answers.social)}
🍽️ Meal: ${getLabel("eating", answers.eating)}
🎯 Participation: ${getLabel("participation", answers.participation)}
📏 Rules: ${getLabel("following_rules", answers.following_rules)}
💪 Independence: ${getLabel("independence", answers.independence)}

✨ Wishing your child a wonderful day!
Best regards, Teacher 🌸
Kinder BH`;
}

export function DailyCheckIn({ student, onComplete }: DailyCheckInProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const isAr = locale === "ar";
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const allAnswered = dailyQuestions.every(q => answers[q.id] !== undefined);

  const handleAttachPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isAr ? "حجم الصورة كبير جداً (أقصى 5MB)" : "Image too large (max 5MB)");
      return;
    }
    setAttachedPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setAttachedPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!user || !allAnswered) return;
    setSaving(true);
    const surveyAnswers: Record<string, number | string> = {};
    dailyQuestions.forEach(q => {
      surveyAnswers[`daily_${q.id}`] = answers[q.id];
    });
    surveyAnswers["_type"] = "daily";
    
    const result = await addSurvey({ student_id: student.id, teacher_id: user.id, answers: surveyAnswers });
    setSaving(false);
    if (result) {
      setSaved(true);
      toast.success(isAr ? "تم حفظ التقييم اليومي ✅" : "Daily check-in saved ✅");
    } else {
      toast.error(isAr ? "خطأ في الحفظ" : "Error saving");
    }
  };

  const handleShareWhatsApp = async () => {
    const msg = buildDailyReportMessage(student, answers, isAr);

    // Try Web Share API with photo if available (works on mobile)
    if (attachedPhoto && navigator.share && navigator.canShare) {
      try {
        const shareData: ShareData = {
          text: msg,
          files: [attachedPhoto],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success(isAr ? "تمت المشاركة ✅" : "Shared ✅");
          return;
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        // Fall through to WhatsApp link
      }
    }

    // Fallback: open WhatsApp with text only
    const photoNote = attachedPhoto
      ? (isAr ? "\n\n📸 *ملاحظة:* تم إرفاق صورة من نشاط الطفل اليوم (سيتم إرسالها بشكل منفصل)" : "\n\n📸 *Note:* A photo from today's activity is attached (will be sent separately)")
      : "";
    window.open(`https://wa.me/?text=${encodeURIComponent(msg + photoNote)}`, "_blank");
  };

  if (saved) {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
            <CheckCircle className="h-14 w-14 text-primary" />
            <h3 className="text-lg font-bold">{isAr ? "تم حفظ التقييم اليومي! ✅" : "Daily Check-in Saved! ✅"}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {isAr ? "يمكنك إرفاق صورة من نشاط اليوم ثم إرسال التقرير لولي الأمر" : "You can attach a photo from today's activity then send the report to parent"}
            </p>

            {/* Photo attachment section */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleAttachPhoto}
            />

            {photoPreview ? (
              <div className="relative w-full max-w-xs">
                <img src={photoPreview} alt="" className="w-full h-40 object-cover rounded-xl border border-border" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Badge className="absolute bottom-2 left-2 text-[10px] bg-primary/90">
                  📸 {isAr ? "صورة مرفقة" : "Photo attached"}
                </Badge>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => photoInputRef.current?.click()}
                className="w-full max-w-xs h-11 gap-2 text-sm border-dashed border-2"
              >
                <ImagePlus className="h-4 w-4" />
                {isAr ? "📷 إرفاق صورة من نشاط اليوم" : "📷 Attach photo from today"}
              </Button>
            )}

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={handleShareWhatsApp} className="h-12 gap-2 text-sm w-full">
                <Share2 className="h-5 w-5" />
                {attachedPhoto
                  ? (isAr ? "📤 إرسال التقرير مع الصورة" : "📤 Send Report with Photo")
                  : (isAr ? "📤 إرسال لولي الأمر عبر واتساب" : "📤 Send to Parent via WhatsApp")}
              </Button>
              <Button variant="outline" onClick={onComplete} className="h-10 text-sm w-full">
                {isAr ? "تم ✅" : "Done ✅"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3" dir={isAr ? "rtl" : "ltr"}>
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold">{isAr ? "📋 التقييم اليومي" : "📋 Daily Check-in"}</h3>
        <p className="text-xs text-muted-foreground">{isAr ? "اختاري الإيموجي المناسب لحالة الطفل اليوم" : "Select the emoji that matches the child's state today"}</p>
        <Badge variant="secondary" className="text-[10px]">
          {Object.keys(answers).length}/{dailyQuestions.length} {isAr ? "مكتمل" : "completed"}
        </Badge>
      </div>

      {dailyQuestions.map((question, qi) => (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: qi * 0.05 }}
        >
          <Card className={answers[question.id] !== undefined ? "border-primary/20" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{isAr ? question.titleAr : question.titleEn}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between gap-1">
                {question.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(prev => ({ ...prev, [question.id]: opt.value }))}
                    className={`flex flex-col items-center gap-1 rounded-xl p-1.5 flex-1 min-h-[64px] transition-all duration-200 touch-manipulation active:scale-95 border-2 ${
                      answers[question.id] === opt.value
                        ? "bg-primary/10 border-primary shadow-sm scale-[1.05]"
                        : "bg-muted/30 border-transparent hover:border-primary/20"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-[8px] leading-tight text-center text-muted-foreground">
                      {isAr ? opt.labelAr : opt.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <Button
        onClick={handleSave}
        disabled={!allAnswered || saving}
        className="w-full h-12 gap-2 text-sm font-semibold"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
        {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ وإرسال للأهل" : "Save & Send to Parent")}
      </Button>
    </div>
  );
}
