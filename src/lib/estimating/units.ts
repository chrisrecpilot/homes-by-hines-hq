/** Deterministic unit conversion; all stored measurements are metric. */
export type MeasureUnit = "m" | "ft" | "cm" | "mm";
export type AreaUnit = "m2" | "ft2";

const TO_M: Record<MeasureUnit, number> = { m: 1, ft: 0.3048, cm: 0.01, mm: 0.001 };
const FT2_TO_M2 = 0.09290304;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function toMetres(value: number | null, unit: MeasureUnit | null): number | null {
  if (value === null || !Number.isFinite(value) || value <= 0) return null;
  return round2(value * TO_M[unit ?? "m"]);
}

export function toSquareMetres(value: number | null, unit: AreaUnit | null): number | null {
  if (value === null || !Number.isFinite(value) || value <= 0) return null;
  return round2(unit === "ft2" ? value * FT2_TO_M2 : value);
}
