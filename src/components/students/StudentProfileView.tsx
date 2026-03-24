import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Area, AreaChart
} from "recharts";
import { Brain, TrendingUp, Heart, MessageSquare, Zap, Star, ClipboardList, Calendar, ArrowLeft, Sparkles, PlayCircle, ChevronDown, Award, BookOpen, Users, Share2, FileDown } from "lucide-react";
import { useI18n } from "@/i18n";
import { DbStudent, DbSurvey, getStudentSurveys, getAttendanceStats } from "@/lib/database";
import { surveyCategories } from "@/data/surveyQuestions";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { generateStudentPdf } from "@/lib/pdfReport";

interface StudentProfileViewProps {
  student: DbStudent;
  onBack: () => void;
}

const COLORS = [
  "hsl(258, 58%, 58%)", "hsl(152, 60%, 52%)", "hsl(38, 92%, 60%)",
  "hsl(200, 80%, 55%)", "hsl(0, 72%, 60%)", "hsl(280, 58%, 65%)", "hsl(170, 60%, 50%)",
  "hsl(30, 80%, 55%)", "hsl(210, 70%, 55%)", "hsl(340, 65%, 55%)"
];

const GRADIENT_PAIRS = [
  { from: "from-purple-500/20", to: "to-pink-500/10", border: "border-purple-300/40", icon: "bg-purple-500/15" },
  { from: "from-emerald-500/20", to: "to-teal-500/10", border: "border-emerald-300/40", icon: "bg-emerald-500/15" },
  { from: "from-blue-500/20", to: "to-cyan-500/10", border: "border-blue-300/40", icon: "bg-blue-500/15" },
  { from: "from-amber-500/20", to: "to-orange-500/10", border: "border-amber-300/40", icon: "bg-amber-500/15" },
  { from: "from-rose-500/20", to: "to-pink-500/10", border: "border-rose-300/40", icon: "bg-rose-500/15" },
  { from: "from-violet-500/20", to: "to-purple-500/10", border: "border-violet-300/40", icon: "bg-violet-500/15" },
  { from: "from-cyan-500/20", to: "to-blue-500/10", border: "border-cyan-300/40", icon: "bg-cyan-500/15" },
  { from: "from-green-500/20", to: "to-emerald-500/10", border: "border-green-300/40", icon: "bg-green-500/15" },
  { from: "from-indigo-500/20", to: "to-blue-500/10", border: "border-indigo-300/40", icon: "bg-indigo-500/15" },
  { from: "from-red-500/20", to: "to-orange-500/10", border: "border-red-300/40", icon: "bg-red-500/15" },
];

