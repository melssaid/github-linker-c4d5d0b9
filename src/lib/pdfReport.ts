import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { surveyCategories } from "@/data/surveyQuestions";

const categoryMeta: Record<string, { titleAr: string; titleEn: string }> = {
  cognitive: { titleAr: "التطور المعرفي", titleEn: "Cognitive Development" },
  language: { titleAr: "اللغة والتواصل", titleEn: "Language & Communication" },
  social_emotional: { titleAr: "الاجتماعي العاطفي", titleEn: "Social-Emotional" },
  gross_motor: { titleAr: "الحركية الكبرى", titleEn: "Gross Motor Skills" },
  fine_motor: { titleAr: "الحركية الدقيقة", titleEn: "Fine Motor Skills" },
  self_care: { titleAr: "الرعاية الذاتية", titleEn: "Self-Care & Independence" },
  attention: { titleAr: "الانتباه والتركيز", titleEn: "Attention & Focus" },
  creativity: { titleAr: "الإبداع والتعبير", titleEn: "Creativity & Expression" },
  behavior: { titleAr: "السلوك وضبط النفس", titleEn: "Behavior & Self-Regulation" },
  daily_mood: { titleAr: "الرفاهية اليومية", titleEn: "Daily Wellbeing" },
};

function getLevel(score: number, isAr: boolean): string {
  if (score >= 80) return isAr ? "ممتاز" : "Excellent";
  if (score >= 60) return isAr ? "جيد" : "Good";
  if (score >= 50) return isAr ? "يحتاج تطوير" : "Needs Work";
  return isAr ? "يحتاج دعم" : "Needs Support";
}

function getLevelColor(score: number): [number, number, number] {
  if (score >= 80) return [34, 197, 94];
  if (score >= 60) return [59, 130, 246];
  if (score >= 50) return [245, 158, 11];
  return [239, 68, 68];
}

interface PdfReportData {
  studentName: string;
  studentAge: number;
  studentGender: string;
  analysis: any;
  answers: Record<string, any>;
  surveyDate: string;
  isAr: boolean;
}

