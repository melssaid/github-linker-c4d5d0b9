export interface Student {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  studentId: string;
  date: string;
  answers: Record<string, number | string>;
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  teacherRecommendations: string[];
  parentMessage: string;
  actionPlan: string[];
  indicators: { type: string; details: string };
  scores: {
    attention: number;
    social: number;
    emotional: number;
    speech: number;
    motor: number;
    cognitive: number;
    creativity: number;
  };
}

const STORAGE_KEYS = {
  students: "kindertrack_students",
  surveys: "kindertrack_surveys",
};

export function getStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEYS.students);
  return data ? JSON.parse(data) : [];
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

export function addStudent(student: Omit<Student, "id" | "createdAt">): Student | null {
  const students = getStudents();
  if (students.length >= 30) return null;
  const newStudent: Student = {
    ...student,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

export function removeStudent(id: string) {
  const students = getStudents().filter(s => s.id !== id);
  saveStudents(students);
  // Also remove surveys
  const surveys = getSurveys().filter(s => s.studentId !== id);
  saveSurveys(surveys);
}

export function getSurveys(): SurveyResponse[] {
  const data = localStorage.getItem(STORAGE_KEYS.surveys);
  return data ? JSON.parse(data) : [];
}

export function saveSurveys(surveys: SurveyResponse[]) {
  localStorage.setItem(STORAGE_KEYS.surveys, JSON.stringify(surveys));
}

export function addSurvey(survey: Omit<SurveyResponse, "id">): SurveyResponse {
  const surveys = getSurveys();
  const newSurvey: SurveyResponse = { ...survey, id: crypto.randomUUID() };
  surveys.push(newSurvey);
  saveSurveys(surveys);
  return newSurvey;
}

export function updateSurveyAnalysis(surveyId: string, analysis: AnalysisResult) {
  const surveys = getSurveys();
  const idx = surveys.findIndex(s => s.id === surveyId);
  if (idx >= 0) {
    surveys[idx].analysis = analysis;
    saveSurveys(surveys);
  }
}

export function getStudentSurveys(studentId: string): SurveyResponse[] {
  return getSurveys().filter(s => s.studentId === studentId);
}
