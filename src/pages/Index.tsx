import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Brain, TrendingUp, ChevronRight, Plus, ClipboardList } from "lucide-react";
import { useI18n } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useState, useEffect } from "react";

const Index = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const { students, analyzedSurveys, studentStatusMap, needsSurvey, totalProgress, isLoading } = useDashboard();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hintSeen = localStorage.getItem("kinder_hint_seen");
    if (!hintSeen) setShowHint(true);
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem("kinder_hint_seen", "true");
  };

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
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 max-w-5xl mx-auto">

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4"
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

        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl font-bold">{isAr ? "لوحة المتابعة" : "Dashboard"}</h1>
          {students.length > 0 && (
            <div className="flex items-center gap-3">
              <Progress value={totalProgress} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground shrink-0">{totalProgress}% {isAr ? "مكتمل" : "complete"}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Users, value: students.length, label: isAr ? "طلاب" : "Students", color: "text-primary", action: () => navigate("/students") },
            { icon: Brain, value: analyzedSurveys.length, label: isAr ? "تحليلات" : "Analyses", color: "text-success", action: () => navigate("/reports") },
            { icon: TrendingUp, value: needsSurvey, label: isAr ? "بانتظار" : "Pending", color: "text-warning", action: () => navigate("/students") },
          ].map((item, i) => (
            <Card key={i} className="cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.98]" onClick={item.action}>
              <CardContent className="p-3 flex flex-col items-center text-center">
                <item.icon className={`h-6 w-6 ${item.color} mb-1`} />
                <p className="text-xl font-bold leading-none">{item.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </CardContent>
            </Card>
          ))}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {isAr ? "الطلاب" : "Students"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="text-xs gap-1 h-7">
                {isAr ? "عرض الكل" : "View All"}
                <ChevronRight className="h-3 w-3 rtl:rotate-180" />
              </Button>
            </div>

            <div className="grid gap-2">
              {studentStatusMap.map(({ student, latest, status, surveyCount }, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className="hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    <CardContent className="p-3 sm:p-4">
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
                              <><ClipboardList className="h-4 w-4" /><span className="hidden sm:inline">{isAr ? "تقييم" : "Assess"}</span></>
                            ) : (
                              <><Brain className="h-4 w-4" /><span className="hidden sm:inline">{isAr ? "الملف" : "Profile"}</span></>
                            )}
                          </Button>
                        </div>
                      </div>

                      {latest?.analysis?.scores && (
                        <div className="mt-2 pt-2 border-t flex gap-1 overflow-x-auto">
                          {Object.entries(latest.analysis.scores as Record<string, number>).slice(0, 5).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-full shrink-0">
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: val >= 70 ? "hsl(var(--success))" : val >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))" }}
                              />
                              <span className="text-[9px] text-muted-foreground">{val}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
