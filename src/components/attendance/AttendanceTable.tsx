import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, FileText, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { DbStudent } from "@/lib/database";
import { getAttendanceForDate, setAttendance as dbSetAttendance } from "@/lib/database";
import { format } from "date-fns";
import { toast } from "sonner";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

interface AttendanceTableProps {
  students: DbStudent[];
  date: Date;
  refreshKey: number;
  onRefresh: () => void;
}

const statusConfig: Record<AttendanceStatus, { icon: typeof Check; color: string; label: string; labelAr: string }> = {
  present: { icon: Check, color: "bg-emerald-500/15 text-emerald-700 border-emerald-200", label: "Present", labelAr: "حاضر" },
  absent: { icon: X, color: "bg-destructive/15 text-destructive border-destructive/30", label: "Absent", labelAr: "غائب" },
  late: { icon: Clock, color: "bg-amber-500/15 text-amber-700 border-amber-200", label: "Late", labelAr: "متأخر" },
  excused: { icon: FileText, color: "bg-blue-500/15 text-blue-700 border-blue-200", label: "Excused", labelAr: "بعذر" },
};

export function AttendanceTable({ students, date, refreshKey, onRefresh }: AttendanceTableProps) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    const dateStr = format(date, "yyyy-MM-dd");
    getAttendanceForDate(dateStr).then(dayRecords => {
      const map: Record<string, AttendanceStatus> = {};
      dayRecords.forEach(r => { map[r.student_id] = r.status as AttendanceStatus; });
      setRecords(map);
    });
  }, [date, refreshKey]);

  const handleStatus = useCallback(async (studentId: string, status: AttendanceStatus) => {
    if (!user) return;
    const dateStr = format(date, "yyyy-MM-dd");
    await dbSetAttendance(studentId, dateStr, status, user.id);
    setRecords(prev => ({ ...prev, [studentId]: status }));
  }, [date, user]);

  const markAllPresent = async () => {
    if (!user) return;
    const dateStr = format(date, "yyyy-MM-dd");
    for (const s of students) {
      await dbSetAttendance(s.id, dateStr, "present", user.id);
    }
    onRefresh();
    toast.success(locale === "ar" ? "تم تسجيل حضور الجميع" : "All marked present");
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">{t("attendance.noStudents")}</CardContent>
      </Card>
    );
  }

  const presentCount = Object.values(records).filter(s => s === "present").length;
  const absentCount = Object.values(records).filter(s => s === "absent").length;
  const lateCount = Object.values(records).filter(s => s === "late").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">{t("attendance.dailyRecord")}</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs gap-1"><Check className="h-3 w-3" /> {presentCount}</Badge>
            <Badge variant="secondary" className="text-xs gap-1 bg-destructive/10 text-destructive"><X className="h-3 w-3" /> {absentCount}</Badge>
            <Badge variant="secondary" className="text-xs gap-1 bg-amber-500/10 text-amber-700"><Clock className="h-3 w-3" /> {lateCount}</Badge>
            <Button size="sm" variant="outline" onClick={markAllPresent} className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" />{t("attendance.markAll")}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10">#</TableHead>
                <TableHead>{t("attendance.student")}</TableHead>
                <TableHead className="text-center">{t("attendance.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, i) => {
                const current = records[student.id];
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-muted-foreground text-xs">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{student.gender === "male" ? "👦" : "👧"}</span>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t("students.age")}: {student.age}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {(Object.keys(statusConfig) as AttendanceStatus[]).map(status => {
                          const cfg = statusConfig[status];
                          const Icon = cfg.icon;
                          const isActive = current === status;
                          return (
                            <Button key={status} size="sm" variant="outline" className={`h-7 px-2 text-[10px] gap-1 transition-all ${isActive ? cfg.color + " border font-semibold shadow-sm" : "opacity-50 hover:opacity-80"}`} onClick={() => handleStatus(student.id, status)}>
                              <Icon className="h-3 w-3" />
                              <span className="hidden sm:inline">{locale === "ar" ? cfg.labelAr : cfg.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
