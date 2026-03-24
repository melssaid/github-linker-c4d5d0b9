import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { surveyTranslations } from "@/data/surveyQuestions";

export type Locale = "en" | "ar";

type Translations = Record<string, Record<Locale, string>>;

const translations: Translations = {
  "app.title": { en: "Kinder BH", ar: "كيندر BH" },
  "app.subtitle": { en: "Child Development Tracker", ar: "متابعة تطور الأطفال" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.survey": { en: "Assessment", ar: "التقييم" },
  "nav.history": { en: "Reports", ar: "التقارير" },
  "nav.students": { en: "Students", ar: "الطلاب" },
  "nav.navigation": { en: "Navigation", ar: "التنقل" },
  "dashboard.title": { en: "Dashboard", ar: "لوحة التحكم" },
  "dashboard.subtitle": { en: "Track development across all domains", ar: "تتبع التطور عبر جميع المجالات" },
  "lang.switch": { en: "العربية", ar: "English" },
  "nav.attendance": { en: "Attendance", ar: "الحضور والغياب" },
  "attendance.title": { en: "Attendance", ar: "الحضور والغياب" },
  "attendance.subtitle": { en: "Track daily student attendance", ar: "تتبع حضور وغياب الطلاب يومياً" },
  "attendance.daily": { en: "Daily Record", ar: "السجل اليومي" },
  "attendance.stats": { en: "Statistics", ar: "الإحصائيات" },
  "attendance.dailyRecord": { en: "Daily Attendance", ar: "الحضور اليومي" },
  "attendance.student": { en: "Student", ar: "الطالب" },
  "attendance.status": { en: "Status", ar: "الحالة" },
  "attendance.markAll": { en: "All Present", ar: "حضور الجميع" },
  "attendance.noStudents": { en: "Add students first from the Students page", ar: "أضف طلاباً أولاً من صفحة الطلاب" },
  "attendance.totalStudents": { en: "Total Students", ar: "إجمالي الطلاب" },
  "attendance.avgRate": { en: "Avg. Attendance", ar: "متوسط الحضور" },
  "attendance.totalRecords": { en: "Total Records", ar: "إجمالي السجلات" },
  "attendance.lowAttendance": { en: "Low Attendance", ar: "حضور منخفض" },
  "attendance.chartTitle": { en: "Attendance Rate by Student", ar: "نسبة الحضور حسب الطالب" },
  "attendance.studentDetails": { en: "Student Details", ar: "تفاصيل الطلاب" },
  
  // Tour
  "tour.welcome": { 
    en: "Welcome to Kinder BH! Let me show you around 🌈", 
    ar: "مرحباً بك في كيندر BH! دعني أريك جولة سريعة 🌈" 
  },
  "tour.students": { 
    en: "Add and manage your students (up to 30)", 
    ar: "إضافة وإدارة طلابك (حتى 30 طالباً)" 
  },
  "tour.survey": { 
    en: "Assess child development across 10 key domains using evidence-based measures", 
    ar: "تقييم تطور الطفل عبر 10 مجالات رئيسية باستخدام مقاييس مبنية على الأدلة" 
  },
  "tour.attendance": { 
    en: "Track daily attendance with present, absent, late, and excused statuses", 
    ar: "سجّل الحضور اليومي بحالات حاضر، غائب، متأخر، ومعذور" 
  },
  "tour.history": { 
    en: "View AI-powered development reports and track progress over time", 
    ar: "اطّلع على تقارير التطور المدعومة بالذكاء الاصطناعي وتتبع التقدم" 
  },
  "tour.dashboard": { 
    en: "Your main dashboard shows class-wide statistics and alerts", 
    ar: "لوحة التحكم الرئيسية تعرض إحصاءات الفصل والتنبيهات" 
  },
  
  // Empty states
  "empty.students.title": { en: "No Students Yet", ar: "لا يوجد طلاب بعد" },
  "empty.students.description": { 
    en: "Start by adding your first student to begin tracking their development", 
    ar: "ابدأ بإضافة أول طالب لك لتتبع تطوره" 
  },
  "empty.students.action": { en: "Add Your First Student", ar: "أضف أول طالب" },
  
  "empty.surveys.title": { en: "Select a Student", ar: "اختر طالباً" },
  "empty.surveys.description": { 
    en: "Choose a student to begin their developmental assessment", 
    ar: "اختر طالباً لبدء تقييمه التطوري" 
  },
  
  "empty.history.title": { en: "No Reports Available", ar: "لا توجد تقارير" },
  "empty.history.description": { 
    en: "Complete assessments to see AI-powered development reports", 
    ar: "أكمل التقييمات لرؤية تقارير التطور المدعومة بالذكاء الاصطناعي" 
  },
  
  // Auth
  "auth.login": { en: "Sign In", ar: "تسجيل الدخول" },
  "auth.signup": { en: "Create Account", ar: "إنشاء حساب" },
  "auth.email": { en: "Email", ar: "البريد الإلكتروني" },
  "auth.password": { en: "Password", ar: "كلمة المرور" },
  "auth.fullName": { en: "Full Name", ar: "الاسم الكامل" },
  "auth.fullNamePlaceholder": { en: "e.g. Sarah Ahmad", ar: "مثال: سارة أحمد" },
  "auth.schoolName": { en: "School Name (optional)", ar: "اسم المدرسة (اختياري)" },
  "auth.schoolNamePlaceholder": { en: "e.g. Al-Noor Kindergarten", ar: "مثال: روضة النور" },
  "auth.subtitle": { en: "Child Development Tracking System", ar: "نظام متابعة تطور الأطفال" },
  "auth.hasAccount": { en: "Already have an account? Sign in", ar: "لديك حساب؟ سجل دخولك" },
  "auth.noAccount": { en: "Have an invite code? Sign up", ar: "لديك كود دعوة؟ أنشئ حساباً" },
  "auth.signupSuccess": { en: "Account created! Welcome.", ar: "تم إنشاء الحساب! أهلاً بك." },
  "auth.error": { en: "Authentication error", ar: "خطأ في المصادقة" },
  "auth.cloudNotice": { en: "☁️ Data is securely stored in the cloud", ar: "☁️ البيانات مخزنة بأمان في السحابة" },
  "storage.notice": { en: "☁️ Cloud-synced data", ar: "☁️ بيانات مزامنة سحابياً" },
};

// Merge survey translations
Object.entries(surveyTranslations).forEach(([key, val]) => {
  translations[key] = val as Record<Locale, string>;
});

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");
  const t = useCallback((key: string) => translations[key]?.[locale] ?? key, [locale]);
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Sync dir and lang on <html> element for global RTL support
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
