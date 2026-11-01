import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { customerEstimate, type ProjectState } from "./project-state";
import { describeSpec } from "./update-project";
import { gbp, headlineRange } from "./types";
import { enquirySchema } from "./enquiry";
import type { Database } from "@/integrations/supabase/types";
export async function saveLead(sessionId: string, state: ProjectState | null, input: unknown) {
  const v = enquirySchema.parse(input);
  const estimate = state && !state.pending && state.revision === state.estimateRevision ? state.estimate : null;
  const range = estimate ? headlineRange(customerEstimate(estimate)) : null;
  const summary = [`[Via chat · ${v.request.replaceAll("_", " ")}]`, v.message,
    state ? `Project: ${describeSpec(state.specification)}` : null,
    range ? `Indicative budget shown: ${gbp(range.low)}–${gbp(range.high)} (${estimate?.estimateType})` : null].filter(Boolean).join("\n");
  // PostgreSQL accepts nullable arguments; generated RPC typings omit SQL nullability.
  const args = {
    p_session: sessionId, p_estimate: estimate?.id ?? null,
    p_name: v.name, p_phone: v.phone, p_email: v.email, p_type: v.enquiry_type,
    p_request: v.request, p_message: summary.slice(0, 5000),
    p_address: v.site_address ?? null, p_preference: v.visit_preference ?? null,
  } as unknown as Database["public"]["Functions"]["save_quote_enquiry"]["Args"];
  const { data, error } = await supabaseAdmin.rpc("save_quote_enquiry", args);
  if (error || !data) throw new Error("Could not save the request.");
  return data;
}