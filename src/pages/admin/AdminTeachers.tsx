import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, CheckCircle2, Loader2, Eye, EyeOff, GraduationCap, ChevronRight, Trash2, FileDown, MessageCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateCredentialPdf, buildCredentialWhatsAppMessage } from "@/lib/credentialsPdf";

interface Kindergarten { id: string; name: string; }
interface TeacherProfile {
  id: string;
  full_name: string;
  kindergarten_id: string | null;
  role?: string;
  studentCount?: number;
}

type CreateRole = "teacher" | "kg_admin";

const AdminTeachers = () => {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [selectedKg, setSelectedKg] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CreateRole>("teacher");

  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");

  // Credential sharing state
  const [shareOpen, setShareOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string; email: string; password: string; role: string; kindergartenName: string;
  } | null>(null);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("kindergartens").select("id, name").order("name").then(({ data }) => setKindergartens((data || []) as Kindergarten[]));
  }, []);

  const loadTeachers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, kindergarten_id").not("kindergarten_id", "is", null);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: students } = await supabase.from("students").select("id, teacher_id");

    const roleMap: Record<string, string> = {};
    (roles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });
    const studentCountMap: Record<string, number> = {};
    (students || []).forEach((s: any) => { studentCountMap[s.teacher_id] = (studentCountMap[s.teacher_id] || 0) + 1; });

    const enriched = (profiles || []).map((p: any) => ({
      ...p, role: roleMap[p.id] || "teacher", studentCount: studentCountMap[p.id] || 0,
    }));
    setTeachers(enriched as TeacherProfile[]);
  };

  useEffect(() => { loadTeachers(); }, []);

  const handleCreateTeacher = async () => {
    if (!selectedKg || !teacherName.trim() || !teacherEmail.trim() || !teacherPassword) return;
    if (teacherPassword.length < 6) {
      toast.error(isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-teacher", {
        body: {
          email: teacherEmail.trim().toLowerCase(),
          password: teacherPassword,
          fullName: teacherName.trim(),
          kindergartenId: selectedKg,
          role: selectedRole,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const roleLabel = selectedRole === "kg_admin" ? (isAr ? "مديرة روضة" : "KG Director") : (isAr ? "معلمة" : "Teacher");
      const kgName = kindergartens.find(k => k.id === selectedKg)?.name || "";

      // Save credentials for sharing
      setCreatedCredentials({
        name: teacherName.trim(),
        email: teacherEmail.trim().toLowerCase(),
        password: teacherPassword,
        role: roleLabel,
        kindergartenName: kgName,
      });
      setShareOpen(true);

      toast.success(isAr ? `تم إنشاء حساب ${roleLabel}: ${teacherName}` : `${roleLabel} account created: ${teacherName}`);
      setTeacherName("");
      setTeacherEmail("");
      setTeacherPassword("");
      loadTeachers();
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ" : "An error occurred"));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeacher = async (teacher: TeacherProfile) => {
    setDeleting(teacher.id);
    try {
      const { data, error } = await supabase.functions.invoke("delete-teacher", { body: { userId: teacher.id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(isAr ? `تم حذف الحساب: ${teacher.full_name}` : `Account deleted: ${teacher.full_name}`);
      loadTeachers();
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ" : "An error occurred"));
    } finally {
      setDeleting(null);
    }
  };

  const handleDownloadPdf = () => {
    if (!createdCredentials) return;
    generateCredentialPdf({ ...createdCredentials, isAr });
    toast.success(isAr ? "تم تحميل ملف PDF" : "PDF downloaded");
  };

  const handleShareWhatsApp = () => {
    if (!createdCredentials) return;
    const msg = buildCredentialWhatsAppMessage({ ...createdCredentials, isAr });
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success(isAr ? "تم فتح واتساب" : "WhatsApp opened");
  };

  const handleOpenEdit = (teacher: TeacherProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTeacher(teacher);
    setEditName(teacher.full_name);
    setEditEmail(""); // email not stored in profiles, user fills it
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher || (!editName.trim() && !editEmail.trim())) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-teacher", {
        body: { userId: editingTeacher.id, fullName: editName.trim() || undefined, email: editEmail.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(isAr ? "تم تحديث البيانات بنجاح" : "Account updated successfully");
      setEditOpen(false);
      loadTeachers();
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ" : "An error occurred"));
    } finally {
      setSaving(false);
    }
  };

  const getKgName = (id: string) => kindergartens.find((k) => k.id === id)?.name || "—";
  const filteredTeachers = selectedKg ? teachers.filter((t) => t.kindergarten_id === selectedKg) : teachers;

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{isAr ? "إدارة الحسابات" : "Manage Accounts"}</h1>
          <p className="text-sm text-muted-foreground">{isAr ? "إنشاء حسابات وإدارة معلمات ومديرات الروضات" : "Create accounts and manage teachers and directors"}</p>
        </div>

        {/* Create Account Card */}
        <Card>
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {isAr ? "إنشاء حساب جديد" : "Create New Account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3 sm:px-6">
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? "الدور" : "Role"}</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as CreateRole)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">{isAr ? "👩‍🏫 معلمة" : "👩‍🏫 Teacher"}</SelectItem>
                  <SelectItem value="kg_admin">{isAr ? "👩‍💼 مديرة روضة" : "👩‍💼 KG Director"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? "الروضة" : "Kindergarten"}</Label>
              <Select value={selectedKg} onValueChange={setSelectedKg}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={isAr ? "اختر الروضة..." : "Select kindergarten..."} />
                </SelectTrigger>
                <SelectContent>
                  {kindergartens.map((kg) => (<SelectItem key={kg.id} value={kg.id}>{kg.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? "الاسم" : "Full Name"}</Label>
              <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder={isAr ? "الاسم الكامل..." : "Full name..."} className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? "البريد الإلكتروني" : "Email"}</Label>
              <Input type="email" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} placeholder="user@school.com" className="text-sm" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? "كلمة المرور المؤقتة" : "Temporary Password"}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"} value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)} placeholder="••••••••"
                  className="text-sm pe-10" dir="ltr" minLength={6}
                />
                <Button type="button" variant="ghost" size="icon" className="absolute end-0 top-0 h-full w-10" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleCreateTeacher} disabled={!selectedKg || !teacherName.trim() || !teacherEmail.trim() || !teacherPassword || creating} className="w-full" size="sm">
              {creating ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <UserPlus className="h-4 w-4 me-2" />}
              {isAr ? "إنشاء الحساب" : "Create Account"}
            </Button>
          </CardContent>
        </Card>

        {/* Registered Accounts */}
        <Card>
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isAr ? "الحسابات المسجلة" : "Registered Accounts"}
              {filteredTeachers.length > 0 && <Badge variant="secondary" className="text-[10px]">{filteredTeachers.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-2">
              {filteredTeachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/students?teacher=${t.id}`)}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{t.full_name}</span>
                        <Badge variant={t.role === "kg_admin" ? "default" : "outline"} className="text-[9px] px-1.5 py-0 shrink-0">
                          {t.role === "kg_admin" ? (isAr ? "مديرة" : "Director") : (isAr ? "معلمة" : "Teacher")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{t.kindergarten_id ? getKgName(t.kindergarten_id) : "—"}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <GraduationCap className="h-3 w-3" /> {t.studentCount || 0} {isAr ? "طالب" : "students"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => handleOpenEdit(t, e)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                          {deleting === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{isAr ? "حذف الحساب" : "Delete Account"}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {isAr ? `هل أنت متأكد من حذف حساب "${t.full_name}"؟ سيتم حذف جميع البيانات المرتبطة نهائياً.` : `Are you sure you want to delete "${t.full_name}"'s account? All data will be permanently deleted.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteTeacher(t)}>
                            {isAr ? "حذف نهائياً" : "Delete Permanently"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                  </div>
                </div>
              ))}
              {filteredTeachers.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">{isAr ? "لا توجد حسابات بعد" : "No accounts yet"}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Credentials Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {isAr ? "تم إنشاء الحساب بنجاح!" : "Account Created Successfully!"}
            </DialogTitle>
            <DialogDescription>
              {isAr ? "شارك بيانات الدخول مع المستخدم الجديد" : "Share login credentials with the new user"}
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-3">
              <Card className="bg-muted/50">
                <CardContent className="p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isAr ? "الاسم:" : "Name:"}</span>
                    <span className="font-medium">{createdCredentials.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isAr ? "الدور:" : "Role:"}</span>
                    <span className="font-medium">{createdCredentials.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isAr ? "الروضة:" : "KG:"}</span>
                    <span className="font-medium">{createdCredentials.kindergartenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isAr ? "البريد:" : "Email:"}</span>
                    <span className="font-medium" dir="ltr">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isAr ? "كلمة المرور:" : "Password:"}</span>
                    <span className="font-medium font-mono" dir="ltr">{createdCredentials.password}</span>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleDownloadPdf} className="gap-1.5 text-xs h-10">
                  <FileDown className="h-4 w-4" />
                  {isAr ? "تحميل PDF" : "Download PDF"}
                </Button>
                <Button onClick={handleShareWhatsApp} className="gap-1.5 text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <MessageCircle className="h-4 w-4" />
                  {isAr ? "إرسال واتساب" : "Send WhatsApp"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              {isAr ? "تعديل بيانات الحساب" : "Edit Account"}
            </DialogTitle>
            <DialogDescription>
              {isAr ? "تعديل الاسم أو البريد الإلكتروني" : "Update name or email address"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? "الاسم" : "Full Name"}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder={isAr ? "الاسم الكامل..." : "Full name..."} className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{isAr ? "البريد الإلكتروني الجديد (اختياري)" : "New Email (optional)"}</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="user@school.com" className="text-sm" dir="ltr" />
            </div>
            <Button onClick={handleSaveEdit} disabled={saving || (!editName.trim() && !editEmail.trim())} className="w-full" size="sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Pencil className="h-4 w-4 me-2" />}
              {isAr ? "حفظ التعديلات" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminTeachers;
