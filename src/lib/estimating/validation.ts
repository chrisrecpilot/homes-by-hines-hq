import type { ProjectSpec, Task } from "./types";

export function minimumInputs(spec: ProjectSpec): string[] {
  if (spec.category !== "extension") return [];
  const missing: string[] = [];
  if (!spec.extensionType && !/\b(rear|side|wraparound)\b/i.test(spec.description))
    missing.push("extensionType");
  if (!(spec.length && spec.width) && !spec.approximateArea) missing.push("size");
  if (!spec.storeys) missing.push("storeys");
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
  if (postcode) return `${postcode[1]!.toUpperCase()} ${postcode[2]!.toUpperCase()}`;
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
  if (spec.category !== "extension") return true;
  const supportedStoreys = data["storeys"] ?? (/single.storey/i.test(String(data["specLevel"])) ? 1 : null);
  if (spec.storeys !== supportedStoreys) return false;
  const location = spec.location?.trim() ?? "";
  const region = String(data["region"] ?? "");
  // No location yet: an approved Kent/South East record applies provisionally.
  if (!location) return /kent|south east/i.test(region);
  // No geocoding guesses: unknown areas require an approved matching regional record.
  return Boolean(region && (location.toLowerCase() === region.toLowerCase() ||
    (/kent|south east/i.test(region) && /\b(kent|maidstone|allington|medway|ashford|canterbury|dartford|gravesend|sevenoaks|tonbridge|tunbridge wells|south east)\b/i.test(location))));
}