export function generateStudentPdf(data: PdfReportData) {
  const { studentName, studentAge, studentGender, analysis, answers, surveyDate, isAr } = data;

  // For Arabic we still generate LTR layout but with Arabic text
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helper functions ──
  const addNewPageIfNeeded = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  };

  const drawColorBar = (x: number, yPos: number, width: number, score: number) => {
    // Background bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, yPos, width, 5, 2, 2, "F");
    // Filled bar
    const [r, g, b] = getLevelColor(score);
    doc.setFillColor(r, g, b);
    doc.roundedRect(x, yPos, width * (score / 100), 5, 2, 2, "F");
  };

  // ── Header ──
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Kinder BH", pageWidth / 2, 16, { align: "center" });
  doc.setFontSize(11);
  doc.text(
    isAr ? "تقرير التقييم النمائي الشامل" : "Comprehensive Developmental Assessment Report",
    pageWidth / 2, 26, { align: "center" }
  );
  doc.setFontSize(9);
  doc.text(
    isAr ? "نظام متابعة تطور الأطفال" : "Child Development Tracking System",
    pageWidth / 2, 34, { align: "center" }
  );

  y = 50;

  // ── Student Info Box ──
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "S");

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  const genderLabel = studentGender === "male" ? (isAr ? "ذكر" : "Male") : (isAr ? "أنثى" : "Female");
  const dateFormatted = new Date(surveyDate).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const col1 = margin + 5;
  const col2 = margin + contentWidth / 3;
  const col3 = margin + (contentWidth * 2) / 3;

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(isAr ? "اسم الطفل" : "Child Name", col1, y + 8);
  doc.text(isAr ? "العمر / الجنس" : "Age / Gender", col2, y + 8);
  doc.text(isAr ? "تاريخ التقرير" : "Report Date", col3, y + 8);

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(studentName, col1, y + 17);
  doc.text(`${studentAge} ${isAr ? "سنوات" : "years"} - ${genderLabel}`, col2, y + 17);
  doc.text(dateFormatted, col3, y + 17);

  y += 36;

  // ── Overall Score ──
  const overallScore = analysis?.overallScore || (analysis?.scores
    ? Math.round(Object.values(analysis.scores as Record<string, number>).reduce((a, b) => a + b, 0) / Object.keys(analysis.scores).length)
    : 0);

  doc.setFillColor(...getLevelColor(overallScore));
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(
    `${isAr ? "الدرجة الإجمالية" : "Overall Score"}: ${overallScore}% — ${getLevel(overallScore, isAr)}`,
    pageWidth / 2, y + 11, { align: "center" }
  );

  y += 26;

  // ── Domain Scores Table ──
  const scores = analysis?.scores || {};
  const domainRows = Object.entries(scores).map(([key, score]) => {
    const meta = categoryMeta[key];
    const name = isAr ? meta?.titleAr : meta?.titleEn;
    return [name || key, `${score}%`, getLevel(score as number, isAr)];
  });

  if (domainRows.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(isAr ? "درجات المجالات النمائية" : "Domain Scores", margin, y + 2);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [[
        isAr ? "المجال" : "Domain",
        isAr ? "الدرجة" : "Score",
        isAr ? "المستوى" : "Level",
      ]],
      body: domainRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3, halign: "center" },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: {
        0: { halign: "left", cellWidth: contentWidth * 0.45 },
        1: { cellWidth: contentWidth * 0.2 },
        2: { cellWidth: contentWidth * 0.35 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const scoreVal = parseInt((domainRows[data.row.index]?.[1] || "0").replace("%", ""));
          const [r, g, b] = getLevelColor(scoreVal);
          data.cell.styles.textColor = [r, g, b];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Domain Score Bars ──
  addNewPageIfNeeded(Object.keys(scores).length * 12 + 15);
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(isAr ? "رسم بياني للدرجات" : "Score Visualization", margin, y + 2);
  y += 8;

  Object.entries(scores).forEach(([key, score]) => {
    addNewPageIfNeeded(12);
    const meta = categoryMeta[key];
    const name = isAr ? meta?.titleAr : meta?.titleEn;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`${name || key}`, margin, y + 3);
    doc.text(`${score}%`, margin + contentWidth - 10, y + 3, { align: "right" });
    drawColorBar(margin, y + 5, contentWidth, score as number);
    y += 12;
  });

  y += 5;

  // ── Summary ──
  if (analysis?.summary) {
    addNewPageIfNeeded(30);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(isAr ? "الملخص العام" : "Summary", margin, y + 2);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 4.5 + 5;
  }

  // ── Strengths ──
  if (analysis?.strengths?.length) {
    addNewPageIfNeeded(analysis.strengths.length * 6 + 15);
    doc.setFontSize(13);
    doc.setTextColor(34, 197, 94);
    doc.text(isAr ? "نقاط القوة" : "Strengths", margin, y + 2);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    analysis.strengths.forEach((s: string) => {
      addNewPageIfNeeded(8);
      const lines = doc.splitTextToSize(`• ${s}`, contentWidth - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5 + 2;
    });
    y += 3;
  }

  // ── Areas for Improvement ──
  if (analysis?.improvements?.length) {
    addNewPageIfNeeded(analysis.improvements.length * 6 + 15);
    doc.setFontSize(13);
    doc.setTextColor(245, 158, 11);
    doc.text(isAr ? "مجالات تحتاج تطوير" : "Areas for Growth", margin, y + 2);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    analysis.improvements.forEach((s: string) => {
      addNewPageIfNeeded(8);
      const lines = doc.splitTextToSize(`• ${s}`, contentWidth - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5 + 2;
    });
    y += 3;
  }

  // ── Development Level ──
  if (analysis?.indicators) {
    addNewPageIfNeeded(20);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(isAr ? "مستوى التطور" : "Development Level", margin, y + 2);
    y += 7;

    const typeLabels: Record<string, string> = {
      gifted: isAr ? "متقدم / موهوب" : "Advanced / Gifted",
      typical: isAr ? "ضمن المسار الطبيعي" : "On Track",
      delayed: isAr ? "يحتاج متابعة متخصصة" : "Needs Specialist Follow-up",
      mixed: isAr ? "أداء متفاوت بين المجالات" : "Mixed Performance",
    };

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y - 2, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241);
    doc.text(typeLabels[analysis.indicators.type] || analysis.indicators.type, margin + 5, y + 5);
    y += 15;

    if (analysis.indicators.details) {
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const detailLines = doc.splitTextToSize(analysis.indicators.details, contentWidth);
      doc.text(detailLines, margin, y);
      y += detailLines.length * 4.5 + 5;
    }
  }

  // ── Parent Message ──
  if (analysis?.parentMessage) {
    addNewPageIfNeeded(30);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(isAr ? "رسالة لولي الأمر" : "Message for Parents", margin, y + 2);
    y += 7;
    doc.setFillColor(240, 253, 244);
    const msgLines = doc.splitTextToSize(analysis.parentMessage, contentWidth - 10);
    const boxH = msgLines.length * 4.5 + 8;
    doc.roundedRect(margin, y - 3, contentWidth, boxH, 3, 3, "F");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(msgLines, margin + 5, y + 3);
    y += boxH + 5;
  }

  // ── Action Plan ──
  if (analysis?.actionPlan?.length) {
    addNewPageIfNeeded(20);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(isAr ? "خطة الأنشطة المنزلية" : "Home Activity Plan", margin, y + 2);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    analysis.actionPlan.forEach((step: string, i: number) => {
      addNewPageIfNeeded(10);
      const lines = doc.splitTextToSize(step, contentWidth - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5 + 3;
    });
    y += 3;
  }

  // ── Teacher Recommendations ──
  if (analysis?.teacherRecommendations?.length) {
    addNewPageIfNeeded(20);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(isAr ? "توصيات المعلمة" : "Teacher Recommendations", margin, y + 2);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    analysis.teacherRecommendations.forEach((r: string) => {
      addNewPageIfNeeded(8);
      const lines = doc.splitTextToSize(`• ${r}`, contentWidth - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5 + 2;
    });
  }

  // ── Footer on each page ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageH - 14, pageWidth, 14, "F");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      isAr
        ? "تم إعداد هذا التقرير بواسطة نظام Kinder BH — هذا التقرير استرشادي ولا يغني عن التقييم المتخصص"
        : "Generated by Kinder BH — This report is for guidance and does not replace specialist evaluation",
      pageWidth / 2, pageH - 7, { align: "center" }
    );
    doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageH - 7, { align: "right" });
  }

  // ── Save ──
  const fileName = `${studentName.replace(/\s+/g, "_")}_report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
