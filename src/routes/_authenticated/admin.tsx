import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Team dashboard — Homes by Hines" },
      { name: "description", content: "Enquiries, chats and visitor activity for the Homes by Hines team." },
      { property: "og:title", content: "Team dashboard — Homes by Hines" },
      { property: "og:description", content: "Enquiries, chats and visitor activity." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "visitors" | "enquiries" | "chats";

function fmt(d: string) {
  return new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("enquiries");

  const role = useQuery({
    queryKey: ["admin-role"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { admin: false, email: "" };
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return { admin: Boolean(data), email: u.user.email ?? "" };
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (role.isLoading) return <p className="mx-auto max-w-6xl px-6 py-20 text-sm">Loading…</p>;
  if (!role.data?.admin) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24">
        <h1 className="font-display text-3xl">No access</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {role.data?.email} isn't on the team list. Only confirmed @recruitpilot.ai accounts can view this area.
        </p>
        <button onClick={signOut} className="mt-6 text-xs uppercase tracking-[0.18em] text-primary">
          Sign out
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow text-primary">Team</p>
          <h1 className="mt-3 font-display text-4xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {role.data.email}
          <button onClick={signOut} className="border border-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground">
            Sign out
          </button>
        </div>
      </div>
      <div className="mt-6 flex gap-6 border-b border-border">
        {(["enquiries", "chats", "visitors"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-3 text-xs uppercase tracking-[0.18em] ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "enquiries" && <Enquiries />}
        {tab === "chats" && <Chats />}
        {tab === "visitors" && <Visitors />}
      </div>
    </section>
  );
}

function Enquiries() {
  const q = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading) return <p className="text-sm">Loading…</p>;
  if (!q.data?.length) return <p className="text-sm text-muted-foreground">No enquiries yet.</p>;
  return (
    <div className="space-y-4">
      {q.data.map((e) => (
        <article key={e.id} className="border border-border bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xl">{e.name}</h3>
            <span className="text-xs text-muted-foreground">{fmt(e.created_at)}</span>
          </div>
          <p className="mt-1 text-sm">
            <a href={`mailto:${e.email}`} className="text-primary">{e.email}</a>
            {e.phone && <> · <a href={`tel:${e.phone}`}>{e.phone}</a></>}
            <span className="eyebrow ml-3 text-muted-foreground">{e.enquiry_type}</span>
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{e.message}</p>
        </article>
      ))}
    </div>
  );
}

type Part = { type: string; text?: string };
type Msg = { id: string; role: string; parts?: Part[] };

function Chats() {
  const [selected, setSelected] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["admin-chats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading) return <p className="text-sm">Loading…</p>;
  if (!q.data?.length) return <p className="text-sm text-muted-foreground">No chats yet.</p>;
  const active = q.data.find((c) => c.id === selected) ?? q.data[0];
  const textOf = (m: Msg) =>
    (m.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => (p.text ?? "").replace(/<suggestions>[\s\S]*?(<\/suggestions>|$)/g, "").trim())
      .join("\n");
  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <ul className="max-h-[70vh] space-y-px overflow-auto border border-border bg-border">
        {q.data.map((c) => {
          const msgs = c.messages as unknown as Msg[];
          const first = msgs.find((m) => m.role === "user");
          return (
            <li key={c.id}>
              <button
                onClick={() => setSelected(c.id)}
                className={`block w-full p-4 text-left ${active.id === c.id ? "bg-card" : "bg-background"}`}
              >
                <p className="line-clamp-2 text-sm">{first ? textOf(first) : "(empty)"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fmt(c.updated_at)} · {msgs.length} msgs
                  {c.enquiry_id && <span className="ml-2 text-primary">Enquiry sent</span>}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="max-h-[70vh] space-y-4 overflow-auto border border-border bg-card p-6">
        {(active.messages as unknown as Msg[]).map((m) => {
          const t = textOf(m);
          if (!t) return null;
          return (
            <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[80%] bg-foreground p-3 text-sm text-background" : "max-w-[90%] text-sm"}>
              <p className="eyebrow mb-1 opacity-60">{m.role === "user" ? "Visitor" : "Assistant"}</p>
              <p className="whitespace-pre-wrap">{t}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function tally(rows: Record<string, string | null>[], key: string) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = r[key] || "Unknown";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function Visitors() {
  const q = useQuery({
    queryKey: ["admin-views"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data, error } = await supabase
        .from("page_views")
        .select("visitor_id,path,source,device,country,city,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const rows = q.data ?? [];
    const days: { day: string; views: number; visitors: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      const key = d.toISOString().slice(0, 10);
      const dayRows = rows.filter((r) => r.created_at.slice(0, 10) === key);
      days.push({
        day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        views: dayRows.length,
        visitors: new Set(dayRows.map((r) => r.visitor_id)).size,
      });
    }
    const loc = rows.map((r) => ({ loc: r.city ? `${r.city}, ${r.country ?? ""}` : r.country }));
    return {
      days,
      total: rows.length,
      unique: new Set(rows.map((r) => r.visitor_id)).size,
      pages: tally(rows, "path"),
      sources: tally(rows.filter((r) => r.source), "source"),
      devices: tally(rows, "device"),
      locations: tally(loc, "loc"),
      recent: rows.slice(0, 15),
    };
  }, [q.data]);

  if (q.isLoading) return <p className="text-sm">Loading…</p>;

  return (
    <div className="space-y-10">
      <dl className="grid gap-px border border-border bg-border sm:grid-cols-2">
        {[["Page views (30 days)", stats.total], ["Unique visitors (30 days)", stats.unique]].map(([l, v]) => (
          <div key={l} className="bg-background p-6">
            <dt className="eyebrow text-muted-foreground">{l}</dt>
            <dd className="mt-2 font-display text-4xl">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="h-64 border border-border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.days}>
            <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} stroke="var(--muted-foreground)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} stroke="var(--muted-foreground)" />
            <Tooltip />
            <Bar dataKey="views" fill="var(--primary)" name="Page views" />
            <Bar dataKey="visitors" fill="var(--foreground)" name="Visitors" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          ["Top pages", stats.pages],
          ["Where they came from", stats.sources],
          ["Devices", stats.devices],
          ["Rough location", stats.locations],
        ].map(([title, list]) => (
          <div key={title as string} className="border border-border p-6">
            <h3 className="text-lg">{title as string}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {(list as [string, number][]).length === 0 && <li className="text-muted-foreground">No data yet</li>}
              {(list as [string, number][]).map(([k, n]) => (
                <li key={k} className="flex justify-between border-b border-border pb-2">
                  <span>{k}</span>
                  <span className="text-muted-foreground">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border border-border p-6">
        <h3 className="text-lg">Latest visits</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {stats.recent.map((r, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
              <span>{r.path}</span>
              <span className="text-muted-foreground">
                {[r.device, r.city ?? r.country, r.source].filter(Boolean).join(" · ")} · {fmt(r.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
