import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map question IDs to readable descriptions so the AI has full context
const questionMap: Record<string, { en: string; ar: string; category: string }> = {
  cog1: { en: "Sort objects by color/shape/size", ar: "تصنيف الأشياء حسب اللون/الشكل/الحجم", category: "cognitive" },
  cog3: { en: "Count objects up to 10", ar: "عدّ الأشياء حتى 10", category: "cognitive" },
  cog5: { en: "Follow 2-3 step instructions", ar: "اتباع تعليمات من 2-3 خطوات", category: "cognitive" },
  lan1: { en: "Speak in 4+ word sentences", ar: "التحدث بجمل من 4+ كلمات", category: "language" },
  lan3: { en: "Understand who/what/where questions", ar: "فهم أسئلة مَن/ماذا/أين", category: "language" },
  se1: { en: "Play cooperatively with others", ar: "اللعب التعاوني مع الآخرين", category: "social_emotional" },
  se4: { en: "Wait for turn and share", ar: "انتظار الدور والمشاركة", category: "social_emotional" },
  se5: { en: "Manage frustration and anger", ar: "إدارة الإحباط والغضب", category: "social_emotional" },
  gm1: { en: "Run, jump, climb with coordination", ar: "الجري والقفز والتسلق بتناسق", category: "motor" },
  fm1: { en: "Hold pencil with proper grip", ar: "مسك القلم بالمسكة الصحيحة", category: "motor" },
  sc1: { en: "Eat independently with utensils", ar: "الأكل المستقل بأدوات الطعام", category: "self_care" },
  sc2: { en: "Use toilet independently", ar: "استخدام الحمام مستقلاً", category: "self_care" },
  dm1: { en: "Overall mood today", ar: "المزاج العام اليوم", category: "daily_mood" },
  dm2: { en: "Energy level today", ar: "مستوى الطاقة اليوم", category: "daily_mood" },
  // Legacy keys for older assessments
  cog2: { en: "Understand cause and effect", ar: "فهم السبب والنتيجة", category: "cognitive" },
  cog4: { en: "Solve simple puzzles", ar: "حل ألغاز بسيطة", category: "cognitive" },
  lan2: { en: "Tell a simple story", ar: "سرد قصة بسيطة", category: "language" },
  lan4: { en: "Speech clarity", ar: "وضوح الكلام", category: "language" },
  lan5: { en: "Interest in books", ar: "اهتمام بالكتب", category: "language" },
  se2: { en: "Identify feelings", ar: "تحديد المشاعر", category: "social_emotional" },
  se3: { en: "Show empathy", ar: "إظهار التعاطف", category: "social_emotional" },
  se6: { en: "Separate from caregiver", ar: "الانفصال عن مقدم الرعاية", category: "social_emotional" },
  gm2: { en: "Kick and throw", ar: "ركل ورمي الكرة", category: "motor" },
  gm3: { en: "Balance", ar: "التوازن", category: "motor" },
  gm4: { en: "Pedal tricycle", ar: "قيادة دراجة", category: "motor" },
  fm2: { en: "Cut with scissors", ar: "القص بالمقص", category: "motor" },
  fm3: { en: "Draw shapes", ar: "رسم أشكال", category: "motor" },
  fm4: { en: "Button/unbutton", ar: "الأزرار والسحّاب", category: "motor" },
  fm5: { en: "String beads", ar: "تنظيم الخرز", category: "motor" },
  sc3: { en: "Wash hands", ar: "غسل اليدين", category: "self_care" },
  sc4: { en: "Dress independently", ar: "ارتداء الملابس", category: "self_care" },
  att1: { en: "Focus 10+ min", ar: "التركيز 10+ دقائق", category: "cognitive" },
  att2: { en: "Sit during group time", ar: "الجلوس أثناء الحلقة", category: "social_emotional" },
  att3: { en: "Complete tasks", ar: "إكمال المهام", category: "cognitive" },
  att4: { en: "Resistance to distraction", ar: "مقاومة التشتت", category: "cognitive" },
  cr1: { en: "Pretend play", ar: "اللعب التخيلي", category: "social_emotional" },
  cr2: { en: "Enjoy art", ar: "الاستمتاع بالفن", category: "motor" },
  cr3: { en: "Respond to music", ar: "الاستجابة للموسيقى", category: "social_emotional" },
  cr4: { en: "Try new approaches", ar: "تجربة طرق جديدة", category: "cognitive" },
  beh1: { en: "Follow rules", ar: "الالتزام بالقواعد", category: "social_emotional" },
  beh2: { en: "Respond to guidance", ar: "الاستجابة للتوجيه", category: "social_emotional" },
  beh3: { en: "Handle transitions", ar: "الانتقال بين الأنشطة", category: "social_emotional" },
  beh4: { en: "Resolve conflicts with words", ar: "حل النزاعات بالكلام", category: "social_emotional" },
  dm3: { en: "Ate well", ar: "الأكل الجيد", category: "daily_mood" },
  dm4: { en: "Drank water", ar: "شرب الماء", category: "daily_mood" },
};

