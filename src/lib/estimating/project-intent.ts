import type { ProjectSpec } from "./types";
export function replacementCategory(text: string, current: ProjectSpec["category"] | undefined): ProjectSpec["category"] | null {
  if (!current || !/\b(actually|instead|new project|another project|change my project|want a separate)\b/i.test(text)) return null;
  const matches: [RegExp, ProjectSpec["category"]][] = [[/garden\s+(room|office|studio|gym)/i, "garden_room"], [/\bextension\b/i, "extension"], [/\bkitchen\b/i, "kitchen"], [/\bbathroom\b/i, "bathroom"], [/\bloft\b/i, "loft"], [/\blandscaping\b/i, "landscaping"]];
  return matches.find(([pattern, category]) => pattern.test(text) && category !== current)?.[1] ?? null;
}