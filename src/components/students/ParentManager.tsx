import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Phone, Share2, Edit2, Trash2, MessageCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

interface Guardian {
  id: string;
  parentId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface ParentManagerProps {
  studentId: string;
  studentName: string;
  analysis?: any;
}

export function ParentManager({ studentId, studentName, analysis }: ParentManagerProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [saving, setSaving] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const fetchGuardians = async () => {
    setLoading(true);
    const { data: links } = await supabase
      .from("student_guardians")
      .select("id, parent_id, relationship, is_primary")
      .eq("student_id", studentId);

    if (!links || links.length === 0) {
      setGuardians([]);
      setLoading(false);
      return;
    }

    const parentIds = links.map(l => l.parent_id);
    const { data: parents } = await supabase
      .from("parents")
      .select("id, name, phone")
      .in("id", parentIds);

    const mapped: Guardian[] = links.map(link => {
      const parent = parents?.find(p => p.id === link.parent_id);
      return {
        id: link.id,
        parentId: link.parent_id,
        name: parent?.name || "",
        phone: parent?.phone || "",
        relationship: link.relationship,
        isPrimary: link.is_primary,
      };
    });

    setGuardians(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchGuardians(); }, [studentId]);

  const openAdd = () => {
    setEditingGuardian(null);
    setName("");
    setPhone("");
    setRelationship("parent");
    setDialogOpen(true);
  };

  const openEdit = (g: Guardian) => {
    setEditingGuardian(g);
    setName(g.name);
    setPhone(g.phone);
    setRelationship(g.relationship);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error(isAr ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      if (editingGuardian) {
        await supabase.from("parents").update({ name: name.trim(), phone: phone.trim() }).eq("id", editingGuardian.parentId);
        await supabase.from("student_guardians").update({ relationship }).eq("id", editingGuardian.id);
        toast.success(isAr ? "تم التحديث" : "Updated");
      } else {
        const { data: newParent, error } = await supabase.from("parents").insert({ name: name.trim(), phone: phone.trim() }).select().single();
        if (error) throw error;
        const isPrimary = guardians.length === 0;
        const { error: linkErr } = await supabase.from("student_guardians").insert({
          student_id: studentId,
          parent_id: newParent.id,
          relationship,
          is_primary: isPrimary,
        });
        if (linkErr) throw linkErr;
        toast.success(isAr ? "تمت إضافة ولي الأمر" : "Parent added");
      }
      setDialogOpen(false);
      fetchGuardians();
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ" : "Error occurred"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: Guardian) => {
    await supabase.from("student_guardians").delete().eq("id", g.id);
    // Check if parent is linked to other students
    const { data: otherLinks } = await supabase.from("student_guardians").select("id").eq("parent_id", g.parentId);
    if (!otherLinks || otherLinks.length === 0) {
      await supabase.from("parents").delete().eq("id", g.parentId);
    }
    toast.success(isAr ? "تم الحذف" : "Removed");
    fetchGuardians();
  };

  const buildWhatsAppMessage = () => {
    if (!analysis) return "";
    
    const date = new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });
    
    const domainEmojis: Record<string, string> = {
      cognitive: "🧠", language: "💬", social_emotional: "❤️",
      gross_motor: "🏃", fine_motor: "✂️", self_care: "🧽",
      attention: "🎯", creativity: "🎨", behavior: "📋", daily_mood: "😊",
    };
    const domainNamesAr: Record<string, string> = {
      cognitive: "التطور المعرفي", language: "اللغة والتواصل", social_emotional: "الاجتماعي العاطفي",
      gross_motor: "الحركية الكبرى", fine_motor: "الحركية الدقيقة", self_care: "الرعاية الذاتية",
      attention: "الانتباه والتركيز", creativity: "الإبداع", behavior: "السلوك", daily_mood: "الرفاهية اليومية",
    };
    const domainNamesEn: Record<string, string> = {
      cognitive: "Cognitive", language: "Language", social_emotional: "Social-Emotional",
      gross_motor: "Gross Motor", fine_motor: "Fine Motor", self_care: "Self-Care",
      attention: "Attention", creativity: "Creativity", behavior: "Behavior", daily_mood: "Daily Wellbeing",
    };

    const getBar = (score: number) => {
      const filled = Math.round(score / 10);
      return "█".repeat(filled) + "░".repeat(10 - filled);
    };

    const getLevel = (score: number) => {
      if (score >= 80) return isAr ? "متقدم ✨" : "Advanced ✨";
      if (score >= 60) return isAr ? "جيد ✅" : "Good ✅";
      if (score >= 40) return isAr ? "في طور النمو 🔄" : "Developing 🔄";
      return isAr ? "يحتاج دعم ⚠️" : "Needs Support ⚠️";
    };

    let msg = "";
    
    // Header
    msg += isAr
      ? `📋 *تقرير التقييم النمائي الشامل*\n━━━━━━━━━━━━━━━━\n👤 الطفل: *${studentName}*\n📅 التاريخ: ${date}\n`
      : `📋 *Comprehensive Developmental Report*\n━━━━━━━━━━━━━━━━\n👤 Child: *${studentName}*\n📅 Date: ${date}\n`;

    // Overall Score
    const overallScore = analysis.overallScore || (analysis.scores ? Math.round(Object.values(analysis.scores as Record<string, number>).reduce((a: number, b: number) => a + b, 0) / Object.keys(analysis.scores).length) : 0);
    msg += isAr
      ? `\n🏆 *الدرجة الإجمالية: ${overallScore}%* ${getLevel(overallScore)}\n`
      : `\n🏆 *Overall Score: ${overallScore}%* ${getLevel(overallScore)}\n`;

    // Domain Scores Table
    msg += isAr ? `\n📊 *درجات المجالات النمائية:*\n` : `\n📊 *Domain Scores:*\n`;
    const scores = analysis.scores || {};
    for (const [key, score] of Object.entries(scores) as [string, number][]) {
      const emoji = domainEmojis[key] || "📌";
      const name = isAr ? domainNamesAr[key] : domainNamesEn[key];
      if (name) {
        msg += `${emoji} ${name}: ${getBar(score)} ${score}%\n`;
      }
    }

    // Summary
    if (analysis.summary) {
      msg += isAr ? `\n📝 *الملخص العام:*\n${analysis.summary}\n` : `\n📝 *Summary:*\n${analysis.summary}\n`;
    }

    // Strengths
    if (analysis.strengths?.length) {
      msg += isAr ? `\n💪 *نقاط القوة:*\n` : `\n💪 *Strengths:*\n`;
      analysis.strengths.forEach((s: string) => { msg += `  ✅ ${s}\n`; });
    }

    // Areas for Improvement
    if (analysis.improvements?.length) {
      msg += isAr ? `\n🔄 *مجالات تحتاج تطوير:*\n` : `\n🔄 *Areas for Growth:*\n`;
      analysis.improvements.forEach((s: string) => { msg += `  📌 ${s}\n`; });
    }

    // Indicators
    if (analysis.indicators) {
      const typeLabels: Record<string, { ar: string; en: string }> = {
        gifted: { ar: "متقدم/موهوب 🌟", en: "Advanced/Gifted 🌟" },
        typical: { ar: "ضمن المسار الطبيعي ✅", en: "On Track ✅" },
        delayed: { ar: "يحتاج متابعة متخصصة ⚠️", en: "Needs Specialist Follow-up ⚠️" },
        mixed: { ar: "أداء متفاوت بين المجالات 🔀", en: "Mixed Performance 🔀" },
      };
      const typeLabel = typeLabels[analysis.indicators.type] || typeLabels.typical;
      msg += isAr
        ? `\n🔍 *مستوى التطور:* ${typeLabel.ar}\n`
        : `\n🔍 *Development Level:* ${typeLabel.en}\n`;
      if (analysis.indicators.details) {
        msg += `${analysis.indicators.details}\n`;
      }
    }

    // Parent Message
    if (analysis.parentMessage) {
      msg += isAr ? `\n💌 *رسالة لولي الأمر:*\n${analysis.parentMessage}\n` : `\n💌 *Message for You:*\n${analysis.parentMessage}\n`;
    }

    // Action Plan
    if (analysis.actionPlan?.length) {
      msg += isAr ? `\n📅 *خطة الأنشطة المنزلية:*\n` : `\n📅 *Home Activity Plan:*\n`;
      analysis.actionPlan.forEach((step: string) => { msg += `\n${step}\n`; });
    }

    // Teacher Recommendations
    if (analysis.teacherRecommendations?.length) {
      msg += isAr ? `\n👩‍🏫 *توصيات المعلمة:*\n` : `\n👩‍🏫 *Teacher Recommendations:*\n`;
      analysis.teacherRecommendations.forEach((r: string) => { msg += `  📎 ${r}\n`; });
    }

    // Footer
    msg += isAr
      ? `\n━━━━━━━━━━━━━━━━\n🏫 تم إعداد هذا التقرير باستخدام نظام Kinder BH للتقييم النمائي\n💡 هذا التقرير استرشادي ولا يغني عن التقييم المتخصص`
      : `\n━━━━━━━━━━━━━━━━\n🏫 Generated by Kinder BH Developmental Assessment System\n💡 This report is for guidance and does not replace specialist evaluation`;

    return msg;
  };

