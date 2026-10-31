import type { ProjectPatch } from "./project-state";
import type { ProjectSpec } from "./types";
import { toMetres, toSquareMetres, type AreaUnit, type MeasureUnit } from "./units";

/** Model-facing input: null always means "unchanged". The server converts units and validates. */
export type UpdateProjectInput = {
  category: ProjectSpec["category"] | null;
  summary: string | null;
  extensionType: ProjectSpec["extensionType"];
  renovationScope: ProjectSpec["renovationScope"];
  specificationLevel: ProjectSpec["specificationLevel"];
  roomSize: ProjectSpec["roomSize"];
  loftType: ProjectSpec["loftType"];
  workType: string | null;
  finish: string | null;
  length: number | null;
  width: number | null;
  lengthUnit: MeasureUnit | null;
  area: number | null;
  areaUnit: AreaUnit | null;
  storeys: number | null;
  roof: ProjectSpec["roof"];
  doorType: ProjectSpec["doorType"];
  wallFinish: ProjectSpec["wallFinish"];
  flooring: ProjectSpec["flooring"];
  underfloorHeating: boolean | null;
  structuralOpening: boolean | null;
  rooflights: number | null;
  location: string | null;
  clearFields: string[];
};

const s = (t: string | string[], e?: unknown[]) => (e ? { type: t, enum: e } : { type: t });
const n = (enumVals: string[]) => s(["string", "null"], [...enumVals, null]);

export const UPDATE_PROJECT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["category", "summary", "extensionType", "renovationScope", "specificationLevel", "roomSize", "loftType", "workType", "finish", "length", "width", "lengthUnit", "area", "areaUnit", "storeys", "roof", "doorType", "wallFinish", "flooring", "underfloorHeating", "structuralOpening", "rooflights", "location", "clearFields"],
  properties: {
    category: n(["extension", "loft", "bathroom", "kitchen", "garden_wall", "landscaping", "plastering", "knock_through", "repair", "general"]),
    summary: { ...s(["string", "null"]), description: "One-line project description in the customer's words" },
    extensionType: n(["rear", "side", "wraparound", "other"]),
    renovationScope: n(["refresh", "replacement", "full"]),
    specificationLevel: n(["standard", "premium", "bespoke"]),
    roomSize: n(["small", "standard", "large"]),
    loftType: n(["rooflight", "dormer", "hip_to_gable", "mansard"]),
    workType: s(["string", "null"]),
    finish: s(["string", "null"]),
    length: { ...s(["number", "null"]), description: "How far it projects / room length, in lengthUnit" },
    width: { ...s(["number", "null"]), description: "Width, in lengthUnit" },
    lengthUnit: n(["m", "ft", "cm", "mm"]),
    area: { ...s(["number", "null"]), description: "Floor area if given instead of dimensions (footprint, not total across storeys)" },
    areaUnit: n(["m2", "ft2"]),
    storeys: s(["integer", "null"]),
    roof: n(["flat", "pitched", "not_applicable"]),
    doorType: n(["french", "bifold", "sliding"]),
    wallFinish: n(["brick", "render", "mixed"]),
    flooring: n(["lvt", "timber", "tiles", "other"]),
    underfloorHeating: s(["boolean", "null"]),
    structuralOpening: s(["boolean", "null"]),
    rooflights: s(["integer", "null"]),
    location: { ...s(["string", "null"]), description: "Town or postcode exactly as typed" },
    clearFields: { type: "array", items: { type: "string" }, description: "Fields the customer withdrew, e.g. ['roof']" },
  },
} as const;

const CLEARABLE = new Set(["roof", "doorType", "wallFinish", "flooring", "underfloorHeating", "structuralOpening", "location", "specificationLevel", "roomSize"]);

/** Convert the model's partial update into a validated metric patch. Pricing fields are never accepted. */
export function buildPatch(input: UpdateProjectInput): ProjectPatch {
  const patch: Record<string, unknown> = {};
  const copy = ["category", "extensionType", "renovationScope", "specificationLevel", "roomSize", "loftType", "workType", "finish", "storeys", "roof", "doorType", "wallFinish", "flooring", "underfloorHeating", "structuralOpening", "location"] as const;
  for (const k of copy) if (input[k] !== null && input[k] !== undefined) patch[k] = input[k];
  if (input.summary?.trim()) patch.description = input.summary.trim().slice(0, 3000);
  const length = toMetres(input.length, input.lengthUnit);
  const width = toMetres(input.width, input.lengthUnit);
  if (length) patch.length = length;
  if (width) patch.width = width;
  if (!length && !width) {
    const area = toSquareMetres(input.area, input.areaUnit);
    if (area) patch.approximateArea = area;
  }
  if (typeof input.rooflights === "number" && input.rooflights >= 0) {
    const note = `${input.rooflights} rooflight${input.rooflights === 1 ? "" : "s"} requested (priced separately once specified)`;
    patch.assumptions = [note];
  }
  for (const f of input.clearFields ?? []) if (CLEARABLE.has(f)) patch[f] = null;
  return patch as ProjectPatch;
}

export function describeSpec(spec: ProjectSpec): string {
  const size = spec.length && spec.width ? `${spec.length}m × ${spec.width}m` : spec.approximateArea ? `${spec.approximateArea}m²` : spec.roomSize ? `${spec.roomSize} room` : null;
  return [spec.category.replace("_", " "), spec.extensionType, spec.renovationScope, size, spec.storeys ? `${spec.storeys} storey` : null, spec.roof ? `${spec.roof} roof` : null, spec.doorType ? `${spec.doorType} doors` : null, spec.location].filter(Boolean).join(", ");
}
