import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useRole } from "@/hooks/useRole";
import { LayoutDashboard, Users, FileText, Settings, Building2, KeyRound, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomTabBar() {
  const { locale, dir } = useI18n();
  const { isAdmin, isKgAdmin } = useRole();
  const location = useLocation();
  const isAr = locale === "ar";

  const teacherTabs = [
    { to: "/", icon: LayoutDashboard, label: isAr ? "الرئيسية" : "Home", end: true },
    { to: "/students", icon: Users, label: isAr ? "الطلاب" : "Students" },
    { to: "/reports", icon: FileText, label: isAr ? "التقارير" : "Reports" },
    { to: "/settings", icon: Settings, label: isAr ? "إعدادات" : "Settings" },
  ];

  const adminTabs = [
    { to: "/admin", icon: LayoutDashboard, label: isAr ? "الرئيسية" : "Home", end: true },
    { to: "/admin/kindergartens", icon: Building2, label: isAr ? "روضات" : "KGs" },
    { to: "/admin/teachers", icon: KeyRound, label: isAr ? "معلمات" : "Teachers" },
    { to: "/students", icon: GraduationCap, label: isAr ? "طلاب" : "Students" },
    { to: "/settings", icon: Settings, label: isAr ? "إعدادات" : "Settings" },
  ];

  const kgAdminTabs = [
    { to: "/kg-admin", icon: LayoutDashboard, label: isAr ? "الرئيسية" : "Home", end: true },
    { to: "/kg-admin/teachers", icon: KeyRound, label: isAr ? "معلمات" : "Teachers" },
    { to: "/students", icon: GraduationCap, label: isAr ? "طلاب" : "Students" },
    { to: "/reports", icon: FileText, label: isAr ? "تقارير" : "Reports" },
    { to: "/settings", icon: Settings, label: isAr ? "إعدادات" : "Settings" },
  ];

  const tabs = isAdmin ? adminTabs : isKgAdmin ? kgAdminTabs : teacherTabs;

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t safe-area-bottom" dir={dir}>
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-lg transition-colors min-w-0 relative",
              isActive(tab.to, tab.end) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className={cn("h-5 w-5", isActive(tab.to, tab.end) && "scale-110")} />
            <span className="text-[10px] font-medium leading-tight truncate">{tab.label}</span>
            {isActive(tab.to, tab.end) && (
              <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-primary" />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
