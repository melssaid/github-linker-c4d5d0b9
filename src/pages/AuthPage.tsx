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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
      {/* soft glow background */}
      <div className="pointer-events-none absolute -z-10 inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(56,189,248,0.18),transparent_32%)]" />
      <div className="w-full max-w-md space-y-5">
        <div className="group flex items-center justify-center gap-4 rounded-2xl bg-white/5 px-4 py-3 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/40 via-pink-500/35 to-cyan-400/35 blur-2xl scale-110 opacity-70 transition-all duration-700 group-hover:opacity-100 group-hover:scale-125" />
            <img
              src={logo}
              alt="Kinder BH"
              className="relative h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_18px_38px_rgba(79,70,229,0.45)]"
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Kinder BH</h1>
            <p className="text-slate-300 text-sm">{t("auth.subtitle")}</p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_70px_-35px_rgba(0,0,0,0.65)]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">{t("auth.login")}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                className="text-slate-200 hover:text-white hover:bg-white/10"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">{t("auth.email")}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="teacher@school.com"
                  required
                  dir="ltr"
                  className="bg-white/5 border-white/15 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">{t("auth.password")}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                  className="bg-white/5 border-white/15 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-[0_12px_35px_-18px_rgba(56,189,248,0.6)] hover:shadow-[0_15px_40px_-18px_rgba(56,189,248,0.8)]"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {t("auth.login")}
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-slate-300">
              {isAr ? "تواصل مع إدارة الروضة للحصول على بيانات الدخول" : "Contact your kindergarten admin for login credentials"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;