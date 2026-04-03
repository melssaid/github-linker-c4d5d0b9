import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { Users, Brain, TrendingUp, Activity, ClipboardList, BarChart3 } from "lucide-react";

const Index = () => {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === "ar";
  const { students, studentStatusMap, totalProgress, isLoading, error } = useDashboard();

  const total = students?.length || 0;
  const analyzed = studentStatusMap?.filter((s) => s.status === "analyzed").length || 0;
  const needs = studentStatusMap?.filter((s) => s.status === "needs_survey").length || 0;
  const completion = total ? Math.round((analyzed / total) * 100) : 0;

  if (error) {
    return <DashboardLayout><div className="min-h-[50vh] flex items-center justify-center">{isAr ? "تعذر تحميل البيانات" : "Could not load data"}</div></DashboardLayout>;
  }

  if (isLoading) {
    return <DashboardLayout><div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></DashboardLayout>;
  }

  const cards = [
    { icon: Users, label: isAr ? "إجمالي الطلاب" : "Total Students", value: total },
    { icon: Brain, label: isAr ? "تحليل منجز" : "Analyzed", value: analyzed },
    { icon: TrendingUp, label: isAr ? "بانتظار التقييم" : "Needs Survey", value: needs },
    { icon: Activity, label: isAr ? "التقدم الكلي" : "Overall Progress", value: `${totalProgress}%` },
  ];

  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isAr ? "لوحة الإدارة والمعلمة" : "Admin & Teacher Hub"}</h1>
            <p className="text-sm text-slate-500">{isAr ? "اختصارات واضحة للتشغيل والتقييم والتقارير" : "Clear shortcuts for operations, assessment, and reporting"}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/daily-ops")}>{isAr ? "التشغيل اليومي" : "Daily Ops"}</Button>
            <Button onClick={() => navigate("/reports")}>{isAr ? "التقارير" : "Reports"}</Button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="rounded-3xl border border-sky-100 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Icon className="h-6 w-6" /></div>
                  <div className="text-sm text-slate-500">{card.label}</div>
                  <div className="mt-3 text-3xl font-bold text-slate-900">{card.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl border border-sky-100 bg-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2 font-semibold text-slate-900"><ClipboardList className="h-5 w-5 text-sky-600" /> {isAr ? "أعمال اليوم" : "Today actions"}</div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">{isAr ? "البدء بصفحة التشغيل اليومي لمتابعة الحضور والوجبات والنوم" : "Start with daily ops for attendance, meals, and sleep"}</div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">{isAr ? "مراجعة الطلاب الذين يحتاجون تقييمًا" : "Review students who need assessment"}</div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">{isAr ? "إرسال التقارير الجاهزة في نهاية اليوم" : "Send prepared reports at day end"}</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-sky-100 bg-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2 font-semibold text-slate-900"><BarChart3 className="h-5 w-5 text-sky-600" /> {isAr ? "ملخص تشغيلي" : "Operational summary"}</div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">{isAr ? `نسبة الإنجاز الحالية ${completion}%` : `Current completion ${completion}%`}</div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">{isAr ? `عدد الطلاب بانتظار التقييم ${needs}` : `Students waiting for survey ${needs}`}</div>
              <Button onClick={() => navigate("/students")}>{isAr ? "فتح الطلاب" : "Open students"}</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Index;
