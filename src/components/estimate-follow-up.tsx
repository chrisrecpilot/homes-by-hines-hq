import { Phone, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EstimateFollowUp({ onAction, disabled = false }: { onAction: (text: string) => void; disabled?: boolean }) {
  return <div className="shrink-0 border-b border-border py-3">
    <p className="mb-2 text-xs text-muted-foreground">An initial idea of the cost. Shall we discuss it or arrange a visit for a formal quotation?</p>
    <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={disabled} onClick={() => onAction("I'd like to request a callback about this project.")}><Phone />Request a callback</Button>
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => onAction("I'd like to request a site visit for this project.")}><CalendarDays />Arrange a site visit</Button>
    </div>
  </div>;
}