import { useQuery } from "@tanstack/react-query";
import { getSurveys, DbSurvey } from "@/lib/database";

export function useAssessments() {
  return useQuery<DbSurvey[]>({
    queryKey: ["assessments"],
    queryFn: () => getSurveys(),
  });
}
