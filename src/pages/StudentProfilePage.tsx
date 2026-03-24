import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, PlayCircle, Share2, Brain, Calendar, ClipboardList, Users as UsersIcon, Zap, Search, FileText, MessageSquare } from "lucide-react";
import { ParentManager } from "@/components/students/ParentManager";
import { useI18n } from "@/i18n";
import { DbStudent, DbSurvey, getStudents, getStudentSurveys, getAttendanceStats } from "@/lib/database";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { DailyCheckIn } from "@/components/assessment/DailyCheckIn";
import { BehaviorAnalysis } from "@/components/assessment/BehaviorAnalysis";
import { BulkWhatsApp } from "@/components/assessment/BulkWhatsApp";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { StudentPhotos } from "@/components/students/StudentPhotos";
import { surveyCategories } from "@/data/surveyQuestions";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface StudentProfilePageProps {
  initialTab?: string;
}

const categoryMeta: Record<string, { emoji: string; titleAr: string; titleEn: string }> = {
  cognitive: { emoji: "🧠", titleAr: "التطور المعرفي", titleEn: "Cognitive" },
  language: { emoji: "💬", titleAr: "اللغة والتواصل", titleEn: "Language" },
  social_emotional: { emoji: "❤️", titleAr: "الاجتماعي العاطفي", titleEn: "Social-Emotional" },
  motor: { emoji: "🏃", titleAr: "المهارات الحركية", titleEn: "Motor Skills" },
  self_care: { emoji: "🧽", titleAr: "الرعاية الذاتية", titleEn: "Self-Care" },
  daily_mood: { emoji: "😊", titleAr: "الرفاهية اليومية", titleEn: "Wellbeing" },
};

