import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { surveyCategories, surveyTranslations } from "@/data/surveyQuestions";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";

interface StudentInfo { id: string; name: string; age: number; gender: string; teacher_id: string; }
interface SurveyInfo { id: string; student_id: string; teacher_id: string; date: string | null; analysis: any; }
interface TeacherInfo { id: string; full_name: string; }

interface Props {
  students: StudentInfo[];
  surveys: SurveyInfo[];
  teachers: TeacherInfo[];
}

const COLORS = [
  "hsl(199, 89%, 48%)",  // primary
  "hsl(142, 71%, 45%)",  // success
  "hsl(43, 96%, 56%)",   // warning/secondary
  "hsl(330, 81%, 60%)",  // accent
  "hsl(262, 80%, 60%)",  // purple
  "hsl(15, 90%, 55%)",   // orange
];

export function KgCharts({ students, surveys, teachers }: Props) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  // 1. Gender distribution
  const genderData = useMemo(() => {
    const males = students.filter(s => s.gender === "male").length;
    const females = students.filter(s => s.gender === "female").length;
    return [
      { name: isAr ? "ذكور" : "Males", value: males },
      { name: isAr ? "إناث" : "Females", value: females },
    ].filter(d => d.value > 0);
  }, [students, isAr]);

  // 2. Age distribution
  const ageData = useMemo(() => {
    const groups: Record<number, number> = {};
    students.forEach(s => { groups[s.age] = (groups[s.age] || 0) + 1; });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([age, count]) => ({
        name: isAr ? `${age} سنوات` : `${age} yrs`,
        count,
      }));
  }, [students, isAr]);

  // 3. Teacher workload (students per teacher)
  const teacherWorkload = useMemo(() => {
    return teachers.map(t => ({
      name: t.full_name.split(" ")[0],
      students: students.filter(s => s.teacher_id === t.id).length,
      surveys: surveys.filter(s => s.teacher_id === t.id).length,
    })).sort((a, b) => b.students - a.students);
  }, [teachers, students, surveys]);

  // 4. Development indicators distribution
  const indicatorData = useMemo(() => {
    const counts = { gifted: 0, typical: 0, delayed: 0, mixed: 0 };
    const analyzed = surveys.filter(s => s.analysis?.indicators?.type);
    analyzed.forEach(s => {
      const type = s.analysis.indicators.type as keyof typeof counts;
      if (counts[type] !== undefined) counts[type]++;
    });
    const labels: Record<string, string> = {
      gifted: isAr ? "متقدم" : "Advanced",
      typical: isAr ? "ضمن المسار" : "On Track",
      delayed: isAr ? "يحتاج دعم" : "Needs Support",
      mixed: isAr ? "متفاوت" : "Mixed",
    };
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: labels[key], value }));
  }, [surveys, isAr]);

  // 5. Average domain scores (radar)
  const domainScores = useMemo(() => {
    const analyzedSurveys = surveys.filter(s => s.analysis?.scores);
    if (analyzedSurveys.length === 0) return [];

    return surveyCategories.map(cat => {
      const scores = analyzedSurveys
        .map(s => s.analysis?.scores?.[cat.id])
        .filter((v: any) => typeof v === "number") as number[];
      const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
      const label = surveyTranslations[cat.titleKey]?.[locale] || cat.id;
      // Shorten label for radar
      const shortLabel = label.length > 12 ? label.substring(0, 12) + "…" : label;
      return { domain: shortLabel, score: Math.round(avg * 10) / 10, fullMark: 5 };
    });
  }, [surveys, locale]);

  // 6. Surveys over time (last 8 weeks)
  const surveyTimeline = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = surveys.filter(s => {
        if (!s.date) return false;
        const d = new Date(s.date);
        return d >= weekStart && d < weekEnd;
      }).length;
      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeks.push({ label, count });
    }
    return weeks;
  }, [surveys]);

  const indicatorColors = ["hsl(199, 89%, 48%)", "hsl(142, 71%, 45%)", "hsl(0, 84%, 60%)", "hsl(43, 96%, 56%)"];

  if (students.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {/* Gender Distribution */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pb-1">
          <CardTitle className="text-xs sm:text-sm">{isAr ? "توزيع الجنس" : "Gender Distribution"}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-3">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Age Distribution */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pb-1">
          <CardTitle className="text-xs sm:text-sm">{isAr ? "توزيع الأعمار" : "Age Distribution"}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-3">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ageData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name={isAr ? "عدد" : "Count"} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Teacher Workload */}
      {teacherWorkload.length > 0 && (
        <Card>
          <CardHeader className="px-3 sm:px-6 pb-1">
            <CardTitle className="text-xs sm:text-sm">{isAr ? "حجم عمل المعلمات" : "Teacher Workload"}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={teacherWorkload} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} name={isAr ? "طلاب" : "Students"} />
                <Bar dataKey="surveys" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} name={isAr ? "تقييمات" : "Surveys"} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Development Indicators */}
      {indicatorData.length > 0 && (
        <Card>
          <CardHeader className="px-3 sm:px-6 pb-1">
            <CardTitle className="text-xs sm:text-sm">{isAr ? "مستويات التطور" : "Development Levels"}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={indicatorData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {indicatorData.map((_, i) => <Cell key={i} fill={indicatorColors[i % indicatorColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Domain Scores Radar */}
      {domainScores.length > 0 && (
        <Card className="sm:col-span-2">
          <CardHeader className="px-3 sm:px-6 pb-1">
            <CardTitle className="text-xs sm:text-sm">{isAr ? "متوسط درجات المجالات" : "Average Domain Scores"}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={domainScores}>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                <Radar name={isAr ? "المتوسط" : "Average"} dataKey="score" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Survey Timeline */}
      {surveyTimeline.some(w => w.count > 0) && (
        <Card className="sm:col-span-2">
          <CardHeader className="px-3 sm:px-6 pb-1">
            <CardTitle className="text-xs sm:text-sm">{isAr ? "التقييمات خلال الأسابيع" : "Surveys Over Weeks"}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={surveyTimeline}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(330, 81%, 60%)" radius={[4, 4, 0, 0]} name={isAr ? "تقييمات" : "Surveys"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
