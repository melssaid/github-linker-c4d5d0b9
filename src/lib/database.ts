import { supabase } from "@/integrations/supabase/client";

export interface DbStudent {
  id: string;
  teacher_id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  kindergarten_id: string | null;
  created_at: string;
}

export interface DbSurvey {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  answers: Record<string, number | string>;
  analysis: any | null;
}

export interface DbAttendance {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
}

export interface DbProfile {
  id: string;
  full_name: string;
  school_name: string | null;
  created_at: string;
}

// Profile
export async function getProfile(userId: string): Promise<DbProfile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data as DbProfile | null;
}

// Students
export async function getStudents(teacherId?: string): Promise<DbStudent[]> {
  let query = supabase.from("students").select("*").order("created_at", { ascending: true });
  if (teacherId) query = query.eq("teacher_id", teacherId);
  const { data } = await query;
  return (data || []) as DbStudent[];
}

export async function addStudent(student: { name: string; age: number; gender: string }, teacherId: string): Promise<DbStudent | null> {
  const { data, error } = await supabase.from("students").insert({ ...student, teacher_id: teacherId }).select().single();
  if (error) { console.error("addStudent error:", error); return null; }
  return data as DbStudent;
}

export async function removeStudent(id: string) {
  await supabase.from("students").delete().eq("id", id);
}

// Surveys
export async function getSurveys(): Promise<DbSurvey[]> {
  const { data } = await supabase.from("surveys").select("*").order("date", { ascending: false });
  return (data || []) as DbSurvey[];
}

export async function getStudentSurveys(studentId: string): Promise<DbSurvey[]> {
  const { data } = await supabase.from("surveys").select("*").eq("student_id", studentId).order("date", { ascending: false });
  return (data || []) as DbSurvey[];
}

export async function addSurvey(survey: { student_id: string; teacher_id: string; answers: Record<string, number | string> }): Promise<DbSurvey | null> {
  const { data, error } = await supabase.from("surveys").insert({ ...survey, date: new Date().toISOString() }).select().single();
  if (error) { console.error("addSurvey error:", error); return null; }
  return data as DbSurvey;
}

export async function updateSurveyAnalysis(surveyId: string, analysis: any) {
  await supabase.from("surveys").update({ analysis }).eq("id", surveyId);
}

// Attendance
export async function getAttendanceForDate(date: string): Promise<DbAttendance[]> {
  const { data } = await supabase.from("attendance").select("*").eq("date", date);
  return (data || []) as DbAttendance[];
}

export async function setAttendance(studentId: string, date: string, status: string, teacherId: string) {
  const { data: existing } = await supabase.from("attendance").select("id").eq("student_id", studentId).eq("date", date).single();
  if (existing) {
    await supabase.from("attendance").update({ status }).eq("id", existing.id);
  } else {
    await supabase.from("attendance").insert({ student_id: studentId, teacher_id: teacherId, date, status });
  }
}

export async function getStudentAttendance(studentId: string): Promise<DbAttendance[]> {
  const { data } = await supabase.from("attendance").select("*").eq("student_id", studentId);
  return (data || []) as DbAttendance[];
}

export async function getAttendanceStats(studentId: string) {
  const records = await getStudentAttendance(studentId);
  const total = records.length;
  const present = records.filter(r => r.status === "present").length;
  const absent = records.filter(r => r.status === "absent").length;
  const late = records.filter(r => r.status === "late").length;
  const excused = records.filter(r => r.status === "excused").length;
  return { total, present, absent, late, excused, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
}
