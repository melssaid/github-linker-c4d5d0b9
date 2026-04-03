import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, ClipboardList, FileText, Share2, Users } from "lucide-react";
import { useI18n } from "@/i18n";
import { DbStudent, DbSurvey, getStudents, getStudentSurveys, getAttendanceStats } from "@/lib/database";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { StudentPhotos } from "@/components/students/StudentPhotos";
import { ParentManager } from "@/components/students/ParentManager";
import { toast } from "sonner";

interface StudentProfilePageProps { initialTab?: string; }

const StudentProfilePage = ({ initialTab }: StudentProfilePageProps) => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [student, setStudent] = useState<DbStudent | null>(null);
  const [surveys, setSurveys] = useState<DbSurvey[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [selectedSurvey, setSelectedSurvey] = useState<DbSurvey | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([getStudents(), getStudentSurveys(studentId), getAttendanceStats(studentId)]).then(([allStudents, s, a]) => {
      const found = allStudents.find(st => st.id === studentId);
      setStudent(found || null);
      setSurveys(s);
      setAttendanceStats(a);
      setLoading(false);
    });
  }, [studentId, refreshKey]);

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full" /></div></DashboardLayout>;
  }

  if (!student) {
    return <DashboardLayout><div className="p-6 text-center space-y-4"><p className="text-muted-foreground">{isAr ? "لم يتم العثور على الطالب" : "Student not found"}</p><Button onClick={() => navigate("/students")}>{isAr ? "العودة للطلاب" : "Back to Students"}</Button></div></DashboardLayout>;
  }

  const latestSurvey = surveys.find(s => s.analysis);
  const adaptStudent = (s: DbStudent) => ({ id: s.id, name: s.name, age: s.age, gender: s.gender as "male" | "female", createdAt: s.created_at });
  const adaptSurvey = (s: DbSurvey) => ({ id: s.id, studentId: s.student_id, date: s.date, answers: s.answers, analysis: s.analysis });

  const handleAssessmentComplete = () => {
    setRefreshKey(k => k + 1);
    setActiveTab("reports");
    toast.success(isAr ? "تم حفظ التقييم" : "Assessment saved");
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 max-w-5xl mx-auto pb-24" dir={isAr ? "rtl" : "ltr"}>
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/students")} className="shrink-0 rounded-full h-10 w-10 hover:bg-primary/10"><ArrowLeft className="h-5 w-5" /></Button>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/40 flex items-center justify-center text-3xl shadow-md border-2 border-background shrink-0">{student.gender === "male" ? "👦" : "👧"}</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate">{student.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0.5">{isAr ? `${student.age} سنوات` : `${student.age} yrs`}</Badge>
                  <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5">{isAr ? `${surveys.length} تقييم` : `${surveys.length} surveys`}</Badge>
                </div>
              </div>
              <div className="hidden md:flex gap-2">
                <Button variant="outline" onClick={() => navigate("/daily-ops")} className="gap-2"><ClipboardList className="h-4 w-4" />{isAr ? "التشغيل اليومي" : "Daily Ops"}</Button>
                <Button onClick={() => navigate("/reports")} className="gap-2"><FileText className="h-4 w-4" />{isAr ? "التقارير" : "Reports"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold">{surveys.length}</div><div className="text-[10px] text-muted-foreground">{isAr ? "التقييمات" : "Surveys"}</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold">{surveys.filter(s => s.analysis).length}</div><div className="text-[10px] text-muted-foreground">{isAr ? "التقارير" : "Reports"}</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold">{attendanceStats?.rate || 0}%</div><div className="text-[10px] text-muted-foreground">{isAr ? "الحضور" : "Attendance"}</div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-5 h-12">
            <TabsTrigger value="overview">{isAr ? "عام" : "Overview"}</TabsTrigger>
            <TabsTrigger value="assess">{isAr ? "تقييم" : "Assess"}</TabsTrigger>
            <TabsTrigger value="reports">{isAr ? "تقارير" : "Reports"}</TabsTrigger>
            <TabsTrigger value="parents">{isAr ? "أهل" : "Parents"}</TabsTrigger>
            <TabsTrigger value="attendance">{isAr ? "حضور" : "Attendance"}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>{isAr ? "ملخص سريع" : "Quick summary"}</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4">{isAr ? "الوصول السريع إلى التقييمات والتقارير والتشغيل اليومي من ملف الطفل." : "Fast access to assessments, reports, and daily ops from the child profile."}</div>
                  <div className="rounded-2xl bg-slate-50 p-4">{isAr ? "هذا الملف هو نقطة العمل الأساسية للمعلمة والإدارة عند متابعة الطفل." : "This profile is the main working point for teachers and admins."}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>{isAr ? "إجراءات مباشرة" : "Direct actions"}</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                  <Button onClick={() => setActiveTab("assess")} className="gap-2"><ClipboardList className="h-4 w-4" />{isAr ? "بدء تقييم" : "Start assessment"}</Button>
                  <Button variant="outline" onClick={() => setActiveTab("reports")} className="gap-2"><FileText className="h-4 w-4" />{isAr ? "عرض التقارير" : "View reports"}</Button>
                  <Button variant="outline" onClick={() => navigate("/daily-ops")} className="gap-2"><Calendar className="h-4 w-4" />{isAr ? "الرجوع للتشغيل اليومي" : "Back to daily ops"}</Button>
                </CardContent>
              </Card>
            </div>
            <StudentPhotos studentId={student.id} studentName={student.name} />
          </TabsContent>

          <TabsContent value="assess">
            <SurveyForm student={student} onComplete={handleAssessmentComplete} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-3">
            {selectedSurvey ? (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedSurvey(null)} className="gap-2"><ArrowLeft className="h-4 w-4" /> {isAr ? "العودة" : "Back"}</Button>
                <AnalysisView student={adaptStudent(student)} survey={adaptSurvey(selectedSurvey)} />
              </div>
            ) : surveys.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">{isAr ? "لا توجد تقارير بعد" : "No reports yet"}</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {surveys.map((survey) => (
                  <Card key={survey.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedSurvey(survey)}>
                    <CardContent className="p-4 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{new Date(survey.date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}</p>
                        <div className="flex gap-2 mt-1"><Badge variant="outline" className="text-[10px]">{isAr ? "تقييم" : "Survey"}</Badge>{survey.analysis && <Badge variant="secondary" className="text-[10px]">{isAr ? "تم التحليل" : "Analyzed"}</Badge>}</div>
                      </div>
                      <Button variant="outline" size="sm">{isAr ? "عرض" : "View"}</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="parents" className="space-y-4">
            <ParentManager studentId={student.id} studentName={student.name} analysis={latestSurvey?.analysis as any} />
            <Card>
              <CardHeader><CardTitle>{isAr ? "مشاركة سريعة" : "Quick sharing"}</CardTitle></CardHeader>
              <CardContent>
                <Button className="gap-2" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(isAr ? `تقرير الطالب ${student.name}` : `Student report ${student.name}`)}`, "_blank")}><Share2 className="h-4 w-4" />{isAr ? "إرسال عبر واتساب" : "Share on WhatsApp"}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTable students={[student]} date={new Date()} refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
