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

    // Verify caller identity
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

    if (!isAdmin && !isKgAdmin) throw new Error("Only admins and KG directors can create accounts");

    const { email, password, fullName, kindergartenId, role = "teacher" } = await req.json();

    if (!email || !password || !fullName || !kindergartenId) {
      throw new Error("Missing required fields: email, password, fullName, kindergartenId");
    }

    // KG admin can only create teachers in their own kindergarten
    if (isKgAdmin && !isAdmin) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("kindergarten_id")
        .eq("id", caller.id)
        .single();

      if (profile?.kindergarten_id !== kindergartenId) {
        throw new Error("You can only create accounts in your own kindergarten");
      }

      // KG admin can only create teacher role, not kg_admin
      if (role !== "teacher") {
        throw new Error("KG directors can only create teacher accounts");
      }
    }

    // Validate role
    const validRoles = ["teacher", "kg_admin"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role. Must be 'teacher' or 'kg_admin'");
    }

    // Create the user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) throw createError;
    if (!newUser.user) throw new Error("Failed to create user");

    const userId = newUser.user.id;

    // Update profile with kindergarten_id
    await adminClient
      .from("profiles")
      .update({ kindergarten_id: kindergartenId })
      .eq("id", userId);

    // Assign role
    await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role });

    return new Response(
      JSON.stringify({ success: true, userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-teacher error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
