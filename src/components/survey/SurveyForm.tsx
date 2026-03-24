import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Send, CheckCircle, ChevronLeft, ChevronRight, Brain, Sparkles, Share2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { surveyCategories } from "@/data/surveyQuestions";
import { DbStudent } from "@/lib/database";
import { addSurvey, updateSurveyAnalysis } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface SurveyFormProps {
  student: DbStudent;
  onComplete: () => void;
}

export function SurveyForm({ student, onComplete }: SurveyFormProps) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const isAr = locale === "ar";
  const [currentCategory, setCurrentCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedSurveyId, setSavedSurveyId] = useState<string | null>(null);

  const totalQuestions = surveyCategories.reduce((sum, c) => sum + c.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const category = surveyCategories[currentCategory];
  const isLastCategory = currentCategory === surveyCategories.length - 1;
  const canProceed = category.questions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (questionId: string, value: number | string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSwipe = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) > threshold) {
      const goNext = isAr ? info.offset.x > 0 : info.offset.x < 0;
      const goPrev = isAr ? info.offset.x < 0 : info.offset.x > 0;
      if (goNext && currentCategory < surveyCategories.length - 1) setCurrentCategory(prev => prev + 1);
      if (goPrev && currentCategory > 0) setCurrentCategory(prev => prev - 1);
    }
  }, [currentCategory, isAr]);

  const handleNext = () => {
    if (isLastCategory) handleSave();
    else setCurrentCategory(prev => prev + 1);
  };

  // Step 1: Save assessment without AI analysis
  const handleSave = async () => {
    if (!user) return;
    setAnalyzing(true);
    const survey = await addSurvey({ student_id: student.id, teacher_id: user.id, answers });
    if (!survey) { setAnalyzing(false); toast.error(isAr ? "خطأ في الحفظ" : "Error saving"); return; }
    setSavedSurveyId(survey.id);
    setSaved(true);
    setAnalyzing(false);
    toast.success(isAr ? "تم حفظ التقييم بنجاح!" : "Assessment saved successfully!");
  };

  // Step 2: Trigger AI analysis on saved survey
  const handleAnalyze = async () => {
    if (!savedSurveyId) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-behavior", {
        body: { studentName: student.name, studentAge: student.age, surveyData: answers, locale },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Rate limit")) toast.error(isAr ? "تم تجاوز حد الطلبات، حاول لاحقاً" : "Rate limit exceeded");
        else if (data.error.includes("Payment")) toast.error(isAr ? "يرجى إضافة رصيد" : "Please add credits");
        else throw new Error(data.error);
        setAnalyzing(false);
        return;
      }
      if (data?.analysis) {
        await updateSurveyAnalysis(savedSurveyId, data.analysis);
      }
      toast.success(isAr ? "تم التحليل بنجاح!" : "Analysis complete!");
      onComplete();
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error(isAr ? "حدث خطأ في التحليل" : "Analysis error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShareWhatsApp = () => {
    const date = new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const msg = isAr
      ? `🌈 *تقرير التقييم الشامل - روضة كيندر BH*\n📅 ${date}\n👶 *الطفل/ة:* ${student.name}\n\n✅ تم إجراء تقييم شامل لطفلكم يشمل جميع مجالات النمو (المعرفي، اللغوي، الاجتماعي، الحركي، الرعاية الذاتية).\n\n📊 سيتم تحليل النتائج بالذكاء الاصطناعي وإرسال التقرير المفصّل قريباً.\n\nمع تحيات المعلمة 🌸\nروضة كيندر BH`
      : `🌈 *Comprehensive Assessment Report - Kinder BH*\n📅 ${date}\n👶 *Child:* ${student.name}\n\n✅ A comprehensive assessment covering all development areas has been completed.\n\n📊 Results will be analyzed by AI and a detailed report will follow.\n\nBest regards, Teacher 🌸\nKinder BH`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Saved state — show options to analyze or go back
  if (saved) {
    return (
      <>
        <Confetti recycle={false} numberOfPieces={300} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card className="border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-10 gap-5">
              <CheckCircle className="h-14 w-14 text-primary" />
              <h3 className="text-xl font-bold text-center">{isAr ? "تم حفظ التقييم بنجاح! ✅" : "Assessment Saved! ✅"}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {isAr ? "يمكنك تحليل التقييم بالذكاء الاصطناعي أو إرسال إشعار لولي الأمر" : "Analyze with AI or notify the parent"}
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button onClick={handleAnalyze} disabled={analyzing} className="h-12 gap-2 text-sm w-full">
                  {analyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  {analyzing ? (isAr ? "جاري التحليل..." : "Analyzing...") : (isAr ? "🤖 تحليل بالذكاء الاصطناعي" : "🤖 Analyze with AI")}
                </Button>
                <Button onClick={handleShareWhatsApp} variant="outline" className="h-11 gap-2 text-sm w-full">
                  <Share2 className="h-4 w-4" />
                  {isAr ? "📤 إرسال إشعار لولي الأمر" : "📤 Notify Parent via WhatsApp"}
                </Button>
                <Button variant="ghost" onClick={onComplete} className="h-10 text-sm w-full text-muted-foreground">
                  {isAr ? "عرض النتائج لاحقاً" : "View Results Later"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </>
    );
  }

  if (analyzing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <h3 className="text-lg font-semibold">{isAr ? "جاري الحفظ..." : "Saving..."}</h3>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4" dir={isAr ? "rtl" : "ltr"}>
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{answeredQuestions}/{totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {surveyCategories.map((cat, i) => {
          const catAnswered = cat.questions.every(q => answers[q.id] !== undefined);
          return (
            <Button key={cat.id} variant={i === currentCategory ? "default" : catAnswered ? "secondary" : "outline"} size="sm" className="shrink-0 text-xs gap-1 h-10 px-3 snap-center touch-manipulation" onClick={() => setCurrentCategory(i)}>
              <span className="text-base">{cat.icon}</span>
              {t(cat.titleKey)}
              {catAnswered && <CheckCircle className="h-3 w-3" />}
            </Button>
          );
        })}
      </div>

      {/* Questions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory}
          initial={{ opacity: 0, x: isAr ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isAr ? 30 : -30 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleSwipe}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                {t(category.titleKey)}
                <Badge variant="secondary" className="text-[10px] ms-auto">{currentCategory + 1}/{surveyCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {category.questions.map((question, qi) => (
                <motion.div
                  key={question.id}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.05 }}
                >
                  <p className="text-sm font-medium leading-relaxed text-start">{isAr ? question.textAr : question.textEn}</p>
                  {question.type === "scale" ? (
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => handleAnswer(question.id, val)}
                          className={`flex flex-col items-center justify-center rounded-xl py-3 px-1 min-h-[56px] transition-all duration-200 touch-manipulation active:scale-95 border-2 ${
                            answers[question.id] === val
                              ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.03]"
                              : "bg-muted/40 text-muted-foreground border-transparent hover:border-primary/30 hover:bg-muted"
                          }`}
                        >
                          <span className="text-base font-bold">{val}</span>
                          <span className="text-[8px] leading-tight mt-0.5 opacity-80">{t(`survey.scale.${val}`)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <RadioGroup value={String(answers[question.id] ?? "")} onValueChange={v => handleAnswer(question.id, parseInt(v))}>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options?.map(opt => (
                          <label
                            key={opt.value}
                            htmlFor={`${question.id}-${opt.value}`}
                            className={`flex items-center gap-2 rounded-xl p-3 min-h-[48px] cursor-pointer transition-all duration-200 touch-manipulation active:scale-[0.97] border-2 ${
                              answers[question.id] === opt.value
                                ? "bg-primary/10 border-primary text-foreground"
                                : "bg-muted/30 border-transparent hover:border-primary/20"
                            }`}
                          >
                            <RadioGroupItem value={String(opt.value)} id={`${question.id}-${opt.value}`} />
                            <span className="text-sm">{isAr ? opt.ar : opt.en}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm py-3 -mx-1 px-1 border-t border-border/50">
        <Button variant="outline" onClick={() => setCurrentCategory(prev => prev - 1)} disabled={currentCategory === 0} className="h-12 px-5 touch-manipulation gap-1.5">
          {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {isAr ? "السابق" : "Previous"}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} className="h-12 px-6 touch-manipulation gap-1.5 flex-1 max-w-[200px]">
          {isLastCategory ? (<><Send className="h-4 w-4" /> {t("survey.submit")}</>) : (<>{isAr ? "التالي" : "Next"} {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</>)}
        </Button>
      </div>
    </div>
  );
}