  const handleSendWhatsApp = (g: Guardian) => {
    const msg = buildWhatsAppMessage();
    if (!msg) {
      toast.error(isAr ? "لا يوجد تقرير لإرساله. قم بإجراء تقييم أولاً" : "No report to send. Run an assessment first");
      return;
    }
    const phoneClean = g.phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, "_blank");
    setSentIds(prev => new Set(prev).add(g.id));
    toast.success(isAr ? "تم فتح واتساب" : "WhatsApp opened");
  };

  const relationshipLabels: Record<string, { ar: string; en: string }> = {
    parent: { ar: "ولي أمر", en: "Parent" },
    mother: { ar: "أم", en: "Mother" },
    father: { ar: "أب", en: "Father" },
    guardian: { ar: "وصي", en: "Guardian" },
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          👨‍👩‍👧 {isAr ? "أولياء الأمور" : "Parents / Guardians"}
        </h3>
        <Button size="sm" variant="outline" onClick={openAdd} className="gap-1.5 h-9 text-xs">
          <UserPlus className="h-3.5 w-3.5" />
          {isAr ? "إضافة" : "Add"}
        </Button>
      </div>

      {/* Empty State */}
      {guardians.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-6 text-center space-y-3">
            <div className="text-3xl">👪</div>
            <p className="text-sm font-medium">{isAr ? "لم تتم إضافة ولي أمر بعد" : "No parents added yet"}</p>
            <p className="text-xs text-muted-foreground">
              {isAr ? "أضف ولي أمر لإرسال التقارير عبر واتساب" : "Add a parent to send reports via WhatsApp"}
            </p>
            <Button size="sm" onClick={openAdd} className="gap-2 h-10">
              <UserPlus className="h-4 w-4" />
              {isAr ? "إضافة ولي أمر" : "Add Parent"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {guardians.map(g => (
            <Card key={g.id} className="overflow-hidden">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {g.relationship === "mother" ? "👩" : g.relationship === "father" ? "👨" : "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{g.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground" dir="ltr">{g.phone}</span>
                      <Badge variant="secondary" className="text-[9px] px-1.5">
                        {relationshipLabels[g.relationship]?.[isAr ? "ar" : "en"] || g.relationship}
                      </Badge>
                      {g.isPrimary && (
                        <Badge className="text-[9px] px-1.5 bg-primary/10 text-primary border-primary/20">
                          {isAr ? "أساسي" : "Primary"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant={sentIds.has(g.id) ? "secondary" : "default"}
                    className="flex-1 h-9 text-xs gap-1.5"
                    onClick={() => handleSendWhatsApp(g)}
                    disabled={!analysis}
                  >
                    {sentIds.has(g.id) ? (
                      <><CheckCircle className="h-3.5 w-3.5" /> {isAr ? "إعادة الإرسال" : "Resend"}</>
                    ) : (
                      <><MessageCircle className="h-3.5 w-3.5" /> {isAr ? "إرسال تقرير" : "Send Report"}</>
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => openEdit(g)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(g)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingGuardian ? (isAr ? "تعديل ولي الأمر" : "Edit Parent") : (isAr ? "إضافة ولي أمر" : "Add Parent")}
            </DialogTitle>
            <DialogDescription>
              {isAr ? "أدخل بيانات ولي الأمر" : "Enter parent details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">{isAr ? "الاسم" : "Name"}</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder={isAr ? "مثال: أحمد محمد" : "e.g. Ahmed Mohamed"} className="h-11" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">{isAr ? "رقم الهاتف" : "Phone"}</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+973 3XXX XXXX" dir="ltr" className="h-11" type="tel" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">{isAr ? "صلة القرابة" : "Relationship"}</label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(relationshipLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{isAr ? label.ar : label.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="w-full h-11">
              {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (editingGuardian ? (isAr ? "تحديث" : "Update") : (isAr ? "إضافة" : "Add"))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
