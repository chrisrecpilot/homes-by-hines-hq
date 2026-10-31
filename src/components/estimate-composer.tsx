import { ArrowUp, Paperclip, X } from "lucide-react";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ChatStatus } from "ai";

function Attachments() {
  const a = usePromptInputAttachments();
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="icon-lg"
        type="button"
        aria-label="Attach photos or drawings"
        title="Attach photos or drawings"
        onClick={a.openFileDialog}
      >
        <Paperclip />
      </Button>
      {a.files.map((f) => (
        <span key={f.id} className="flex max-w-44 items-center gap-1 text-xs text-muted-foreground">
          {f.mediaType.startsWith("image/") && <img src={f.url} alt={f.filename ?? "Attached photo"} className="size-10 shrink-0 rounded object-cover" />}
          <span className="truncate">{f.filename ?? "Photo"}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            aria-label={`Remove ${f.filename ?? "photo"}`}
            onClick={() => a.remove(f.id)}
          >
            <X />
          </Button>
        </span>
      ))}
    </div>
  );
}
export function EstimateComposer({
  onSend,
  status,
  onStop,
  hero = false,
  uploading = false,
}: {
  onSend: (message: PromptInputMessage) => Promise<void>;
  status: ChatStatus;
  onStop: () => void;
  hero?: boolean;
  uploading?: boolean;
}) {
  return (
    <PromptInput
      onSubmit={onSend}
      accept="image/jpeg,image/png,image/webp,application/pdf"
      maxFileSize={10 * 1024 * 1024}
      maxFiles={4}
      multiple
      onError={(e) => toast.error(e.message)}
      className="w-full text-foreground [&_[data-slot=input-group]]:rounded-lg [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-none"
    >
      <PromptInputTextarea
        aria-label={hero ? "Describe your building project" : "Message the team"}
        placeholder={
          hero
            ? "Describe your project… e.g. I want a 5m × 4m rear extension."
            : "Add details or ask about your project…"
        }
        className={
          hero ? "min-h-20 max-h-32 p-4 text-base lg:min-h-28" : "min-h-16 max-h-28 p-4 text-base"
        }
        maxLength={5000}
      />
      <PromptInputFooter className="items-center justify-between gap-2 px-2 pb-2">
        <div className="flex min-w-0 items-center gap-1">
          <Attachments />
          <p className="text-[11px] text-muted-foreground">
            {uploading ? "Uploading securely…" : "Photos & drawings"}
          </p>
        </div>
        <PromptInputSubmit
          status={status}
          onStop={onStop}
          disabled={uploading}
          size="icon-sm"
          className="size-11 shrink-0 rounded-md"
          aria-label={status === "streaming" ? "Stop reply" : "Send project description"}
        >
          {status !== "streaming" && status !== "submitted" ? <ArrowUp /> : undefined}
        </PromptInputSubmit>
      </PromptInputFooter>
    </PromptInput>
  );
}
