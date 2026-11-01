import { describe, expect, it } from "vitest";
import { applyProjectPatch, emptyProject, outstandingRefinements } from "./project-state";
import { readQuote, QUOTE_STORAGE_KEY } from "./quote-storage";
import { calculateEstimate } from "./calculate";
import { headlineRange, type CatalogEntry } from "./types";
import { benchmarkApplies, minimumInputs } from "./validation";
import { advanceFollowUp, type FollowUp } from "./follow-up";
import { replacementCategory } from "./project-intent";
const settings = { markup_percent: 12, vat_registered: null, sales_vat_percent: 20, tax_confirmed: false };
const extension = { ...emptyProject("extension", "Rear extension"), extensionType: "rear" as const, length: 6, width: 6, storeys: 1, roof: "flat" as const, doorType: "bifold" as const, location: "Maidstone" };
const benchmark: CatalogEntry = { id: "fixture-extension", kind: "benchmark", name: "Test only", updated_at: "2026-11-01", data: { category: "extension", approved: true, storeys: 1, region: "Kent & South East England", source: "Test fixture", sourceDate: "2026-11-01", vatBasis: "exclusive", unit: "m²", pricePence: { low: 180000, expected: 215000, high: 250000 }, marginIncluded: true } };
describe("Independent quotation rules", () => {
  it("starts a separate garden-room specification with no inherited extension data", () => {
    const garden = applyProjectPatch(extension, { category: "garden_room", description: "Separate garden room" });
    expect(garden.category).toBe("garden_room");
    expect([garden.length, garden.width, garden.storeys, garden.roof, garden.doorType, garden.extensionType, garden.location]).toEqual([null, null, null, null, null, null, null]);
  });
  it("garden rooms cannot price from extension records even at identical dimensions", () => {
    const garden = { ...emptyProject("garden_room", "Garden office"), gardenAttachment: "standalone" as const, intendedUse: "office" as const, length: 6, width: 6 };
    expect(benchmarkApplies(garden, benchmark.data)).toBe(false);
    expect(headlineRange(calculateEstimate(garden, [benchmark], settings))).toBeNull();
  });
  it("attached garden rooms stay garden rooms until explicitly recategorised", () => {
    const spec = applyProjectPatch(emptyProject("garden_room", "Garden room"), { gardenAttachment: "attached" });
    expect(spec.category).toBe("garden_room");
    expect(minimumInputs(spec)).toEqual(["size", "intendedUse"]);
  });
  it("retains the £64,800–£90,000 baseline without inventing a pitched-roof uplift", () => {
    const pitched = calculateEstimate(applyProjectPatch(extension, { roof: "pitched" }), [benchmark], settings);
    expect(headlineRange(pitched)).toMatchObject({ low: 6480000, high: 9000000 });
    expect(pitched.customerNotes?.join(" ")).toContain("still need confirmation");
  });
  it("completed roof and doors are not outstanding refinement tasks", () => {
    expect(outstandingRefinements(extension)).toEqual(["finishes", "photos"]);
  });
  it("new tab storage never inherits legacy localStorage quotes", () => {
    const requested: string[] = [];
    expect(readQuote({ getItem: (key) => { requested.push(key); return null; } })).toBeNull();
    expect(requested).toEqual([QUOTE_STORAGE_KEY]);
  });
  it("refresh reads the exact active-tab identity and transcript", () => {
    const quote = { id: "12345678-1234-1234-1234-123456789abc", token: "87654321-1234-1234-1234-123456789abc", messages: [{ id: "message", role: "user", parts: [{ type: "text", text: "Rear extension" }] }] };
    expect(readQuote({ getItem: () => JSON.stringify(quote) })).toEqual(quote);
  });
  it("broken browser storage does not restore any previous customer", () => {
    expect(readQuote({ getItem: () => { throw new Error("Blocked"); } })).toBeNull();
  });
});
describe("Phone-first conversion", () => {
  const start: FollowUp = { request: "callback", step: "name", name: "", phone: "", email: null, address: null, preference: null };
  it("asks name then required phone then optional email before a callback is ready", () => {
    const name = advanceFollowUp(start, "Homeowner");
    expect(name.flow.step).toBe("phone");
    const phone = advanceFollowUp(name.flow, "07700900987");
    expect(phone.flow.step).toBe("email");
    const email = advanceFollowUp(phone.flow, "No thanks");
    expect(email.flow.step).toBe("ready");
    expect(email.flow.email).toBeNull();
  });
  it("rejects missing or invalid phone rather than accepting a lead", () => {
    const result = advanceFollowUp({ ...start, step: "phone", name: "Homeowner" }, "123");
    expect(result.error).toBe(true);
    expect(result.flow.step).toBe("phone");
  });
  it("visit requests require an address then collect preferences, not a confirmed booking", () => {
    const result = advanceFollowUp({ ...start, request: "site_visit", step: "email", name: "Homeowner", phone: "07700900987" }, "No thanks");
    expect(result.flow.step).toBe("address");
    const address = advanceFollowUp(result.flow, "ME16 0PP");
    expect(address.flow.step).toBe("preference");
    expect(advanceFollowUp(address.flow, "Tuesday morning").flow).toMatchObject({ step: "ready", address: "ME16 0PP", preference: "Tuesday morning", request: "site_visit" });
  });
  it("explicitly recognises separate garden-room intent without treating roof changes as a new quote", () => {
    expect(replacementCategory("Actually, I want a separate garden room instead.", "extension")).toBe("garden_room");
    expect(replacementCategory("Actually, change the extension roof to pitched", "extension")).toBeNull();
  });
});