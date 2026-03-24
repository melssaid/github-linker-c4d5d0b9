import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { getStudents, getSurveys, DbStudent, DbSurvey } from "@/lib/database";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { FileText, Brain } from "lucide-react";

const ReportsPage = () => {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [surveys, setSurveys] = useState<DbSurvey[]>([]);

  useEffect(() => {
    getStudents().then(setStudents);
    getSurveys().then(setSurveys);
  }, []);

  const analyzedSurveys = surveys.filter(s => s.analysis);

  // Group by student
  const studentReports = students
    .map(st => {
      const stSurveys = analyzedSurveys.filter(s => s.student_id === st.id);
      const latest = stSurveys.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      return { student: st, surveyCount: stSurveys.length, latest };
    })
    .filter(sr => sr.surveyCount > 0)
    .sort((a, b) => new Date(b.latest?.date || 0).getTime() - new Date(a.latest?.date || 0).getTime());

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title={isAr ? "التقارير" : "Reports"}
          description={isAr ? "جميع تقارير التحليل حسب الطالب" : "All analysis reports by student"}
        />

        {studentReports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={isAr ? "لا توجد تقارير بعد" : "No Reports Yet"}
            description={isAr ? "أجرِ تقييماً لطالب من صفحة الملف الشخصي" : "Run an assessment from a student profile to see reports"}
          />
        ) : (
          <div className="space-y-2">
            {studentReports.map(({ student, surveyCount, latest }) => (
              <Card
                key={student.id}
                className="cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className="text-2xl shrink-0">{student.gender === "male" ? "👦" : "👧"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{student.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{surveyCount} {isAr ? "تقرير" : "reports"}</span>
                      {latest && (
                        <>
                          <span>•</span>
                          <span>{new Date(latest.date).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}</span>
                        </>
                      )}
                    </div>
                    {latest?.analysis?.indicators?.type && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {latest.analysis.indicators.type === "gifted" ? "🌟" : "✅"} {isAr ? "آخر تحليل" : "Latest analysis"}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="h-10 min-w-[44px] text-xs gap-1">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">{isAr ? "عرض" : "View"}</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
