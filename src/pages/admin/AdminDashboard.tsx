import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Users, GraduationCap, ClipboardList, ChevronRight,
  ChevronDown, UserCircle, Plus, Pencil, Trash2, BarChart3
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  studentCount: number;
}

interface KgTree {
  id: string;
  name: string;
  staff: StaffMember[];
  studentCount: number;
  surveyCount: number;
}

const AdminDashboard = () => {
  const { locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const [kgTrees, setKgTrees] = useState<KgTree[]>([]);
  const [totals, setTotals] = useState({ kgs: 0, staff: 0, students: 0, surveys: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedKgs, setExpandedKgs] = useState<Set<string>>(new Set());

  // Add KG dialog
  const [addKgOpen, setAddKgOpen] = useState(false);
  const [newKgName, setNewKgName] = useState("");
  const [addingKg, setAddingKg] = useState(false);

  // Edit KG dialog
  const [editKgOpen, setEditKgOpen] = useState(false);
  const [editKgId, setEditKgId] = useState("");
  const [editKgName, setEditKgName] = useState("");
  const [editingKg, setEditingKg] = useState(false);

  const load = async () => {
    const [kgRes, profilesRes, rolesRes, studentsRes, surveysRes] = await Promise.all([
      supabase.from("kindergartens").select("id, name").order("name"),
      supabase.from("profiles").select("id, full_name, kindergarten_id").not("kindergarten_id", "is", null),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("students").select("id, teacher_id, kindergarten_id"),
      supabase.from("surveys").select("id, teacher_id"),
    ]);

    const kindergartens = (kgRes.data || []) as { id: string; name: string }[];
    const profiles = (profilesRes.data || []) as { id: string; full_name: string; kindergarten_id: string }[];
    const roles = (rolesRes.data || []) as { user_id: string; role: string }[];
    const students = (studentsRes.data || []) as { id: string; teacher_id: string; kindergarten_id: string | null }[];
    const surveys = (surveysRes.data || []) as { id: string; teacher_id: string }[];

    const roleMap: Record<string, string> = {};
    roles.forEach(r => { roleMap[r.user_id] = r.role; });

    const studentsByTeacher: Record<string, number> = {};
    students.forEach(s => { studentsByTeacher[s.teacher_id] = (studentsByTeacher[s.teacher_id] || 0) + 1; });

    const trees: KgTree[] = kindergartens.map(kg => {
      const kgProfiles = profiles.filter(p => p.kindergarten_id === kg.id);
      const staff: StaffMember[] = kgProfiles
        .map(p => ({
          id: p.id, full_name: p.full_name,
          role: roleMap[p.id] || "teacher",
          studentCount: studentsByTeacher[p.id] || 0,
        }))
        .sort((a, b) => {
          if (a.role === "kg_admin" && b.role !== "kg_admin") return -1;
          if (a.role !== "kg_admin" && b.role === "kg_admin") return 1;
          return a.full_name.localeCompare(b.full_name);
        });

      const kgStudentCount = students.filter(s => s.kindergarten_id === kg.id).length;
      const kgTeacherIds = kgProfiles.map(p => p.id);
      const kgSurveyCount = surveys.filter(s => kgTeacherIds.includes(s.teacher_id)).length;

      return { id: kg.id, name: kg.name, staff, studentCount: kgStudentCount, surveyCount: kgSurveyCount };
    });

    setKgTrees(trees);
    setTotals({ kgs: kindergartens.length, staff: profiles.length, students: students.length, surveys: surveys.length });
    if (trees.length <= 3) setExpandedKgs(new Set(trees.map(t => t.id)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleKg = (id: string) => {
    setExpandedKgs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAddKg = async () => {
    if (!newKgName.trim() || !user) return;
    setAddingKg(true);
    const { error } = await supabase.from("kindergartens").insert({ name: newKgName.trim(), created_by: user.id });
    if (error) toast.error(error.message);
    else {
      toast.success(isAr ? "تمت إضافة الروضة بنجاح" : "Kindergarten added");
      setNewKgName("");
      setAddKgOpen(false);
      load();
    }
    setAddingKg(false);
  };

  const handleEditKg = async () => {
    if (!editKgName.trim()) return;
    setEditingKg(true);
    const { error } = await supabase.from("kindergartens").update({ name: editKgName.trim() }).eq("id", editKgId);
    if (error) toast.error(error.message);
    else {
      toast.success(isAr ? "تم تعديل اسم الروضة" : "Kindergarten updated");
      setEditKgOpen(false);
      load();
    }
    setEditingKg(false);
  };

  const handleDeleteKg = async (id: string) => {
    await supabase.from("kindergartens").delete().eq("id", id);
    toast.success(isAr ? "تم حذف الروضة" : "Kindergarten deleted");
    load();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{isAr ? "لوحة تحكم النظام" : "System Dashboard"}</h1>
            <p className="text-sm text-muted-foreground">{isAr ? "إدارة شاملة لجميع الروضات والحسابات" : "Full management of all kindergartens and accounts"}</p>
          </div>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Building2, value: totals.kgs, label: isAr ? "روضات" : "KGs", color: "text-primary" },
            { icon: Users, value: totals.staff, label: isAr ? "حسابات" : "Staff", color: "text-emerald-600" },
            { icon: GraduationCap, value: totals.students, label: isAr ? "طلاب" : "Students", color: "text-blue-600" },
            { icon: ClipboardList, value: totals.surveys, label: isAr ? "تقييمات" : "Surveys", color: "text-amber-600" },
          ].map((c, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-2.5 sm:p-3 flex flex-col items-center text-center">
                <c.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${c.color} mb-0.5`} />
                <p className="text-lg font-bold leading-none">{c.value}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => setAddKgOpen(true)} className="gap-1.5 text-xs h-10 justify-start">
            <Building2 className="h-4 w-4 text-primary" />
            {isAr ? "إضافة روضة" : "Add Kindergarten"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/teachers")} className="gap-1.5 text-xs h-10 justify-start">
            <UserCircle className="h-4 w-4 text-emerald-600" />
            {isAr ? "إنشاء حساب" : "Create Account"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/reports")} className="gap-1.5 text-xs h-10 justify-start sm:col-span-1 col-span-2">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            {isAr ? "التقارير" : "Reports"}
          </Button>
        </div>

        {/* Hierarchical KG Tree */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {isAr ? "هيكل الروضات" : "Kindergarten Structure"}
            </h2>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary" onClick={() => setAddKgOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              {isAr ? "روضة جديدة" : "New KG"}
            </Button>
          </div>

          {kgTrees.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center space-y-3">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-medium">{isAr ? "لا توجد روضات بعد" : "No kindergartens yet"}</p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "ابدأ بإضافة أول روضة ثم أضف المديرات والمعلمات" : "Start by adding a kindergarten, then add directors and teachers"}
                </p>
                <Button onClick={() => setAddKgOpen(true)} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  {isAr ? "إضافة روضة" : "Add Kindergarten"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            kgTrees.map(kg => (
              <Collapsible key={kg.id} open={expandedKgs.has(kg.id)} onOpenChange={() => toggleKg(kg.id)}>
                <Card className="overflow-hidden">
                  {/* KG Header */}
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold truncate">{kg.name}</p>
                          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Users className="h-3 w-3" /> {kg.staff.length} {isAr ? "حسابات" : "staff"}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <GraduationCap className="h-3 w-3" /> {kg.studentCount} {isAr ? "طالب" : "students"}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <ClipboardList className="h-3 w-3" /> {kg.surveyCount} {isAr ? "تقييم" : "surveys"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Edit KG */}
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditKgId(kg.id);
                            setEditKgName(kg.name);
                            setEditKgOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        {/* Delete KG */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{isAr ? "حذف الروضة" : "Delete Kindergarten"}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {isAr
                                  ? `هل أنت متأكد من حذف "${kg.name}"؟ سيتم حذف جميع البيانات المرتبطة بها.`
                                  : `Are you sure you want to delete "${kg.name}"? All associated data will be removed.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteKg(kg.id)}
                              >
                                {isAr ? "حذف نهائياً" : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {expandedKgs.has(kg.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Staff List */}
                  <CollapsibleContent>
                    <div className="border-t">
                      {kg.staff.length === 0 ? (
                        <div className="p-4 text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {isAr ? "لا توجد حسابات في هذه الروضة" : "No staff in this kindergarten"}
                          </p>
                          <Button size="sm" variant="outline" onClick={() => navigate("/admin/teachers")} className="gap-1 text-xs">
                            <Plus className="h-3.5 w-3.5" />
                            {isAr ? "إضافة حساب" : "Add Account"}
                          </Button>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {kg.staff.map(member => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between px-4 sm:px-5 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => navigate(`/students?teacher=${member.id}`)}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1 ps-4 sm:ps-6">
                                <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium truncate">{member.full_name}</span>
                                    <Badge
                                      variant={member.role === "kg_admin" ? "default" : "outline"}
                                      className="text-[9px] px-1.5 py-0 shrink-0"
                                    >
                                      {member.role === "kg_admin" ? (isAr ? "مديرة" : "Director") : (isAr ? "معلمة" : "Teacher")}
                                    </Badge>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <GraduationCap className="h-3 w-3" />
                                    {member.studentCount} {isAr ? "طالب" : "students"}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 rtl:rotate-180" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer actions */}
                      <div className="border-t px-3 py-2 bg-muted/20 flex items-center gap-2 flex-wrap">
                        <Button variant="ghost" size="sm" className="text-xs h-8 text-primary gap-1" onClick={() => navigate(`/admin/kindergartens/${kg.id}`)}>
                          {isAr ? "تفاصيل الروضة" : "KG Details"}
                          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" onClick={() => navigate("/admin/teachers")}>
                          <Plus className="h-3 w-3" />
                          {isAr ? "إضافة حساب" : "Add Account"}
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>
      </div>

      {/* Add KG Dialog */}
      <Dialog open={addKgOpen} onOpenChange={setAddKgOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة روضة جديدة" : "Add New Kindergarten"}</DialogTitle>
            <DialogDescription>{isAr ? "أدخل اسم الروضة الجديدة" : "Enter the name for the new kindergarten"}</DialogDescription>
          </DialogHeader>
          <Input
            value={newKgName}
            onChange={(e) => setNewKgName(e.target.value)}
            placeholder={isAr ? "اسم الروضة..." : "Kindergarten name..."}
            onKeyDown={(e) => e.key === "Enter" && handleAddKg()}
          />
          <DialogFooter>
            <Button onClick={handleAddKg} disabled={addingKg || !newKgName.trim()} className="w-full">
              {addingKg ? (isAr ? "جاري الإضافة..." : "Adding...") : (isAr ? "إضافة" : "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit KG Dialog */}
      <Dialog open={editKgOpen} onOpenChange={setEditKgOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isAr ? "تعديل اسم الروضة" : "Edit Kindergarten Name"}</DialogTitle>
            <DialogDescription>{isAr ? "أدخل الاسم الجديد" : "Enter the new name"}</DialogDescription>
          </DialogHeader>
          <Input
            value={editKgName}
            onChange={(e) => setEditKgName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEditKg()}
          />
          <DialogFooter>
            <Button onClick={handleEditKg} disabled={editingKg || !editKgName.trim()} className="w-full">
              {editingKg ? (isAr ? "جاري التعديل..." : "Updating...") : (isAr ? "حفظ" : "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDashboard;
