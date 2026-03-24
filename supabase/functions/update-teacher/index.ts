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

    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const roleList = (roles || []).map((r: any) => r.role);
    const isAdmin = roleList.includes("admin");
    const isKgAdmin = roleList.includes("kg_admin");

    if (!isAdmin && !isKgAdmin) throw new Error("Only admins and KG directors can update accounts");

    const { userId, fullName, email } = await req.json();
    if (!userId) throw new Error("Missing userId");

    // KG admin can only edit teachers in their own kindergarten
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

      if (callerProfile?.kindergarten_id !== targetProfile?.kindergarten_id) {
        throw new Error("You can only edit accounts in your own kindergarten");
      }
    }

    // Update name in profiles
    if (fullName && fullName.trim()) {
      await adminClient
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", userId);
    }

    // Update email via admin API
    if (email && email.trim()) {
      const { error: emailError } = await adminClient.auth.admin.updateUserById(userId, {
        email: email.trim().toLowerCase(),
      });
      if (emailError) throw emailError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("update-teacher error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
