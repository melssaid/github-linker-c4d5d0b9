import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Share2, FileDown, CheckCircle, AlertTriangle, Star, TrendingUp, MessageCircle, Heart } from "lucide-react";
import { useI18n } from "@/i18n";
import { AnalysisResult, Student, SurveyResponse } from "@/lib/storage";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AnalysisViewProps {
  student: Student;
  survey: SurveyResponse;
}

export function AnalysisView({ student, survey }: AnalysisViewProps) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const reportRef = useRef<HTMLDivElement>(null);
  const analysis = survey.analysis;

  // Helper to extract localized values
  const loc = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return (isAr ? val?.ar : val?.en) || val?.ar || val?.en || "";
  };
  const locArray = (val: any): string[] => {
    if (Array.isArray(val)) return val.map((v: any) => typeof v === "string" ? v : loc(v));
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const picked = isAr ? val?.ar : val?.en;
      return Array.isArray(picked) ? picked : [];
    }
    return [];
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {isAr ? "لا توجد نتائج تحليل لهذا الاستقصاء" : "No analysis results for this survey"}
        </CardContent>
      </Card>
    );
  }

  const scoreKeys = [
    { key: "cognitive", ar: "المعرفي", en: "Cognitive" },
    { key: "language", ar: "اللغة", en: "Language" },
    { key: "social_emotional", ar: "اجتماعي", en: "Social" },
    { key: "motor", ar: "حركي", en: "Motor" },
    { key: "self_care", ar: "رعاية ذاتية", en: "Self-Care" },
    { key: "daily_mood", ar: "الرفاهية", en: "Wellbeing" },
    // Legacy keys for older assessments
    { key: "attention", ar: "انتباه", en: "Attention" },
    { key: "creativity", ar: "إبداع", en: "Creativity" },
    { key: "behavior", ar: "سلوك", en: "Behavior" },
    { key: "gross_motor", ar: "حركة كبرى", en: "Gross Motor" },
    { key: "fine_motor", ar: "حركة دقيقة", en: "Fine Motor" },
  ];

  const radarData = scoreKeys
    .filter(s => analysis.scores?.[s.key] !== undefined)
    .map(s => ({
      subject: isAr ? s.ar : s.en,
      value: analysis.scores[s.key],
    }));

  const barData = radarData.map(d => ({ name: d.subject, score: d.value }));

  const indicatorColor: Record<string, string> = {
    gifted: "bg-primary/10 text-primary border-primary/30",
    typical: "bg-muted text-muted-foreground border-border",
    delayed: "bg-destructive/10 text-destructive border-destructive/30",
    mixed: "bg-accent/10 text-accent-foreground border-accent/30",
  };

  const handleShareWhatsApp = () => {
    const msg = `${isAr ? "تقرير نمو الطفل" : "Child Development Report"}: ${student.name}\n\n${loc(analysis.parentMessage)}\n\n${locArray(analysis.actionPlan).join("\n")}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      toast.info(isAr ? "جاري إنشاء PDF..." : "Generating PDF...");
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${student.name}-report-${new Date().toLocaleDateString()}.pdf`);
      toast.success(isAr ? "تم تصدير PDF" : "PDF exported");
    } catch {
      toast.error(isAr ? "خطأ في التصدير" : "Export error");
    }
  };

  return (
    <div className="space-y-4" dir={isAr ? "rtl" : "ltr"}>
      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleShareWhatsApp} variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" /> {t("analysis.share")}
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" /> {t("analysis.exportPdf")}
        </Button>
      </div>

      <div ref={reportRef} className="space-y-4 bg-background p-2">
        {/* Header */}
        <div className="text-center pb-2 border-b">
          <h2 className="text-xl font-bold">🌈 Kinder BH</h2>
          <p className="text-sm text-muted-foreground">{student.name} — {new Date(survey.date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}</p>
        </div>

        {/* Indicator badge */}
        {analysis.indicators?.type && (
          <Card className={`border-2 ${indicatorColor[analysis.indicators.type] || ""}`}>
            <CardContent className="py-3 flex items-center gap-3">
              <Star className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">{t("analysis.indicators")}: {t(`indicators.${analysis.indicators.type}`)}</p>
                <p className="text-xs text-muted-foreground">{loc(analysis.indicators.details)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> {t("analysis.summary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{loc(analysis.summary)}</p>
          </CardContent>
        </Card>

        {/* Charts */}
        {radarData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("analysis.scores")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("analysis.scores")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Score details */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            {radarData.map(item => (
              <div key={item.subject} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{item.subject}</span>
                  <span>{item.value}/100</span>
                </div>
                <Progress value={item.value} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" /> {t("analysis.strengths")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {locArray(analysis.strengths).map((s, i) => (
                  <li key={i} className="text-sm flex gap-2"><span className="text-primary shrink-0">✓</span> {s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> {t("analysis.improvements")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {locArray(analysis.improvements).map((s, i) => (
                  <li key={i} className="text-sm flex gap-2"><span className="text-destructive shrink-0">!</span> {s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {locArray(analysis.teacherRecommendations).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" /> {t("analysis.recommendations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {locArray(analysis.teacherRecommendations).map((r, i) => (
                  <li key={i} className="text-sm p-2 rounded-lg bg-primary/5 border border-primary/10">{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Parent Message */}
        {analysis.parentMessage && (
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" /> {t("analysis.parentMessage")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed bg-primary/5 p-3 rounded-lg">{loc(analysis.parentMessage)}</p>
              {locArray(analysis.actionPlan).length > 0 && (
                <>
                  <h4 className="text-sm font-semibold">{t("analysis.actionPlan")}</h4>
                  <div className="space-y-2">
                    {locArray(analysis.actionPlan).map((a, i) => (
                      <div key={i} className="text-sm p-2 rounded-lg bg-muted/30 border">{a}</div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
