import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, Edit3, CheckCircle, MessageCircle, Calendar, PartyPopper, BookOpen } from "lucide-react";

interface BulkWhatsAppProps {
  teacherName?: string;
  className?: string;
}

interface MessageTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ReactNode;
  category: "weekly" | "occasion";
  messageAr: string;
  messageEn: string;
}

const templates: MessageTemplate[] = [
  {
    id: "weekly_summary",
    titleAr: "📊 ملخص أسبوعي",
    titleEn: "📊 Weekly Summary",
    icon: <Calendar className="h-4 w-4" />,
    category: "weekly",
    messageAr: `🌈 *ملخص الأسبوع - روضة كيندر BH*

السلام عليكم أولياء الأمور الكرام 🌸

نحب نشارككم ملخص نشاطات هذا الأسبوع:

📚 *الأنشطة التعليمية:*
• تعلمنا حرف (___) وتدربنا على كتابته
• تعرفنا على الأرقام من (___ إلى ___)
• قمنا بنشاط فني عن (___)

🎨 *الأنشطة الإبداعية:*
• الرسم والتلوين
• الأشغال اليدوية

🏃 *الأنشطة الحركية:*
• ألعاب رياضية في الساحة
• تمارين التوازن والتنسيق

💡 *ملاحظة:* نتمنى منكم متابعة الواجبات المنزلية مع أطفالكم.

مع تحيات المعلمة ___
روضة كيندر BH 🌈`,
    messageEn: `🌈 *Weekly Summary - Kinder BH*

Dear Parents 🌸

We'd like to share this week's activity summary:

📚 *Learning Activities:*
• Learned letter (___) and practiced writing
• Worked on numbers from (___ to ___)
• Art activity about (___)

🎨 *Creative Activities:*
• Drawing and coloring
• Handicrafts

🏃 *Physical Activities:*
• Sports games in the yard
• Balance and coordination exercises

💡 *Note:* Please follow up on homework with your children.

Best regards, Teacher ___
Kinder BH 🌈`,
  },
  {
    id: "weekly_behavior",
    titleAr: "📋 تقرير سلوكي أسبوعي",
    titleEn: "📋 Weekly Behavior Report",
    icon: <BookOpen className="h-4 w-4" />,
    category: "weekly",
    messageAr: `📋 *التقرير السلوكي الأسبوعي*

السلام عليكم أولياء الأمور الكرام 💐

نود إطلاعكم على الملاحظات السلوكية لهذا الأسبوع:

✅ *إيجابيات لاحظناها:*
• التزام الأطفال بالنظام العام
• تعاون ملحوظ بين الأطفال
• حماس في المشاركة بالأنشطة

⚠️ *نقاط تحتاج انتباه:*
• التذكير بآداب الحوار
• تشجيع الاستقلالية في ترتيب الأدوات

📌 *توصيات للمنزل:*
• تخصيص وقت للقراءة اليومية (15 دقيقة)
• تشجيع اللعب التعاوني مع الإخوة
• الحفاظ على روتين النوم المبكر

شكراً لتعاونكم الدائم 🙏
المعلمة ___`,
    messageEn: `📋 *Weekly Behavior Report*

Dear Parents 💐

Here are this week's behavioral observations:

✅ *Positives we noticed:*
• Children following general rules
• Notable cooperation among children
• Enthusiasm in participating in activities

⚠️ *Areas needing attention:*
• Reminding about conversation etiquette
• Encouraging independence in organizing tools

📌 *Home recommendations:*
• Dedicate daily reading time (15 minutes)
• Encourage cooperative play with siblings
• Maintain early sleep routine

Thank you for your continued cooperation 🙏
Teacher ___`,
  },
  {
    id: "welcome",
    titleAr: "🎉 ترحيب ببداية العام",
    titleEn: "🎉 Welcome to New Year",
    icon: <PartyPopper className="h-4 w-4" />,
    category: "occasion",
    messageAr: `🎉 *أهلاً وسهلاً بكم في العام الدراسي الجديد!*

السلام عليكم ورحمة الله وبركاته

يسعدنا أن نرحب بكم وبأطفالكم الأعزاء في روضة كيندر BH 🌈

📅 *معلومات مهمة:*
• الدوام من الساعة ___ إلى ___
• يرجى إحضار (حقيبة الطفل - وجبة صحية - ملابس احتياطية)
• التواصل معنا عبر هذا الرقم في حالة الطوارئ

🤝 نتطلع لعام دراسي مميز مليء بالمرح والتعلم!

مع أطيب التحيات
المعلمة ___
روضة كيندر BH 🌟`,
    messageEn: `🎉 *Welcome to the New School Year!*

Dear Parents,

We're delighted to welcome you and your children to Kinder BH 🌈

📅 *Important Information:*
• School hours: ___ to ___
• Please bring (child's bag - healthy snack - spare clothes)
• Contact us at this number for emergencies

🤝 Looking forward to a wonderful year of fun and learning!

Best regards,
Teacher ___
Kinder BH 🌟`,
  },
  {
    id: "eid",
    titleAr: "🌙 تهنئة بالعيد",
    titleEn: "🌙 Eid Greetings",
    icon: <PartyPopper className="h-4 w-4" />,
    category: "occasion",
    messageAr: `🌙✨ *كل عام وأنتم بخير*

أولياء الأمور الكرام

تتقدم إدارة روضة كيندر BH ومعلماتها بأحرّ التهاني بمناسبة العيد المبارك 🎉

أعاده الله عليكم وعلى أطفالكم بالصحة والسعادة 🤲

نتمنى لكم إجازة سعيدة ونلتقي بإذن الله يوم ___

مع خالص الحب والتقدير 💐
روضة كيندر BH 🌈`,
    messageEn: `🌙✨ *Eid Mubarak!*

Dear Parents,

Kinder BH administration and teachers extend warmest wishes on this blessed Eid 🎉

May it bring health and happiness to you and your children 🤲

We wish you a happy holiday and look forward to seeing you on ___

With love and appreciation 💐
Kinder BH 🌈`,
  },
  {
    id: "motivational",
    titleAr: "💪 رسالة تحفيزية",
    titleEn: "💪 Motivational Message",
    icon: <MessageCircle className="h-4 w-4" />,
    category: "occasion",
    messageAr: `💪 *رسالة تحفيزية لأولياء الأمور*

السلام عليكم 🌸

نود أن نشكركم على تعاونكم المستمر ومتابعتكم الرائعة لأطفالكم 🙏

🌟 تذكروا دائماً:
• طفلكم فريد ومميز بطريقته الخاصة
• الصبر والتشجيع أهم أدوات التربية
• كل خطوة صغيرة هي إنجاز يستحق الاحتفال
• بيئة الحب والأمان تصنع أطفالاً واثقين

💡 نصيحة اليوم: خصصوا 10 دقائق يومياً للعب مع أطفالكم - فهذا أفضل استثمار ❤️

معاً نبني جيلاً واعياً ومبدعاً 🌈

المعلمة ___`,
    messageEn: `💪 *Motivational Message for Parents*

Dear Parents 🌸

We'd like to thank you for your continuous cooperation and wonderful follow-up with your children 🙏

🌟 Always remember:
• Your child is unique and special in their own way
• Patience and encouragement are the best parenting tools
• Every small step is an achievement worth celebrating
• A loving and safe environment builds confident children

💡 Today's tip: Dedicate 10 minutes daily to play with your children - it's the best investment ❤️

Together we build an aware and creative generation 🌈

Teacher ___`,
  },
];

