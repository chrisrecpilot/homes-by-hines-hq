import type { ProjectSpec, Task } from "./types";

export function minimumInputs(spec: ProjectSpec): string[] {
  const missing: string[] = [];
  const size = Boolean((spec.length && spec.width) || spec.approximateArea);
  const policies: Record<ProjectSpec["category"], () => void> = {
    extension: () => {
      if (!spec.extensionType && !/\b(rear|side|wraparound)\b/i.test(spec.description)) missing.push("extensionType");
      if (!size) missing.push("size");
      if (!spec.storeys) missing.push("storeys");
    },
    kitchen: () => {
      if (!spec.renovationScope) missing.push("renovationScope");
      if (!size && !spec.roomSize) missing.push("size");
      if (!spec.specificationLevel) missing.push("specificationLevel");
    },
    bathroom: () => {
      if (!spec.renovationScope) missing.push("renovationScope");
      if (!size && !spec.roomSize) missing.push("size");
      if (spec.layoutRetained === null) missing.push("layoutRetained");
      if (spec.fittingsRetained === null) missing.push("fittingsRetained");
    },
    loft: () => {
      if (!spec.loftType) missing.push("loftType");
      if (!size) missing.push("size");
      if (!spec.existingRoof) missing.push("existingRoof");
    },
    garden_wall: () => {
      if (!spec.workType) missing.push("workType");
      if (!spec.length && !spec.approximateArea) missing.push("size");
      if (!spec.finish) missing.push("finish");
    },
    plastering: () => { if (!size) missing.push("size"); },
    knock_through: () => { if (!spec.openingArea && !spec.length) missing.push("openingSize"); },
    repair: () => { if (spec.description.trim().length < 8) missing.push("description"); },
    general: () => { if (!spec.workType) missing.push("workType"); },
  };
  policies[spec.category]();
  // Location is intentionally not required: an approved Kent/South East regional
  // benchmark is used provisionally until the customer confirms where they are.
  return missing;
}

const UK_POSTCODE = /^([A-Za-z]{1,2}\d[A-Za-z\d]?)\s*(\d[A-Za-z]{2})$/;
/** Normalises UK postcodes (ME160PP → ME16 0PP) and strips "near …" hedging. */
export function normalizeLocation(location: string | null): string | null {
  if (!location) return null;
  const trimmed = location.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  const postcode = trimmed.match(UK_POSTCODE);
  if (postcode?.[1] && postcode[2]) return `${postcode[1].toUpperCase()} ${postcode[2].toUpperCase()}`;
  const near = trimmed.match(/^near\s+(.+)$/i);
  return (near?.[1] ?? trimmed).slice(0, 150);
}

export const EXTENSION_PHASES = ["groundworks", "foundations", "floor", "walls", "roof", "glazing", "services", "finishes", "waste"];
export function taskPhase(task: Task): string | null {
  if (task.phase) return task.phase;
  const id = `${task.id} ${task.name}`.toLowerCase();
  if (/excavation|groundworks|site preparation/.test(id)) return "groundworks";
  if (/foundation/.test(id)) return "foundations";
  if (/flooring|floor finishes|plaster|painting|decoration/.test(id)) return "finishes";
  if (/ground floor|\bfloor\b|_floor$/.test(id)) return "floor";
  if (/masonry|structural walls/.test(id)) return "walls";
  if (/roof/.test(id)) return "roof";
  if (/glazing|windows and doors/.test(id)) return "glazing";
  if (/plumbing|electrical|drainage|heating/.test(id)) return "services";
  if (/waste|completion/.test(id)) return "waste";
  return null;
}

export function benchmarkApplies(spec: ProjectSpec, data: Record<string, unknown>): boolean {
  if (spec.category === "kitchen" || spec.category === "bathroom") {
    if (!data["region"] || !Array.isArray(data["inclusions"]) || !data["inclusions"].length || !Array.isArray(data["exclusions"])) return false;
    if (data["renovationScope"] !== spec.renovationScope) return false;
    if (data["specificationLevel"] && data["specificationLevel"] !== spec.specificationLevel) return false;
    if (data["roomSize"] && data["roomSize"] !== spec.roomSize) return false;
    if (typeof data["layoutRetained"] === "boolean" && data["layoutRetained"] !== spec.layoutRetained) return false;
    if (typeof data["fittingsRetained"] === "boolean" && data["fittingsRetained"] !== spec.fittingsRetained) return false;
    const area = spec.length && spec.width ? spec.length * spec.width : spec.approximateArea;
    if (typeof data["minArea"] === "number" && (!area || area < data["minArea"])) return false;
    if (typeof data["maxArea"] === "number" && (!area || area > data["maxArea"])) return false;
    // A kitchen benchmark is a scoped whole-job allowance, not cabinets/appliances per m².
    if (spec.category === "kitchen" && data["unit"] !== "job") return false;
  } else if (spec.category !== "extension") {
    if (!data["region"]) return false;
    if (spec.category === "loft" && data["loftType"] !== spec.loftType) return false;
    if (spec.category === "garden_wall" && (data["workType"] !== spec.workType || data["finish"] !== spec.finish)) return false;
  }
  const supportedStoreys = data["storeys"] ?? (/single.storey/i.test(String(data["specLevel"])) ? 1 : null);
  if (spec.category === "extension" && spec.storeys !== supportedStoreys) return false;
  const location = spec.location?.trim() ?? "";
  const region = String(data["region"] ?? "");
  // No location yet: an approved Kent/South East record applies provisionally.
  if (!location) return /kent|south east/i.test(region);
  // No geocoding guesses: unknown areas require an approved matching regional record.
  return Boolean(region && (location.toLowerCase() === region.toLowerCase() ||
    (/kent|south east/i.test(region) && /\b(kent|maidstone|allington|medway|ashford|canterbury|dartford|gravesend|sevenoaks|tonbridge|tunbridge wells|south east)\b/i.test(location))));
}