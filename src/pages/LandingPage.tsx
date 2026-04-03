import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/kinder-bh-logo.png";
import { CalendarDays, Camera, ClipboardList, Moon, Sparkles, Utensils, Users, School, ShieldCheck } from "lucide-react";

const features = [
  { icon: ClipboardList, title: "تقييم سريع وسهل", description: "تقييم الطفل أثناء النشاط بنقرات قليلة بدل النماذج المعقدة." },
  { icon: Camera, title: "توثيق فوري", description: "أضف صورًا وملاحظات قصيرة بسرعة دون تعطيل وقت المعلمة." },
  { icon: Users, title: "تقارير واضحة للأهل", description: "ملخصات مفهومة ترفع رضا أولياء الأمور وثقتهم بالروضة." },
  { icon: CalendarDays, title: "تشغيل يومي منظم", description: "حضور، أنشطة، تقويم، ومتابعات يومية في مكان واحد." },
  { icon: Utensils, title: "وجبات وملاحظات يومية", description: "متابعة الوجبات والنوم والملاحظات بطريقة سهلة ومرتبة." },
  { icon: Moon, title: "لوحة إدارية واضحة", description: "مؤشرات سريعة تعجب الإدارة وتدعم القرارات التشغيلية." },
];

const personas = [
  { icon: School, title: "للإدارة", description: "رؤية أوضح للأداء والتقييمات والحضور والتقارير من شاشة واحدة." },
  { icon: Users, title: "للمعلمة", description: "تجربة أخف للتوثيق والتقييم والمتابعة اليومية دون إرباك." },
  { icon: ShieldCheck, title: "للأسرة", description: "تقارير يومية وشهرية أوضح تعزز الثقة والرضا والاحتفاظ." },
];

export default function LandingPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#f8fbff_45%,#f1f7ff_100%)] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Kinder BH" className="h-12 w-12 rounded-2xl bg-white object-contain shadow-sm" />
          <div>
            <div className="text-lg font-bold">Kinder BH</div>
            <div className="text-sm text-slate-500">منصة تشغيل وتقييم للروضات</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost"><Link to="/auth">تسجيل الدخول</Link></Button>
          <Button asChild><Link to="/auth">ابدأ الآن</Link></Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-sky-600" />
              مصمم لتوفير وقت المعلمة وزيادة وضوح الإدارة
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                إدارة الروضة وتقييم الطفل
                <span className="block text-sky-600">بطريقة سهلة واحترافية</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                نظام عملي يربط الحضور والأنشطة والتوثيق والتقارير في تجربة واحدة، مع تركيز خاص على التقييم السريع الذي يوفّر وقت المعلمة ويمنح الإدارة صورة أوضح.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl px-8"><Link to="/auth">ابدأ التجربة</Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-8"><Link to="/auth">شاهد النظام</Link></Button>
            </div>
          </div>

          <div className="rounded-[32px] border bg-white p-6 shadow-xl shadow-sky-100">
            <div className="grid gap-4">
              <div className="rounded-3xl bg-slate-900 p-6 text-white">
                <div className="mb-3 text-sm text-slate-300">ملخص اليوم</div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[["الحضور","84"],["التقييمات","31"],["التقارير","19"],["الأنشطة","8"]].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 p-4">
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="mt-1 text-xs text-slate-300">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-3xl border-sky-100"><CardContent className="space-y-2 p-6"><div className="font-semibold">التقييم السريع</div><div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">ليان أحمد — يؤدي باستقلالية</div><div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">آدم خالد — يحتاج دعمًا بسيطًا</div></CardContent></Card>
                <Card className="rounded-3xl border-sky-100"><CardContent className="space-y-2 p-6"><div className="font-semibold">السجل اليومي</div><div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">الوجبات: 72 جيد / 12 متوسط</div><div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">النوم: 58 طفلًا ناموا اليوم</div></CardContent></Card>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            {personas.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="rounded-3xl bg-white shadow-sm">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Icon className="h-6 w-6" /></div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="leading-7 text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold">ما الذي يجعل النظام مناسبًا للروضات؟</h2>
            <p className="mt-3 text-slate-600">يركز على الأشياء التي تعجب الإدارة وتوفر وقت المعلمة دون تعقيد.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="rounded-3xl border-white/80 bg-white shadow-sm">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Icon className="h-6 w-6" /></div>
                    <div><h3 className="text-xl font-semibold">{feature.title}</h3><p className="mt-2 leading-7 text-slate-600">{feature.description}</p></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-[32px] bg-slate-900 p-10 text-white shadow-xl">
            <h2 className="text-3xl font-bold">جاهز لتجربة أوضح وأسهل للروضة؟</h2>
            <p className="mt-3 max-w-2xl text-slate-300">ابدأ من صفحة دخول واحدة ثم انتقل إلى تجربة تشغيل يومي تساعد الإدارة والمعلمة وولي الأمر في وقت واحد.</p>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="secondary"><Link to="/auth">ابدأ الآن</Link></Button>
              <Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-slate-900"><Link to="/auth">عرض الدخول</Link></Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
