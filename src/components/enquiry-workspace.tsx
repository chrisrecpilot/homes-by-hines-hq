import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminUpload } from "@/lib/estimating/uploads.functions";
import { describeSpec } from "@/lib/estimating/update-project";
import { gbp, headlineRange, type EstimateResult, type ProjectSpec } from "@/lib/estimating/types";
import type { Database } from "@/integrations/supabase/types";
type Lead = Database["public"]["Tables"]["enquiries"]["Row"];
const statuses = ["new", "contacted", "survey_arranged", "quoted", "won", "lost"];
const label = (s: string) => s.replaceAll("_", " ");
const fmt = (s: string) => new Date(s).toLocaleString("en-GB");
export function EnquiryWorkspace() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["admin-enquiries"], queryFn: async () => {
    const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error; return data;
  } });
  const leads = (q.data ?? []).filter((e) => (filter === "all" || e.lead_status === filter || e.request_type === filter) && `${e.name} ${e.phone} ${e.enquiry_type} ${JSON.stringify(e.project_snapshot)}`.toLowerCase().includes(search.toLowerCase()));
  const active = leads.find((e) => e.id === selected) ?? leads[0];
  return <div>
    <div className="mb-5 flex flex-wrap gap-3">
      <Input aria-label="Search enquiries" placeholder="Search name, phone or project" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <select aria-label="Filter enquiries" value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 text-sm">
        {["all", ...statuses, "callback", "site_visit"].map((s) => <option key={s} value={s}>{label(s)}</option>)}
      </select>
    </div>
    {q.isPending ? <p>Loading enquiries…</p> : q.isError ? <p role="alert">Enquiries couldn't be loaded.</p> : !leads.length ? <p className="text-sm text-muted-foreground">No matching enquiries.</p> : <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="max-h-[70vh] overflow-y-auto border border-border">
        {leads.map((e) => <Button key={e.id} variant="ghost" onClick={() => setSelected(e.id)} className={`h-auto w-full flex-col items-start whitespace-normal rounded-none border-b border-border p-4 text-left ${e.id === active?.id ? "bg-secondary" : ""}`}>
          <span className="font-medium">{e.name}</span><span className="text-xs capitalize text-muted-foreground">{label(e.lead_status)} · {label(e.request_type ?? e.enquiry_type)}</span>
          <span className="text-xs text-muted-foreground">{fmt(e.created_at)}</span>
          {e.project_snapshot && <span className="line-clamp-2 text-xs text-muted-foreground">{describeSpec(e.project_snapshot as unknown as ProjectSpec)}</span>}
        </Button>)}
      </div>
      {active && <LeadDetail key={active.id} lead={active} />}
    </div>}
  </div>;
}
function LeadDetail({ lead }: { lead: Lead }) {
  const client = useQueryClient();
  const signFile = useServerFn(getAdminUpload);
  const [status, setStatus] = useState(lead.lead_status);
  const [notes, setNotes] = useState(lead.internal_notes);
  const [action, setAction] = useState(lead.next_action);
  const [followUp, setFollowUp] = useState(lead.follow_up_at?.slice(0, 16) ?? "");
  const [survey, setSurvey] = useState(lead.survey_at?.slice(0, 16) ?? "");
  const [saving, setSaving] = useState(false);
  const context = useQuery({ queryKey: ["lead-context", lead.id], queryFn: async () => {
    const [chat, versions, files] = await Promise.all([
      lead.session_id ? supabase.from("chat_conversations").select("messages").eq("id", lead.session_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      lead.session_id ? supabase.from("estimate_versions").select("id,result,created_at").eq("session_id", lead.session_id).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      lead.session_id ? supabase.from("estimate_uploads").select("id,name,storage_path").eq("session_id", lead.session_id) : Promise.resolve({ data: [], error: null }),
    ]);
    if (chat.error || versions.error || files.error) throw new Error("Project details unavailable");
    return { chat: chat.data?.messages, versions: versions.data ?? [], files: files.data ?? [] };
  } });
  const snapshot = context.data?.versions.find((v) => v.id === lead.estimate_version_id);
  const est = snapshot?.result as unknown as EstimateResult | undefined;
  const range = est ? headlineRange(est) : null;
  async function save() {
    setSaving(true);
    const { error } = await supabase.from("enquiries").update({ lead_status: status, internal_notes: notes, next_action: action,
      follow_up_at: followUp ? new Date(followUp).toISOString() : null, survey_at: survey ? new Date(survey).toISOString() : null }).eq("id", lead.id);
    setSaving(false);
    if (error) toast.error("Couldn't save the follow-up."); else { toast.success("Follow-up saved."); void client.invalidateQueries({ queryKey: ["admin-enquiries"] }); }
  }
  const spec = lead.project_snapshot as unknown as ProjectSpec | null;
  const messages = Array.isArray(context.data?.chat) ? context.data.chat as unknown as { role: string; parts?: { type: string; text?: string }[] }[] : [];
  return <div className="min-w-0 space-y-6">
    <section className="border-b border-border pb-5"><h2 className="font-display text-2xl">{lead.name}</h2>
      <p className="mt-2 text-sm">{lead.phone && <a className="text-primary" href={`tel:${lead.phone}`}>{lead.phone}</a>}{lead.email && <> · <a href={`mailto:${lead.email}`}>{lead.email}</a></>}</p>
      <p className="mt-2 text-xs capitalize text-muted-foreground">{label(lead.request_type ?? lead.enquiry_type)} · {fmt(lead.created_at)}</p>
      {lead.site_address && <p className="mt-2 text-sm">Site: {lead.site_address}</p>}{lead.visit_preference && <p className="text-sm">Visit preference: {lead.visit_preference} (request only)</p>}
    </section>
    <section><h3 className="font-medium">Project &amp; submitted estimate</h3>
      <p className="mt-2 text-sm">{spec ? describeSpec(spec) : lead.message}</p>
      {spec && <details className="mt-2 text-xs"><summary>All project selections</summary><dl className="mt-2 grid grid-cols-2 gap-2">{Object.entries(spec).filter(([, v]) => v !== null && v !== "" && (!Array.isArray(v) || v.length)).map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k.replace(/([A-Z])/g, " $1")}</dt><dd>{Array.isArray(v) ? v.join(", ") : String(v)}</dd></div>)}</dl></details>}
      {range && <p className="mt-3 font-display text-xl">{gbp(range.low)}–{gbp(range.high)} <span className="text-sm text-muted-foreground">· {est?.estimateType} · {est?.benchmarkEstimate?.vatBasis === "inclusive" ? "VAT included" : "VAT to confirm"}</span></p>}
      {!snapshot && <p className="mt-2 text-xs text-muted-foreground">No estimate snapshot attached.</p>}
      {est && <details className="mt-2 text-xs"><summary>Pricing basis and assumptions</summary><p className="mt-2">{est.benchmarkEstimate?.source} · {est.benchmarkEstimate?.sourceDate}</p>{[...est.assumptions, ...est.customerNotes ?? [], ...est.benchmarkEstimate?.inclusions ?? [], ...est.benchmarkEstimate?.exclusions ?? []].map((s, i) => <p key={i} className="mt-1">{s}</p>)}</details>}
    </section>
    <section className="space-y-3 border-t border-border pt-5"><h3 className="font-medium">Follow-up</h3>
      <label className="block text-xs">Lead status<select value={status} onChange={(e) => setStatus(e.target.value)} className="ml-3 rounded-md border border-input bg-background p-2">{statuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></label>
      <label className="block text-xs">Internal notes<Textarea className="mt-1" value={notes} maxLength={10000} onChange={(e) => setNotes(e.target.value)} /></label>
      <label className="block text-xs">Next action<Input className="mt-1" value={action} maxLength={500} onChange={(e) => setAction(e.target.value)} /></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs">Follow-up date<Input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} /></label><label className="text-xs">Survey appointment<Input type="datetime-local" value={survey} onChange={(e) => setSurvey(e.target.value)} /></label></div>
      <Button onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save follow-up"}</Button>
    </section>
    {context.isError && <p role="alert">Linked project details couldn't be loaded.</p>}
    <details className="border-t border-border pt-4"><summary className="text-sm font-medium">Photos &amp; drawings ({context.data?.files.length ?? 0})</summary><div className="mt-2 flex flex-wrap gap-2">{context.data?.files.map((f) => <Button key={f.id} size="sm" variant="outline" onClick={async () => { try { const result = await signFile({ data: { path: f.storage_path } }); window.open(result.url, "_blank", "noopener,noreferrer"); } catch { toast.error("File couldn't be opened."); } }}>{f.name}</Button>)}</div></details>
    <details className="border-t border-border pt-4"><summary className="text-sm font-medium">Linked conversation</summary><div className="mt-3 space-y-3">{messages.map((m, i) => <div key={i} className="text-sm"><p className="text-xs font-medium text-primary">{m.role === "user" ? "Customer" : "Team"}</p><p className="whitespace-pre-wrap">{m.parts?.filter((p) => p.type === "text").map((p) => p.text?.replace(/<(choices|suggestions)>[\s\S]*?(<\/(choices|suggestions)>|$)/g, "")).join("\n")}</p></div>)}</div></details>
    <details className="border-t border-border pt-4"><summary className="text-sm font-medium">Previous estimate versions</summary>{context.data?.versions.map((v) => { const r = headlineRange(v.result as unknown as EstimateResult); return <p key={v.id} className="mt-2 text-xs">{fmt(v.created_at)} · {r ? `${gbp(r.low)}–${gbp(r.high)}` : "No complete budget"}{v.id === lead.estimate_version_id ? " · submitted snapshot" : ""}</p>; })}</details>
  </div>;
}