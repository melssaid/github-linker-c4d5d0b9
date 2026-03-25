import { useState } from "react";
import logo from "@/assets/kinder-bh-logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { toast } from "sonner";
import { Loader2, Globe } from "lucide-react";

const AuthPage = () => {
  const { signIn } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isAr = locale === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fdf6e3] via-[#f7f0ff] to-[#e1f4ff] p-4">
      <div className="pointer-events-none absolute -z-10 inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,176,85,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(137,180,255,0.18),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(120,255,214,0.16),transparent_32%)]" />
      <div className="w-full max-w-md space-y-5">
        <div className="group flex items-center justify-center gap-4 rounded-2xl bg-white shadow-[0_15px_45px_-25px_rgba(15,23,42,0.25)] px-4 py-3 border border-orange-100">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-300/40 via-amber-200/45 to-sky-200/40 blur-2xl scale-110 opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-125" />
            <img
              src={logo}
              alt="Kinder BH"
              className="relative h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition duration-500 ease-out group-hover:scale-105"
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Kinder BH</h1>
            <p className="text-slate-600 text-sm leading-snug">{t("auth.subtitle")}</p>
          </div>
        </div>

        <Card className="border border-orange-100 bg-white/95 backdrop-blur shadow-[0_16px_60px_-30px_rgba(15,23,42,0.35)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                {t("auth.login")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                className="text-slate-500 hover:text-slate-800 hover:bg-orange-50"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">{t("auth.email")}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="teacher@school.com"
                  required
                  dir="ltr"
                  className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-300 focus:ring-orange-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">{t("auth.password")}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                  className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-300 focus:ring-orange-300"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-300 text-slate-900 font-semibold shadow-[0_12px_35px_-18px_rgba(251,146,60,0.65)] hover:shadow-[0_14px_38px_-18px_rgba(251,146,60,0.8)]"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {t("auth.login")}
              </Button>
            </form>
            <p className="mt-1 text-center text-xs text-slate-600">
              {isAr ? "تواصل مع إدارة الروضة للحصول على بيانات الدخول" : "Contact your kindergarten admin for login credentials"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;