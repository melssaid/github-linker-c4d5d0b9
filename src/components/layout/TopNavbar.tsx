import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Users, FileText, Settings,
  Shield, Building2, KeyRound, Globe, LogOut, GraduationCap
} from "lucide-react";
import logo from "@/assets/kinder-bh-logo.png";
import { cn } from "@/lib/utils";

export function TopNavbar() {
  const { locale, setLocale, dir } = useI18n();
  const { signOut } = useAuth();
  const { kindergartenName, isAdmin, isKgAdmin } = useRole();
  const location = useLocation();
  const isAr = locale === "ar";

  const teacherLinks = [
    { to: "/", icon: LayoutDashboard, label: isAr ? "الرئيسية" : "Dashboard", end: true },
    { to: "/students", icon: Users, label: isAr ? "الطلاب" : "Students" },
    { to: "/reports", icon: FileText, label: isAr ? "التقارير" : "Reports" },
  ];

  const adminLinks = [
    { to: "/admin", icon: Shield, label: isAr ? "لوحة التحكم" : "Dashboard", end: true },
    { to: "/admin/kindergartens", icon: Building2, label: isAr ? "الروضات" : "Kindergartens" },
    { to: "/admin/teachers", icon: KeyRound, label: isAr ? "المعلمات" : "Teachers" },
    { to: "/students", icon: GraduationCap, label: isAr ? "جميع الطلاب" : "All Students" },
    { to: "/reports", icon: FileText, label: isAr ? "التقارير" : "Reports" },
  ];

  const kgAdminLinks = [
    { to: "/kg-admin", icon: Building2, label: isAr ? "روضتي" : "My KG", end: true },
    { to: "/kg-admin/teachers", icon: KeyRound, label: isAr ? "المعلمات" : "Teachers" },
    { to: "/students", icon: GraduationCap, label: isAr ? "الطلاب" : "Students" },
    { to: "/reports", icon: FileText, label: isAr ? "التقارير" : "Reports" },
  ];

  const navLinks = isAdmin ? adminLinks : isKgAdmin ? kgAdminLinks : teacherLinks;

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const roleLabel = isAdmin
    ? (isAr ? "مسؤول النظام" : "System Admin")
    : isKgAdmin
    ? kindergartenName || (isAr ? "مديرة الروضة" : "KG Admin")
    : null;

  return (
    <header className="sticky top-0 z-50 bg-card border-b" dir={dir}>
      <div className="flex items-center justify-between px-3 sm:px-6 h-14">
        <div className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Kinder BH" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          <h1 className="text-base sm:text-lg font-bold text-foreground font-[Quicksand] hidden sm:block">Kinder BH</h1>
          {roleLabel && (
            <Badge variant="outline" className="hidden lg:flex items-center gap-1 text-[10px]">
              {isAdmin ? <Shield className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
              <span className="truncate max-w-[120px]">{roleLabel}</span>
            </Badge>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isActive(link.to, link.end)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setLocale(locale === "en" ? "ar" : "en")} className="h-8 w-8 p-0">
            <Globe className="h-4 w-4" />
          </Button>
          <NavLink to="/settings">
            <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", isActive("/settings") && "text-primary")}>
              <Settings className="h-4 w-4" />
            </Button>
          </NavLink>
          <Button variant="ghost" size="sm" onClick={signOut} className="h-8 w-8 p-0 text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
