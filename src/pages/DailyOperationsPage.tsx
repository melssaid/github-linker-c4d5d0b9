import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Moon, Send, Utensils, Users } from "lucide-react";
import { Link } from "react-router-dom";

const blocks = [
  { title: "الحضور", value: "84 حاضر / 8 غياب", icon: Users },
  { title: "الوجبات", value: "72 جيد / 12 متوسط", icon: Utensils },
  { title: "النوم", value: "58 طفلًا ناموا اليوم", icon: Moon },
  { title: "التقييمات", value: "31 تقييمًا مكتملًا", icon: ClipboardList },
];

export default function DailyOperationsPage() {
  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">التشغيل اليومي</h1>
            <p className="text-sm text-slate-500">ملخص سريع يساعد الإدارة والمعلمة على اتخاذ القرار بسرعة</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline"><Link to="/students">الطلاب</Link></Button>
            <Button asChild><Link to="/reports">التقارير</Link></Button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {blocks.map((block) => {
            const Icon = block.icon;
            return (
              <Card key={block.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm text-slate-500">{block.title}</div>
                  <div className="mt-3 text-xl font-bold text-slate-900">{block.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>أولويات اليوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">متابعة الأطفال الذين يحتاجون تقييمًا إضافيًا</div>
              <div className="rounded-2xl bg-slate-50 p-4">إرسال ملخص اليوم إلى أولياء الأمور قبل نهاية الدوام</div>
              <div className="rounded-2xl bg-slate-50 p-4">مراجعة الأطفال ذوي الملاحظات السلوكية المتكررة</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>ملخصات جاهزة للإرسال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold">ليان أحمد</div>
                  <Badge variant="secondary">جاهز</Badge>
                </div>
                <p className="text-sm leading-7 text-slate-600">شاركت اليوم بشكل ممتاز وأظهرت تقدمًا ملحوظًا في نشاط الألوان.</p>
              </div>
              <Button className="gap-2"><Send className="h-4 w-4" /> إرسال التقارير الجاهزة</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
