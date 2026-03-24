import { useQuery } from "@tanstack/react-query";
import { getStudents, DbStudent } from "@/lib/database";

export function useStudents(teacherId?: string) {
  return useQuery<DbStudent[]>({
    queryKey: ["students", teacherId ?? "all"],
    queryFn: () => getStudents(teacherId),
  });
}
