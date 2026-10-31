import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function verifySession(id: string, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(token))
    throw new Error("Invalid conversation credentials");
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hash = [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const { error: insertError } = await supabaseAdmin
    .from("estimating_sessions")
    .upsert({ id, token_hash: hash }, { onConflict: "id", ignoreDuplicates: true });
  if (insertError) throw new Error("Could not open conversation");
  const { data, error } = await supabaseAdmin
    .from("estimating_sessions")
    .select("token_hash")
    .eq("id", id)
    .single();
  if (error || data?.token_hash !== hash) throw new Error("Conversation access denied");
}