function CircularScore({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-rose-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-muted/30" strokeWidth={4} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-sm font-bold">{score}%</span>
    </div>
  );
}

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
  const [assessmentMode, setAssessmentMode] = useState<"daily" | "behavior" | "monthly" | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<DbSurvey | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      getStudents(),
      getStudentSurveys(studentId),
      getAttendanceStats(studentId),
    ]).then(([allStudents, s, a]) => {
      const found = allStudents.find(st => st.id === studentId);
      setStudent(found || null);
      setSurveys(s);
      setAttendanceStats(a);
      setLoading(false);
    });
  }, [studentId, refreshKey]);

  // Helpers
  const loc = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return (isAr ? val?.ar : val?.en) || val?.ar || val?.en || "";
  };
  const locArray = (val: any): string[] => {
    if (Array.isArray(val)) return val.map((v: any) => typeof v === "string" ? v : loc(v));
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const picked = isAr ? val?.ar : val?.en;
      return Array.isArray(picked) ? picked : [];
    }
    return [];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">{isAr ? "لم يتم العثور على الطالب" : "Student not found"}</p>
          <Button onClick={() => navigate("/students")}>{isAr ? "العودة للطلاب" : "Back to Students"}</Button>
        </div>
      </DashboardLayout>
    );
  }

  const latestSurvey = surveys.find(s => s.analysis);
  const analysis = latestSurvey?.analysis as any;

  const categoryScores = surveyCategories.map(cat => {
    const answers = latestSurvey?.answers || {};
    const answered = cat.questions.filter(q => answers[q.id] !== undefined);
    const sum = answered.reduce((s, q) => {
      const v = answers[q.id];
      return s + (typeof v === "number" ? v : 3);
    }, 0);
    const avg = answered.length > 0 ? Math.round((sum / answered.length) * 20) : 0;
    const meta = categoryMeta[cat.id];
    return {
      id: cat.id,
      emoji: meta?.emoji || "📊",
      titleAr: meta?.titleAr || cat.id,
      titleEn: meta?.titleEn || cat.id,
      score: analysis?.scores?.[cat.id] ?? avg,
    };
  });

  const overallScore = categoryScores.length > 0
    ? Math.round(categoryScores.reduce((s, c) => s + c.score, 0) / categoryScores.length)
    : 0;

  const handleAssessmentComplete = () => {
    setRefreshKey(k => k + 1);
    setAssessmentMode(null);
    setActiveTab("reports");
    toast.success(isAr ? "تم التقييم! يمكنك الآن مشاهدة التقرير" : "Assessment done! View the report now");
  };

  const handleShareWhatsApp = () => {
    const parentMsg = analysis?.parentMessage;
    const msg = typeof parentMsg === "string" ? parentMsg : (isAr ? parentMsg?.ar : parentMsg?.en) || "";
    const plan = analysis?.actionPlan;
    const planText = Array.isArray(plan) ? plan.join("\n") : (isAr ? plan?.ar : plan?.en)?.join?.("\n") || "";
    const fullMsg = `${isAr ? "📋 تقرير" : "📋 Report"}: ${student.name}\n\n${msg}\n\n${isAr ? "📅 خطة العمل:" : "📅 Action Plan:"}\n${planText}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMsg)}`, "_blank");
  };

  const adaptStudent = (s: DbStudent) => ({ id: s.id, name: s.name, age: s.age, gender: s.gender as "male" | "female", createdAt: s.created_at });
  const adaptSurvey = (s: DbSurvey) => ({ id: s.id, studentId: s.student_id, date: s.date, answers: s.answers, analysis: s.analysis });

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 max-w-4xl mx-auto pb-24" dir={isAr ? "rtl" : "ltr"}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/students")} className="shrink-0 rounded-full h-10 w-10 hover:bg-primary/10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/40 flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 border-background shrink-0">
                  {student.gender === "male" ? "👦" : "👧"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold truncate">{student.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0.5">
                      {isAr ? `${student.age} سنوات` : `${student.age} yrs`}
                    </Badge>
                    {analysis?.indicators?.type && (
                      <Badge className={`text-[10px] rounded-full px-2 py-0.5 ${
                        analysis.indicators.type === "gifted" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : analysis.indicators.type === "delayed" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}>
                        {analysis.indicators.type === "gifted" ? "🌟" : analysis.indicators.type === "delayed" ? "⚠️" : "✅"} {isAr ? (analysis.indicators.type === "gifted" ? "موهوب" : analysis.indicators.type === "delayed" ? "يحتاج دعم" : "طبيعي") : analysis.indicators.type}
                      </Badge>
                    )}
                  </div>
                </div>
                {overallScore > 0 && <CircularScore score={overallScore} size={56} />}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <ClipboardList className="h-5 w-5" />, value: surveys.length, label: isAr ? "تقييم" : "Surveys", color: "text-primary" },
            { icon: <Brain className="h-5 w-5" />, value: surveys.filter(s => s.analysis).length, label: isAr ? "تحليل AI" : "AI Reports", color: "text-purple-500" },
            { icon: <Calendar className="h-5 w-5" />, value: `${attendanceStats?.rate || 0}%`, label: isAr ? "حضور" : "Attendance", color: "text-emerald-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className={`mx-auto mb-1 ${stat.color}`}>{stat.icon}</div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category scores quick glance */}
        {overallScore > 0 && (
          <div className="grid grid-cols-5 gap-1.5">
            {categoryScores.filter(c => c.score > 0).map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-muted/30">
                <span className="text-lg">{cat.emoji}</span>
                <span className={`text-[11px] font-bold ${cat.score >= 80 ? "text-emerald-600" : cat.score >= 50 ? "text-amber-600" : "text-rose-600"}`}>{cat.score}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setAssessmentMode(null); }} className="space-y-4">
          <TabsList className="w-full grid grid-cols-6 h-12">
            <TabsTrigger value="overview" className="text-[9px] sm:text-sm py-3">{isAr ? "📋 عام" : "📋 Overview"}</TabsTrigger>
            <TabsTrigger value="assess" className="text-[9px] sm:text-sm py-3">{isAr ? "📝 تقييم" : "📝 Assess"}</TabsTrigger>
            <TabsTrigger value="reports" className="text-[9px] sm:text-sm py-3">{isAr ? "🧠 تقارير" : "🧠 Reports"}</TabsTrigger>
            <TabsTrigger value="photos" className="text-[9px] sm:text-sm py-3">{isAr ? "📷 صور" : "📷 Photos"}</TabsTrigger>
            <TabsTrigger value="parents" className="text-[9px] sm:text-sm py-3">{isAr ? "👪 أهل" : "👪 Parents"}</TabsTrigger>
            <TabsTrigger value="attendance" className="text-[9px] sm:text-sm py-3">{isAr ? "📅 حضور" : "📅 Attend."}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {analysis ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{isAr ? "ملخص التحليل" : "Analysis Summary"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{loc(analysis.summary)}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-emerald-200/50">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm text-emerald-600">{isAr ? "✅ نقاط القوة" : "✅ Strengths"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {locArray(analysis.strengths).slice(0, 3).map((s: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-200/50">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm text-amber-600">{isAr ? "⚠️ يحتاج تطوير" : "⚠️ Needs Work"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {locArray(analysis.improvements).slice(0, 3).map((s: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {analysis.parentMessage && (
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        💌 {isAr ? "رسالة لولي الأمر" : "Parent Message"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs leading-relaxed bg-primary/5 p-3 rounded-lg">{loc(analysis.parentMessage)}</p>
                      <Button size="sm" variant="outline" onClick={handleShareWhatsApp} className="gap-2 h-10 w-full">
                        <Share2 className="h-4 w-4" />
                        {isAr ? "إرسال عبر واتساب" : "Share via WhatsApp"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">📝</div>
                  <h3 className="font-semibold">{isAr ? "لا توجد تقييمات بعد" : "No assessments yet"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? "قم بإجراء أول تقييم لهذا الطالب" : "Run the first assessment for this student"}
                  </p>
                  <Button onClick={() => setActiveTab("assess")} className="gap-2 h-12">
                    <PlayCircle className="h-5 w-5" />
                    {isAr ? "بدء التقييم" : "Start Assessment"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Assessment Tab - Multi-type */}
          <TabsContent value="assess" className="space-y-4">
            {!assessmentMode ? (
              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  {isAr ? "اختاري نوع التقييم" : "Choose assessment type"}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {/* Daily */}
                  <Card
                    className="cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98] touch-manipulation"
                    onClick={() => setAssessmentMode("daily")}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <Zap className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold">{isAr ? "📋 تقييم يومي" : "📋 Daily Check-in"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isAr ? "7 بنود بالإيموجي - مزاج، طاقة، تفاعل، وجبة، مشاركة..." : "7 emoji items - mood, energy, social, meal, participation..."}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">{isAr ? "يومي" : "Daily"}</Badge>
                    </CardContent>
                  </Card>

                  {/* Behavior Analysis */}
                  <Card
                    className="cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98] touch-manipulation"
                    onClick={() => setAssessmentMode("behavior")}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                        <Search className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold">{isAr ? "🔍 تحليل سلوك آني" : "🔍 Instant Behavior Analysis"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isAr ? "اختاري سلوكيات ملاحظة → تحليل AI → حلول فورية" : "Select behaviors → AI analysis → instant solutions"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px] bg-purple-100 text-purple-700">{isAr ? "آني" : "Instant"}</Badge>
                    </CardContent>
                  </Card>

                  {/* Monthly Comprehensive */}
                  <Card
                    className="cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98] touch-manipulation"
                    onClick={() => setAssessmentMode("monthly")}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold">{isAr ? "📊 تقييم شهري شامل" : "📊 Monthly Comprehensive"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isAr ? "تقييم مفصّل لجميع مجالات النمو مع تحليل AI" : "Detailed assessment of all growth areas with AI analysis"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">{isAr ? "شهري" : "Monthly"}</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setAssessmentMode(null)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> {isAr ? "العودة لأنواع التقييم" : "Back to assessment types"}
                </Button>
                
                {assessmentMode === "daily" && (
                  <DailyCheckIn student={student} onComplete={handleAssessmentComplete} />
                )}
                {assessmentMode === "behavior" && (
                  <BehaviorAnalysis student={student} />
                )}
                {assessmentMode === "monthly" && (
                  <SurveyForm student={student} onComplete={handleAssessmentComplete} />
                )}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-3">
            {selectedSurvey ? (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedSurvey(null)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> {isAr ? "العودة للقائمة" : "Back to list"}
                </Button>
                <AnalysisView student={adaptStudent(student)} survey={adaptSurvey(selectedSurvey)} />
              </div>
            ) : surveys.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">📊</div>
                  <p className="text-sm text-muted-foreground">{isAr ? "لا توجد تقارير بعد" : "No reports yet"}</p>
                  <Button onClick={() => setActiveTab("assess")} size="sm" className="gap-2">
                    <PlayCircle className="h-4 w-4" /> {isAr ? "إجراء تقييم" : "Run Assessment"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {surveys.map(survey => {
                  const isDailyType = survey.answers?.["_type"] === "daily";
                  return (
                    <Card
                      key={survey.id}
                      className="cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.99]"
                      onClick={() => setSelectedSurvey(survey)}
                    >
                      <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {new Date(survey.date).toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              {isDailyType ? (isAr ? "📋 يومي" : "📋 Daily") : (isAr ? "📊 شامل" : "📊 Full")}
                            </Badge>
                            {survey.analysis && (
                              <Badge variant="secondary" className="text-[10px]">
                                {(survey.analysis as any)?.indicators?.type === "gifted" ? "🌟" : "✅"} {isAr ? "تم التحليل" : "Analyzed"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs h-10 min-w-[44px]">
                          {isAr ? "عرض" : "View"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-3">
            <StudentPhotos studentId={student.id} studentName={student.name} />
          </TabsContent>

          {/* Parents Tab - Now includes bulk messaging */}
          <TabsContent value="parents" className="space-y-6">
            <ParentManager studentId={student.id} studentName={student.name} analysis={analysis} />
            
            {/* Bulk WhatsApp Section */}
            <div className="border-t pt-6">
              <BulkWhatsApp />
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            {attendanceStats && attendanceStats.total > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: isAr ? "حاضر" : "Present", value: attendanceStats.present, color: "text-emerald-600" },
                  { label: isAr ? "غائب" : "Absent", value: attendanceStats.absent, color: "text-rose-600" },
                  { label: isAr ? "متأخر" : "Late", value: attendanceStats.late, color: "text-amber-600" },
                  { label: isAr ? "معذور" : "Excused", value: attendanceStats.excused, color: "text-blue-600" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
            <AttendanceTable
              students={[student]}
              date={new Date()}
              refreshKey={refreshKey}
              onRefresh={() => setRefreshKey(k => k + 1)}
            />
          </TabsContent>
        </Tabs>

        {/* Sticky CTA for mobile */}
        {activeTab !== "assess" && (
          <div className="fixed bottom-20 inset-x-0 md:hidden px-4 z-40">
            <Button
              onClick={() => setActiveTab("assess")}
              className="w-full h-12 gap-2 shadow-xl rounded-full text-sm font-semibold"
            >
              <PlayCircle className="h-5 w-5" />
              {isAr ? "تقييم جديد" : "New Assessment"}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
