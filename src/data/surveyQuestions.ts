import { Locale } from "@/i18n";

export interface SurveyCategory {
  id: string;
  titleKey: string;
  icon: string;
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  textEn: string;
  textAr: string;
  type: "scale" | "choice";
  options?: { en: string; ar: string; value: number }[];
}

// Simplified essential assessment — 6 core domains, ~15 questions total
export const surveyCategories: SurveyCategory[] = [
  {
    id: "cognitive",
    titleKey: "survey.cognitive",
    icon: "🧠",
    questions: [
      { id: "cog1", textEn: "Can the child sort objects by color, shape, or size?", textAr: "هل يستطيع الطفل تصنيف الأشياء حسب اللون أو الشكل أو الحجم؟", type: "scale" },
      { id: "cog3", textEn: "Can the child count objects up to 10 correctly?", textAr: "هل يستطيع الطفل عدّ الأشياء حتى 10 بشكل صحيح؟", type: "scale" },
      { id: "cog5", textEn: "Can the child follow 2-3 step instructions?", textAr: "هل يستطيع الطفل اتباع تعليمات من 2-3 خطوات؟", type: "scale" },
    ],
  },
  {
    id: "language",
    titleKey: "survey.language",
    icon: "💬",
    questions: [
      { id: "lan1", textEn: "Does the child speak in sentences of 4+ words?", textAr: "هل يتحدث الطفل بجمل من 4 كلمات أو أكثر؟", type: "scale" },
      { id: "lan3", textEn: "Does the child understand questions (who, what, where)?", textAr: "هل يفهم الطفل أسئلة (مَن، ماذا، أين)؟", type: "scale" },
    ],
  },
  {
    id: "social_emotional",
    titleKey: "survey.social_emotional",
    icon: "❤️",
    questions: [
      { id: "se1", textEn: "Does the child play cooperatively with other children?", textAr: "هل يلعب الطفل بشكل تعاوني مع الأطفال الآخرين؟", type: "scale" },
      { id: "se4", textEn: "Can the child wait for their turn and share?", textAr: "هل يستطيع الطفل انتظار دوره والمشاركة؟", type: "scale" },
      { id: "se5", textEn: "How well does the child manage frustration and anger?", textAr: "ما مدى قدرة الطفل على إدارة الإحباط والغضب؟", type: "scale" },
    ],
  },
  {
    id: "motor",
    titleKey: "survey.motor",
    icon: "🏃",
    questions: [
      { id: "gm1", textEn: "Can the child run, jump, and climb with coordination?", textAr: "هل يستطيع الطفل الجري والقفز والتسلق بتناسق؟", type: "scale" },
      { id: "fm1", textEn: "Can the child hold a pencil/crayon with proper grip?", textAr: "هل يستطيع الطفل مسك القلم/الطباشير بالمسكة الصحيحة؟", type: "scale" },
    ],
  },
  {
    id: "self_care",
    titleKey: "survey.self_care",
    icon: "🧽",
    questions: [
      { id: "sc1", textEn: "Can the child eat independently using utensils?", textAr: "هل يستطيع الطفل الأكل بشكل مستقل باستخدام أدوات الطعام؟", type: "scale" },
      { id: "sc2", textEn: "Can the child use the toilet independently?", textAr: "هل يستطيع الطفل استخدام الحمام بشكل مستقل؟", type: "scale" },
    ],
  },
  {
    id: "daily_mood",
    titleKey: "survey.daily_mood",
    icon: "😊",
    questions: [
      { id: "dm1", textEn: "What is the child's overall mood today?", textAr: "ما مزاج الطفل العام اليوم؟", type: "choice", options: [
        { en: "Very Happy", ar: "سعيد جداً", value: 5 },
        { en: "Happy", ar: "سعيد", value: 4 },
        { en: "Neutral", ar: "محايد", value: 3 },
        { en: "Upset", ar: "منزعج", value: 2 },
        { en: "Very Upset", ar: "منزعج جداً", value: 1 },
      ]},
      { id: "dm2", textEn: "How was the child's energy level today?", textAr: "كيف كان مستوى طاقة الطفل اليوم؟", type: "choice", options: [
        { en: "Very Active", ar: "نشيط جداً", value: 5 },
        { en: "Active", ar: "نشيط", value: 4 },
        { en: "Normal", ar: "عادي", value: 3 },
        { en: "Low Energy", ar: "طاقة منخفضة", value: 2 },
        { en: "Very Tired", ar: "متعب جداً", value: 1 },
      ]},
    ],
  },
];

