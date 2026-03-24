import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { DbStudent } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, Share2, CheckCircle, AlertTriangle, Lightbulb, Send } from "lucide-react";

interface BehaviorAnalysisProps {
  student: DbStudent;
}

const behaviorCategories = [
  {
    id: "emotional",
    titleAr: "😢 سلوكيات عاطفية",
    titleEn: "😢 Emotional Behaviors",
    behaviors: [
      { id: "crying", ar: "بكاء متكرر", en: "Frequent crying" },
      { id: "anger", ar: "نوبات غضب", en: "Anger outbursts" },
      { id: "anxiety", ar: "قلق وتوتر", en: "Anxiety & tension" },
      { id: "sadness", ar: "حزن وانطواء", en: "Sadness & withdrawal" },
      { id: "fear", ar: "خوف مفرط", en: "Excessive fear" },
    ],
  },
  {
    id: "social",
    titleAr: "👥 سلوكيات اجتماعية",
    titleEn: "👥 Social Behaviors",
    behaviors: [
      { id: "aggression", ar: "عدوانية مع الأقران", en: "Aggression with peers" },
      { id: "isolation", ar: "عزلة وانسحاب", en: "Isolation & withdrawal" },
      { id: "sharing_issues", ar: "صعوبة في المشاركة", en: "Difficulty sharing" },
      { id: "bullying", ar: "تنمر", en: "Bullying" },
      { id: "defiance", ar: "عناد ورفض", en: "Defiance & refusal" },
    ],
  },
  {
    id: "learning",
    titleAr: "📚 سلوكيات تعلّمية",
    titleEn: "📚 Learning Behaviors",
    behaviors: [
      { id: "distraction", ar: "تشتت الانتباه", en: "Distraction" },
      { id: "hyperactivity", ar: "فرط حركة", en: "Hyperactivity" },
      { id: "low_motivation", ar: "ضعف الدافعية", en: "Low motivation" },
      { id: "difficulty_following", ar: "صعوبة اتباع التعليمات", en: "Difficulty following instructions" },
    ],
  },
  {
    id: "physical",
    titleAr: "🏃 سلوكيات جسدية",
    titleEn: "🏃 Physical Behaviors",
    behaviors: [
      { id: "biting", ar: "عض", en: "Biting" },
      { id: "hitting", ar: "ضرب", en: "Hitting" },
      { id: "eating_issues", ar: "مشاكل في الأكل", en: "Eating issues" },
      { id: "sleep_issues", ar: "مشاكل في النوم", en: "Sleep issues" },
    ],
  },
];

interface AnalysisResult {
  quickSolutions: string[];
  parentMessage: string;
  detailedAnalysis: string;
  preventionTips: string[];
}

