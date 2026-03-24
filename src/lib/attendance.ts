import { format } from "date-fns";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

const STORAGE_KEY = "kindertrack_attendance";

export function getAttendanceRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAttendanceRecords(records: AttendanceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function setAttendance(studentId: string, date: Date, status: AttendanceStatus) {
  const records = getAttendanceRecords();
  const dateStr = format(date, "yyyy-MM-dd");
  const idx = records.findIndex(r => r.studentId === studentId && r.date === dateStr);
  if (idx >= 0) {
    records[idx].status = status;
  } else {
    records.push({ studentId, date: dateStr, status });
  }
  saveAttendanceRecords(records);
}

export function getAttendanceForDate(date: Date): AttendanceRecord[] {
  const dateStr = format(date, "yyyy-MM-dd");
  return getAttendanceRecords().filter(r => r.date === dateStr);
}

export function getStudentAttendance(studentId: string): AttendanceRecord[] {
  return getAttendanceRecords().filter(r => r.studentId === studentId);
}

export function getAttendanceStats(studentId: string) {
  const records = getStudentAttendance(studentId);
  const total = records.length;
  const present = records.filter(r => r.status === "present").length;
  const absent = records.filter(r => r.status === "absent").length;
  const late = records.filter(r => r.status === "late").length;
  const excused = records.filter(r => r.status === "excused").length;
  return { total, present, absent, late, excused, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
}