// Add translations for survey categories
export const surveyTranslations: Record<string, Record<string, string>> = {
  "survey.cognitive": { en: "Cognitive Development", ar: "التطور المعرفي" },
  "survey.language": { en: "Language & Communication", ar: "اللغة والتواصل" },
  "survey.social_emotional": { en: "Social-Emotional Development", ar: "التطور الاجتماعي العاطفي" },
  "survey.motor": { en: "Motor Skills", ar: "المهارات الحركية" },
  "survey.self_care": { en: "Self-Care & Independence", ar: "الرعاية الذاتية والاستقلالية" },
  "survey.daily_mood": { en: "Daily Wellbeing", ar: "الرفاهية اليومية" },
  
  "survey.fillSurvey": { en: "Fill Survey", ar: "ملء الاستقصاء" },
  "survey.scale.1": { en: "Not Yet", ar: "لم يتقنها بعد" },
  "survey.scale.2": { en: "Emerging", ar: "بداية الاكتساب" },
  "survey.scale.3": { en: "Developing", ar: "في طور النمو" },
  "survey.scale.4": { en: "Proficient", ar: "متقن" },
  "survey.scale.5": { en: "Advanced", ar: "متقدم" },
  "survey.submit": { en: "Save Assessment", ar: "حفظ التقييم" },
  "survey.analyzeAi": { en: "Analyze with AI", ar: "تحليل بالذكاء الاصطناعي" },
  "survey.analyzing": { en: "Analyzing with AI...", ar: "جاري التحليل بالذكاء الاصطناعي..." },
  "survey.complete": { en: "Assessment Saved", ar: "تم حفظ التقييم" },
  "survey.selectCategory": { en: "Select a domain to begin", ar: "اختر مجالاً للبدء" },
  "survey.noSurveys": { en: "No surveys yet", ar: "لا توجد استقصاءات بعد" },

  // Student management
  "students.title": { en: "Students", ar: "الطلاب" },
  "students.add": { en: "Add Student", ar: "إضافة طالب" },
  "students.name": { en: "Student Name", ar: "اسم الطالب/ة" },
  "students.age": { en: "Age", ar: "العمر" },
  "students.gender": { en: "Gender", ar: "الجنس" },
  "students.male": { en: "Male", ar: "ذكر" },
  "students.female": { en: "Female", ar: "أنثى" },
  "students.max": { en: "Maximum 30 students reached", ar: "تم الوصول للحد الأقصى 30 طالب" },
  "students.count": { en: "students", ar: "طالب/ة" },
  "students.select": { en: "Select a student", ar: "اختر طالب/ة" },
  "students.remove": { en: "Remove", ar: "حذف" },
  "students.noStudents": { en: "No students added yet", ar: "لم تتم إضافة طلاب بعد" },

  // Analysis
  "analysis.title": { en: "AI Analysis Results", ar: "نتائج تحليل الذكاء الاصطناعي" },
  "analysis.summary": { en: "Summary", ar: "الملخص" },
  "analysis.strengths": { en: "Strengths", ar: "نقاط القوة" },
  "analysis.improvements": { en: "Areas for Growth", ar: "مجالات النمو" },
  "analysis.recommendations": { en: "Teacher Recommendations", ar: "توصيات المعلمة" },
  "analysis.parentMessage": { en: "Parent Message", ar: "رسالة للأهل" },
  "analysis.actionPlan": { en: "Development Plan", ar: "خطة التطوير" },
  "analysis.indicators": { en: "Development Level", ar: "مستوى التطور" },
  "analysis.scores": { en: "Domain Scores", ar: "درجات المجالات" },
  "analysis.share": { en: "Share via WhatsApp", ar: "مشاركة عبر الواتساب" },
  "analysis.exportPdf": { en: "Export as PDF", ar: "تصدير كـ PDF" },
  "analysis.history": { en: "Survey History", ar: "سجل الاستقصاءات" },
  "analysis.viewResults": { en: "View Results", ar: "عرض النتائج" },

  // Storage notice
  "storage.notice": { en: "☁️ Cloud-synced data", ar: "☁️ بيانات مزامنة سحابياً" },

  // Indicators
  "indicators.gifted": { en: "Advanced", ar: "متقدم" },
  "indicators.typical": { en: "On Track", ar: "ضمن المسار" },
  "indicators.delayed": { en: "Needs Support", ar: "يحتاج دعم" },
  "indicators.mixed": { en: "Mixed", ar: "متفاوت" },
};
