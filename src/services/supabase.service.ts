/**
 * Supabase service layer.
 * Re-exports the typed Supabase client and provides higher-level helpers for
 * the most common database operations.  Prefer using these helpers over calling
 * `supabase.from(...)` directly in components so that queries stay consistent
 * and can be updated from a single location.
 */

export { supabase } from "@/integrations/supabase/client";
export type { Database } from "@/integrations/supabase/types";

export {
  // Profile
  getProfile,
  // Students
  getStudents,
  addStudent,
  removeStudent,
  // Surveys
  getSurveys,
  getStudentSurveys,
  addSurvey,
  updateSurveyAnalysis,
  // Attendance
  getAttendanceForDate,
  setAttendance,
  getStudentAttendance,
  getAttendanceStats,
} from "@/lib/database";

export type {
  DbStudent,
  DbSurvey,
  DbAttendance,
  DbProfile,
} from "@/lib/database";
