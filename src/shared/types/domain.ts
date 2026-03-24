export type Gender = 'male' | 'female';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  teacherId: string;
  kindergartenId: string | null;
  name: string;
  age: number;
  gender: Gender;
  createdAt: string;
}

export interface Survey {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  answers: Record<string, number | string>;
  analysis: unknown | null;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
}