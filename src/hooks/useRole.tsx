import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "teacher" | "kg_admin";

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [kindergartenId, setKindergartenId] = useState<string | null>(null);
  const [kindergartenName, setKindergartenName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles && roles.length > 0) {
        // Priority: admin > kg_admin > teacher
        const roleList = roles.map(r => r.role);
        if (roleList.includes("admin")) setRole("admin");
        else if (roleList.includes("kg_admin")) setRole("kg_admin");
        else setRole(roleList[0] as AppRole);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("kindergarten_id")
        .eq("id", user.id)
        .single();

      if (profile?.kindergarten_id) {
        setKindergartenId(profile.kindergarten_id);
        const { data: kg } = await supabase
          .from("kindergartens")
          .select("name")
          .eq("id", profile.kindergarten_id)
          .single();
        if (kg) setKindergartenName(kg.name);
      }

      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isKgAdmin = role === "kg_admin";

  return { role, isAdmin, isTeacher, isKgAdmin, loading, kindergartenId, kindergartenName };
}
