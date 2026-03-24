import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { Building2, Plus, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Kindergarten {
  id: string;
  name: string;
  created_at: string;
}

const AdminKindergartens = () => {
  const { user } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("kindergartens").select("*").order("created_at", { ascending: true });
    setKindergartens((data || []) as Kindergarten[]);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase.from("kindergartens").insert({ name: newName.trim(), created_by: user.id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(locale === "ar" ? "تمت إضافة الروضة" : "Kindergarten added");
      setNewName("");
      load();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("kindergartens").delete().eq("id", id);
    toast.success(locale === "ar" ? "تم الحذف" : "Deleted");
    load();
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{locale === "ar" ? "إدارة الروضات" : "Manage Kindergartens"}</h1>
          <p className="text-sm text-muted-foreground">{locale === "ar" ? "إضافة وإدارة الروضات المسجلة" : "Add and manage registered kindergartens"}</p>
        </div>

        <Card>
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {locale === "ar" ? "إضافة روضة جديدة" : "Add New Kindergarten"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={locale === "ar" ? "اسم الروضة..." : "Kindergarten name..."}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="text-sm"
              />
              <Button onClick={handleAdd} disabled={loading || !newName.trim()} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 me-1" />
                <span className="hidden sm:inline">{locale === "ar" ? "إضافة" : "Add"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-2 sm:gap-3">
          {kindergartens.map((kg) => (
            <Card key={kg.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/admin/kindergartens/${kg.id}`)}>
              <CardContent className="flex items-center justify-between p-3 sm:py-4 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{kg.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{new Date(kg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(kg.id); }} className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </div>
              </CardContent>
            </Card>
          ))}
          {kindergartens.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">
              {locale === "ar" ? "لا توجد روضات مسجلة بعد" : "No kindergartens registered yet"}
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminKindergartens;
