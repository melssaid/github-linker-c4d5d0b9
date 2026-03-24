import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface StudentInfo { id: string; name: string; age: number; gender: string; teacher_id: string; }
interface SurveyInfo { id: string; student_id: string; teacher_id: string; date: string | null; analysis: any; }
interface TeacherInfo { id: string; full_name: string; }

interface Props {
  students: StudentInfo[];
  surveys: SurveyInfo[];
  teachers: TeacherInfo[];
}

export function KgInsights({ students, surveys, teachers }: Props) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const insights = useMemo(() => {
    const items: { icon: typeof TrendingUp; color: string; title: string; value: string }[] = [];

    // Coverage rate
    const studentsWithSurveys = new Set(surveys.map(s => s.student_id));
    const coverage = students.length > 0 ? Math.round((studentsWithSurveys.size / students.length) * 100) : 0;
    items.push({
      icon: coverage >= 80 ? CheckCircle2 : coverage >= 50 ? Clock : AlertTriangle,
      color: coverage >= 80 ? "text-[hsl(142,71%,45%)]" : coverage >= 50 ? "text-[hsl(43,96%,56%)]" : "text-destructive",
      title: isAr ? "نسبة التغطية" : "Survey Coverage",
      value: `${coverage}%`,
    });

    // Students needing support
    const needSupport = new Set<string>();
    surveys.forEach(s => {
      if (s.analysis?.indicators?.type === "delayed") needSupport.add(s.student_id);
    });
    items.push({
      icon: needSupport.size > 0 ? AlertTriangle : CheckCircle2,
      color: needSupport.size > 0 ? "text-destructive" : "text-[hsl(142,71%,45%)]",
      title: isAr ? "يحتاجون دعم" : "Need Support",
      value: `${needSupport.size}`,
    });

    // Advanced students
    const advanced = new Set<string>();
    surveys.forEach(s => {
      if (s.analysis?.indicators?.type === "gifted") advanced.add(s.student_id);
    });
    items.push({
      icon: TrendingUp,
      color: "text-primary",
      title: isAr ? "متقدمون" : "Advanced",
      value: `${advanced.size}`,
    });

    // Avg surveys per student
    const avgSurveys = students.length > 0 ? (surveys.length / students.length).toFixed(1) : "0";
    items.push({
      icon: TrendingUp,
      color: "text-secondary-foreground",
      title: isAr ? "متوسط التقييمات/طالب" : "Avg Surveys/Student",
      value: avgSurveys,
    });

    return items;
  }, [students, surveys, isAr]);

  if (students.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {insights.map((item, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <item.icon className={`h-5 w-5 ${item.color}`} />
            <p className="text-lg font-bold leading-none">{item.value}</p>
            <p className="text-[10px] text-muted-foreground">{item.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
