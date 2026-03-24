import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { useI18n } from "@/i18n";
import { getStudents, DbStudent } from "@/lib/database";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

const SurveyPage = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<DbStudent | null>(null);

  useEffect(() => { getStudents().then(setStudents); }, []);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <PageHeader 
          title={locale === "ar" ? "استقصاء سلوكي" : "Behavioral Survey"}
          description={locale === "ar" ? "املأ الاستقصاء لتحليل سلوك وتطور الطفل" : "Fill the survey to analyze child behavior and development"}
          tooltip={locale === "ar" ? "يحلل الذكاء الاصطناعي الإجابات لتحديد نقاط القوة ومجالات التطوير" : "AI analyzes answers to identify strengths and development areas"}
        />

        {students.length === 0 ? (
          <EmptyState 
            icon={Users}
            title={t("empty.students.title")}
            description={t("empty.students.description")}
          />
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{locale === "ar" ? "اختر الطالب" : "Select Student"}</CardTitle>
                <CardDescription className="text-xs">{locale === "ar" ? "اختر طالباً لملء استقصاءه" : "Choose a student to fill their survey"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedStudent?.id || ""} onValueChange={(id) => setSelectedStudent(students.find(s => s.id === id) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === "ar" ? "اختر طالباً..." : "Select a student..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.gender === "male" ? "👦" : "👧"} {student.name} ({student.age} {locale === "ar" ? "سنوات" : "years"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedStudent ? (
              <SurveyForm student={selectedStudent} onComplete={() => navigate("/history")} />
            ) : (
              <EmptyState 
                icon={ClipboardList}
                title={t("empty.surveys.title")}
                description={t("empty.surveys.description")}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SurveyPage;
