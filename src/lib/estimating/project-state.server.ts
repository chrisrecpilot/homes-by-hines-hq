import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { generateEstimate } from "./estimate.server";
import { applyProjectPatch, type ProjectPatch, type ProjectState } from "./project-state";
import type { ProjectSpec } from "./types";
import { normalizeLocation, minimumInputs } from "./validation";

export async function readProjectState(sessionId: string): Promise<ProjectState | null> {
  const { data, error } = await supabaseAdmin.from("estimating_sessions").select("project_state").eq("id", sessionId).single();
  if (error) throw new Error("Could not load project");
  return data.project_state as unknown as ProjectState | null;
}
export async function updateProjectState(sessionId: string, input: ProjectSpec | ProjectPatch, expectedRevision: number, full = false): Promise<ProjectState> {
  const previous = await readProjectState(sessionId);
  if ((previous?.revision ?? 0) !== expectedRevision) throw new Error("This project changed in another window. Please reload and try again.");
  if (!previous && !full) throw new Error("Choose a project first.");
  const specification = full ? input as ProjectSpec : previous ? applyProjectPatch(previous.specification, input) : input as ProjectSpec;
  specification.location = normalizeLocation(specification.location);
  if (previous && JSON.stringify(previous.specification) === JSON.stringify(specification) && !previous.pending) return previous;
  const revision = expectedRevision + 1;
  const changedCategory = previous?.specification.category !== specification.category;
  const state: ProjectState = { specification, revision, specificationVersion: revision,
    projectId: changedCategory ? crypto.randomUUID() : previous?.projectId ?? crypto.randomUUID(),
    startedAt: changedCategory ? new Date().toISOString() : previous?.startedAt ?? new Date().toISOString(),
    estimate: null, currentEstimateId: null,
    estimateRevision: 0, pricingMethod: null,
    pricingStatus: "needs_input", calculatedAt: null, pending: true };
  const { data: claimed, error } = await supabaseAdmin.from("estimating_sessions")
    .update({ project_state: state as unknown as Json, project_revision: revision })
    .eq("id", sessionId).eq("project_revision", expectedRevision).select("id").maybeSingle();
  if (error || !claimed) throw new Error("This project changed in another window. Please reload and try again.");
  try {
    const estimate = await generateEstimate(sessionId, specification);
    Object.assign(state, { estimate, currentEstimateId: estimate.id, estimateRevision: revision,
      pricingMethod: estimate.estimateType, pricingStatus: estimate.status, calculatedAt: estimate.createdAt, pending: false });
  } catch (error) {
    console.error("Project estimate failed", error);
    Object.assign(state, { pending: false, pricingStatus: minimumInputs(specification).length ? "needs_input" : "review_required" });
  }
  const { data: saved, error: saveError } = await supabaseAdmin.from("estimating_sessions")
    .update({ project_state: state as unknown as Json }).eq("id", sessionId).eq("project_revision", revision).select("id").maybeSingle();
  if (saveError || !saved) throw new Error("This project changed in another window. Please reload and try again.");
  return state;
}