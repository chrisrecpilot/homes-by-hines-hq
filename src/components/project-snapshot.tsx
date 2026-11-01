import { useState } from "react";
import { Pencil, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectSpec } from "@/lib/estimating/types";

export function ProjectSnapshot({ specification: s, busy, onEdit }: { specification: ProjectSpec; busy: boolean; onEdit: (text: string) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const category = s.workType?.toLowerCase().includes("garden room") ? "Garden room" : s.category === "extension" ? `${s.extensionType ?? "House"} extension` : s.category.replaceAll("_", " ");
  const fields = [
    ["Project", category],
    ["Size", s.length && s.width ? `${s.length}m × ${s.width}m` : s.approximateArea ? `${s.approximateArea}m²` : s.roomSize],
    ["Storeys", s.storeys ? s.storeys === 1 ? "Single storey" : `${s.storeys} storeys` : null],
    ["Roof", s.roof], ["Doors", s.doorType], ["Location", s.location],
    ["Walls", s.wallFinish], ["Flooring", s.flooring], ["Specification", s.specificationLevel],
    ["Attachment", s.gardenAttachment], ["Use", s.intendedUse],
  ].filter(([, v]) => v);
  return <details className="project-snapshot group shrink-0 border-b border-border/70">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-xs [&::-webkit-details-marker]:hidden">
      <span className="font-medium">Your project <span className="ml-2 font-normal capitalize text-muted-foreground">{category}{s.length && s.width ? ` · ${s.length * s.width}m²` : ""}</span></span>
      <ChevronDown className="size-3.5 shrink-0 transition-transform group-open:rotate-180" />
    </summary>
    <div className="flex flex-wrap gap-x-5 gap-y-2 pb-3">
      {fields.map(([label, content]) => <Button key={label} variant="ghost" size="sm" disabled={busy} title={`Change ${label?.toLowerCase()}`} className="h-auto gap-2 px-0 py-1 text-xs" onClick={() => { setEditing(label ?? null); setValue(content ?? ""); }}>
        <span className="text-muted-foreground">{label}</span><span className="capitalize">{content}</span><Pencil className="size-3 text-muted-foreground" />
      </Button>)}
      {!s.location && <Button variant="ghost" size="sm" disabled={busy} className="h-auto px-0 py-1 text-xs text-primary" onClick={() => { setEditing("Location"); setValue(""); }}>Add location</Button>}
    </div>
    {editing && <form className="mb-3 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (!value.trim() || busy) return; onEdit(`Change my ${editing.toLowerCase()} to ${value.trim()}. Keep all other project details unchanged.`); setEditing(null); }}>
      <input autoFocus aria-label={`Change ${editing.toLowerCase()}`} value={value} onChange={(e) => setValue(e.target.value)} maxLength={150} className="min-w-0 flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
      <Button type="submit" size="icon-sm" disabled={busy || !value.trim()} aria-label="Apply change"><Check /></Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Cancel change" onClick={() => setEditing(null)}><X /></Button>
    </form>}
  </details>;
}