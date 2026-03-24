import { TopNavbar } from "./TopNavbar";
import { BottomTabBar } from "./BottomTabBar";
import { useI18n } from "@/i18n";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={dir}>
      <TopNavbar />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
