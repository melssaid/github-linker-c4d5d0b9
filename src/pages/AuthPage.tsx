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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-center gap-4">
          <img src={logo} alt="Kinder BH" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Kinder BH</h1>
            <p className="text-muted-foreground text-sm">{t("auth.subtitle")}</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t("auth.login")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLocale(locale === "en" ? "ar" : "en")}>
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("auth.email")}</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@school.com" required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.password")}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} dir="ltr" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {t("auth.login")}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {isAr ? "تواصل مع إدارة الروضة للحصول على بيانات الدخول" : "Contact your kindergarten admin for login credentials"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
