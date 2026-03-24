import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useI18n } from "@/i18n";
import { getStudents, DbStudent } from "@/lib/database";
import { PageHeader } from "@/components/common/PageHeader";
import { StudentManager } from "@/components/students/StudentManager";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const StudentsPage = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const { isAdmin, isKgAdmin } = useRole();
  const [searchParams] = useSearchParams();
  const teacherIdParam = searchParams.get("teacher");

  const [students, setStudents] = useState<DbStudent[]>([]);
  const [teacherName, setTeacherName] = useState<string | null>(null);

  // Admin or KG Admin can view a specific teacher's students
  const targetTeacherId = (isAdmin || isKgAdmin) ? teacherIdParam : null;

  useEffect(() => {
    if (targetTeacherId) {
      supabase.from("profiles").select("full_name").eq("id", targetTeacherId).single()
        .then(({ data }) => setTeacherName(data?.full_name || null));
    }
  }, [targetTeacherId]);

  const refreshStudents = () => {
    getStudents(targetTeacherId || undefined).then(setStudents);
  };

  useEffect(() => { refreshStudents(); }, [targetTeacherId]);

  const handleSelectStudent = (student: DbStudent | null) => {
    if (student) {
      navigate(`/students/${student.id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {targetTeacherId && teacherName && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate(isKgAdmin ? "/kg-admin/teachers" : "/admin/teachers")} className="gap-1 text-xs">
              <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              {isAr ? "رجوع للحسابات" : "Back to Accounts"}
            </Button>
            <Badge variant="secondary" className="text-xs">
              {isAr ? `طلاب: ${teacherName}` : `Students of: ${teacherName}`}
            </Badge>
          </div>
        )}

        <PageHeader
          title={targetTeacherId ? (isAr ? `طلاب ${teacherName || ""}` : `${teacherName || ""}'s Students`) : t("students.title")}
          description={isAr ? "أضف طلابك واضغط على أي طالب لفتح ملفه الشامل" : "Add students and tap any student to open their full profile"}
          tooltip={isAr ? "يمكنك إضافة حتى 30 طالباً" : "You can add up to 30 students"}
        />
        <StudentManager
          students={students}
          onStudentsChange={refreshStudents}
          selectedStudent={null}
          onSelectStudent={handleSelectStudent}
          overrideTeacherId={targetTeacherId || undefined}
        />
      </div>
    </DashboardLayout>
  );
};

export default StudentsPage;
