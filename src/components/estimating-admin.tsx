import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EstimateCard } from "@/components/estimate-card";
import { getAdminUpload } from "@/lib/estimating/uploads.functions";
import {
  gbp,
  type CatalogEntry,
  type EstimateResult,
  type PricingSettings,
} from "@/lib/estimating/types";
import type { Json } from "@/integrations/supabase/types";

const kinds = [
  "labour",
  "material",
  "productivity",
  "template",
  "expense",
  "benchmark",
  "business",
  "reviews",
  "history",
] as const;
type Section = (typeof kinds)[number];
export function EstimatingAdmin() {
  const [section, setSection] = useState<Section>("labour");
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const catalog = useQuery({
    queryKey: ["estimating-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("estimating_catalog").select("*").order("name");
      if (error) throw error;
      return data as unknown as CatalogEntry[];
    },
  });
  const rows = (catalog.data ?? []).filter(
    (r) => r.kind === section && r.name.toLowerCase().includes(search.toLowerCase()),
  );
  function change(s: Section) {
    setSection(s);
    setSelected(null);
    setSearch("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border pb-5">
        {kinds.map((k) => (
          <Button
            key={k}
            size="sm"
            variant={section === k ? "default" : "outline"}
            onClick={() => change(k)}
            className="capitalize"
          >
            {k === "expense"
              ? "Equipment & specialist"
              : k === "business"
                ? "Business pricing"
                : k === "reviews"
                  ? "Estimates & actuals"
                  : k}
          </Button>
        ))}
      </div>
      {section === "benchmark" && <div className="mt-5 flex flex-wrap gap-3 border-b border-border pb-4 text-xs">
        {["extension", "kitchen", "bathroom", "loft", "garden_wall", "landscaping"].map((category) => {
          const approved = (catalog.data ?? []).filter((row) => row.kind === "benchmark" && row.data["category"] === category && row.data["approved"] === true);
          return <span key={category} className="capitalize">{category.replaceAll("_", " ")}: {approved.length ? `${approved.length} approved benchmark(s)` : "Needs sourced benchmark"}</span>;
        })}
      </div>}
      {catalog.error && (
        <p className="mt-4 text-destructive">Pricing could not load. {catalog.error.message}</p>
      )}
      {section === "business" ? (
        <BusinessSettings />
      ) : section === "reviews" ? (
        <Reviews />
      ) : section === "history" ? (
        <History />
      ) : (
        <>
          <div className="my-6 flex flex-wrap items-center justify-between gap-3">
            <input
              aria-label="Search pricing records"
              className="min-w-0 border border-input bg-background px-3 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records…"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelected({
                  id: `${section}_${crypto.randomUUID()}`,
                  kind: section,
                  name: "",
                  updated_at: new Date().toISOString(),
                  data:
                    section === "template"
                      ? { approved: false, tasks: [] }
                      : section === "productivity"
                        ? {
                            approved: false,
                            unitsPerPersonDay: null,
                            setupPersonDays: 0,
                            minimumPersonDays: 0,
                          }
                        : {
                            approved: false,
                            pricePence: null,
                            unit: "unit",
                            vatTreatment: "unknown",
                            source: null,
                          },
                })
              }
            >
              <Plus />
              Add record
            </Button>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Owner-provided day rates are provisional. Approve each work phase, productivity and
            sourced price before numeric estimates can be issued.
          </p>
          <div className="grid items-start gap-6 md:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]">
            <div className="max-h-[600px] overflow-auto border border-border">
              {rows.map((r) => (
                <Button
                  key={r.id}
                  variant="ghost"
                  className={`h-auto w-full justify-between whitespace-normal border-b border-border px-4 py-3 text-left ${selected?.id === r.id ? "bg-secondary" : ""}`}
                  onClick={() => setSelected(r)}
                >
                  <span>{r.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {typeof r.data["pricePence"] === "number"
                      ? gbp(r.data["pricePence"])
                      : r.data["approved"] === true
                        ? "Approved"
                        : "To confirm"}
                  </span>
                </Button>
              ))}
              {!rows.length && (
                <p className="p-5 text-sm text-muted-foreground">No records found.</p>
              )}
            </div>
            {selected ? (
              <CatalogEditor
                key={selected.id}
                row={selected}
                onSaved={() => {
                  setSelected(null);
                  void qc.invalidateQueries({ queryKey: ["estimating-catalog"] });
                }}
              />
            ) : (
              <p className="py-4 text-sm text-muted-foreground">
                Select a record to review its pricing and assumptions.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
function CatalogEditor({ row, onSaved }: { row: CatalogEntry; onSaved: () => void }) {
  const [name, setName] = useState(row.name);
  const [data, setData] = useState<Record<string, unknown>>(row.data);
  const [advanced, setAdvanced] = useState(JSON.stringify(row.data, null, 2));
  const [saving, setSaving] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const set = (k: string, v: unknown) => {
    setData((d) => ({ ...d, [k]: v }));
  };
  async function save() {
    try {
      setSaving(true);
      const value = advancedMode ? (JSON.parse(advanced) as Record<string, unknown>) : data;
      if (!name.trim()) throw new Error("A name is required.");
      if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error("Settings must be an object.");
      if (row.kind === "benchmark" && value["approved"] === true) {
        if (!String(value["source"] ?? "").trim() || !String(value["region"] ?? "").trim() || !/^\d{4}-\d{2}-\d{2}$/.test(String(value["sourceDate"] ?? ""))) throw new Error("Approved benchmarks require a source, region and source date.");
        if (!["job", "m²", "m"].includes(String(value["unit"])) || !["exclusive", "inclusive", "not_applicable"].includes(String(value["vatBasis"]))) throw new Error("Confirm the benchmark unit and VAT basis.");
        if (!Array.isArray(value["inclusions"]) || !value["inclusions"].length || !Array.isArray(value["exclusions"])) throw new Error("Document benchmark inclusions and exclusions before approving.");
        if (value["category"] === "kitchen" && value["unit"] !== "job") throw new Error("Kitchen benchmarks must be scoped whole-job budgets.");
      }
      if (row.kind === "template") {
        const tasks = value["tasks"] as { id: string; basis: string }[];
        if (!Array.isArray(tasks) || new Set(tasks.map((t) => t.id)).size !== tasks.length)
          throw new Error("Each task needs a unique ID.");
      }
      for (const k of ["pricePence", "minimumPence", "deliveryPence", "hourlyPence"]) {
        if (
          typeof value[k] === "number" &&
          (!Number.isSafeInteger(value[k]) || (value[k] as number) < 0)
        )
          throw new Error("Prices must be non-negative whole pennies.");
      }
      const { error } = await supabase.from("estimating_catalog").upsert({
        id: row.id,
        kind: row.kind,
        name: name.trim(),
        data: value as Json,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Pricing record saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }
  const input = (label: string, key: string, type = "text", scale = 1) => (
    <label className="block text-xs text-muted-foreground">
      {label}
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "any" : undefined}
        className="mt-1 block w-full border border-input bg-background px-3 py-2 text-sm text-foreground"
        value={
          typeof data[key] === "number"
            ? (data[key] as number) / scale
            : typeof data[key] === "string"
              ? String(data[key])
              : ""
        }
        onChange={(e) =>
          set(
            key,
            type === "number"
              ? e.target.value === ""
                ? null
                : Number(e.target.value) * scale
              : e.target.value,
          )
        }
      />
    </label>
  );
  return (
    <section className="space-y-5">
      <label className="block text-xs text-muted-foreground">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <div className="flex flex-wrap gap-5">
        {["approved", "verified"].map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm capitalize">
            <input
              type="checkbox"
              checked={data[k] === true}
              onChange={(e) => set(k, e.target.checked)}
            />
            {k}
          </label>
        ))}
      </div>
      {!advancedMode && row.kind !== "template" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {row.kind === "productivity" ? (
            <>
              {input("Units per person-day", "unitsPerPersonDay", "number")}
              {input("Setup person-days", "setupPersonDays", "number")}
              {input("Minimum person-days", "minimumPersonDays", "number")}
            </>
          ) : (
            <>
              {input("Purchase price (£)", "pricePence", "number", 100)}
              {input("Unit", "unit")}
              {input("Minimum attendance (£)", "minimumPence", "number", 100)}
              {input("Hourly rate (£)", "hourlyPence", "number", 100)}
              {input("Delivery (£)", "deliveryPence", "number", 100)}
              {input("Supplier / subcontractor", "supplier")}
              {input("Price source", "source")}
              {input("Region", "region")}
              {input("Effective date", "effectiveDate", "date")}
              {input("Last verification date", "lastVerified", "date")}
              {input("Purchase VAT (%)", "purchaseVatPercent", "number")}
              <label className="text-xs text-muted-foreground">
                Purchase VAT treatment
                <select
                  className="mt-1 w-full border border-input bg-background px-3 py-2 text-foreground"
                  value={String(data["vatTreatment"] ?? "unknown")}
                  onChange={(e) => set("vatTreatment", e.target.value)}
                >
                  {[
                    "unknown",
                    "net",
                    "not_applicable",
                    "inclusive_nonrecoverable",
                    "inclusive_recoverable",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {v.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              {row.kind === "material" && (
                <>
                  {input("Wastage (%)", "wastagePercent", "number")}
                  {input("Coverage per product unit", "coverage", "number")}
                  {input("Quantity multiplier", "quantityFactor", "number")}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={data["roundWhole"] === true}
                      onChange={(e) => set("roundWhole", e.target.checked)}
                    />
                    Round to whole products
                  </label>
                </>
              )}
              {row.kind === "benchmark" && (
                <>
                  {input("Project category", "category")}
                  {input("Source date", "sourceDate", "date")}
                  {input("Scope (refresh / replacement / full)", "renovationScope")}
                  {input("Specification (standard / premium / bespoke)", "specificationLevel")}
                  {input("Room size (small / standard / large)", "roomSize")}
                  {input("Minimum applicable area (m²)", "minArea", "number")}
                  {input("Maximum applicable area (m²)", "maxArea", "number")}
                  {input("Storeys", "storeys", "number")}
                  <label className="text-xs text-muted-foreground">Benchmark VAT basis
                    <select className="mt-1 w-full border border-input bg-background p-2 text-foreground" value={String(data["vatBasis"] ?? "unknown")} onChange={(e) => set("vatBasis", e.target.value)}>
                      <option value="unknown">Confirm VAT</option><option value="exclusive">Excludes VAT</option><option value="inclusive">Includes VAT</option><option value="not_applicable">Not applicable</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data["marginIncluded"] === true} onChange={(e) => set("marginIncluded", e.target.checked)} />Contractor margin included</label>
                  {["inclusions", "exclusions"].map((key) => <label key={key} className="text-xs capitalize text-muted-foreground">{key} (one per line)
                    <textarea className="mt-1 min-h-20 w-full border border-input bg-background p-2 text-foreground" value={Array.isArray(data[key]) ? (data[key] as string[]).join("\n") : ""} onChange={(e) => set(key, e.target.value.split("\n").filter(Boolean))} />
                  </label>)}
                </>
              )}
            </>
          )}
        </div>
      )}
      <Button
        variant="link"
        size="sm"
        onClick={() => {
          setAdvancedMode(!advancedMode);
          setAdvanced(JSON.stringify(data, null, 2));
        }}
      >
        Advanced assumptions / low–expected–high ranges
      </Button>
      {(advancedMode || row.kind === "template") && (
        <>
          <p className="text-xs text-muted-foreground">
            Prices are whole pennies. Ranges use {"{low, expected, high}"}. Templates reference
            trade, material, expense and productivity IDs; quantity bases: count, floor, walls,
            roof, foundation, length, opening, room_surfaces.
          </p>
          <textarea
            aria-label="Advanced pricing assumptions"
            className="min-h-80 w-full border border-input bg-background p-3 font-mono text-xs"
            value={advanced}
            onChange={(e) => {
              setAdvanced(e.target.value);
              setAdvancedMode(true);
            }}
          />
        </>
      )}
      <Button disabled={saving} onClick={() => void save()}>
        <Save />
        {saving ? "Saving…" : "Save record"}
      </Button>
    </section>
  );
}
function BusinessSettings() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["estimating-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estimating_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data;
    },
  });
  const [draft, setDraft] = useState<PricingSettings | null>(null);
  const s = draft ?? query.data;
  if (!s) return <p className="py-6">Loading business settings…</p>;
  async function save() {
    if (!s) return;
    const { error } = await supabase
      .from("estimating_settings")
      .update({ ...s, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) toast.error(error.message);
    else {
      toast.success("Business pricing saved");
      void qc.invalidateQueries({ queryKey: ["estimating-settings"] });
    }
  }
  return (
    <div className="max-w-xl space-y-6 py-6">
      <label className="block text-sm">
        Business markup: {s.markup_percent}%
        <input
          aria-label="Business markup"
          type="range"
          min={10}
          max={15}
          step={1}
          value={s.markup_percent}
          onChange={(e) => setDraft({ ...s, markup_percent: Number(e.target.value) })}
          className="mt-3 block w-full accent-primary"
        />
      </label>
      <label className="block text-sm">
        VAT registration
        <select
          aria-label="VAT registration"
          className="mt-2 block w-full border border-input bg-background p-3"
          value={
            s.vat_registered === null ? "unknown" : s.vat_registered ? "registered" : "unregistered"
          }
          onChange={(e) =>
            setDraft({
              ...s,
              vat_registered: e.target.value === "unknown" ? null : e.target.value === "registered",
              tax_confirmed: false,
            })
          }
        >
          <option value="unknown">Not confirmed</option>
          <option value="registered">VAT registered</option>
          <option value="unregistered">Not VAT registered</option>
        </select>
      </label>
      <label className="block text-sm">
        Applicable sales VAT (%)
        <input
          aria-label="Applicable sales VAT"
          type="number"
          min={0}
          max={20}
          className="mt-2 block w-full border border-input bg-background p-3"
          value={s.sales_vat_percent}
          onChange={(e) =>
            setDraft({ ...s, sales_vat_percent: Number(e.target.value), tax_confirmed: false })
          }
        />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={s.tax_confirmed}
          onChange={(e) => setDraft({ ...s, tax_confirmed: e.target.checked })}
        />
        Tax treatment confirmed for the configured project templates. Exceptional work requires
        separate tax review.
      </label>
      <p className="text-sm text-muted-foreground">
        Markup is not profit margin. Purchase VAT is handled per rate record; unknown tax settings
        block complete customer totals.
      </p>
      <Button onClick={() => void save()}>
        <Save />
        Save settings
      </Button>
    </div>
  );
}
function Reviews() {
  const signed = useServerFn(getAdminUpload);
  const q = useQuery({
    queryKey: ["estimate-reviews"],
    queryFn: async () => {
      const [e, a, u] = await Promise.all([
        supabase
          .from("estimate_versions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("estimate_actuals").select("*"),
        supabase.from("estimate_uploads").select("*"),
      ]);
      if (e.error || a.error || u.error) throw new Error("Could not load estimate reviews");
      return { estimates: e.data ?? [], actuals: a.data ?? [], uploads: u.data ?? [] };
    },
  });
  const [selected, setSelected] = useState<string | null>(null);
  if (q.error) return <p className="py-6 text-destructive">{q.error.message}</p>;
  const rows = q.data?.estimates ?? [];
  const row = rows.find((r) => r.id === selected) ?? rows[0];
  const calibrated = q.data?.actuals.filter((a) => rows.find((r) => r.id === a.estimate_id)) ?? [];
  const deltas = calibrated
    .map((a) => {
      const r = rows.find((e) => e.id === a.estimate_id)?.result as unknown as EstimateResult;
      const actual = a.labour_pence + a.material_pence + a.specialist_pence + a.other_pence;
      return r?.base.expected
        ? {
            ratio: actual / r.base.expected,
            days: a.actual_person_days,
            expectedDays: r.lines
              .filter((l) => l.category === "labour")
              .reduce((n, l) => n + l.quantity.expected, 0),
          }
        : null;
    })
    .filter((d) => d !== null);
  return (
    <div className="py-6">
      {!!deltas.length && (
        <p className="mb-5 border-y border-border py-4 text-sm">
          Recorded jobs: {deltas.length} · Average actual/estimated base cost:{" "}
          {((deltas.reduce((n, d) => n + d.ratio, 0) / deltas.length) * 100).toFixed(0)}%. Review
          recurring differences before changing approved assumptions; no rates update automatically.
        </p>
      )}
      {!row ? (
        <p className="text-sm text-muted-foreground">No estimates yet.</p>
      ) : (
        <div className="grid items-start gap-6 md:grid-cols-[240px_1fr]">
          <div className="space-y-1">
            {rows.map((r) => (
              <Button
                key={r.id}
                variant="outline"
                className="h-auto w-full flex-col items-start whitespace-normal p-3 text-left"
                onClick={() => setSelected(r.id)}
              >
                <span>{(r.specification as unknown as { description: string }).description}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("en-GB")}
                </span>
              </Button>
            ))}
          </div>
          <div>
            <EstimateCard
              estimate={{
                ...(row.result as unknown as EstimateResult),
                id: row.id,
                createdAt: row.created_at,
              }}
            />
            <section className="my-5 border-y border-border py-4">
              <h3 className="text-lg">Pricing review</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Status: {(row.result as unknown as EstimateResult).status?.replaceAll("_", " ") ?? "Legacy estimate"}
              </p>
              <h4 className="mt-3 text-sm font-medium">Customer details to collect</h4>
              <p className="text-xs text-muted-foreground">{(row.result as unknown as EstimateResult).missingInputs?.join(", ") || "Minimum details supplied"}</p>
              <h4 className="mt-3 text-sm font-medium">Internal pricing gaps — resolve in the catalogue</h4>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                {(row.result as unknown as EstimateResult).missing.map((issue, index) => <li key={index}>{issue}</li>)}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Confirm missing prices and productivity, approve scope coverage, or maintain a sourced category benchmark. Changes affect new versions only.
              </p>
            </section>
            <div className="my-4 flex flex-wrap gap-2">
              {q.data?.uploads
                .filter((u) => u.session_id === row.session_id)
                .map((u) => (
                  <Button
                    key={u.id}
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { url } = await signed({ data: { path: u.storage_path } });
                        window.open(url, "_blank", "noopener,noreferrer");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Could not open file");
                      }
                    }}
                  >
                    {u.name}
                  </Button>
                ))}
            </div>
            <ActualsEditor
              key={row.id}
              estimateId={row.id}
              existing={q.data?.actuals.find((a) => a.estimate_id === row.id)}
            />
            <details className="mt-6 text-xs">
              <summary className="cursor-pointer">Immutable pricing snapshot</summary>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all">
                {JSON.stringify(row.pricing_snapshot, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
type Actual = {
  labour_pence: number;
  material_pence: number;
  specialist_pence: number;
  other_pence: number;
  actual_person_days: number;
  notes: string;
};
function ActualsEditor({
  estimateId,
  existing,
}: {
  estimateId: string;
  existing: Actual | undefined;
}) {
  const qc = useQueryClient();
  const [a, setA] = useState<Actual>(
    existing ?? {
      labour_pence: 0,
      material_pence: 0,
      specialist_pence: 0,
      other_pence: 0,
      actual_person_days: 0,
      notes: "",
    },
  );
  async function save() {
    if (Object.values(a).some((v) => typeof v === "number" && (!Number.isFinite(v) || v < 0))) {
      toast.error("Costs and days must be non-negative.");
      return;
    }
    const { error } = await supabase
      .from("estimate_actuals")
      .upsert({ ...a, estimate_id: estimateId, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message);
    else {
      toast.success("Actual costs saved");
      void qc.invalidateQueries({ queryKey: ["estimate-reviews"] });
    }
  }
  return (
    <section className="border-t border-border pt-6">
      <h3 className="text-xl">Actual contractor / completed job costs</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["Labour (£)", "labour_pence"],
            ["Materials (£)", "material_pence"],
            ["Specialists (£)", "specialist_pence"],
            ["Equipment, waste & other (£)", "other_pence"],
            ["Actual person-days", "actual_person_days"],
          ] as const
        ).map(([label, key]) => (
          <label key={key} className="text-xs text-muted-foreground">
            {label}
            <input
              type="number"
              min={0}
              step="any"
              className="mt-1 w-full border border-input bg-background p-2 text-foreground"
              value={a[key] / (key === "actual_person_days" ? 1 : 100)}
              onChange={(e) =>
                setA({
                  ...a,
                  [key]: Number(e.target.value) * (key === "actual_person_days" ? 1 : 100),
                })
              }
            />
          </label>
        ))}
      </div>
      <label className="mt-4 block text-xs text-muted-foreground">
        Quantity discrepancies, contractor quotations and review notes
        <textarea
          aria-label="Actual cost review notes"
          maxLength={5000}
          className="mt-1 w-full border border-input bg-background p-3 text-foreground"
          value={a.notes}
          onChange={(e) => setA({ ...a, notes: e.target.value })}
        />
      </label>
      <Button className="mt-4" onClick={() => void save()}>
        <Save />
        Save actual costs
      </Button>
    </section>
  );
}
function History() {
  const q = useQuery({
    queryKey: ["pricing-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estimating_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="space-y-3 py-6">
      {q.data?.map((h) => (
        <details key={h.id} className="border-b border-border pb-3 text-xs">
          <summary className="cursor-pointer">
            {h.record_id} · {new Date(h.created_at).toLocaleString("en-GB")}
          </summary>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap break-all">
            {JSON.stringify({ before: h.previous_data, after: h.next_data }, null, 2)}
          </pre>
        </details>
      ))}
      {!q.data?.length && (
        <p className="text-sm text-muted-foreground">No pricing edits recorded yet.</p>
      )}
    </div>
  );
}
