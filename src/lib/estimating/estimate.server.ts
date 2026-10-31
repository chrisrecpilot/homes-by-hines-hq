import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { calculateEstimate } from "./calculate";
import { projectSchema, type CatalogEntry, type ProjectSpec } from "./types";
import type { Json } from "@/integrations/supabase/types";

export async function generateEstimate(sessionId: string, input: ProjectSpec) {
  const specification = projectSchema.parse(input);
  const [catalogQuery, settingsQuery] = await Promise.all([
    supabaseAdmin.from("estimating_catalog").select("*"),
    supabaseAdmin.from("estimating_settings").select("*").eq("id", 1).single(),
  ]);
  if (catalogQuery.error || settingsQuery.error || !settingsQuery.data)
    throw new Error("Pricing data is unavailable; the team can review your project.");
  const catalog = catalogQuery.data as unknown as CatalogEntry[];
  const result = calculateEstimate(specification, catalog, settingsQuery.data);
  const { data, error } = await supabaseAdmin
    .from("estimate_versions")
    .insert({
      session_id: sessionId,
      specification: specification as unknown as Json,
      pricing_snapshot: {
        catalog: catalogQuery.data,
        settings: settingsQuery.data,
      } as unknown as Json,
      result: result as unknown as Json,
    })
    .select("id,created_at")
    .single();
  if (error || !data) throw new Error("Could not save the estimate. Please try again.");
  return { ...result, id: data.id, createdAt: data.created_at };
}
