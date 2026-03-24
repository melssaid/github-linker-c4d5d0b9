import { surveyCategories } from "@/data/surveyQuestions";

// Generate realistic random survey answers
export function generateDemoSurveyAnswers(): Record<string, number | string> {
  const answers: Record<string, number | string> = {};
  surveyCategories.forEach(cat => {
    cat.questions.forEach(q => {
      if (q.type === "choice" && q.options) {
        const opt = q.options[Math.floor(Math.random() * q.options.length)];
        answers[q.id] = opt.value;
      } else {
        answers[q.id] = Math.floor(Math.random() * 3) + 3; // 3-5 biased positive
      }
    });
  });
  return answers;
}

// Generate a full mock AI analysis
export function generateDemoAnalysis(studentName: string, answers: Record<string, number | string>) {
  const scores: Record<string, number> = {};
  surveyCategories.forEach(cat => {
    const catAnswers = cat.questions.map(q => answers[q.id]).filter(v => typeof v === "number") as number[];
    const avg = catAnswers.length > 0 ? Math.round((catAnswers.reduce((a, b) => a + b, 0) / catAnswers.length) * 20) : 70;
    scores[cat.id] = Math.min(100, Math.max(30, avg + Math.floor(Math.random() * 20 - 10)));
  });

  const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
  const indicatorType = avgScore >= 85 ? "gifted" : avgScore >= 50 ? "typical" : "delayed";

  return {
    summary: {
      ar: `${studentName} يُظهر تطوراً جيداً في معظم المجالات النمائية. المعدل العام ${avgScore}% يعكس مستوى ${indicatorType === "gifted" ? "متميز" : indicatorType === "typical" ? "طبيعي مناسب لعمره" : "يحتاج دعم إضافي"}. لوحظ تفاعل إيجابي مع الأنشطة الجماعية وقدرة جيدة على التعبير عن المشاعر.`,
      en: `${studentName} shows good development across most areas. Overall score of ${avgScore}% reflects ${indicatorType === "gifted" ? "exceptional" : indicatorType === "typical" ? "age-appropriate" : "needs additional support"} development.`,
    },
    strengths: {
      ar: [
        "يتفاعل بشكل إيجابي مع الأقران ويبادر باللعب الجماعي",
        "يُظهر فضولاً معرفياً ملحوظاً ويطرح أسئلة ذكية",
        "قدرة جيدة على التعبير عن المشاعر بشكل مناسب",
        "يلتزم بقواعد الفصل ويستجيب للتوجيهات",
      ],
      en: [
        "Interacts positively with peers and initiates group play",
        "Shows notable intellectual curiosity and asks smart questions",
        "Good ability to express emotions appropriately",
        "Follows classroom rules and responds to guidance",
      ],
    },
    improvements: {
      ar: [
        "يحتاج لتحسين فترة التركيز أثناء الأنشطة الطويلة",
        "تطوير المهارات الحركية الدقيقة (مسك القلم، القص)",
        "تعزيز مهارة انتظار الدور والصبر",
      ],
      en: [
        "Needs to improve attention span during longer activities",
        "Develop fine motor skills (pencil grip, cutting)",
        "Strengthen turn-taking and patience skills",
      ],
    },
    recommendations: {
      ar: [
        "استخدام أنشطة قصيرة متنوعة لتحسين التركيز تدريجياً",
        "تخصيص وقت يومي لتمارين الحركات الدقيقة (التلوين، العجين)",
        "مكافأة السلوك الإيجابي فوراً لتعزيز الثقة بالنفس",
        "التواصل المنتظم مع الأهل حول التقدم المحرز",
      ],
      en: [
        "Use short varied activities to gradually improve focus",
        "Dedicate daily time for fine motor exercises (coloring, play dough)",
        "Immediately reward positive behavior to boost confidence",
        "Regular communication with parents about progress",
      ],
    },
    parentMessage: {
      ar: `عزيزي ولي أمر ${studentName}، يسعدنا إبلاغكم أن طفلكم يُظهر تطوراً ملحوظاً في الروضة. نلاحظ تفاعله الإيجابي مع زملائه وحماسه للتعلم. ننصح بتخصيص 15 دقيقة يومياً للقراءة المشتركة وتمارين الحركات الدقيقة في المنزل. شكراً لتعاونكم المستمر 🌟`,
      en: `Dear parent of ${studentName}, we're pleased to share that your child shows notable progress. We recommend 15 minutes daily of shared reading and fine motor exercises at home.`,
    },
    actionPlan: {
      ar: [
        "اليوم الأول: نشاط تلوين مع قصة تفاعلية لتعزيز التركيز والمهارات الحركية",
        "اليوم الثاني: لعبة جماعية تعزز انتظار الدور والتعاون مع الأقران",
        "اليوم الثالث: نشاط بناء حر بالمكعبات لتنمية التفكير المنطقي والإبداع",
      ],
      en: [
        "Day 1: Coloring activity with interactive story for focus and motor skills",
        "Day 2: Group game to strengthen turn-taking and peer cooperation",
        "Day 3: Free block building to develop logical thinking and creativity",
      ],
    },
    indicators: {
      type: indicatorType,
      details: {
        ar: indicatorType === "gifted"
          ? "يُظهر مؤشرات موهبة مبكرة في التفكير المنطقي والقدرات اللغوية"
          : indicatorType === "typical"
            ? "النمو ضمن المعدل الطبيعي المتوقع لعمره"
            : "يحتاج متابعة ودعم إضافي في بعض المجالات",
        en: indicatorType === "gifted"
          ? "Shows early gifted indicators in logical thinking and language"
          : indicatorType === "typical"
            ? "Development within expected range for age"
            : "Needs follow-up and additional support in some areas",
      },
    },
    scores,
  };
}

// Generate 30 days of attendance records
export function generateDemoAttendanceDates(): { date: string; status: string }[] {
  const records: { date: string; status: string }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    const rand = Math.random();
    const status = rand < 0.75 ? "present" : rand < 0.85 ? "late" : rand < 0.93 ? "absent" : "excused";
    records.push({ date: d.toISOString().split("T")[0], status });
  }
  return records;
}
