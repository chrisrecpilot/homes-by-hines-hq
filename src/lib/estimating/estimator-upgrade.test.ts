import { describe, expect, it } from "vitest";
import { applyProjectPatch, emptyProject } from "./project-state";
import { buildPatch, type UpdateProjectInput } from "./update-project";
import { calculateEstimate } from "./calculate";
import { enquirySchema } from "./enquiry";
import { headlineRange, type CatalogEntry } from "./types";

const settings = { markup_percent: 12, vat_registered: null, sales_vat_percent: 20, tax_confirmed: false };
const blank: UpdateProjectInput = {
  category: null, summary: null, extensionType: null, renovationScope: null, specificationLevel: null, roomSize: null,
  loftType: null, workType: null, finish: null, length: null, width: null, lengthUnit: null, area: null, areaUnit: null,
  storeys: null, roof: null, doorType: null, wallFinish: null, flooring: null, underfloorHeating: null,
  structuralOpening: null, rooflights: null, location: null, clearFields: [],
};

describe("multi-detail updates", () => {
  it("applies 5m × 4m, flat roof, bifolds, underfloor heating and Maidstone in one patch", () => {
    const base = emptyProject("extension", "Rear extension");
    const spec = applyProjectPatch(base, buildPatch({ ...blank, category: "extension", length: 5, width: 4, lengthUnit: "m", roof: "flat", doorType: "bifold", underfloorHeating: true, location: "Maidstone" }));
    expect([spec.length, spec.width, spec.roof, spec.doorType, spec.bifolds, spec.underfloorHeating, spec.location]).toEqual([5, 4, "flat", "bifold", true, true, "Maidstone"]);
  });
  it("revision to 6m wide and French doors keeps roof, length and location", () => {
    const first = applyProjectPatch(emptyProject("extension", "Rear extension"), buildPatch({ ...blank, length: 5, width: 4, lengthUnit: "m", roof: "flat", doorType: "bifold", location: "Maidstone" }));
    const revised = applyProjectPatch(first, buildPatch({ ...blank, width: 6, lengthUnit: "m", doorType: "french" }));
    expect([revised.length, revised.width, revised.doorType, revised.bifolds, revised.roof, revised.location]).toEqual([5, 6, "french", false, "flat", "Maidstone"]);
  });
  it("converts feet and square feet to metric", () => {
    expect(buildPatch({ ...blank, length: 15, width: 12, lengthUnit: "ft" })).toMatchObject({ length: 4.57, width: 3.66 });
    expect(buildPatch({ ...blank, area: 200, areaUnit: "ft2" })).toMatchObject({ approximateArea: 18.58 });
  });
  it("cannot carry pricing or markup fields", () => {
    const patch = buildPatch({ ...blank, markup_percent: 0, pricePence: 1 } as never);
    expect(patch).toEqual({});
  });
});

const kitchenReplacement: CatalogEntry = { id: "benchmark_kitchen_replacement", kind: "benchmark", name: "New fitted kitchen", updated_at: "2026-10-31",
  data: { approved: true, category: "kitchen", renovationScope: "replacement", unit: "job", region: "Kent & South East England", vatBasis: "exclusive", marginIncluded: true, sourceDate: "2026-10-31", source: "Checkatrade 2026", pricePence: { low: 620000, expected: 1150000, high: 1680000 }, inclusions: ["Units"], exclusions: ["Structural"] } };
const bathroomFull: CatalogEntry = { id: "benchmark_bathroom_full", kind: "benchmark", name: "Bathroom full", updated_at: "2026-10-31",
  data: { approved: true, category: "bathroom", renovationScope: "full", unit: "job", region: "Kent & South East England", vatBasis: "exclusive", marginIncluded: true, sourceDate: "2026-10-31", source: "Checkatrade 2026", pricePence: { low: 750000, expected: 1100000, high: 1500000 }, inclusions: ["Strip out"], exclusions: ["Structural"] } };

describe("kitchen and bathroom market guidance", () => {
  it("new fitted kitchen + average room prices £6,200–£16,800", () => {
    const est = calculateEstimate({ ...emptyProject("kitchen", "Kitchen"), renovationScope: "replacement", roomSize: "standard" }, [kitchenReplacement, bathroomFull], settings);
    expect(est.status).toBe("indicative_estimate");
    expect(headlineRange(est)).toEqual({ low: 620000, expected: 1150000, high: 1680000 });
  });
  it("complete bathroom refurbishment + compact room prices £7,500–£15,000", () => {
    const est = calculateEstimate({ ...emptyProject("bathroom", "Bathroom"), renovationScope: "full", roomSize: "small" }, [kitchenReplacement, bathroomFull], settings);
    expect(headlineRange(est)).toEqual({ low: 750000, expected: 1100000, high: 1500000 });
  });
  it("a kitchen refresh does not borrow the replacement benchmark", () => {
    const est = calculateEstimate({ ...emptyProject("kitchen", "Kitchen"), renovationScope: "refresh", roomSize: "standard" }, [kitchenReplacement], settings);
    expect(headlineRange(est)).toBeNull();
  });
});

describe("phone-first enquiries", () => {
  const valid = { name: "Sam", phone: "07700 900123", email: null, enquiry_type: "renovation", request: "site_visit", message: "Rear extension" };
  it("accepts a phone number without an email", () => expect(enquirySchema.safeParse(valid).success).toBe(true));
  it("rejects a missing or too-short phone number", () => {
    expect(enquirySchema.safeParse({ ...valid, phone: "" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
  });
  it("rejects an invalid optional email", () => expect(enquirySchema.safeParse({ ...valid, email: "nope" }).success).toBe(false));
});
