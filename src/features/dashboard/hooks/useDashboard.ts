import { useMemo } from "react";
import { useStudents } from "@/features/students/hooks/useStudents";
import { useAssessments } from "@/features/assessments/hooks/useAssessments";
import { DbStudent, DbSurvey } from "@/lib/database";

export interface StudentStatus {
  student: DbStudent;
  latest: DbSurvey | null;
  status: "new" | "needs_survey" | "analyzed";
  surveyCount: number;
}

export function useDashboard() {
  const studentsQuery = useStudents();
  const assessmentsQuery = useAssessments();

  const data = useMemo(() => {
    const students = studentsQuery.data ?? [];
    const assessments = assessmentsQuery.data ?? [];
    const analyzedSurveys = assessments.filter((s) => s.analysis);

    const studentStatusMap: StudentStatus[] = students.map((st) => {
      const studentSurveys = assessments.filter((s) => s.student_id === st.id);
      const analyzedStudentSurveys = studentSurveys.filter((s) => s.analysis);
      const latest =
        analyzedStudentSurveys.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0] || null;
      let status: "new" | "needs_survey" | "analyzed" = "new";
      if (latest) status = "analyzed";
      else if (studentSurveys.length > 0) status = "analyzed";
      else status = "needs_survey";
      return { student: st, latest, status, surveyCount: studentSurveys.length };
    });

    const needsSurvey = studentStatusMap.filter((x) => x.status === "needs_survey").length;
    const analyzed = studentStatusMap.filter((x) => x.latest).length;
    const totalProgress =
      students.length > 0 ? Math.round((analyzed / students.length) * 100) : 0;

    return {
      students,
      assessments,
      analyzedSurveys,
      studentStatusMap,
      needsSurvey,
      analyzed,
      totalProgress,
      totals: {
        students: students.length,
        assessments: assessments.length,
        analyzed: analyzedSurveys.length,
      },
    };
  }, [studentsQuery.data, assessmentsQuery.data]);

  return {
    ...data,
    isLoading: studentsQuery.isLoading || assessmentsQuery.isLoading,
  };
}
