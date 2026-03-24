import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/i18n";
import { DbStudent } from "@/lib/database";
import { getAttendanceStats } from "@/lib/database";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AttendanceStatsProps {
  students: DbStudent[];
}

export function AttendanceStats({ students }: AttendanceStatsProps) {
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<{ student: DbStudent; stats: { total: number; present: number; absent: number; late: number; excused: number; rate: number } }[]>([]);

  useEffect(() => {
    Promise.all(students.map(async s => ({ student: s, stats: await getAttendanceStats(s.id) }))).then(setStats);
  }, [students]);

  const chartData = stats.filter(s => s.stats.total > 0).map(s => ({
    name: s.student.name.length > 8 ? s.student.name.slice(0, 8) + "…" : s.student.name,
    rate: s.stats.rate,
    present: s.stats.present,
    absent: s.stats.absent,
  }));

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">{t("attendance.noStudents")}</CardContent>
      </Card>
    );
  }

  const totalRecords = stats.reduce((sum, s) => sum + s.stats.total, 0);
  const avgRate = stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.stats.rate, 0) / stats.filter(s => s.stats.total > 0).length) || 0 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{students.length}</p><p className="text-xs text-muted-foreground">{t("attendance.totalStudents")}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{avgRate}%</p><p className="text-xs text-muted-foreground">{t("attendance.avgRate")}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{totalRecords}</p><p className="text-xs text-muted-foreground">{t("attendance.totalRecords")}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-destructive">{stats.filter(s => s.stats.rate < 70 && s.stats.total > 0).length}</p><p className="text-xs text-muted-foreground">{t("attendance.lowAttendance")}</p></CardContent></Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t("attendance.chartTitle")}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`${value}%`, locale === "ar" ? "نسبة الحضور" : "Attendance"]} />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 80 ? "hsl(152, 60%, 52%)" : entry.rate >= 60 ? "hsl(38, 92%, 60%)" : "hsl(0, 72%, 60%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">{t("attendance.studentDetails")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {stats.map(s => (
            <div key={s.student.id} className="flex items-center gap-3">
              <span className="text-base">{s.student.gender === "male" ? "👦" : "👧"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">{s.student.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {s.stats.total > 0 ? `${s.stats.rate}% (${s.stats.present}/${s.stats.total})` : locale === "ar" ? "لا توجد بيانات" : "No data"}
                  </span>
                </div>
                <Progress value={s.stats.rate} className="h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
