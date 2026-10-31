import type { ProjectSpec, Task } from "./types";

export function minimumInputs(spec: ProjectSpec): string[] {
  if (spec.category !== "extension") return [];
  const missing: string[] = [];
  if (!spec.extensionType && !/\b(rear|side|wraparound)\b/i.test(spec.description))
    missing.push("extensionType");
  if (!(spec.length && spec.width) && !spec.approximateArea) missing.push("size");
  if (!spec.storeys) missing.push("storeys");
  if (!spec.location?.trim()) missing.push("location");
  return missing;
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
  // No geocoding guesses: unknown areas require an approved matching regional record.
  return Boolean(region && (location.toLowerCase() === region.toLowerCase() ||
    (/kent|south east/i.test(region) && /\b(kent|maidstone|allington|medway|ashford|canterbury|dartford|gravesend|sevenoaks|tonbridge|tunbridge wells|south east)\b/i.test(location))));
}