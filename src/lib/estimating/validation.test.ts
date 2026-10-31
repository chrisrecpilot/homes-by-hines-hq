import { describe, expect, it } from "vitest";
import { calculateEstimate } from "./calculate";
import { headlineRange, projectSchema, type CatalogEntry } from "./types";

const settings = { markup_percent: 12, vat_registered: null, sales_vat_percent: 20, tax_confirmed: false };
const input = projectSchema.parse({ category: "extension", extensionType: "rear", location: "Maidstone", length: 6, width: 6, storeys: 1, height: 2.4, openingArea: 4, foundationDepth: 1, foundationWidth: 0.6, roof: null, bifolds: false, underfloorHeating: null, structuralOpening: null, description: "Single storey rear extension", assumptions: [], exclusions: [] });
const benchmark: CatalogEntry = { id: "benchmark_extension", kind: "benchmark", name: "Kent benchmark", updated_at: "2026-10-31", data: { category: "extension", approved: true, region: "Kent & South East England", specLevel: "Standard single-storey extension", unit: "m²", pricePence: { low: 180000, expected: 215000, high: 250000 }, source: "Approved test benchmark", sourceDate: "2026-10-31", vatBasis: "exclusive", marginIncluded: true } };
describe("Responsible whole-project pricing", () => {
  it("returns needs_input and no money for a rear-extension starter", () => {
    const result = calculateEstimate({ ...input, length: null, width: null, location: null, storeys: null }, [benchmark], settings);
    expect(result.status).toBe("needs_input");
    expect(result.missingInputs).toEqual(["size", "storeys", "location"]);
    expect(result.total).toBeNull();
    expect(headlineRange(result)).toBeNull();
    expect(result.lines).toEqual([]);
  });
  it("requires extension type when it is not supplied", () => {
    expect(calculateEstimate({ ...input, extensionType: null, description: "An extension" }, [benchmark], settings).missingInputs).toContain("extensionType");
  });
  it("prices 36m² using approved £1,800–£2,500/m² without adding 12%", () => {
    const result = calculateEstimate(input, [benchmark], settings);
    expect(result.status).toBe("indicative_estimate");
    expect(headlineRange(result)).toEqual({ low: 6480000, expected: 7740000, high: 9000000 });
    expect(result.benchmarkEstimate?.quantity).toBe(36);
    expect(result.benchmarkEstimate?.vatBasis).toBe("exclusive");
    expect(result.markup.expected).toBe(0);
  });
  it("supports explicitly supplied 36m² without inventing length and width", () => {
    const result = calculateEstimate({ ...input, length: null, width: null, approximateArea: 36 }, [benchmark], settings);
    expect(headlineRange(result)?.expected).toBe(7740000);
    expect(result.specification.length).toBeNull();
  });
  it("does not apply a single-storey Kent benchmark to two storeys or Manchester", () => {
    expect(headlineRange(calculateEstimate({ ...input, storeys: 2 }, [benchmark], settings))).toBeNull();
    expect(headlineRange(calculateEstimate({ ...input, location: "Manchester" }, [benchmark], settings))).toBeNull();
  });
  it("does not mistake a priced floor for all major construction phases", () => {
    const catalog: CatalogEntry[] = [
      { id: "template_extension", kind: "template", name: "Incomplete scope", updated_at: "2026-10-31", data: { approved: true, tasks: [{ id: "floor", name: "Ground floor", basis: "floor", expense: "floor_cost" }] } },
      { id: "floor_cost", kind: "expense", name: "Floor", updated_at: "2026-10-31", data: { approved: true, verified: true, unit: "job", pricePence: 1600000, source: "Test quote", vatTreatment: "net" } },
    ];
    const result = calculateEstimate(input, catalog, settings);
    expect(result.lines).toHaveLength(1);
    expect(result.base.expected).toBe(1600000);
    expect(result.total).toBeNull();
    expect(result.subtotal).toBeNull();
    expect(result.status).toBe("review_required");
    expect(result.scopeComplete).toBe(false);
    expect(headlineRange(calculateEstimate(input, [...catalog, benchmark], settings))?.expected).toBe(7740000);
  });
  it("retains French doors, underfloor heating and LVT without adding them to a benchmark", () => {
    const result = calculateEstimate({ ...input, doorType: "french", underfloorHeating: true, flooring: "lvt" }, [benchmark], settings);
    expect(result.specification.doorType).toBe("french");
    expect(result.specification.underfloorHeating).toBe(true);
    expect(result.specification.flooring).toBe("lvt");
    expect(headlineRange(result)?.expected).toBe(7740000);
  });
  it("recalculates 7×5m to £63,000–£87,500 and invalidates removed dimensions", () => {
    expect(headlineRange(calculateEstimate({ ...input, length: 7, width: 5 }, [benchmark], settings))).toEqual({ low: 6300000, expected: 7525000, high: 8750000 });
    expect(headlineRange(calculateEstimate({ ...input, length: null }, [benchmark], settings))).toBeNull();
  });
});