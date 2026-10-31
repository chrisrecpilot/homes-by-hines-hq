import { z } from "zod";

export const projectSchema = z
  .object({
    category: z.enum([
      "extension",
      "loft",
      "bathroom",
      "kitchen",
      "garden_wall",
      "plastering",
      "knock_through",
      "repair",
      "general",
    ]),
    extensionType: z.enum(["rear", "side", "wraparound", "other"]).nullable().default(null),
    approximateArea: z.number().positive().max(10000).nullable().default(null),
    doorType: z.enum(["french", "bifold", "sliding"]).nullable().default(null),
    wallFinish: z.enum(["brick", "render"]).nullable().default(null),
    flooring: z.enum(["lvt", "timber", "tiles"]).nullable().default(null),
    excludedPhases: z.array(z.string().max(80)).max(20).default([]),
    location: z.string().max(150).nullable(),
    length: z.number().positive().max(100).nullable(),
    width: z.number().positive().max(100).nullable(),
    height: z.number().positive().max(20).nullable(),
    storeys: z.number().int().min(1).max(3).nullable(),
    openingArea: z.number().min(0).max(1000).nullable(),
    foundationDepth: z.number().positive().max(5).nullable(),
    foundationWidth: z.number().positive().max(3).nullable(),
    roof: z.enum(["flat", "pitched", "not_applicable"]).nullable(),
    bifolds: z.boolean().nullable(),
    underfloorHeating: z.boolean().nullable(),
    structuralOpening: z.boolean().nullable(),
    description: z.string().min(1).max(3000),
    assumptions: z.array(z.string().max(300)).max(20),
    exclusions: z.array(z.string().max(300)).max(20),
  })
  .strict();
export type ProjectSpec = z.infer<typeof projectSchema>;
export type Range = { low: number; expected: number; high: number };
export type CatalogKind =
  "labour" | "material" | "productivity" | "template" | "benchmark" | "expense";
export type CatalogEntry = {
  id: string;
  kind: string;
  name: string;
  data: Record<string, unknown>;
  updated_at: string;
};
export type PricingSettings = {
  markup_percent: number;
  vat_registered: boolean | null;
  sales_vat_percent: number;
  tax_confirmed: boolean;
};
export type Task = {
  id: string;
  name: string;
  basis: string;
  trade?: string;
  productivity?: string;
  material?: string;
  expense?: string;
  condition?: string;
  workers?: number;
  phase?: string;
};
export type EstimateLine = {
  id: string;
  name: string;
  category: "labour" | "materials" | "other";
  quantity: Range;
  unit: string;
  rates: Range;
  cost: Range;
  source: string;
  verified: boolean;
  workers?: number;
  days?: Range;
};
export type EstimateType = "benchmark" | "provisional" | "detailed";
export type BenchmarkEstimate = {
  range: Range;
  perUnit: Range;
  unit: string;
  quantity: number;
  source: string;
  sourceDate: string;
  vatBasis: string;
  specLevel: string | null;
  inclusions: string[];
  exclusions: string[];
  marginIncluded: boolean;
};
export type EstimateResult = {
  id?: string;
  createdAt?: string;
  specification: ProjectSpec;
  lines: EstimateLine[];
  missing: string[];
  assumptions: string[];
  exclusions: string[];
  warnings: string[];
  base: Range;
  markup: Range;
  vat: Range | null;
  total: Range | null;
  subtotal: Range | null;
  markupPercent: number;
  estimateType: EstimateType | null;
  benchmarkEstimate: BenchmarkEstimate | null;
  provisionalCount: number;
  verifiedCount: number;
  unpricedCount: number;
  vatConfirmed: boolean;
  confidence: "Higher" | "Moderate" | "Lower";
  status: "needs_input" | "indicative_estimate" | "detailed_estimate" | "review_required";
  missingInputs: string[];
  scopeComplete: boolean;
};
/** The only monetary headline allowed in cards and compact summaries, including old snapshots. */
export function headlineRange(estimate: EstimateResult): Range | null {
  if (estimate.status === "needs_input") return null;
  if (estimate.estimateType === "benchmark") return estimate.benchmarkEstimate?.range ?? null;
  if (estimate.status === "review_required" || estimate.scopeComplete !== true) return null;
  return estimate.total;
}
export const gbp = (pence: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(pence / 100);
