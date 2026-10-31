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
  confidence: "Higher" | "Moderate" | "Lower";
  status: "estimated" | "review_required";
};
export const gbp = (pence: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(pence / 100);
