import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, RotateCcw, X, FileText, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { EstimateComposer } from "@/components/estimate-composer";
import { ProjectSnapshot } from "@/components/project-snapshot";
import { EstimateCard } from "@/components/estimate-card";
import {
  VisualChoiceCards,
  parseChoices,
  stripChoices,
  type VisualChoice,
} from "@/components/visual-choices";
import { uploadEstimateFile } from "@/lib/estimating/uploads.functions";
import { getProjectState, selectProjectChoice } from "@/lib/estimating/project-state.functions";
import { choicePatch, type ProjectState } from "@/lib/estimating/project-state";
import { gbp, headlineRange, type EstimateResult } from "@/lib/estimating/types";

const STORAGE_KEY = "hbh-team-chat";
type Stored = { id: string; token: string; messages: UIMessage[] };
function fresh(): Stored {
  return { id: crypto.randomUUID(), token: crypto.randomUUID(), messages: [] };
}
function loadStored(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.id && parsed.token && Array.isArray(parsed.messages)) return parsed;
      // Preserve older transcripts locally but use a new owned conversation ID.
      if (Array.isArray(parsed.messages)) return { ...fresh(), messages: parsed.messages };
    }
  } catch {
    /* Storage may be unavailable. */
  }
  return fresh();
}
const STARTERS = [
  "Rear extension",
  "Kitchen renovation",
  "Bathroom refurbishment",
  "Loft conversion",
  "Landscaping",
  "Garden room",
  "General building work",
];
function splitSuggestions(text: string) {
  const m = text.match(/<suggestions>([\s\S]*?)(<\/suggestions>|$)/);
  const body = stripChoices(text)
    .replace(/<suggestions>[\s\S]*$/, "")
    .replace(/<[a-z]*$/, "")
    .trim();
  const suggestions = m?.[2]
    ? (m[1] ?? "")
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s && !/not ready|maybe later|skip|i'll type|rather not/i.test(s))
        .slice(0, 4)
    : [];
  return { body, suggestions };
}
function Pills({
  items,
  onPick,
  disabled,
  hero = false,
}: {
  items: string[];
  onPick: (t: string) => void;
  disabled: boolean;
  hero?: boolean;
}) {
  return (
    <div className={hero ? "flex flex-wrap justify-center gap-2" : "flex flex-wrap gap-2"}>
      {items.map((s) => (
        <Button
          key={s}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onPick(s)}
          className={
            hero
              ? "category-pill min-h-10 h-auto min-w-0 rounded-full whitespace-normal border-border/80 bg-card/80 px-4 py-2 text-sm text-foreground shadow-none hover:border-primary hover:bg-primary/5 hover:text-foreground"
              : ""
          }
        >
          {s}
          
        </Button>
      ))}
    </div>
  );
}
const PANEL_TYPE_LABELS = {
  benchmark: "Preliminary",
  provisional: "Provisional",
  detailed: "Detailed",
} as const;
function EstimatePanel({
  estimate,
  stale,
  busy,
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
  estimate: EstimateResult;
  stale: boolean;
  busy: boolean;
}) {
  const bench = estimate.estimateType === "benchmark" ? estimate.benchmarkEstimate : null;
  const range = headlineRange(estimate);
  if (stale || busy) return <p className="shrink-0 border-b border-border py-3 text-xs text-muted-foreground">Refreshing your budget — the previous figure is based on your earlier specification.</p>;
  if (!range) return estimate.status === "review_required" ? <p className="shrink-0 border-b border-border py-3 text-xs text-muted-foreground">This project needs a tailored estimate. We can help with the details or arrange a visit.</p> : null;
  const s = estimate.specification;
  const area = (s.length && s.width ? s.length * s.width : s.approximateArea ?? 0) * (s.category === "extension" ? s.storeys ?? 1 : 1);
  return (
    <Button variant="ghost" onClick={onToggle} aria-expanded={expanded} aria-label={expanded ? "Back to conversation" : "View estimated project budget"} className="h-auto w-full shrink-0 justify-between gap-3 rounded-none border-b border-border px-0 py-3 text-xs hover:bg-secondary hover:text-foreground">
        <span className="flex min-w-0 items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="truncate font-medium">
            {area ? `${area}m² ` : ""}
            {s.category.replaceAll("_", " ")}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 font-display text-base sm:text-xl">
          {gbp(range.low)}–{gbp(range.high)}
          {(bench ? bench.vatBasis === "exclusive" : !estimate.vatConfirmed) && <span className="text-muted-foreground"> +VAT</span>}
          <ChevronDown className={expanded ? "size-3 rotate-180" : "size-3"} />
        </span>
    </Button>
  );
}
export function TeamChat({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(inline);
  const [stored, setStored] = useState<Stored | null>(null);
  useEffect(() => {
    if (open && !stored) setStored(loadStored());
  }, [open, stored]);
  function reset() {
    const next = fresh();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Continue without browser persistence when storage is unavailable. */
    }
    setStored(next);
  }
  if (inline)
    return (
      <div className="h-full min-h-0 w-full">
        {stored ? (
          <ChatWindow key={stored.id} stored={stored} inline onReset={reset} />
        ) : (
          <div className="h-full animate-pulse bg-background" />
        )}
      </div>
    );
  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 h-auto gap-3 px-5 py-3.5 text-xs uppercase"
        >
          <MessageCircle />
          Chat to the team
        </Button>
      )}
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex h-[min(740px,calc(100dvh-1.5rem))] flex-col border border-border bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[480px]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center bg-primary font-display text-primary-foreground">
                H
              </span>
              <div>
                <p className="font-display text-base">Chat to the team</p>
                <p className="text-xs text-muted-foreground">Homes by Hines</p>
              </div>
            </div>
            <div className="flex">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={reset}
                aria-label="New conversation"
                title="New conversation"
              >
                <RotateCcw />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X />
              </Button>
            </div>
          </div>
          {stored && <ChatWindow key={stored.id} stored={stored} />}
        </div>
      )}
    </>
  );
}
function ChatWindow({
  stored,
  inline = false,
  onReset,
}: {
  stored: Stored;
  inline?: boolean;
  onReset?: () => void;
}) {
  const upload = useServerFn(uploadEstimateFile);
  const reducedMotion = useReducedMotion();
  const layoutTransition = { duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  const readState = useServerFn(getProjectState);
  const selectChoice = useServerFn(selectProjectChoice);
  const [project, setProject] = useState<ProjectState | null>(null);
  const [resultExpanded, setResultExpanded] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [choiceError, setChoiceError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const uploadCache = useRef(new Map<string, Awaited<ReturnType<typeof upload>>>());
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { conversationId: stored.id, sessionToken: stored.token },
      }),
    [stored.id, stored.token],
  );
  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id: stored.id,
    messages: stored.messages,
    transport,
    onError: () => toast.error("We couldn't send that message just now. Your project details are still here."),
    onFinish: () => { void refreshProject(); },
  });
  const busy = status === "submitted" || status === "streaming" || selecting;
  async function refreshProject() {
    try { const state = await readState({ data: { sessionId: stored.id, token: stored.token } }); setProject(state); }
    catch { /* Existing conversation remains usable if recovery temporarily fails. */ }
  }
  useEffect(() => { void refreshProject(); }, [stored.id]);
  async function pick(set: string, choice: VisualChoice, category?: "extension" | "kitchen" | "bathroom" | "loft" | "landscaping" | "general") {
    if (busy || uploading) return;
    setSelecting(true); setChoiceError(false);
    if (set === "starter") setMessages([{ id: crypto.randomUUID(), role: "user", metadata: { choice: true }, parts: [{ type: "text", text: choice.message }] }]);
    try {
      const result = await selectChoice({ data: { sessionId: stored.id, token: stored.token, revision: project?.revision ?? 0,
        set, value: choice.value, message: choice.message, category } });
      setProject(result.state);
      const next: UIMessage[] = [...messages, { id: crypto.randomUUID(), role: "user", metadata: { choice: true }, parts: [{ type: "text", text: choice.message }] },
        { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: result.response }] }];
      setMessages(next);
      setPicked((p) => ({ ...p, [set]: choice.value }));
    } catch {
      if (set === "starter") setMessages(messages);
      setChoiceError(true);
      toast.error("We couldn't update that choice just now. Please try again; your details are still here.");
      await refreshProject();
    } finally { setSelecting(false); }
  }
  const active = messages.length > 0;
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, messages }));
    } catch {
      /* Continue without browser persistence when storage is unavailable. */
    }
  }, [stored, messages]);
  async function send(text: string) {
    if (!text.trim() || busy || uploading) return;
    setResultExpanded(false);
    await sendMessage({ text });
  }
  async function submit({ text, files }: PromptInputMessage) {
    if (busy || uploading || (!text.trim() && !files.length)) return;
    if (text.length > 5000) throw new Error("Please keep your message under 5,000 characters.");
    setUploading(true);
    try {
      const uploaded = [];
      for (const [index, f] of files.entries()) {
        setUploadProgress(`${index + 1}/${files.length} · ${f.filename ?? "Attachment"}`);
        const cached = uploadCache.current.get(f.url);
        if (cached) { uploaded.push(cached); continue; }
        const blob = await fetch(f.url).then((r) => r.blob());
        const form = new FormData();
        form.set("sessionId", stored.id);
        form.set("token", stored.token);
        form.set("file", new File([blob], f.filename ?? "photo", { type: f.mediaType }));
        const saved = await upload({ data: form });
        uploadCache.current.set(f.url, saved);
        uploaded.push(saved);
      }
      setUploading(false);
      setUploadProgress(null);
      await sendMessage({
        text: text.trim() || "I've attached a photo or drawing for this project.",
        files: uploaded,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }
  const last = messages.at(-1);
  const lastText =
    last?.role === "assistant"
      ? last.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("\n")
      : "";
  const lastSuggestions =
    !busy && last?.role === "assistant" ? splitSuggestions(lastText).suggestions : [];
  const lastChoices = !busy && last?.role === "assistant" ? parseChoices(lastText) : null;
  const [picked, setPicked] = useState<Record<string, string>>({});
  const latestEstimate = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m?.role !== "assistant") continue;
      for (const p of [...m.parts].reverse()) {
        if (
          p.type === "tool-calculate_estimate" &&
          (p as { state?: string }).state === "output-available" &&
          (p as { output?: unknown }).output &&
          typeof (p as { output?: unknown }).output === "object" &&
          "specification" in ((p as { output?: object }).output as object)
        )
          return { estimate: (p as { output: EstimateResult }).output, index: i };
      }
    }
    return null;
  }, [messages]);
  const currentEstimate = project ? project.estimate : latestEstimate?.estimate ?? null;
  const estimateStale = project ? project.estimateRevision !== project.revision || project.pending : false;
  function selectedValue(set: string): string | null {
    const spec = project?.specification;
    if (!spec) return picked[set] ?? null;
    const values: Record<string, string | null> = { roof: spec.roof, doors: spec.doorType, walls: spec.wallFinish, flooring: spec.flooring,
      storeys: spec.storeys ? String(spec.storeys) : null, sizes: spec.length && spec.width ? `${spec.length}x${spec.width}` : null,
      kitchen_scope: spec.renovationScope, bathroom_scope: spec.renovationScope, specification: spec.specificationLevel,
      room_size: spec.roomSize, kitchen_size: spec.roomSize, bathroom_size: spec.roomSize, bathroom_layout: spec.layoutRetained === null ? null : spec.layoutRetained ? "retained" : "changed",
      bathroom_fittings: spec.fittingsRetained === null ? null : spec.fittingsRetained ? "retained" : "replaced" };
    return values[set] ?? picked[set] ?? null;
  }
  return (
    <motion.div
      layout={inline ? "position" : false}
      transition={{ layout: layoutTransition }}
      data-chat-active={active}
      className={
        inline
          ? "quotation-window flex h-full min-h-0 flex-col"
          : "flex min-h-0 flex-1 flex-col"
      }
    >
      {
        <motion.div
          layout={inline ? "position" : false}
          transition={{ layout: layoutTransition }}
          ref={panel}
          className={
            inline
              ? "quotation-thread flex min-h-0 flex-1 flex-col text-foreground"
              : "flex min-h-0 flex-1 flex-col"
          }
        >
          {inline && active && (
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 py-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  Project estimate
                </p>

              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onReset}
                title="New conversation"
                aria-label="New conversation"
              >
                <RotateCcw />
              </Button>
            </div>
          )}
          {project && active && <ProjectSnapshot specification={project.specification} busy={busy} onEdit={(text) => void send(text)} />}
          {currentEstimate && (
            <EstimatePanel estimate={currentEstimate} stale={estimateStale} busy={selecting || Boolean(project?.pending)} expanded={resultExpanded} onToggle={() => setResultExpanded((v) => !v)} />
          )}
          {resultExpanded && currentEstimate && !estimateStale ? <div className="min-h-0 flex-1 overflow-y-auto" key="budget-result">
            <EstimateCard estimate={currentEstimate} onAction={(text) => void send(text)} />
          </div> : <Conversation className="min-h-0 flex-1">
            <ConversationContent
              className={inline ? "gap-5 px-0 py-4" : "gap-5 px-4 py-5 sm:px-5"}
            >
              <AnimatePresence initial={false} mode="popLayout">
              {!active && (
                <motion.div key="project-starters" exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }} className="text-sm text-muted-foreground">
                  {!inline && <p className="mb-4 text-sm">Tell us about your house, site or garden.</p>}
                  <div className="category-options">
                    <Pills
                      items={STARTERS}
                      onPick={(t) => {
                        const categories = { "Rear extension": "extension", "Kitchen renovation": "kitchen", "Bathroom refurbishment": "bathroom", "Loft conversion": "loft", "Landscaping": "landscaping", "General building work": "general" } as const;
                        const category = categories[t as keyof typeof categories];
                        if (t === "Garden room") { void send("I'm looking to build a garden room."); return; }
                        if (category) void pick("starter", { value: category, label: t, description: "", message: t === "Rear extension" ? "I'm looking to build a rear extension." : `I'd like help with ${t.toLowerCase()}.` }, category);
                      }}
                      disabled={busy}
                      hero={inline}
                    />
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
              {!resultExpanded && messages.map((message) => (message.metadata as { choice?: boolean } | undefined)?.choice ? (
                <motion.p key={message.id} initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={layoutTransition} className="self-end text-xs text-muted-foreground">
                  <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary align-middle" />
                  {message.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}
                </motion.p>
              ) : (
                <motion.div key={message.id} initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...layoutTransition, delay: reducedMotion ? 0 : 0.1 }}>
                <Message key={message.id} from={message.role}>
                  <MessageContent
                    className={
                      message.role === "user"
                        ? "group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary/80 group-[.is-user]:text-foreground"
                        : "min-w-0 w-full bg-transparent p-0"
                    }
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        const { body } = splitSuggestions(part.text);
                        return body ? <MessageResponse key={i}>{body}</MessageResponse> : null;
                      }
                      if (part.type === "file")
                        return (
                          <p key={i} className="flex items-center gap-2 text-xs">
                            <FileText size={14} />
                            {part.filename ?? "Attached photo"}
                          </p>
                        );
                      if (part.type.startsWith("tool-")) {
                        const t = part as {
                          type: `tool-${string}`;
                          state:
                            | "input-streaming"
                            | "input-available"
                            | "output-available"
                            | "output-error";
                          output?: unknown;
                          errorText?: string;
                        };
                        const estimate =
                          t.type === "tool-calculate_estimate" &&
                          t.state === "output-available" &&
                          t.output &&
                          typeof t.output === "object" &&
                          "specification" in t.output
                            ? (t.output as EstimateResult)
                            : null;
                        // Internal tool execution is never shown to customers; only the
                        // current estimate card and genuine errors surface in the chat.
                        if (t.state === "output-error")
                          return (
                            <p key={i} className="text-xs text-muted-foreground">
                              Something didn't go through — please try that again.
                            </p>
                          );
                        return null;
                      }
                      return null;
                    })}
                    {message.role === "assistant" && message.id !== last?.id && (() => {
                      const set = parseChoices(message.parts.filter((p) => p.type === "text").map((p) => p.text).join("\n"));
                      const repeated = set && messages.slice(messages.indexOf(message) + 1).some((later) => later.role === "assistant" && parseChoices(later.parts.filter((p) => p.type === "text").map((p) => p.text).join("\n")) === set);
                      return set && !repeated && !["refine", "refine_room"].includes(set) ? <VisualChoiceCards setId={set} selected={selectedValue(set)} disabled={busy}
                        onPick={(choice) => choicePatch(set, choice.value) ? void pick(set, choice) : void send(choice.message)} /> : null;
                    })()}
                  </MessageContent>
                </Message>
                </motion.div>
              ))}
              {choiceError && <p role="alert" className="text-sm text-muted-foreground">That choice couldn't be updated. Please try it again.</p>}
              {!resultExpanded && lastChoices && (
                <motion.div key={lastChoices} initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...layoutTransition, delay: reducedMotion ? 0 : 0.16 }}>
                <VisualChoiceCards
                  setId={lastChoices}
                  selected={selectedValue(lastChoices)}
                  disabled={busy}
                  onPick={(choice: VisualChoice) => {
                    if (choicePatch(lastChoices, choice.value) || ["refine", "refine_room", "sizes"].includes(lastChoices)) void pick(lastChoices, choice);
                    else void send(choice.message);
                  }}
                />
                </motion.div>
              )}
              {!resultExpanded && !!lastSuggestions.length && (
                <Pills items={lastSuggestions} onPick={(t) => void send(t)} disabled={busy} />
              )}
              {(status === "submitted" || (selecting && messages.length === 1)) && (
                <Shimmer className="text-sm">The team is thinking…</Shimmer>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>}
        </motion.div>
      }
      <motion.div
        layout={inline ? "position" : false}
        transition={{ layout: layoutTransition }}
        className={inline ? "quotation-input shrink-0 pb-2 pt-3" : "shrink-0 border-t border-border p-3"}
      >
        <EstimateComposer
          onSend={submit}
          status={status}
          onStop={stop}
          hero={inline && !active}
          uploading={uploading}
          busy={busy}
          uploadProgress={uploadProgress}
        />
        {inline && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            AI-assisted · Team-backed · Indicative, not a fixed quotation.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
