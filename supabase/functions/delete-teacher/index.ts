import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check caller roles
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const roleList = (roles || []).map((r: any) => r.role);
    const isAdmin = roleList.includes("admin");
    const isKgAdmin = roleList.includes("kg_admin");

    if (!isAdmin && !isKgAdmin) throw new Error("Only admins and KG directors can delete accounts");

    const { userId } = await req.json();
    if (!userId) throw new Error("Missing userId");

    // Prevent self-deletion
    if (userId === caller.id) throw new Error("Cannot delete your own account");

    // KG admin can only delete users in their own kindergarten
    if (isKgAdmin && !isAdmin) {
      const { data: callerProfile } = await adminClient
        .from("profiles")
        .select("kindergarten_id")
        .eq("id", caller.id)
        .single();

      const { data: targetProfile } = await adminClient
        .from("profiles")
        .select("kindergarten_id")
        .eq("id", userId)
        .single();

      if (!callerProfile?.kindergarten_id || callerProfile.kindergarten_id !== targetProfile?.kindergarten_id) {
        throw new Error("You can only delete accounts in your own kindergarten");
      }

      // KG admin cannot delete other kg_admins
      const { data: targetRoles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const targetRoleList = (targetRoles || []).map((r: any) => r.role);
      if (targetRoleList.includes("kg_admin") || targetRoleList.includes("admin")) {
        throw new Error("You cannot delete admin or director accounts");
      }
    }

    // Delete related data in order
    // 1. Get student IDs for this teacher
    const { data: teacherStudents } = await adminClient
      .from("students")
      .select("id")
      .eq("teacher_id", userId);

    const studentIds = (teacherStudents || []).map((s: any) => s.id);

    if (studentIds.length > 0) {
      // Delete student-related data
      await adminClient.from("attendance").delete().in("student_id", studentIds);
      await adminClient.from("surveys").delete().in("student_id", studentIds);
      await adminClient.from("parent_reports").delete().in("student_id", studentIds);
      await adminClient.from("message_deliveries").delete().in("student_id", studentIds);
      await adminClient.from("student_guardians").delete().in("student_id", studentIds);
      await adminClient.from("students").delete().eq("teacher_id", userId);
    }

    // 2. Delete user role and profile
    await adminClient.from("user_roles").delete().eq("user_id", userId);
    await adminClient.from("profiles").delete().eq("id", userId);

    // 3. Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("delete-teacher error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