const categoryMeta: Record<string, { emoji: string; titleAr: string; titleEn: string; descAr: string; descEn: string }> = {
  cognitive: {
    emoji: "🧠", titleAr: "التطور المعرفي", titleEn: "Cognitive Development",
    descAr: "يقيّم قدرات التصنيف والعد وحل المشكلات والتفكير المنطقي المناسبة للعمر",
    descEn: "Assesses sorting, counting, problem-solving, and age-appropriate logical thinking",
  },
  language: {
    emoji: "💬", titleAr: "اللغة والتواصل", titleEn: "Language & Communication",
    descAr: "يتابع قدرات الكلام والتعبير والفهم اللغوي ومقارنتها بالمعايير العمرية",
    descEn: "Tracks speech, expression, comprehension and compares to age-appropriate milestones",
  },
  social_emotional: {
    emoji: "❤️", titleAr: "التطور الاجتماعي العاطفي", titleEn: "Social-Emotional",
    descAr: "يقيّم التعاون مع الأقران والتعاطف وإدارة المشاعر والانفصال عن مقدم الرعاية",
    descEn: "Evaluates peer cooperation, empathy, emotion management, and caregiver separation",
  },
  gross_motor: {
    emoji: "🏃", titleAr: "المهارات الحركية الكبرى", titleEn: "Gross Motor Skills",
    descAr: "يتابع الجري والقفز والتسلق والتوازن والتنسيق الجسدي العام",
    descEn: "Tracks running, jumping, climbing, balance, and overall physical coordination",
  },
  fine_motor: {
    emoji: "✂️", titleAr: "المهارات الحركية الدقيقة", titleEn: "Fine Motor Skills",
    descAr: "يقيّم مسك القلم والقص والرسم والتنسيق بين العين واليد",
    descEn: "Assesses pencil grip, cutting, drawing, and hand-eye coordination",
  },
  self_care: {
    emoji: "🧽", titleAr: "الرعاية الذاتية", titleEn: "Self-Care & Independence",
    descAr: "يتابع استقلالية الطفل في الأكل والنظافة واستخدام الحمام وارتداء الملابس",
    descEn: "Tracks independence in eating, hygiene, toileting, and dressing",
  },
  attention: {
    emoji: "🎯", titleAr: "الانتباه والتركيز", titleEn: "Attention & Focus",
    descAr: "يقيّم مدة التركيز والقدرة على إكمال المهام ومقاومة التشتت",
    descEn: "Assesses focus duration, task completion, and resistance to distraction",
  },
  creativity: {
    emoji: "🎨", titleAr: "الإبداع والتعبير", titleEn: "Creativity & Expression",
    descAr: "يتابع اللعب التخيلي والرسم والاستجابة للموسيقى والتفكير الإبداعي",
    descEn: "Tracks imaginative play, art, music response, and creative problem-solving",
  },
  behavior: {
    emoji: "📋", titleAr: "السلوك وضبط النفس", titleEn: "Behavior & Self-Regulation",
    descAr: "يقيّم الالتزام بالقواعد والاستجابة للتوجيه والانتقال بين الأنشطة وحل النزاعات",
    descEn: "Evaluates rule-following, guidance response, transitions, and conflict resolution",
  },
  daily_mood: {
    emoji: "😊", titleAr: "الرفاهية اليومية", titleEn: "Daily Wellbeing",
    descAr: "يتابع المزاج ومستوى الطاقة والتغذية والترطيب اليومي للطفل",
    descEn: "Tracks mood, energy level, nutrition, and daily hydration",
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function getScoreLevel(score: number, isAr: boolean): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: isAr ? "ممتاز" : "Excellent", color: "text-emerald-700", bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" };
  if (score >= 60) return { label: isAr ? "جيد" : "Good", color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" };
  if (score >= 50) return { label: isAr ? "يحتاج تطوير" : "Needs Work", color: "text-amber-700", bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" };
  return { label: isAr ? "يحتاج دعم" : "Needs Support", color: "text-rose-700", bg: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300" };
}

function getScoreTip(score: number, isAr: boolean): string {
  if (score >= 80) return isAr ? "✅ أداء ممتاز — استمري في التعزيز والتحفيز" : "✅ Excellent — keep reinforcing";
  if (score >= 60) return isAr ? "👍 جيد — مع بعض التحسينات البسيطة سيتفوق" : "👍 Good — minor improvements needed";
  if (score >= 50) return isAr ? "⚠️ يحتاج انتباه — خصصي أنشطة إضافية يومياً" : "⚠️ Needs attention — add daily activities";
  return isAr ? "🔴 يحتاج دعم عاجل — تواصلي مع المختص فوراً" : "🔴 Urgent support — consult a specialist";
}

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

/* ── Daily Check-in Component ── */
function DailyCheckIn({ isAr, studentName }: { isAr: boolean; studentName: string }) {
  const [mood, setMood] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const moodEmojis = [
    { emoji: "😢", label: isAr ? "حزين" : "Sad" },
    { emoji: "😐", label: isAr ? "عادي" : "Neutral" },
    { emoji: "🙂", label: isAr ? "جيد" : "Good" },
    { emoji: "😄", label: isAr ? "سعيد" : "Happy" },
    { emoji: "🤩", label: isAr ? "ممتاز" : "Amazing" },
  ];

  const focusEmojis = [
    { emoji: "😵‍💫", label: isAr ? "مشتت" : "Distracted" },
    { emoji: "🤔", label: isAr ? "ضعيف" : "Low" },
    { emoji: "🧐", label: isAr ? "متوسط" : "Medium" },
    { emoji: "🎯", label: isAr ? "جيد" : "Good" },
    { emoji: "🔥", label: isAr ? "عالي جداً" : "Laser Focus" },
  ];

  const interactionEmojis = [
    { emoji: "🫥", label: isAr ? "منعزل" : "Isolated" },
    { emoji: "😶", label: isAr ? "خجول" : "Shy" },
    { emoji: "🙋", label: isAr ? "متفاعل" : "Active" },
    { emoji: "🤝", label: isAr ? "تعاوني" : "Cooperative" },
    { emoji: "🌟", label: isAr ? "قيادي" : "Leader" },
  ];

  const handleSave = () => {
    setSaved(true);
    toast.success(isAr ? `تم حفظ تقييم ${studentName} اليومي ✅` : `Daily check-in saved for ${studentName} ✅`);
  };

  const renderScale = (
    items: { emoji: string; label: string }[],
    value: number | null,
    setValue: (v: number) => void
  ) => (
    <div className="flex gap-1 justify-center">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => setValue(i)}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all duration-200 min-w-[48px] ${
            value === i
              ? "bg-primary/15 scale-110 shadow-md ring-2 ring-primary/30"
              : "hover:bg-muted/50 hover:scale-105"
          }`}
        >
          <span className="text-xl">{item.emoji}</span>
          <span className="text-[9px] text-muted-foreground font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );

  if (saved) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardContent className="p-6 text-center space-y-2">
            <span className="text-5xl">✅</span>
            <h3 className="font-bold text-lg">{isAr ? "تم التسجيل!" : "Check-in Saved!"}</h3>
            <p className="text-sm text-muted-foreground">
              {isAr ? `المزاج: ${moodEmojis[mood!]?.emoji} | التركيز: ${focusEmojis[focus!]?.emoji} | التفاعل: ${interactionEmojis[interaction!]?.emoji}` :
                `Mood: ${moodEmojis[mood!]?.emoji} | Focus: ${focusEmojis[focus!]?.emoji} | Interaction: ${interactionEmojis[interaction!]?.emoji}`}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSaved(false)} className="text-xs">
              {isAr ? "تعديل" : "Edit"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500/10 via-background to-rose-500/5 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15">
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          {isAr ? "📝 التقييم اليومي السريع" : "📝 Daily Quick Check-in"}
        </CardTitle>
        <CardDescription className="text-xs">
          {isAr ? "سجّلي ملاحظاتك اليومية بنقرة واحدة" : "Log daily observations with one tap"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2 text-muted-foreground">{isAr ? "😊 المزاج" : "😊 Mood"}</p>
          {renderScale(moodEmojis, mood, setMood)}
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 text-muted-foreground">{isAr ? "🎯 التركيز" : "🎯 Focus"}</p>
          {renderScale(focusEmojis, focus, setFocus)}
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 text-muted-foreground">{isAr ? "👫 التفاعل" : "👫 Interaction"}</p>
          {renderScale(interactionEmojis, interaction, setInteraction)}
        </div>
        <Button
          onClick={handleSave}
          disabled={mood === null || focus === null || interaction === null}
          className="w-full rounded-full gap-2 shadow-md"
          size="sm"
        >
          <Sparkles className="h-4 w-4" />
          {isAr ? "حفظ التقييم اليومي" : "Save Daily Check-in"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ── Quick Glance Grid ── */
function QuickGlanceGrid({ categoryScores, isAr }: { categoryScores: { id: string; emoji: string; titleAr: string; titleEn: string; score: number }[]; isAr: boolean }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {categoryScores.map((cat, idx) => {
        const level = getScoreLevel(cat.score, isAr);
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className={`text-xs font-extrabold ${getScoreColor(cat.score)}`}>{cat.score}%</span>
            <span className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-1">
              {isAr ? cat.titleAr.split(" ")[0] : cat.titleEn.split(" ")[0]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Main Component ── */
export function StudentProfileView({ student, onBack }: StudentProfileViewProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<DbSurvey[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getStudentSurveys(student.id),
      getAttendanceStats(student.id),
    ]).then(([s, a]) => {
      setSurveys(s);
      setAttendanceStats(a);
      setLoading(false);
    });
  }, [student.id]);

  const latestSurvey = surveys.find(s => s.analysis);
  const analysis = latestSurvey?.analysis as any;

  const categoryScores = surveyCategories.map(cat => {
    const catQuestions = cat.questions;
    const answers = latestSurvey?.answers || {};
    const answered = catQuestions.filter(q => answers[q.id] !== undefined);
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
      descAr: meta?.descAr || "",
      descEn: meta?.descEn || "",
      score: analysis?.scores?.[cat.id] ?? avg,
    };
  });

  const overallScore = categoryScores.length > 0
    ? Math.round(categoryScores.reduce((s, c) => s + c.score, 0) / categoryScores.length)
    : 0;

  const radarData = categoryScores.filter(c => c.score > 0).map(c => ({
    subject: `${c.emoji} ${isAr ? c.titleAr.split(" ")[0] : c.titleEn.split(" ")[0]}`,
    value: c.score, fullMark: 100,
  }));

  const attendancePieData = attendanceStats ? [
    { name: isAr ? "حاضر" : "Present", value: attendanceStats.present, color: "hsl(152, 60%, 52%)" },
    { name: isAr ? "غائب" : "Absent", value: attendanceStats.absent, color: "hsl(0, 72%, 60%)" },
    { name: isAr ? "متأخر" : "Late", value: attendanceStats.late, color: "hsl(38, 92%, 60%)" },
    { name: isAr ? "معذور" : "Excused", value: attendanceStats.excused, color: "hsl(200, 80%, 55%)" },
  ].filter(d => d.value > 0) : [];

  const surveyTimeline = surveys.filter(s => s.analysis).slice(0, 10).reverse().map((s) => ({
    date: new Date(s.date).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric" }),
    score: Math.round(((Object.values((s.analysis as any)?.scores || {}) as number[]).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0)) / Math.max(Object.keys((s.analysis as any)?.scores || {}).length, 1)),
  }));

  const handleShareWhatsApp = () => {
    const parentMsg = analysis?.parentMessage;
    const msg = typeof parentMsg === "string" ? parentMsg : (isAr ? parentMsg?.ar : parentMsg?.en) || "";
    const plan = analysis?.actionPlan;
    const planText = Array.isArray(plan) ? plan.join("\n") : (isAr ? plan?.ar : plan?.en)?.join?.("\n") || "";
    const fullMsg = `${isAr ? "📋 تقرير" : "📋 Report"}: ${student.name}\n\n${msg}\n\n${isAr ? "📅 خطة العمل:" : "📅 Action Plan:"}\n${planText}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMsg)}`, "_blank");
    toast.success(isAr ? "تم فتح واتساب للمشاركة" : "WhatsApp opened for sharing");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full" />
        <p className="text-sm text-muted-foreground animate-pulse">{isAr ? "جاري تحميل بيانات الطالب..." : "Loading student data..."}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-8">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 mt-1 rounded-full hover:bg-primary/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4 flex-1">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/40 flex items-center justify-center text-5xl shadow-lg border-2 border-background">
                  {student.gender === "male" ? "👦" : "👧"}
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs rounded-full px-3 py-1">
                      {student.gender === "male" ? "👦" : "👧"} {isAr ? `العمر: ${student.age} سنوات` : `Age: ${student.age} years`}
                    </Badge>
                    {analysis?.indicators?.type && (
                      <Badge className={`text-xs rounded-full px-3 py-1 ${
                        analysis.indicators.type === "gifted" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : analysis.indicators.type === "delayed" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}>
                        {analysis.indicators.type === "gifted" ? "🌟 " : analysis.indicators.type === "delayed" ? "⚠️ " : "✅ "}
                        {isAr ? (analysis.indicators.type === "gifted" ? "موهوب" : analysis.indicators.type === "delayed" ? "يحتاج دعم" : "طبيعي") : analysis.indicators.type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" className="gap-2 rounded-full shadow-md" onClick={() => navigate("/survey")}>
                  <PlayCircle className="h-4 w-4" />
                  {isAr ? "تقييم جديد" : "New Assessment"}
                </Button>
                {analysis && (
                  <Button size="sm" variant="outline" className="gap-2 rounded-full" onClick={() => {
                    generateStudentPdf({
                      studentName: student.name,
                      studentAge: student.age,
                      studentGender: student.gender,
                      analysis,
                      answers: latestSurvey?.answers || {},
                      surveyDate: latestSurvey?.date || new Date().toISOString(),
                      isAr,
                    });
                    toast.success(isAr ? "تم تحميل التقرير بصيغة PDF" : "PDF report downloaded");
                  }}>
                    <FileDown className="h-4 w-4" />
                    {isAr ? "تحميل PDF" : "PDF Report"}
                  </Button>
                )}
                {analysis?.parentMessage && (
                  <Button size="sm" variant="outline" className="gap-2 rounded-full" onClick={handleShareWhatsApp}>
                    <Share2 className="h-4 w-4" />
                    {isAr ? "واتساب" : "WhatsApp"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Check-in */}
      <DailyCheckIn isAr={isAr} studentName={student.name} />

      {/* Quick Glance Grid */}
      {overallScore > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? "👀 نظرة سريعة على جميع البنود" : "👀 Quick Glance — All Categories"}</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickGlanceGrid categoryScores={categoryScores} isAr={isAr} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Award className="h-5 w-5" />, value: overallScore, suffix: "%", label: isAr ? "المعدل العام" : "Overall Score", color: "from-primary/20 to-primary/5", iconColor: "text-primary" },
          { icon: <ClipboardList className="h-5 w-5" />, value: surveys.length, suffix: "", label: isAr ? "استقصاء" : "Surveys", color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-500" },
          { icon: <Calendar className="h-5 w-5" />, value: attendanceStats?.rate || 0, suffix: "%", label: isAr ? "نسبة الحضور" : "Attendance", color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-500" },
          { icon: <Brain className="h-5 w-5" />, value: surveys.filter(s => s.analysis).length, suffix: "", label: isAr ? "تحليلات AI" : "AI Analyses", color: "from-purple-500/20 to-purple-500/5", iconColor: "text-purple-500" },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}>
            <Card className={`border-0 shadow-md bg-gradient-to-br ${stat.color} hover:shadow-lg transition-shadow`}>
              <CardContent className="pt-4 pb-3 text-center">
                <div className={`mx-auto mb-2 ${stat.iconColor}`}>{stat.icon}</div>
                <p className="text-3xl font-extrabold tracking-tight">{stat.value}{stat.suffix}</p>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overall Score Ring */}
      {overallScore > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <CircularScore score={overallScore} size={100} />
                  <div>
                    <h3 className="text-lg font-bold">{isAr ? "المعدل العام للتطور" : "Overall Development Score"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isAr ? `بناءً على ${categoryScores.filter(c => c.score > 0).length} بنود تقييم` : `Based on ${categoryScores.filter(c => c.score > 0).length} assessment categories`}
                    </p>
                    <Badge className={`mt-2 ${getScoreLevel(overallScore, isAr).bg} border-0`}>
                      {getScoreLevel(overallScore, isAr).label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="w-full grid grid-cols-5 rounded-full p-1 bg-muted/50">
          <TabsTrigger value="categories" className="rounded-full text-xs">{isAr ? "📋 البنود" : "📋 Categories"}</TabsTrigger>
          <TabsTrigger value="overview" className="rounded-full text-xs">{isAr ? "📊 الرسوم" : "📊 Charts"}</TabsTrigger>
          <TabsTrigger value="analysis" className="rounded-full text-xs">{isAr ? "🧠 التحليل" : "🧠 Analysis"}</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-full text-xs">{isAr ? "📅 الحضور" : "📅 Attendance"}</TabsTrigger>
          <TabsTrigger value="parent" className="rounded-full text-xs">{isAr ? "💌 الأهل" : "💌 Parents"}</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-3">
          {categoryScores.length > 0 && categoryScores.some(c => c.score > 0) ? (
            categoryScores.map((cat, idx) => {
              const gradient = GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length];
              const level = getScoreLevel(cat.score, isAr);
              const isExpanded = expandedCategory === cat.id;

              return (
                <motion.div key={cat.id} initial={{ opacity: 0, x: isAr ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06, type: "spring", stiffness: 100 }}>
                  <Card className={`overflow-hidden border ${gradient.border} bg-gradient-to-br ${gradient.from} ${gradient.to} cursor-pointer hover:shadow-md transition-all duration-300`}
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <div className={`w-14 h-14 rounded-2xl ${gradient.icon} flex items-center justify-center text-3xl shadow-sm`}>{cat.emoji}</div>
                          <CircularScore score={cat.score} size={52} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-sm leading-tight">{isAr ? cat.titleAr : cat.titleEn}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] border-0 ${level.bg}`}>{level.label}</Badge>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown className="h-4 w-4 text-muted-foreground" /></motion.div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{isAr ? cat.descAr : cat.descEn}</p>
                          <div className="mt-2"><Progress value={cat.score} className="h-2" /></div>
                          <p className={`text-[11px] font-medium mt-1.5 ${getScoreColor(cat.score)}`}>{getScoreTip(cat.score, isAr)}</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && latestSurvey && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                            <div className="mt-4 pt-3 border-t border-border/30 space-y-2">
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{isAr ? "تفاصيل الإجابات" : "Answer Details"}</p>
                              {surveyCategories.find(c => c.id === cat.id)?.questions.map((q, qi) => {
                                const answer = latestSurvey.answers?.[q.id];
                                const answerNum = typeof answer === "number" ? answer : 0;
                                return (
                                  <motion.div key={q.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: qi * 0.05 }}
                                    className="flex items-center justify-between text-xs bg-background/50 rounded-lg p-2">
                                    <span className="text-muted-foreground flex-1 truncate">{isAr ? q.textAr : q.textEn}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {typeof answer === "number" && (
                                        <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map(i => (<div key={i} className={`w-2 h-2 rounded-full ${i <= answerNum ? "bg-primary" : "bg-muted"}`} />))}
                                        </div>
                                      )}
                                      <Badge variant="outline" className="text-[10px]">{answer !== undefined ? (typeof answer === "number" ? `${answer}/5` : String(answer)) : "—"}</Badge>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}><ClipboardList className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" /></motion.div>
                <h3 className="font-bold text-lg mb-2">{isAr ? "لا توجد بيانات بعد" : "No data yet"}</h3>
                <p className="text-sm text-muted-foreground mb-6">{isAr ? "أكملي تقييماً لعرض جميع البنود والتحليلات" : "Complete an assessment to view all categories"}</p>
                <Button onClick={() => navigate("/survey")} className="gap-2 rounded-full shadow-md"><PlayCircle className="h-4 w-4" />{isAr ? "ابدأ التقييم الآن" : "Start Assessment Now"}</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {radarData.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
                      {isAr ? "مخطط المهارات الشامل" : "Comprehensive Skills Radar"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <Radar dataKey="value" stroke="hsl(258, 58%, 58%)" fill="hsl(258, 58%, 58%)" fillOpacity={0.2} strokeWidth={2} dot={{ r: 4, fill: "hsl(258, 58%, 58%)" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {surveyTimeline.length > 1 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10"><TrendingUp className="h-4 w-4 text-emerald-500" /></div>
                      {isAr ? "تطور الدرجات عبر الزمن" : "Score Progress Over Time"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={surveyTimeline}>
                        <defs><linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(258, 58%, 58%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(258, 58%, 58%)" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="hsl(258, 58%, 58%)" fill="url(#scoreGradient)" strokeWidth={2.5} dot={{ fill: "hsl(258, 58%, 58%)", r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {categoryScores.some(c => c.score > 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10"><Award className="h-4 w-4 text-amber-500" /></div>
                    {isAr ? "مقارنة درجات جميع البنود" : "All Category Scores Comparison"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={categoryScores.filter(c => c.score > 0)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey={c => `${c.emoji} ${isAr ? c.titleAr.split(" ")[0] : c.titleEn.split(" ")[0]}`} tick={{ fontSize: 11 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20}>
                        {categoryScores.filter(c => c.score > 0).map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {analysis ? (
            <>
              {analysis.summary && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10"><Brain className="h-4 w-4 text-primary" /></div>
                      {isAr ? "🧠 ملخص التحليل الشامل" : "🧠 Comprehensive Analysis Summary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{typeof analysis.summary === "string" ? analysis.summary : (isAr ? analysis.summary.ar : analysis.summary.en)}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.indicators?.details && (
                <Card className={`border-0 shadow-lg ${
                  analysis.indicators.type === "gifted" ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5"
                    : analysis.indicators.type === "delayed" ? "bg-gradient-to-br from-rose-500/10 to-rose-500/5"
                    : "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
                }`}>
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="text-4xl">{analysis.indicators.type === "gifted" ? "🌟" : analysis.indicators.type === "delayed" ? "⚠️" : "✅"}</div>
                    <div>
                      <h4 className="font-bold text-sm mb-2">{isAr ? "🔍 المؤشرات المبكرة للتطور" : "🔍 Early Development Indicators"}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{typeof analysis.indicators.details === "string" ? analysis.indicators.details : (isAr ? analysis.indicators.details.ar : analysis.indicators.details.en)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.strengths && (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/15"><Star className="h-4 w-4 text-emerald-500" /></div>
                        {isAr ? "💪 نقاط القوة" : "💪 Strengths"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(Array.isArray(analysis.strengths) ? analysis.strengths : (isAr ? analysis.strengths.ar : analysis.strengths.en) || []).map((s: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2 bg-emerald-500/5 rounded-lg p-2"><span className="text-emerald-500 mt-0.5 shrink-0">✅</span><span>{s}</span></li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {analysis.improvements && (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/15"><Zap className="h-4 w-4 text-amber-500" /></div>
                        {isAr ? "🎯 مجالات التحسين" : "🎯 Areas to Improve"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(Array.isArray(analysis.improvements) ? analysis.improvements : (isAr ? analysis.improvements.ar : analysis.improvements.en) || []).map((s: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2 bg-amber-500/5 rounded-lg p-2"><span className="text-amber-500 mt-0.5 shrink-0">🔸</span><span>{s}</span></li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {analysis.recommendations && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/15"><BookOpen className="h-4 w-4 text-blue-500" /></div>
                      {isAr ? "📝 توصيات المعلمة" : "📝 Teacher Recommendations"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(Array.isArray(analysis.recommendations) ? analysis.recommendations : (isAr ? analysis.recommendations.ar : analysis.recommendations.en) || []).map((s: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2 bg-blue-500/5 rounded-lg p-2"><span className="text-blue-500 mt-0.5 shrink-0">💡</span><span>{s}</span></li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <Brain className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-lg mb-2">{isAr ? "لا توجد تحليلات بعد" : "No analysis yet"}</h3>
                <p className="text-sm text-muted-foreground mb-6">{isAr ? "أكملي استقصاءً للحصول على تحليل شامل بالذكاء الاصطناعي" : "Complete a survey for comprehensive AI analysis"}</p>
                <Button onClick={() => navigate("/survey")} className="gap-2 rounded-full shadow-md"><PlayCircle className="h-4 w-4" />{isAr ? "ابدأ التقييم" : "Start Assessment"}</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10"><Calendar className="h-4 w-4 text-emerald-500" /></div>
                  {isAr ? "إحصائيات الحضور" : "Attendance Statistics"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { emoji: "✅", label: isAr ? "حاضر" : "Present", value: attendanceStats?.present || 0, color: "text-emerald-600" },
                  { emoji: "❌", label: isAr ? "غائب" : "Absent", value: attendanceStats?.absent || 0, color: "text-rose-600" },
                  { emoji: "⏰", label: isAr ? "متأخر" : "Late", value: attendanceStats?.late || 0, color: "text-amber-600" },
                  { emoji: "📋", label: isAr ? "معذور" : "Excused", value: attendanceStats?.excused || 0, color: "text-blue-600" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm items-center bg-muted/30 rounded-lg p-2.5">
                    <span className="flex items-center gap-2">{item.emoji} {item.label}</span>
                    <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>{isAr ? "📊 نسبة الحضور" : "📊 Attendance Rate"}</span>
                    <span className="text-lg">{attendanceStats?.rate || 0}%</span>
                  </div>
                  <Progress value={attendanceStats?.rate || 0} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {attendancePieData.length > 0 && (
              <Card className="border-0 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10"><Users className="h-4 w-4 text-blue-500" /></div>
                    {isAr ? "التوزيع البياني" : "Visual Distribution"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {attendancePieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Parent Message Tab (NEW) */}
        <TabsContent value="parent" className="space-y-4">
          {analysis?.parentMessage ? (
            <>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-rose-500/15"><Heart className="h-5 w-5 text-rose-500" /></div>
                      {isAr ? "💌 رسالة خاصة للأهل" : "💌 Special Message for Parents"}
                    </CardTitle>
                    <CardDescription className="text-xs">{isAr ? "رسالة لطيفة يمكن مشاركتها مع ولي الأمر" : "A gentle message to share with parents"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background/60 rounded-2xl p-5 border border-rose-200/30 dark:border-rose-800/30 shadow-inner">
                      <p className="text-sm leading-loose italic">
                        "{typeof analysis.parentMessage === "string" ? analysis.parentMessage : (isAr ? analysis.parentMessage.ar : analysis.parentMessage.en)}"
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleShareWhatsApp} className="gap-2 rounded-full flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                        <Share2 className="h-4 w-4" />
                        {isAr ? "مشاركة عبر واتساب" : "Share via WhatsApp"}
                      </Button>
                      <Button variant="outline" className="gap-2 rounded-full" onClick={() => {
                        const msg = typeof analysis.parentMessage === "string" ? analysis.parentMessage : (isAr ? analysis.parentMessage.ar : analysis.parentMessage.en);
                        navigator.clipboard.writeText(msg || "");
                        toast.success(isAr ? "تم نسخ الرسالة" : "Message copied");
                      }}>
                        <MessageSquare className="h-4 w-4" />
                        {isAr ? "نسخ" : "Copy"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {analysis.actionPlan && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/15"><ClipboardList className="h-4 w-4 text-purple-500" /></div>
                        {isAr ? "📅 خطة العمل المنزلية" : "📅 Home Action Plan"}
                      </CardTitle>
                      <CardDescription className="text-xs">{isAr ? "خطوات عملية يمكن للأهل تطبيقها في المنزل" : "Practical steps parents can apply at home"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(Array.isArray(analysis.actionPlan) ? analysis.actionPlan : (isAr ? analysis.actionPlan.ar : analysis.actionPlan.en) || []).map((s: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-3 bg-purple-500/5 rounded-lg p-3">
                            <div className="shrink-0 w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-300">{i + 1}</div>
                            <span className="pt-1">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-lg mb-2">{isAr ? "لا توجد رسالة للأهل بعد" : "No parent message yet"}</h3>
                <p className="text-sm text-muted-foreground mb-6">{isAr ? "أكملي تقييماً لتوليد رسالة مخصصة للأهل" : "Complete an assessment to generate a parent message"}</p>
                <Button onClick={() => navigate("/survey")} className="gap-2 rounded-full shadow-md"><PlayCircle className="h-4 w-4" />{isAr ? "ابدأ التقييم" : "Start Assessment"}</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Survey History */}
      {surveys.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10"><ClipboardList className="h-4 w-4 text-blue-500" /></div>
                {isAr ? "📜 سجل الاستقصاءات" : "📜 Survey History"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {surveys.slice(0, 5).map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border bg-gradient-to-r from-muted/30 to-transparent hover:from-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.analysis ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>{s.analysis ? "✅" : "⏳"}</div>
                      <div>
                        <p className="text-sm font-medium">{new Date(s.date).toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                        <p className="text-[11px] text-muted-foreground">{Object.keys(s.answers).length} {isAr ? "إجابة" : "answers"}</p>
                      </div>
                    </div>
                    {s.analysis && (
                      <Badge className={`text-xs rounded-full ${
                        (s.analysis as any)?.indicators?.type === "gifted" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}>
                        {(s.analysis as any)?.indicators?.type === "gifted" ? "🌟 " : "✅ "}
                        {isAr ? ((s.analysis as any)?.indicators?.type === "gifted" ? "موهوب" : "مكتمل") : ((s.analysis as any)?.indicators?.type === "gifted" ? "Gifted" : "Complete")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