export function BehaviorAnalysis({ student }: BehaviorAnalysisProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const isAr = locale === "ar";
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const toggleBehavior = (id: string) => {
    setSelectedBehaviors(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const getSelectedLabels = () => {
    const labels: string[] = [];
    behaviorCategories.forEach(cat => {
      cat.behaviors.forEach(b => {
        if (selectedBehaviors.includes(b.id)) {
          labels.push(isAr ? b.ar : b.en);
        }
      });
    });
    return labels;
  };

  const handleAnalyze = async () => {
    if (selectedBehaviors.length === 0) {
      toast.error(isAr ? "اختاري سلوكاً واحداً على الأقل" : "Select at least one behavior");
      return;
    }
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-behavior", {
        body: {
          studentName: student.name,
          studentAge: student.age,
          mode: "instant_behavior",
          behaviors: getSelectedLabels(),
          notes,
          locale,
        },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Rate limit")) toast.error(isAr ? "تم تجاوز حد الطلبات" : "Rate limit exceeded");
        else if (data.error.includes("Payment")) toast.error(isAr ? "يرجى إضافة رصيد" : "Please add credits");
        else throw new Error(data.error);
        setAnalyzing(false);
        return;
      }
      setResult(data?.analysis || data);
      toast.success(isAr ? "تم التحليل بنجاح!" : "Analysis complete!");
    } catch (err) {
      console.error("Behavior analysis error:", err);
      toast.error(isAr ? "حدث خطأ في التحليل" : "Analysis error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const msg = `${isAr ? "📋 تقرير سلوكي لـ" : "📋 Behavior report for"} ${student.name}\n\n${result.parentMessage}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleReset = () => {
    setSelectedBehaviors([]);
    setNotes("");
    setResult(null);
  };

  // Show results
  if (result) {
    return (
      <div className="space-y-4" dir={isAr ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">{isAr ? "🔍 نتائج التحليل" : "🔍 Analysis Results"}</h3>
          <Button variant="outline" size="sm" onClick={handleReset}>{isAr ? "تحليل جديد" : "New Analysis"}</Button>
        </div>

        {/* Quick Solutions */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Lightbulb className="h-4 w-4" /> {isAr ? "حلول سريعة" : "Quick Solutions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(result.quickSolutions || []).map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm p-2.5 rounded-lg bg-primary/5 border border-primary/10 flex gap-2"
                >
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" /> {isAr ? "التحليل المفصّل" : "Detailed Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.detailedAnalysis}</p>
          </CardContent>
        </Card>

        {/* Prevention Tips */}
        {result.preventionTips?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> {isAr ? "نصائح وقائية" : "Prevention Tips"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {result.preventionTips.map((tip, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-amber-500 shrink-0">•</span> {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Parent Message + WhatsApp */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{isAr ? "💌 رسالة لولي الأمر" : "💌 Parent Message"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed bg-primary/5 p-3 rounded-lg">{result.parentMessage}</p>
            <Button onClick={handleShareWhatsApp} className="w-full h-11 gap-2">
              <Share2 className="h-4 w-4" />
              {isAr ? "إرسال عبر واتساب" : "Send via WhatsApp"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold">{isAr ? "🔍 تحليل السلوك الآني" : "🔍 Instant Behavior Analysis"}</h3>
        <p className="text-xs text-muted-foreground">
          {isAr ? "اختاري السلوكيات الملاحظة ثم اضغطي تحليل للحصول على حلول فورية" : "Select observed behaviors then analyze for instant solutions"}
        </p>
      </div>

      {/* Behavior Selection */}
      {behaviorCategories.map((cat, ci) => (
        <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{isAr ? cat.titleAr : cat.titleEn}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cat.behaviors.map(b => (
                  <Badge
                    key={b.id}
                    variant={selectedBehaviors.includes(b.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-all touch-manipulation active:scale-95 py-1.5 px-3 text-xs ${
                      selectedBehaviors.includes(b.id) ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "hover:bg-muted"
                    }`}
                    onClick={() => toggleBehavior(b.id)}
                  >
                    {isAr ? b.ar : b.en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{isAr ? "📝 ملاحظات إضافية (اختياري)" : "📝 Additional Notes (optional)"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isAr ? "أضيفي تفاصيل إضافية عن السلوك الملاحظ..." : "Add additional details about the observed behavior..."}
            rows={3}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Selected count + Analyze */}
      <div className="space-y-2">
        {selectedBehaviors.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {isAr ? `تم اختيار ${selectedBehaviors.length} سلوك` : `${selectedBehaviors.length} behavior(s) selected`}
          </p>
        )}
        <Button
          onClick={handleAnalyze}
          disabled={selectedBehaviors.length === 0 || analyzing}
          className="w-full h-12 gap-2 text-sm font-semibold"
        >
          {analyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
          {analyzing ? (isAr ? "جاري التحليل..." : "Analyzing...") : (isAr ? "🤖 تحليل بالذكاء الاصطناعي" : "🤖 Analyze with AI")}
        </Button>
      </div>
    </div>
  );
}
