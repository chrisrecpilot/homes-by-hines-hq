import { describe, expect, it } from "vitest";
import { applyProjectPatch, choicePatch, emptyProject, customerEstimate } from "./project-state";
import { minimumInputs, benchmarkApplies } from "./validation";
import { calculateEstimate } from "./calculate";
import { headlineRange, type CatalogEntry } from "./types";
const settings = { markup_percent: 12, vat_registered: null, sales_vat_percent: 20, tax_confirmed: false };
describe("Category minimum information", () => {
  it("requires kitchen scope for a 36m² kitchen, and finish only when an approved benchmark requires it", () => {
    const spec = { ...emptyProject("kitchen", "Renovate my kitchen"), length: 6, width: 6 };
    expect(minimumInputs(spec)).toEqual(["renovationScope"]);
    const scopedBenchmark: CatalogEntry = { id: "fixture", kind: "benchmark", name: "Fixture", updated_at: "2026-10-31", data: { approved: true, category: "kitchen", specificationLevel: "standard" } };
    expect(minimumInputs(spec, [scopedBenchmark])).toEqual(["renovationScope", "specificationLevel"]);
    expect(headlineRange(calculateEstimate(spec, [], settings))).toBeNull();
  });
  it("bathrooms need only scope and size (scope implies layout changes)", () => {
    expect(minimumInputs({ ...emptyProject("bathroom", "Full refurbishment"), renovationScope: "full" })).toEqual(["size"]);
    expect(minimumInputs({ ...emptyProject("bathroom", "Full refurbishment"), renovationScope: "full", roomSize: "standard" })).toEqual([]);
  });
  it("requires loft conversion type, area and roof information", () => {
    expect(minimumInputs(emptyProject("loft", "Loft conversion"))).toEqual(["loftType", "size", "existingRoof"]);
  });
  it("requires landscaping scope, area/length and finish", () => {
    expect(minimumInputs(emptyProject("garden_wall", "Garden project"))).toEqual(["workType", "size", "finish"]);
  });
});
describe("Scoped benchmarks", () => {
  const spec = { ...emptyProject("kitchen", "New kitchen"), renovationScope: "replacement" as const, specificationLevel: "standard" as const, length: 6, width: 6, location: "Maidstone" };
  const data = { category: "kitchen", renovationScope: "replacement", specificationLevel: "standard", region: "Kent & South East England", unit: "job", inclusions: ["Cabinets and worktops"], exclusions: ["Appliances"], minArea: 20, maxArea: 40 };
  it("rejects a generic kitchen per-m² benchmark", () => expect(benchmarkApplies(spec, { ...data, unit: "m²" })).toBe(false));
  it("rejects mismatched scope, size and region", () => {
    expect(benchmarkApplies(spec, { ...data, renovationScope: "refresh" })).toBe(false);
    expect(benchmarkApplies(spec, { ...data, maxArea: 30 })).toBe(false);
    expect(benchmarkApplies({ ...spec, location: "Manchester" }, data)).toBe(false);
  });
  it("uses an approved whole-job kitchen fixture once, without multiplying by 36 or adding markup", () => {
    const benchmark: CatalogEntry = { id: "test_kitchen", kind: "benchmark", name: "Test only", updated_at: "2026-10-31", data: { ...data, approved: true, pricePence: { low: 1000000, expected: 1200000, high: 1400000 }, source: "Test fixture, not live pricing", sourceDate: "2026-10-31", vatBasis: "exclusive", marginIncluded: true } };
    const estimate = calculateEstimate(spec, [benchmark], settings);
    expect(headlineRange(estimate)).toEqual({ low: 1000000, expected: 1200000, high: 1400000 });
    expect(estimate.benchmarkEstimate?.quantity).toBe(1);
    expect(estimate.markup.expected).toBe(0);
  });
  it("returns review without fabricated money when no approved kitchen data exists", () => {
    const estimate = calculateEstimate(spec, [], settings);
    expect(estimate.status).toBe("review_required");
    expect(headlineRange(estimate)).toBeNull();
  });
});
describe("Structured state safeguards", () => {
  it("replaces flat with pitched and preserves dimensions and location", () => {
    const spec = { ...emptyProject("extension", "Rear extension"), length: 6, width: 6, location: "Maidstone" };
    const flat = applyProjectPatch(spec, choicePatch("roof", "flat") ?? {});
    const pitched = applyProjectPatch(flat, choicePatch("roof", "pitched") ?? {});
    expect(pitched.roof).toBe("pitched");
    expect(pitched.length).toBe(6);
    expect(pitched.location).toBe("Maidstone");
  });
  it("does not retain a superseded explicit area after changing dimensions", () => {
    const spec = { ...emptyProject("extension", "Rear extension"), approximateArea: 36 };
    expect(applyProjectPatch(spec, { length: 7, width: 5 }).approximateArea).toBeNull();
  });
  it("rejects unknown fields and invalid selections", () => {
    expect(() => applyProjectPatch(emptyProject("extension", "Rear extension"), { unknown: 100 } as never)).toThrow();
    expect(choicePatch("roof", "invented")).toBeNull();
  });
  it("strips internal diagnostics and incomplete costs before returning customer data", () => {
    const internal = calculateEstimate({ ...emptyProject("extension", "Rear extension"), extensionType: "rear", length: 6, width: 6, storeys: 1 }, [], settings);
    expect(internal.missing.length).toBeGreaterThan(0);
    expect(customerEstimate(internal).missing).toEqual([]);
    expect(customerEstimate(internal).lines).toEqual([]);
    expect(headlineRange(customerEstimate(internal))).toBeNull();
  });
});