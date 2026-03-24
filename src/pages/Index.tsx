import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label as UiLabel } from "@/components/ui/label";
import { Users, Brain, TrendingUp, ChevronRight, Plus, ClipboardList, Sparkles, BarChart3, CheckCircle2, Activity, LayoutGrid, Wand2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useMemo, useState, useEffect } from "react";
import auroraLogo from "@/assets/logo-aurora.svg";

const Index = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const { students, analyzedSurveys, studentStatusMap, needsSurvey, totalProgress, isLoading } = useDashboard();
  const [showHint, setShowHint] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const hintSeen = localStorage.getItem("kinder_hint_seen");
    if (!hintSeen) setShowHint(true);
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem("kinder_hint_seen", "true");
  };

  const stats = useMemo(() => {
    const total = students?.length || 0;
    const analyzed = studentStatusMap?.filter((s) => s.status === "analyzed").length || 0;
    const needs = studentStatusMap?.filter((s) => s.status === "needs_survey").length || 0;
    const newCount = studentStatusMap?.filter((s) => s.status === "new").length || 0;
    const completion = total ? Math.round((analyzed / total) * 100) : 0;
    return { total, analyzed, needs, newCount, completion };
  }, [students, studentStatusMap]);

  const getStatusBadge = (status: "new" | "needs_survey" | "analyzed", latest: any) => {
    if (status === "analyzed" && latest?.analysis) {
      const type = latest.analysis.indicators?.type;
      return (
        <Badge variant={type === "gifted" ? "default" : type === "delayed" ? "destructive" : "secondary"} className="text-[10px]">
          {t(`indicators.${type || "typical"}`)}
        </Badge>
      );
    }
    if (status === "needs_survey") {
      return <Badge variant="outline" className="text-[10px] border-warning text-warning">{isAr ? "يحتاج تقييم" : "Needs Survey"}</Badge>;
    }
    return <Badge variant="outline" className="text-[10px]">{isAr ? "جديد" : "New"}</Badge>;
  };

  const quickActions = [
    {
      icon: Plus,
      label: isAr ? "إضافة طلاب" : "Add Students",
      desc: isAr ? "ابدأ قوائم المتابعة" : "Start filling your roster",
      action: () => navigate("/students"),
    },
    {
      icon: ClipboardList,
      label: isAr ? "تقييم سريع" : "Quick Assess",
      desc: isAr ? "شغّل استبيان مختصر" : "Run a short survey",
      action: () => navigate("/students"),
    },
    {
      icon: BarChart3,
      label: isAr ? "التقارير" : "Reports",
      desc: isAr ? "شارك النتائج فوراً" : "Share insights instantly",
      action: () => navigate("/reports"),
    },
  ];

  const renderScores = (latest?: any) => {
    const entries = Object.entries(latest?.analysis?.scores || {}).slice(0, 3);
    if (!entries.length) return null;
    return (
      <div className="mt-2 pt-2 border-t flex gap-1 overflow-x-auto">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-full shrink-0">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: val >= 70 ? "hsl(var(--success))" : val >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))" }}
            />
            <span className="text-[9px] text-muted-foreground">{val}%</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
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
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(56,189,248,0.18),transparent_32%)]" />
      </div>

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-cyan-300 p-2 shadow-lg">
              <img src={auroraLogo} alt="Kinder Aurora" className="h-full w-full object-contain" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80 flex items-center gap-1"><Wand2 className="h-4 w-4" /> AI Kinder</p>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">{isAr ? "لوحة المتابعة الذكية" : "Smart Kinder Dashboard"}</h1>
              <p className="text-xs text-muted-foreground max-w-lg">
                {isAr
                  ? "تبسيط تقييم السلوك، ومتابعة مؤشرات الأطفال في لمحة واحدة"
                  : "Simplify behavioral screening and track child indicators at a glance"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-background/60 border rounded-full px-3 py-2 shadow-sm">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{isAr ? "وضع مضغوط" : "Compact mode"}</span>
              <Switch checked={compact} onCheckedChange={setCompact} />
            </div>
            <Button className="gap-2" onClick={() => navigate("/reports")}> <Sparkles className="h-4 w-4" /> {isAr ? "توليد تقرير" : "Generate Report"}</Button>
          </div>
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 shadow-sm"
            >
              <button onClick={dismissHint} className="absolute top-2 end-2 text-muted-foreground hover:text-foreground text-xs">✕</button>
              <div className="flex items-start gap-3">
                <div className="text-2xl sm:text-3xl shrink-0">💡</div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {isAr ? "كيف يعمل التطبيق؟" : "How does it work?"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {[
                      { n: "1", l: isAr ? "أضف الطلاب" : "Add Students" },
                      { n: "2", l: isAr ? "افتح ملف الطالب" : "Open Profile" },
                      { n: "3", l: isAr ? "املأ التقييم" : "Run Assessment" },
                      { n: "4", l: isAr ? "شارك التقرير" : "Share Report" },
                    ].map((step, i) => (
                      <span key={i} className="flex items-center gap-1 bg-muted/60 px-2 py-1 rounded-full">
                        <span className="text-primary font-bold">{step.n}</span> {step.l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { icon: Users, value: stats.total, label: isAr ? "إجمالي الطلاب" : "Total Students", color: "text-primary", note: isAr ? "نشطون" : "active" },
            { icon: Brain, value: stats.analyzed, label: isAr ? "تحليل منجز" : "Analyzed", color: "text-success", note: `${stats.completion}%` },
            { icon: TrendingUp, value: stats.needs, label: isAr ? "بانتظار التقييم" : "Needs survey", color: "text-warning", note: isAr ? "الأولوية" : "priority" },
            { icon: Activity, value: totalProgress, label: isAr ? "التقدم الكلي" : "Overall progress", color: "text-foreground", note: "%" },
          ].map((item, i) => (
            <Card key={i} className="border border-white/10 bg-white/5 backdrop-blur cursor-default"> 
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center ${item.color}`}> 
                  <item.icon className="h-5 w-5" /> 
                </div> 
                <div className="leading-tight"> 
                  <p className="text-xs text-muted-foreground">{item.label}</p> 
                  <p className="text-xl font-bold">{item.value}</p> 
                  <p className="text-[10px] text-muted-foreground">{item.note}</p> 
                </div> 
              </CardContent> 
            </Card> 
          ))} 
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3"> 
          <Card className="lg:col-span-2 border border-white/10 bg-white/5 backdrop-blur"> 
            <CardContent className="p-4 sm:p-6 space-y-4"> 
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"> 
                <div> 
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2"> 
                    <Sparkles className="h-4 w-4 text-primary" /> {isAr ? "مساعد الذكاء" : "AI Coach"} 
                  </h2> 
                  <p className="text-xs text-muted-foreground">{isAr ? "اقتراحات تلقائية لأقرب خطوة" : "Auto-suggestions for next best action"}</p> 
                </div> 
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1"> 
                  <CheckCircle2 className="h-4 w-4 text-success" /> 
                  {isAr ? "مدعوم بتحليل السلوك" : "Behavior analysis ready"} 
                </div> 
              </div> 

              <div className="grid gap-2"> 
                {quickActions.map((item, i) => ( 
                  <motion.div 
                    key={item.label} 
                    initial={{ opacity: 0, x: -6 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.05 }} 
                  > 
                    <Card 
                      className="border border-white/10 bg-background/60 hover:border-primary/40 transition-colors cursor-pointer" 
                      onClick={item.action} 
                    > 
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3"> 
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"> 
                          <item.icon className="h-5 w-5" /> 
                        </div> 
                        <div className="flex-1"> 
                          <p className="text-sm font-semibold">{item.label}</p> 
                          <p className="text-xs text-muted-foreground">{item.desc}</p> 
                        </div> 
                        <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" /> 
                      </CardContent> 
                    </Card> 
                  </motion.div> 
                ))} 
              </div> 
            </CardContent> 
          </Card>

          <Card className="border border-white/10 bg-gradient-to-br from-primary/10 via-background to-foreground/5 backdrop-blur"> 
            <CardContent className="p-4 sm:p-5 space-y-3"> 
              <div className="flex items-center gap-2"> 
                <BarChart3 className="h-4 w-4 text-primary" /> 
                <p className="text-sm font-semibold">{isAr ? "نظرة سريعة" : "At a glance"}</p> 
              </div> 
              <div className="space-y-2 text-xs text-muted-foreground"> 
                <div className="flex items-center justify-between"> 
                  <span>{isAr ? "اكتمل" : "Completed"}</span> 
                  <span className="font-semibold text-foreground">{stats.completion}%</span> 
                </div> 
                <Progress value={stats.completion} className="h-2" /> 
                <div className="flex items-center justify-between"> 
                  <span>{isAr ? "بانتظار" : "Pending"}</span> 
                  <span className="font-semibold text-warning">{stats.needs}</span> 
                </div> 
                <div className="flex items-center justify-between"> 
                  <span>{isAr ? "جديد" : "New"}</span> 
                  <span className="font-semibold text-muted-foreground">{stats.newCount}</span> 
                </div> 
              </div> 
              <div className="text-xs text-muted-foreground bg-muted/60 rounded-lg p-3"> 
                {isAr 
                  ? "يقترح النظام بدء تقييم الطلاب الجدد أولاً لضمان بيانات متناسقة" 
                  : "System suggests assessing new students first to keep data consistent."} 
              </div> 
            </CardContent> 
          </Card> 
        </div>

        <div className="flex items-center justify-between mt-2"> 
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"> 
            {isAr ? "الطلاب" : "Students"} 
          </h2> 
          <div className="flex items-center gap-3"> 
            <div className="flex items-center gap-2 text-xs text-muted-foreground"> 
              <UiLabel className="text-xs text-muted-foreground cursor-pointer" htmlFor="compact-toggle"> 
                {isAr ? "مضغوط" : "Compact"} 
              </UiLabel> 
              <Switch id="compact-toggle" checked={compact} onCheckedChange={setCompact} /> 
            </div> 
            <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="text-xs gap-1 h-7"> 
              {isAr ? "عرض الكل" : "View All"} 
              <ChevronRight className="h-3 w-3 rtl:rotate-180" /> 
            </Button> 
          </div> 
        </div> 

        {students.length === 0 ? ( 
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}> 
            <Card className="border-dashed border-2"> 
              <CardContent className="p-6 sm:p-10 text-center space-y-4"> 
                <div className="text-5xl sm:text-6xl">🎓</div> 
                <h2 className="text-xl sm:text-2xl font-bold"> 
                  {isAr ? "ابدأ بإضافة الطلاب" : "Start by Adding Students"} 
                </h2> 
                <p className="text-sm text-muted-foreground max-w-sm mx-auto"> 
                  {isAr ? "أضف طلابك لبدء تقييم سلوكهم وتطورهم باستخدام الذكاء الاصطناعي" : "Add your students to start assessing their behavior and development with AI"} 
                </p> 
                <div className="flex flex-col sm:flex-row gap-2 justify-center"> 
                  <Button onClick={() => navigate("/students")} className="gap-2 h-12 text-base"> 
                    <Plus className="h-5 w-5" /> 
                    {isAr ? "إضافة طلاب" : "Add Students"} 
                  </Button> 
                </div> 
              </CardContent> 
            </Card> 
          </motion.div> 
        ) : ( 
          <div className={`grid gap-2 ${compact ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}> 
            {studentStatusMap.map(({ student, latest, status, surveyCount }, i) => ( 
              <motion.div 
                key={student.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.03 }} 
              > 
                <Card 
                  className={`hover:shadow-md transition-all cursor-pointer active:scale-[0.99] ${compact ? "border-white/10 bg-white/5" : ""}`} 
                  onClick={() => navigate(`/students/${student.id}`)} 
                > 
                  <CardContent className={`${compact ? "p-3" : "p-3 sm:p-4"}`}> 
                    <div className="flex items-center gap-3"> 
                      <div className="text-2xl sm:text-3xl shrink-0"> 
                        {student.gender === "male" ? "👦" : "👧"} 
                      </div> 
                      <div className="flex-1 min-w-0"> 
                        <div className="flex items-center gap-2 mb-0.5"> 
                          <p className="text-sm font-semibold truncate">{student.name}</p> 
                          {getStatusBadge(status, latest)} 
                        </div> 
                        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground"> 
                          <span>{isAr ? `${student.age} سنوات` : `${student.age} yrs`}</span> 
                          <span>•</span> 
                          <span>{surveyCount} {isAr ? "تقييم" : "surveys"}</span> 
                        </div> 
                      </div> 
                      <div className="shrink-0"> 
                        <Button 
                          size="sm" 
                          variant={status === "needs_survey" ? "default" : "outline"} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(status === "needs_survey" ? `/students/${student.id}/assess` : `/students/${student.id}`); 
                          }} 
                          className="h-10 min-w-[44px] text-xs gap-1" 
                        > 
                          {status === "needs_survey" ? ( 
                            <> 
                              <ClipboardList className="h-4 w-4" /> <span className="hidden sm:inline">{isAr ? "تقييم" : "Assess"}</span> 
                            </> 
                          ) : ( 
                            <> 
                              <Brain className="h-4 w-4" /> <span className="hidden sm:inline">{isAr ? "الملف" : "Profile"}</span> 
                            </> 
                          )} 
                        </Button> 
                      </div> 
                    </div> 

                    {renderScores(latest)} 
                  </CardContent> 
                </Card> 
              </motion.div> 
            ))} 
          </div> 
        )} 
      </div> 
    </DashboardLayout>
  );
};

export default Index;