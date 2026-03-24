import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import {
  ArrowRight, Building2, Users, GraduationCap, ClipboardList,
  ChevronRight, UserCircle
} from "lucide-react";

interface Teacher {
  id: string;
  full_name: string;
  role: string;
  studentCount: number;
}

interface Student {
  id: string;
  name: string;
  age: number;
  gender: string;
  teacher_id: string;
  teacherName?: string;
}

const AdminKindergartenDetail = () => {
  const { kgId } = useParams<{ kgId: string }>();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [kgName, setKgName] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [surveyCount, setSurveyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kgId) return;
    const load = async () => {
      setLoading(true);

      // Fetch KG name
      const { data: kg } = await supabase.from("kindergartens").select("name").eq("id", kgId).single();
      setKgName(kg?.name || "");

      // Fetch profiles in this KG
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").eq("kindergarten_id", kgId);
      const profileList = (profiles || []) as { id: string; full_name: string }[];
      const profileIds = profileList.map(p => p.id);

      // Fetch roles for these profiles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap: Record<string, string> = {};
      (roles || []).forEach((r: any) => {
        if (profileIds.includes(r.user_id)) roleMap[r.user_id] = r.role;
      });

      // Fetch students in this KG
      const { data: studentData } = await supabase.from("students").select("id, name, age, gender, teacher_id").eq("kindergarten_id", kgId).order("name");
      const studentList = (studentData || []) as Student[];

      // Build teacher name map
      const teacherNameMap: Record<string, string> = {};
      profileList.forEach(p => { teacherNameMap[p.id] = p.full_name; });

      // Count students per teacher
      const studentCountMap: Record<string, number> = {};
      studentList.forEach(s => {
        studentCountMap[s.teacher_id] = (studentCountMap[s.teacher_id] || 0) + 1;
      });

      const enrichedTeachers: Teacher[] = profileList.map(p => ({
        id: p.id,
        full_name: p.full_name,
        role: roleMap[p.id] || "teacher",
        studentCount: studentCountMap[p.id] || 0,
      }));

      const enrichedStudents = studentList.map(s => ({
        ...s,
        teacherName: teacherNameMap[s.teacher_id] || "—",
      }));

      setTeachers(enrichedTeachers);
      setStudents(enrichedStudents);

      // Count surveys
      const teacherIds = profileList.map(p => p.id);
      if (teacherIds.length > 0) {
        const { count } = await supabase.from("surveys").select("id", { count: "exact", head: true }).in("teacher_id", teacherIds);
        setSurveyCount(count || 0);
      }

      setLoading(false);
    };
    load();
  }, [kgId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { icon: Users, label: isAr ? "المعلمات" : "Teachers", value: teachers.length, color: "text-[hsl(142,71%,45%)]" },
    { icon: GraduationCap, label: isAr ? "الطلاب" : "Students", value: students.length, color: "text-primary" },
    { icon: ClipboardList, label: isAr ? "التقييمات" : "Assessments", value: surveyCount, color: "text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/kindergartens")} className="gap-1 text-xs">
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            {isAr ? "رجوع" : "Back"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{kgName}</h1>
            <p className="text-xs text-muted-foreground">{isAr ? "تفاصيل الروضة" : "Kindergarten Details"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 flex flex-col items-center gap-1">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teachers */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {isAr ? "المعلمات والمديرات" : "Teachers & Directors"}
              <Badge variant="secondary" className="text-[10px]">{teachers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {teachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">{isAr ? "لا توجد حسابات بعد" : "No accounts yet"}</p>
            ) : (
              <div className="space-y-2">
                {teachers.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students?teacher=${t.id}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <UserCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm truncate">{t.full_name}</span>
                          <Badge variant={t.role === "kg_admin" ? "default" : "outline"} className="text-[9px] px-1.5 py-0 shrink-0">
                            {t.role === "kg_admin" ? (isAr ? "مديرة" : "Director") : (isAr ? "معلمة" : "Teacher")}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <GraduationCap className="h-3 w-3" /> {t.studentCount} {isAr ? "طالب" : "students"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 rtl:rotate-180" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              {isAr ? "جميع الطلاب" : "All Students"}
              <Badge variant="secondary" className="text-[10px]">{students.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {students.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">{isAr ? "لا يوجد طلاب بعد" : "No students yet"}</p>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-auto">
                {students.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students/${s.id}`)}
                  >
                    <span className="text-lg">{s.gender === "male" ? "👦" : "👧"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{isAr ? "العمر" : "Age"}: {s.age}</span>
                        <span>• {s.teacherName}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 rtl:rotate-180" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminKindergartenDetail;
