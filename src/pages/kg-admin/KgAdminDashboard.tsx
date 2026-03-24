import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, ClipboardList, Brain, ChevronRight } from "lucide-react";
import { KgCharts } from "@/components/kg-admin/KgCharts";
import { KgInsights } from "@/components/kg-admin/KgInsights";
import { useNavigate } from "react-router-dom";

interface TeacherInfo { id: string; full_name: string; }
interface StudentInfo { id: string; name: string; age: number; gender: string; teacher_id: string; }
interface SurveyInfo { id: string; student_id: string; teacher_id: string; date: string | null; analysis: any; }

const KgAdminDashboard = () => {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const { kindergartenName, kindergartenId } = useRole();
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [surveys, setSurveys] = useState<SurveyInfo[]>([]);

  useEffect(() => {
    if (!kindergartenId) return;
    const load = async () => {
      const [profilesRes, studentsRes, surveysRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("kindergarten_id", kindergartenId),
        supabase.from("students").select("id, name, age, gender, teacher_id").eq("kindergarten_id", kindergartenId),
        supabase.from("surveys").select("id, student_id, teacher_id, date, analysis"),
      ]);
      setTeachers((profilesRes.data || []) as TeacherInfo[]);
      setStudents((studentsRes.data || []) as StudentInfo[]);
      setSurveys((surveysRes.data || []) as SurveyInfo[]);
    };
    load();
  }, [kindergartenId]);

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.full_name || "—";
  const analyzedCount = surveys.filter(s => s.analysis).length;

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {kindergartenName || (isAr ? "روضتي" : "My Kindergarten")}
          </h1>
          <p className="text-sm text-muted-foreground">{isAr ? "نظرة شاملة على الروضة" : "Kindergarten overview"}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Users, value: teachers.length, label: isAr ? "معلمات" : "Teachers", color: "text-primary" },
            { icon: GraduationCap, value: students.length, label: isAr ? "طلاب" : "Students", color: "text-accent-foreground" },
            { icon: ClipboardList, value: surveys.length, label: isAr ? "تقييمات" : "Surveys", color: "text-secondary-foreground" },
            { icon: Brain, value: analyzedCount, label: isAr ? "تحليلات" : "Analyzed", color: "text-primary" },
          ].map((c, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex flex-col items-center text-center">
                <c.icon className={`h-5 w-5 ${c.color} mb-1`} />
                <p className="text-lg font-bold leading-none">{c.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Insights */}
        <KgInsights students={students} surveys={surveys} teachers={teachers} />

        {/* Charts */}
        <KgCharts students={students} surveys={surveys} teachers={teachers} />

        {/* Teachers list - clickable */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isAr ? "المعلمات" : "Teachers"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-2">
              {teachers.map(t => {
                const teacherStudents = students.filter(s => s.teacher_id === t.id);
                const teacherSurveys = surveys.filter(s => s.teacher_id === t.id);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students?teacher=${t.id}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">👩‍🏫</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {teacherStudents.length} {isAr ? "طالب" : "students"} • {teacherSurveys.length} {isAr ? "تقييم" : "surveys"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 rtl:rotate-180" />
                  </div>
                );
              })}
              {teachers.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">{isAr ? "لا توجد معلمات بعد" : "No teachers yet"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students list - clickable */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {isAr ? "جميع الطلاب" : "All Students"}
              <Badge variant="secondary" className="text-[10px]">{students.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-2">
              {students.map(s => {
                const studentSurveys = surveys.filter(sv => sv.student_id === s.id);
                const latestAnalyzed = studentSurveys.find(sv => sv.analysis);
                const indicatorType = latestAnalyzed?.analysis?.indicators?.type;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students/${s.id}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{s.gender === "male" ? "👦" : "👧"}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          {indicatorType && (
                            <Badge variant={indicatorType === "gifted" ? "default" : indicatorType === "delayed" ? "destructive" : "secondary"} className="text-[9px]">
                              {indicatorType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {isAr ? `${s.age} سنوات` : `${s.age} yrs`} • {getTeacherName(s.teacher_id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {studentSurveys.length} {isAr ? "تقييم" : "surveys"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                    </div>
                  </div>
                );
              })}
              {students.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">{isAr ? "لا يوجد طلاب بعد" : "No students yet"}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KgAdminDashboard;
