import { describe, expect, it } from "vitest";
import { toMetres, toSquareMetres } from "./units";

describe("unit conversion", () => {
  it("converts 15ft × 12ft to metres", () => {
    expect(toMetres(15, "ft")).toBe(4.57);
    expect(toMetres(12, "ft")).toBe(3.66);
  });
  it("converts 200 square feet to 18.58 m²", () => {
    expect(toSquareMetres(200, "ft2")).toBe(18.58);
  });
  it("keeps metric values and treats zero/unknown as null", () => {
    expect(toMetres(6, "m")).toBe(6);
    expect(toSquareMetres(20, "m2")).toBe(20);
    expect(toMetres(0, "m")).toBeNull();
    expect(toMetres(null, "ft")).toBeNull();
  });
});