const categoryNames: Record<string, { en: string; ar: string; emoji: string }> = {
  cognitive: { en: "Cognitive Development", ar: "التطور المعرفي", emoji: "🧠" },
  language: { en: "Language & Communication", ar: "اللغة والتواصل", emoji: "💬" },
  social_emotional: { en: "Social-Emotional", ar: "الاجتماعي العاطفي", emoji: "❤️" },
  motor: { en: "Motor Skills", ar: "المهارات الحركية", emoji: "🏃" },
  self_care: { en: "Self-Care", ar: "الرعاية الذاتية", emoji: "🧽" },
  daily_mood: { en: "Daily Wellbeing", ar: "الرفاهية اليومية", emoji: "😊" },
};

const scaleLabels: Record<number, { en: string; ar: string }> = {
  1: { en: "Not Yet", ar: "لم يتقنها بعد" },
  2: { en: "Emerging", ar: "بداية الاكتساب" },
  3: { en: "Developing", ar: "في طور النمو" },
  4: { en: "Proficient", ar: "متقن" },
  5: { en: "Advanced", ar: "متقدم" },
};

function buildReadableData(answers: Record<string, number | string>, isArabic: boolean): string {
  const lang = isArabic ? "ar" : "en";
  const grouped: Record<string, { question: string; answer: string; score: number }[]> = {};

  for (const [qId, value] of Object.entries(answers)) {
    const q = questionMap[qId];
    if (!q) continue;
    if (!grouped[q.category]) grouped[q.category] = [];
    const score = typeof value === "number" ? value : parseInt(value as string, 10) || 0;
    const label = scaleLabels[score]?.[lang] || `${score}/5`;
    grouped[q.category].push({
      question: q[lang],
      answer: `${score}/5 (${label})`,
      score,
    });
  }

  let result = "";
  for (const [catId, items] of Object.entries(grouped)) {
    const cat = categoryNames[catId];
    if (!cat) continue;
    const avg = items.reduce((s, i) => s + i.score, 0) / items.length;
    result += `\n${cat.emoji} ${cat[lang]} (${isArabic ? "المتوسط" : "Avg"}: ${avg.toFixed(1)}/5):\n`;
    for (const item of items) {
      result += `  - ${item.question}: ${item.answer}\n`;
    }
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { studentName, studentAge, locale, mode } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isArabic = locale === "ar";
    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "instant_behavior") {
      // Instant behavior analysis mode
      const { behaviors, notes } = body;
      const behaviorList = (behaviors || []).join(", ");

      systemPrompt = isArabic
        ? `أنت خبيرة في سلوك الأطفال ورياض الأطفال. المعلمة لاحظت سلوكيات معينة عند طفل وتحتاج حلول فورية عملية.

## التعليمات:
- قدمي 4-6 حلول سريعة وعملية يمكن تطبيقها فوراً في الصف
- اكتبي تحليلاً مختصراً لأسباب السلوك المحتملة
- قدمي 3-4 نصائح وقائية لمنع تكرار السلوك
- اكتبي رسالة مهنية ودافئة لولي الأمر تشرح الملاحظة وتقترح تعاوناً

## هيكل الإجابة (JSON):
{
  "quickSolutions": ["حل 1", "حل 2", "حل 3", "حل 4"],
  "detailedAnalysis": "تحليل مختصر لأسباب السلوك وسياقه",
  "preventionTips": ["نصيحة 1", "نصيحة 2", "نصيحة 3"],
  "parentMessage": "رسالة لولي الأمر"
}`
        : `You are a child behavior expert. The teacher noticed specific behaviors and needs instant practical solutions.

## Instructions:
- Provide 4-6 quick, practical solutions applicable immediately in class
- Write a brief analysis of potential causes
- Give 3-4 prevention tips
- Write a warm, professional parent message

## Response Structure (JSON):
{
  "quickSolutions": ["Solution 1", "Solution 2", "Solution 3", "Solution 4"],
  "detailedAnalysis": "Brief analysis of behavior causes and context",
  "preventionTips": ["Tip 1", "Tip 2", "Tip 3"],
  "parentMessage": "Message for parent"
}`;

      userPrompt = isArabic
        ? `اسم الطفل: ${studentName}\nالعمر: ${studentAge} سنوات\n\n🔍 السلوكيات الملاحظة: ${behaviorList}\n\n${notes ? `📝 ملاحظات المعلمة: ${notes}` : ""}`
        : `Child: ${studentName}\nAge: ${studentAge} years\n\n🔍 Observed behaviors: ${behaviorList}\n\n${notes ? `📝 Teacher notes: ${notes}` : ""}`;
    } else {
      // Standard comprehensive assessment mode
      const { surveyData } = body;
      const readableData = buildReadableData(surveyData || {}, isArabic);

      systemPrompt = isArabic
        ? `أنت خبير متخصص في تنمية الطفل ورياض الأطفال. حلل بيانات الاستقصاء وقدم تقريراً مهنياً شاملاً.

## التعليمات:
- حلل كل مجال نمائي بشكل منفصل
- قارن أداء الطفل بالمعايير المتوقعة لعمره
- قدم توصيات عملية ومحددة
- اكتب رسالة الأهل بأسلوب دافئ ومهني

## هيكل الإجابة (JSON):
{
  "summary": "ملخص شامل",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2", "نقطة قوة 3"],
  "improvements": ["مجال 1", "مجال 2", "مجال 3"],
  "teacherRecommendations": ["توصية 1", "توصية 2", "توصية 3"],
  "parentMessage": "رسالة دافئة للأهل",
  "actionPlan": ["اليوم 1: نشاط", "اليوم 2: نشاط", "اليوم 3: نشاط"],
  "indicators": { "type": "gifted|typical|delayed|mixed", "details": "شرح" },
  "scores": { "cognitive": 0-100, "language": 0-100, "social_emotional": 0-100, "motor": 0-100, "self_care": 0-100, "daily_mood": 0-100 },
  "overallScore": 0-100
}`
        : `You are a child development expert. Analyze the survey and provide a professional report.

## Response Structure (JSON):
{
  "summary": "Comprehensive summary",
  "strengths": ["S1", "S2", "S3"],
  "improvements": ["A1", "A2", "A3"],
  "teacherRecommendations": ["R1", "R2", "R3"],
  "parentMessage": "Warm parent message",
  "actionPlan": ["Day 1: Activity", "Day 2: Activity", "Day 3: Activity"],
  "indicators": { "type": "gifted|typical|delayed|mixed", "details": "explanation" },
  "scores": { "cognitive": 0-100, "language": 0-100, "social_emotional": 0-100, "motor": 0-100, "self_care": 0-100, "daily_mood": 0-100 },
  "overallScore": 0-100
}`;

      userPrompt = isArabic
        ? `اسم الطفل: ${studentName}\nالعمر: ${studentAge} سنوات\n\n📊 نتائج التقييم:\n${readableData}`
        : `Child: ${studentName}\nAge: ${studentAge} years\n\n📊 Assessment Results:\n${readableData}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      analysis = mode === "instant_behavior"
        ? { quickSolutions: [], detailedAnalysis: content, preventionTips: [], parentMessage: "" }
        : { summary: content, strengths: [], improvements: [], teacherRecommendations: [], parentMessage: "", actionPlan: [], indicators: { type: "typical", details: "" }, scores: {}, overallScore: 50 };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-behavior error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
