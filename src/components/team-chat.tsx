import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolOutput } from "@/components/ai-elements/tool";

const STORAGE_KEY = "hbh-team-chat";

type Stored = { id: string; messages: UIMessage[] };

function loadStored(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.id && Array.isArray(parsed.messages)) return parsed;
    }
  } catch {
    /* ignore */
  }
  const fresh = { id: crypto.randomUUID(), messages: [] };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function Monogram() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary font-display text-sm text-primary-foreground">
      H
    </span>
  );
}

export function TeamChat() {
  const [open, setOpen] = useState(false);
  const [stored, setStored] = useState<Stored | null>(null);

  useEffect(() => {
    if (open && !stored) setStored(loadStored());
  }, [open, stored]);

  function reset() {
    const fresh = { id: crypto.randomUUID(), messages: [] };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setStored(fresh);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-primary px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4" />
          Chat to the team
        </button>
      )}
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex h-[min(640px,calc(100vh-1.5rem))] flex-col border border-border bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px]">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Monogram />
              <div>
                <p className="font-display text-base leading-tight">Chat to the team</p>
                <p className="text-xs text-muted-foreground">Homes by Hines</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                aria-label="New conversation"
                title="New conversation"
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {stored && <ChatWindow key={stored.id} stored={stored} />}
        </div>
      )}
    </>
  );
}

function ChatWindow({ stored }: { stored: Stored }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { conversationId: stored.id } }),
    [stored.id],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: stored.id,
    messages: stored.messages,
    transport,
    onError: (error) => {
      const msg = error.message || "";
      if (msg.includes("429")) toast.error("We're busy right now — please try again in a moment.");
      else if (msg.includes("402")) toast.error("Chat is unavailable right now. Please use the enquiry form.");
      else toast.error("The message didn't send. Please try again.");
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: stored.id, messages }));
    }
  }, [messages, status, stored.id]);

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  return (
    <>
      <Conversation className="flex-1">
        <ConversationContent className="gap-5 px-4 py-5">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              <p className="font-display text-xl text-foreground">How can we help?</p>
              <p className="mt-2">
                Tell us about your house, site or garden. We plan and manage the whole job — architects,
                builders, council, building control — and you pay the trades directly.
              </p>
            </div>
          )}
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent
                className={
                  message.role === "user"
                    ? "group-[.is-user]:rounded-none group-[.is-user]:bg-foreground group-[.is-user]:text-background"
                    : "bg-transparent p-0"
                }
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <MessageResponse key={i}>{part.text}</MessageResponse>;
                  }
                  if (part.type === "tool-submit_enquiry") {
                    return (
                      <Tool key={i} defaultOpen={false}>
                        <ToolHeader type={part.type} state={part.state} title="Enquiry sent to the team" />
                        <ToolContent>
                          <ToolOutput output={part.output} errorText={part.errorText} />
                        </ToolContent>
                      </Tool>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <Shimmer className="text-sm">The team is typing…</Shimmer>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t border-border p-3">
        <PromptInput
          onSubmit={({ text }) => {
            if (!text.trim() || busy) return;
            sendMessage({ text });
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            autoFocus
            placeholder="Ask about your project…"
            className="min-h-12"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </>
  );
}
