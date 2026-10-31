import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, RotateCcw, X, FileText, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Tool, ToolContent, ToolHeader, ToolOutput } from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { EstimateComposer } from "@/components/estimate-composer";
import { EstimateCard } from "@/components/estimate-card";
import {
  VisualChoiceCards,
  parseChoices,
  stripChoices,
  type VisualChoice,
} from "@/components/visual-choices";
import { uploadEstimateFile } from "@/lib/estimating/uploads.functions";
import { gbp, type EstimateResult } from "@/lib/estimating/types";

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
    <div className={hero ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
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
              ? "h-11 min-w-0 justify-between whitespace-normal border-border bg-transparent px-3 text-left text-xs text-foreground shadow-none hover:border-primary hover:bg-secondary hover:text-foreground [&:last-child]:col-span-2"
              : ""
          }
        >
          {s}
          {hero && <Plus className="shrink-0 text-primary" />}
        </Button>
      ))}
    </div>
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
  const [uploading, setUploading] = useState(false);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { conversationId: stored.id, sessionToken: stored.token },
      }),
    [stored.id, stored.token],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: stored.id,
    messages: stored.messages,
    transport,
    onError: (error) => toast.error(error.message || "The message could not be sent."),
  });
  const busy = status === "submitted" || status === "streaming";
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
    await sendMessage({ text });
  }
  async function submit({ text, files }: PromptInputMessage) {
    if (busy || uploading || (!text.trim() && !files.length)) return;
    if (text.length > 5000) throw new Error("Please keep your message under 5,000 characters.");
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const blob = await fetch(f.url).then((r) => r.blob());
        const form = new FormData();
        form.set("sessionId", stored.id);
        form.set("token", stored.token);
        form.set("file", new File([blob], f.filename ?? "photo", { type: f.mediaType }));
        uploaded.push(await upload({ data: form }));
      }
      await sendMessage({
        text: text.trim() || "I've attached a photo or drawing for this project.",
        files: uploaded,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      throw error;
    } finally {
      setUploading(false);
    }
  }
  const last = messages.at(-1);
  const lastSuggestions =
    !busy && last?.role === "assistant"
      ? splitSuggestions(
          last.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("\n"),
        ).suggestions
      : [];
  return (
    <div
      data-chat-active={active}
      className={
        inline
          ? "flex h-full min-h-0 flex-col px-5 lg:px-10 xl:px-12"
          : "flex min-h-0 flex-1 flex-col"
      }
    >
      {
        <div
          ref={panel}
          className={
            inline
              ? "flex min-h-0 flex-1 flex-col bg-background text-foreground"
              : "flex min-h-0 flex-1 flex-col"
          }
        >
          {inline && (
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-3 lg:py-5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  Project estimate
                </p>
                <p className="mt-1 hidden text-xs text-muted-foreground lg:block">
                  Homes by Hines · No obligation
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
          <Conversation className="min-h-0 flex-1">
            <ConversationContent
              className={inline ? "gap-5 px-0 py-4 lg:py-6" : "gap-5 px-4 py-5 sm:px-5"}
            >
              {!active && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-display text-2xl text-foreground lg:text-3xl">
                    What are you planning?
                  </p>
                  <p className="mt-2 text-sm">
                    {inline
                      ? "A house, a room, or something outdoors."
                      : "Tell us about your house, site or garden."}
                  </p>
                  <div className="mt-4 lg:mt-6">
                    <Pills
                      items={STARTERS}
                      onPick={(t) =>
                        void send(inline ? `I'd like an estimate for a ${t.toLowerCase()}.` : t)
                      }
                      disabled={busy}
                      hero={inline}
                    />
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent
                    className={
                      message.role === "user"
                        ? "group-[.is-user]:rounded-none group-[.is-user]:bg-foreground group-[.is-user]:text-background"
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
                        return (
                          <div key={i}>
                            {estimate && (
                              <EstimateCard estimate={estimate} onAction={(t) => void send(t)} />
                            )}
                            <Tool defaultOpen={false}>
                              <ToolHeader
                                type={t.type}
                                state={t.state}
                                title={
                                  t.type === "tool-calculate_estimate"
                                    ? "Project calculation"
                                    : t.state === "output-available" &&
                                        (t.output as { ok?: boolean })?.ok
                                      ? "Enquiry sent to the team"
                                      : "Send enquiry"
                                }
                              />
                              <ToolContent>
                                <ToolOutput output={t.output} errorText={t.errorText} />
                              </ToolContent>
                            </Tool>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))}
              {!!lastSuggestions.length && (
                <Pills items={lastSuggestions} onPick={(t) => void send(t)} disabled={busy} />
              )}
              {status === "submitted" && (
                <Shimmer className="text-sm">The team is thinking…</Shimmer>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>
      }
      <div
        className={inline ? "shrink-0 pb-4 pt-2 lg:pb-6" : "shrink-0 border-t border-border p-3"}
      >
        <EstimateComposer
          onSend={submit}
          status={status}
          onStop={stop}
          hero={inline && !active}
          uploading={uploading}
        />
        {inline && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Indicative costs, not a fixed quotation. Unconfirmed pricing needs a team review.
          </p>
        )}
      </div>
    </div>
  );
}
