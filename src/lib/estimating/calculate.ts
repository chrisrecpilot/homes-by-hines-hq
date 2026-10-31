import {
  projectSchema,
  type ProjectSpec,
  type CatalogEntry,
  type PricingSettings,
  type Range,
  type Task,
  type EstimateLine,
  type EstimateResult,
} from "./types";

const range = (n: number): Range => ({ low: n, expected: n, high: n });
const keys = ["low", "expected", "high"] as const;
export function multiplyMoney(pence: number, quantity: number) {
  if (!Number.isSafeInteger(pence) || pence < 0 || !Number.isFinite(quantity) || quantity < 0)
    throw new Error("Invalid money or quantity");
  const scaled = Math.round(quantity * 1_000_000);
  const result = Number((BigInt(pence) * BigInt(scaled) + 500_000n) / 1_000_000n);
  if (!Number.isSafeInteger(result)) throw new Error("Cost exceeds supported range");
  return result;
}
export const floorArea = (length: number, width: number) => length * width;
export const wallArea = (length: number, height: number, openings = 0) =>
  Math.max(0, length * height - openings);
export const concreteVolume = (length: number, width: number, depth: number) =>
  length * width * depth;
export const sheetCount = (area: number, sheetArea: number, wastage: number) => {
  if (sheetArea <= 0 || wastage < 0) throw new Error("Invalid sheet specification");
  return Math.ceil((area * (1 + wastage / 100)) / sheetArea);
};
export const masonryUnits = (
  area: number,
  lengthMm: number,
  heightMm: number,
  jointMm: number,
  leaves: number,
  waste: number,
) => {
  if (lengthMm <= 0 || heightMm <= 0 || jointMm < 0 || leaves <= 0)
    throw new Error("Invalid masonry specification");
  return Math.ceil(
    ((area * leaves * 1_000_000) / ((lengthMm + jointMm) * (heightMm + jointMm))) *
      (1 + waste / 100),
  );
};
export const paintLitres = (area: number, coats: number, coverage: number, waste: number) => {
  if (coverage <= 0 || coats <= 0) throw new Error("Invalid paint coverage");
  return ((area * coats) / coverage) * (1 + waste / 100);
};
export function totals(base: number, markupPercent: number, vatPercent: number | null) {
  if (markupPercent < 10 || markupPercent > 15) throw new Error("Markup must be 10–15%");
  const markup = multiplyMoney(base, markupPercent / 100);
  const subtotal = base + markup;
  const vat = vatPercent === null ? null : multiplyMoney(subtotal, vatPercent / 100);
  return { base, markup, subtotal, vat, total: vat === null ? null : subtotal + vat };
}
function numeric(data: Record<string, unknown>, key: string, fallback = 0) {
  const n = data[key];
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}
function readRange(data: Record<string, unknown>, field: string): Range | null {
  const v = data[field];
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) return range(v);
  if (v && typeof v === "object") {
    const r = v as Range;
    if (
      keys.every((k) => typeof r[k] === "number" && Number.isFinite(r[k]) && r[k] >= 0) &&
      r.low <= r.expected &&
      r.expected <= r.high
    )
      return r;
  }
  return null;
}
function quantity(spec: ProjectSpec, basis: string): number | null {
  const { length: l, width: w, height: h, storeys } = spec;
  const area = l && w ? floorArea(l, w) : null;
  const perimeter = l && w ? (spec.category === "extension" ? 2 * l + w : 2 * (l + w)) : null;
  switch (basis) {
    case "count":
      return 1;
    case "length":
      return l;
    case "opening":
      return spec.openingArea;
    case "floor":
      return area === null ? null : area * (storeys ?? 1);
    case "roof":
      return spec.roof === "flat" ? area : null;
    case "walls":
      return spec.category === "garden_wall"
        ? l && h
          ? wallArea(l, h, spec.openingArea ?? 0)
          : null
        : perimeter && h && spec.openingArea !== null
          ? wallArea(perimeter, h, spec.openingArea) * (storeys ?? 1)
          : null;
    case "room_surfaces":
      return area !== null && perimeter && h && spec.openingArea !== null
        ? area + wallArea(perimeter, h, spec.openingArea)
        : null;
    case "foundation":
      return perimeter && spec.foundationWidth && spec.foundationDepth
        ? concreteVolume(perimeter, spec.foundationWidth, spec.foundationDepth)
        : null;
    default:
      return null;
  }
}
export function calculateEstimate(
  input: ProjectSpec,
  catalog: CatalogEntry[],
  settings: PricingSettings,
): EstimateResult {
  const spec = projectSchema.parse(input);
  const template = catalog.find(
    (r) => r.kind === "template" && r.id === `template_${spec.category}`,
  );
  const tasks = (template?.data["tasks"] ?? []) as Task[];
  const missing: string[] = [];
  const assumptions = [...spec.assumptions];
  const warnings: string[] = [];
  const lines: EstimateLine[] = [];
  const used = new Set<string>();
  if (!template || !tasks.length)
    missing.push("An approved project template is needed for this scope.");
  if (template?.data["approved"] !== true)
    missing.push("Project scope template needs team approval.");
  if (!spec.location) missing.push("Project location is needed to confirm regional pricing.");
  if (["extension", "loft", "knock_through", "garden_wall"].includes(spec.category))
    warnings.push(
      "Structural design, ground conditions and statutory approvals require qualified professional confirmation; photographs are not proof of dimensions or structural adequacy.",
    );
  for (const task of tasks) {
    if (used.has(task.id)) throw new Error(`Duplicate task: ${task.id}`);
    used.add(task.id);
    if (task.condition) {
      const value = spec[task.condition as keyof ProjectSpec];
      if (value === false) continue;
      if (value !== true) {
        missing.push(`${task.name}: confirm whether required.`);
        continue;
      }
    }
    const q = quantity(spec, task.basis);
    if (q === null) {
      missing.push(`${task.name}: confirmed measurements/specification needed (${task.basis}).`);
      continue;
    }
    if (q === 0) continue;
    for (const category of ["labour", "materials", "other"] as const) {
      const id =
        category === "labour"
          ? task.trade
          : category === "materials"
            ? task.material
            : task.expense;
      if (!id) continue;
      const record = catalog.find((r) => r.id === id);
      if (!record) {
        missing.push(`${task.name}: missing ${category} record.`);
        continue;
      }
      const d = record.data;
      let rates = readRange(d, "pricePence");
      if (!rates) {
        missing.push(`${task.name}: ${record.name} price needs an approved rate or allowance.`);
        continue;
      }
      if (d["approved"] !== true) {
        missing.push(`${task.name}: ${record.name} is not approved for estimating.`);
        continue;
      }
      if (category !== "labour" && !d["source"]) {
        missing.push(`${record.name}: price source is required.`);
        continue;
      }
      if (!d["vatTreatment"] || d["vatTreatment"] === "unknown") {
        missing.push(`${record.name}: purchase VAT treatment needs confirmation.`);
        continue;
      }
      if (!["net", "not_applicable", "inclusive_nonrecoverable", "inclusive_recoverable"].includes(String(d["vatTreatment"]))) {
        missing.push(`${record.name}: invalid purchase VAT treatment.`);
        continue;
      }
      if (d["vatTreatment"] === "inclusive_recoverable" && settings.vat_registered !== true) {
        missing.push(`${record.name}: recoverable VAT requires registered status.`);
        continue;
      }
      if (d["vatTreatment"] === "inclusive_recoverable") {
        const tax = numeric(d, "purchaseVatPercent", -1);
        if (tax < 0 || tax > 20) {
          missing.push(`${record.name}: confirm purchase VAT rate.`);
          continue;
        }
        const grossRates = rates;
        rates = Object.fromEntries(
          keys.map((k) => [k, multiplyMoney(grossRates[k], 1 / (1 + tax / 100))]),
        ) as Range;
      }
      let qty = range(category === "other" && d["unit"] === "job" ? 1 : q);
      let days: Range | undefined;
      const workers = task.workers ?? 1;
      if (!Number.isInteger(workers) || workers < 1 || workers > 100) {
        missing.push(`${task.name}: worker count must be a positive whole number.`);
        continue;
      }
      if (category === "labour") {
        const productivity = catalog.find((r) => r.id === task.productivity);
        const output = productivity ? readRange(productivity.data, "unitsPerPersonDay") : null;
        if (!output || output.low <= 0 || productivity?.data["approved"] !== true) {
          missing.push(`${task.name}: approved person-day productivity is required.`);
          continue;
        }
        const prep = numeric(productivity.data, "setupPersonDays");
        const min = numeric(productivity.data, "minimumPersonDays");
        if (prep < 0 || min < 0) {
          missing.push(`${task.name}: setup and attendance cannot be negative.`);
          continue;
        }
        qty = {
          low: Math.max(min, q / output.high + prep),
          expected: Math.max(min, q / output.expected + prep),
          high: Math.max(min, q / output.low + prep),
        };
        days = {
          low: qty.low / workers,
          expected: qty.expected / workers,
          high: qty.high / workers,
        };
      } else if (category === "materials") {
        const waste = numeric(d, "wastagePercent");
        if (waste < 0 || waste > 100) {
          missing.push(`${record.name}: confirm a valid wastage allowance.`);
          continue;
        }
        const coverage = numeric(d, "coverage", 1);
        if (coverage <= 0) {
          missing.push(`${record.name}: product coverage must be positive.`);
          continue;
        }
        const factor = readRange(d, "quantityFactor") ?? range(1);
        qty = Object.fromEntries(
          keys.map((k) => [k, (q * factor[k] * (1 + waste / 100)) / coverage]),
        ) as Range;
        if (d["roundWhole"] === true)
          qty = Object.fromEntries(keys.map((k) => [k, Math.ceil(qty[k])])) as Range;
        assumptions.push(
          `${record.name}: ${waste}% wastage; ${coverage} ${task.basis} per ${String(d["unit"] ?? "unit")}.`,
        );
      }
      const minimum = numeric(d, "minimumPence");
      const delivery = numeric(d, "deliveryPence");
      const costs = Object.fromEntries(
        keys.map((k) => [k, Math.max(minimum, multiplyMoney(rates[k], qty[k])) + delivery]),
      ) as Range;
      lines.push({
        id: `${task.id}_${category}`,
        name: `${task.name} — ${record.name}`,
        category,
        quantity: qty,
        unit: category === "labour" ? "person-days" : String(d["unit"] ?? task.basis),
        rates,
        cost: costs,
        source: `${record.id} · ${String(d["source"] ?? "Owner-provided planning rate")} · ${record.updated_at}`,
        verified: d["verified"] === true,
        ...(category === "labour" && days ? { workers, days } : {}),
      });
    }
  }
  const base = Object.fromEntries(
    keys.map((k) => [k, lines.reduce((sum, line) => sum + line.cost[k], 0)]),
  ) as Range;
  const vatRate =
    settings.tax_confirmed && settings.vat_registered !== null
      ? settings.vat_registered
        ? settings.sales_vat_percent
        : 0
      : null;
  if (vatRate === null)
    missing.push("Business VAT registration and project tax treatment need team confirmation.");
  const amounts = keys.map((k) => totals(base[k], settings.markup_percent, vatRate));
  const markup = Object.fromEntries(keys.map((k, i) => [k, amounts[i]?.markup ?? 0])) as Range;
  const allComplete = missing.length === 0;
  const subtotal = allComplete
    ? (Object.fromEntries(keys.map((k, i) => [k, amounts[i]?.subtotal ?? 0])) as Range)
    : null;
  const vat =
    allComplete && vatRate !== null
      ? (Object.fromEntries(keys.map((k, i) => [k, amounts[i]?.vat ?? 0])) as Range)
      : null;
  const total = allComplete
    ? (Object.fromEntries(keys.map((k, i) => [k, amounts[i]?.total ?? 0])) as Range)
    : null;
  const benchmark = catalog.find(
    (r) =>
      r.kind === "benchmark" &&
      r.data["category"] === spec.category &&
      r.data["approved"] === true &&
      r.data["source"] &&
      r.data["sourceDate"],
  );
  const benchmarkRange = benchmark ? readRange(benchmark.data, "pricePence") : null;
  if (total && benchmarkRange) {
    const unitQ = benchmark?.data["unit"] === "m²" ? quantity(spec, "floor") : 1;
    if (
      unitQ &&
      (total.expected < benchmarkRange.low * unitQ || total.expected > benchmarkRange.high * unitQ)
    )
      warnings.push(
        "Outside the sourced market benchmark; review scope for omissions. No price has been increased to match market averages.",
      );
  }
  return {
    specification: spec,
    lines,
    missing: [...new Set(missing)],
    assumptions: [...new Set(assumptions)],
    exclusions: spec.exclusions,
    warnings,
    base,
    markup,
    vat,
    total,
    subtotal,
    markupPercent: settings.markup_percent,
    confidence:
      missing.length || warnings.length
        ? "Lower"
        : lines.every((l) => l.verified) && !assumptions.length
          ? "Higher"
          : "Moderate",
    status: allComplete ? "estimated" : "review_required",
  };
}