export function BulkWhatsApp({ teacherName, className }: BulkWhatsAppProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setEditedMessage(isAr ? template.messageAr : template.messageEn);
    setEditing(false);
    setSent(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedMessage);
    toast.success(isAr ? "تم نسخ الرسالة! ✅" : "Message copied! ✅");
  };

  const handleSendWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(editedMessage)}`, "_blank");
    setSent(true);
    toast.success(isAr ? "تم فتح واتساب!" : "WhatsApp opened!");
  };

  const weeklyTemplates = templates.filter(t => t.category === "weekly");
  const occasionTemplates = templates.filter(t => t.category === "occasion");

  return (
    <div className={`space-y-4 ${className || ""}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold">{isAr ? "📨 رسائل جماعية للأهل" : "📨 Bulk Messages to Parents"}</h3>
        <p className="text-xs text-muted-foreground">
          {isAr ? "اختاري نموذج رسالة، عدّليها حسب الحاجة، ثم أرسليها للجروب" : "Select a template, edit as needed, then send to the group"}
        </p>
      </div>

      {/* Weekly Templates */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {isAr ? "تقارير أسبوعية" : "Weekly Reports"}
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {weeklyTemplates.map(t => (
            <Card
              key={t.id}
              className={`cursor-pointer transition-all touch-manipulation active:scale-[0.98] ${
                selectedTemplate?.id === t.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/20"
              }`}
              onClick={() => handleSelectTemplate(t)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{isAr ? t.titleAr : t.titleEn}</p>
                </div>
                {selectedTemplate?.id === t.id && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Occasion Templates */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <PartyPopper className="h-4 w-4 text-amber-500" />
          {isAr ? "مناسبات وترحيب" : "Occasions & Welcome"}
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {occasionTemplates.map(t => (
            <Card
              key={t.id}
              className={`cursor-pointer transition-all touch-manipulation active:scale-[0.98] ${
                selectedTemplate?.id === t.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/20"
              }`}
              onClick={() => handleSelectTemplate(t)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{isAr ? t.titleAr : t.titleEn}</p>
                </div>
                {selectedTemplate?.id === t.id && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Template Preview & Edit */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{isAr ? "معاينة الرسالة" : "Message Preview"}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="gap-1 h-8 text-xs">
                    <Edit3 className="h-3 w-3" />
                    {editing ? (isAr ? "إغلاق التعديل" : "Close Edit") : (isAr ? "تعديل" : "Edit")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editing ? (
                  <Textarea
                    value={editedMessage}
                    onChange={e => setEditedMessage(e.target.value)}
                    rows={12}
                    className="text-sm font-mono"
                    dir={isAr ? "rtl" : "ltr"}
                  />
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg max-h-64 overflow-y-auto border">
                    {editedMessage}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1 h-11 gap-2 text-sm">
                    <Copy className="h-4 w-4" />
                    {isAr ? "نسخ" : "Copy"}
                  </Button>
                  <Button onClick={handleSendWhatsApp} className="flex-1 h-11 gap-2 text-sm">
                    <Send className="h-4 w-4" />
                    {sent ? (isAr ? "إعادة الإرسال" : "Resend") : (isAr ? "إرسال واتساب" : "Send WhatsApp")}
                  </Button>
                </div>

                {sent && (
                  <p className="text-xs text-center text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {isAr ? "تم فتح واتساب للإرسال" : "WhatsApp opened for sending"}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
