import { z } from "zod";
import { projectSchema, type EstimateResult, type ProjectSpec } from "./types";
import { minimumInputs } from "./validation";

export type ProjectState = {
  specification: ProjectSpec;
  revision: number;
  estimate: EstimateResult | null;
  currentEstimateId: string | null;
  estimateRevision: number;
  specificationVersion: number;
  pricingMethod: EstimateResult["estimateType"];
  pricingStatus: EstimateResult["status"];
  calculatedAt: string | null;
  pending: boolean;
};
export const patchSchema = projectSchema.partial();
export type ProjectPatch = z.infer<typeof patchSchema>;
export function emptyProject(category: ProjectSpec["category"], description: string): ProjectSpec {
  return projectSchema.parse({ category, description, location: null, length: null, width: null,
    height: null, storeys: null, openingArea: null, foundationDepth: null, foundationWidth: null,
    roof: null, bifolds: null, underfloorHeating: null, structuralOpening: null, assumptions: [], exclusions: [] });
}
export function applyProjectPatch(spec: ProjectSpec, patch: ProjectPatch): ProjectSpec {
  const valid = patchSchema.parse(patch);
  const result = { ...spec, ...valid };
  if ("length" in valid || "width" in valid) result.approximateArea = null;
  if ("approximateArea" in valid) { result.length = null; result.width = null; }
  if (valid.doorType) result.bifolds = valid.doorType === "bifold";
  return projectSchema.parse(result);
}
export function choicePatch(set: string, value: string): ProjectPatch | null {
  const map: Record<string, Record<string, ProjectPatch>> = {
    sizes: { "3x4": { length: 3, width: 4 }, "4x5": { length: 4, width: 5 }, "5x6": { length: 5, width: 6 }, "6x6": { length: 6, width: 6 } },
    storeys: { "1": { storeys: 1 }, "2": { storeys: 2 } },
    roof: { flat: { roof: "flat" }, pitched: { roof: "pitched" }, not_sure: { roof: null } },
    doors: { french: { doorType: "french" }, bifold: { doorType: "bifold" }, sliding: { doorType: "sliding" } },
    walls: { brick: { wallFinish: "brick" }, render: { wallFinish: "render" }, mixed: { wallFinish: "mixed" } },
    flooring: { lvt: { flooring: "lvt" }, timber: { flooring: "timber" }, tiles: { flooring: "tiles" }, other: { flooring: "other" } },
    kitchen_scope: { refresh: { renovationScope: "refresh" }, replacement: { renovationScope: "replacement" }, full: { renovationScope: "full" } },
    bathroom_scope: { refresh: { renovationScope: "refresh" }, replacement: { renovationScope: "replacement" }, full: { renovationScope: "full" } },
    specification: { standard: { specificationLevel: "standard" }, premium: { specificationLevel: "premium" }, bespoke: { specificationLevel: "bespoke" } },
    room_size: { small: { roomSize: "small" }, standard: { roomSize: "standard" }, large: { roomSize: "large" } },
    bathroom_layout: { retained: { layoutRetained: true }, changed: { layoutRetained: false } },
    bathroom_fittings: { retained: { fittingsRetained: true }, replaced: { fittingsRetained: false } },
  };
  return map[set]?.[value] ?? null;
}
export function nextProjectQuestion(spec: ProjectSpec): string {
  const missing = minimumInputs(spec);
  const field = missing[0];
  if (field === "renovationScope") return `What sort of ${spec.category} work are you planning?\n<choices>${spec.category}_scope</choices>`;
  if (field === "size") return spec.category === "extension" ? "Roughly how big are you thinking?\n<choices>sizes</choices>" : ["bathroom", "kitchen"].includes(spec.category) ? "Roughly how big is the room? You can give dimensions or choose a size.\n<choices>room_size</choices>" : "What is the approximate area or length? You can give rough measurements.";
  if (field === "storeys") return "Single or double storey?\n<choices>storeys</choices>";
  if (field === "specificationLevel") return "What level of finish are you thinking?\n<choices>specification</choices>";
  if (field === "layoutRetained") return "Will the plumbing and fittings stay in their current positions?\n<choices>bathroom_layout</choices>";
  if (field === "fittingsRetained") return "Are you keeping the existing sanitaryware or replacing it?\n<choices>bathroom_fittings</choices>";
  if (field === "loftType") return "Are you thinking rooflights, a dormer, hip-to-gable or a mansard conversion?";
  if (field === "existingRoof") return "What is the existing roof like?";
  if (field === "workType") return "What work would you like us to carry out?";
  if (field === "finish") return "What material or finish are you thinking?";
  if (field) return "Could you tell us a little more about the work and its size?";
  return "What would you like to refine?\n<choices>refine</choices>";
}
/** Never send internal cost diagnostics or incomplete line items to a visitor or model. */
export function customerEstimate(result: EstimateResult): EstimateResult {
  const complete = result.scopeComplete && result.estimateType !== "benchmark";
  return { ...result, missing: [], lines: complete ? result.lines : [],
    base: complete ? result.base : { low: 0, expected: 0, high: 0 },
    markup: complete ? result.markup : { low: 0, expected: 0, high: 0 },
    assumptions: result.assumptions.filter((s) => !/wastage;|per person|Explicitly excluded construction phase/i.test(s)),
    warnings: result.warnings.filter((s) => !/Outside the sourced market benchmark/i.test(s)) };
}
export function customerState(state: ProjectState): ProjectState {
  return { ...state, estimate: state.estimate ? customerEstimate(state.estimate) : null };
}