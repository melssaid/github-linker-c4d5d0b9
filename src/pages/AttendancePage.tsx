import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { useI18n } from "@/i18n";
import { getStudents, DbStudent } from "@/lib/database";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";

const AttendancePage = () => {
  const { t, locale } = useI18n();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [students, setStudents] = useState<DbStudent[]>([]);
  const dateLocale = locale === "ar" ? ar : enUS;

  useEffect(() => { getStudents().then(setStudents); }, []);

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-3">
          <PageHeader 
            title={t("attendance.title")}
            description={t("attendance.subtitle")}
            tooltip={locale === "ar" ? "حاضر 🟢 | غائب 🔴 | متأخر 🟡 | معذور 🔵" : "Present 🟢 | Absent 🔴 | Late 🟡 | Excused 🔵"}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("w-full sm:w-[220px] justify-start text-start font-normal gap-2 text-sm self-start")}>
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "PPP", { locale: dateLocale })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="daily" className="flex-1 sm:flex-none text-sm">{t("attendance.daily")}</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 sm:flex-none text-sm">{t("attendance.stats")}</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <AttendanceTable students={students} date={selectedDate} refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />
          </TabsContent>
          <TabsContent value="stats">
            <AttendanceStats students={students} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
