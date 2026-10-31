import { Download, Mail, MapPin, Pencil, Ruler, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gbp, type EstimateResult } from "@/lib/estimating/types";

export function EstimateCard({
  estimate,
  onAction,
}: {
  estimate: EstimateResult;
  onAction?: (text: string) => void;
}) {
  const s = estimate.specification;
  function download() {
    const text = [
      "Homes by Hines — Indicative estimate",
      s.description,
      s.location ?? "Location unconfirmed",
      estimate.total
        ? `${gbp(estimate.total.low)}–${gbp(estimate.total.high)} | Expected: ${gbp(estimate.total.expected)}`
        : "Manual pricing review required — no complete budget available",
      ...estimate.lines.map(
        (l) =>
          `${l.name}: ${l.quantity.expected.toFixed(2)} ${l.unit} × ${gbp(l.rates.expected)} = ${gbp(l.cost.expected)}`,
      ),
      ...estimate.missing,
      ...estimate.assumptions,
      ...estimate.exclusions,
      "Initial estimate only. Final pricing depends on site survey, confirmed specifications and necessary technical assessments.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `homes-by-hines-estimate-${estimate.id ?? "review"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <article className="my-3 w-full min-w-0 border border-border bg-card text-card-foreground">
      <div className="border-b border-border p-5">
        <p className="eyebrow text-primary">Homes by Hines · Indicative estimate</p>
        <h3 className="mt-3 text-2xl capitalize">{s.category.replaceAll("_", " ")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {s.location && (
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {s.location}
            </span>
          )}
          {s.length && s.width && (
            <span className="flex items-center gap-1">
              <Ruler size={13} />
              {s.length} × {s.width}m
            </span>
          )}
          {estimate.createdAt && (
            <span className="flex items-center gap-1">
              <CalendarDays size={13} />
              {new Date(estimate.createdAt).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        {estimate.total ? (
          <>
            <p className="text-sm text-muted-foreground">
              Estimated project budget · {estimate.confidence.toLowerCase()} confidence
            </p>
            <p className="mt-2 font-display text-3xl">
              {gbp(estimate.total.low)}–{gbp(estimate.total.high)}
            </p>
            <p className="mt-2 text-sm">
              Expected cost: <strong>{gbp(estimate.total.expected)}</strong>
            </p>
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              {(
                [
                  ["Labour", "labour"],
                  ["Materials", "materials"],
                  ["Equipment, waste & specialist costs", "other"],
                ] as const
              ).map(([name, cat]) => (
                <div key={cat} className="flex justify-between gap-4">
                  <dt>{name}</dt>
                  <dd>
                    {gbp(
                      estimate.lines
                        .filter((l) => l.category === cat)
                        .reduce((n, l) => n + l.cost.expected, 0),
                    )}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt>Coordination & delivery ({estimate.markupPercent}%)</dt>
                <dd>{gbp(estimate.markup.expected)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Applicable VAT</dt>
                <dd>{estimate.vat ? gbp(estimate.vat.expected) : "To confirm"}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <h4 className="text-xl">Ready for a pricing review</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              We've recorded your scope. A reliable total needs confirmed pricing and the details
              below.
            </p>
            <ul className="mt-4 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {estimate.missing.slice(0, 5).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            {estimate.missing.length > 5 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {estimate.missing.length - 5} further items flagged for the team.
              </p>
            )}
          </>
        )}
        <details className="mt-5 border-t border-border pt-3 text-xs">
          <summary className="cursor-pointer font-medium">
            Scope, calculations & assumptions
          </summary>
          <div className="mt-3 space-y-3">
            {estimate.lines.map((l) => (
              <p key={l.id}>
                <strong>{l.name}</strong>
                <br />
                {l.quantity.expected.toFixed(2)} {l.unit} × {gbp(l.rates.expected)} ={" "}
                {gbp(l.cost.expected)}
                {l.workers
                  ? ` · ${l.workers} worker(s), ${l.days?.expected.toFixed(2)} working days`
                  : ""}
                <br />
                <span className="text-muted-foreground">
                  {l.verified ? "Verified" : "Provisional"} · {l.source}
                </span>
              </p>
            ))}
            {[...estimate.assumptions, ...estimate.exclusions, ...estimate.warnings].map((a, i) => (
              <p key={i}>{a}</p>
            ))}
          </div>
        </details>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          This is an initial estimate, not a binding quotation. Final pricing depends on a site
          survey, confirmed specifications and necessary structural or technical assessments. Any
          recommended contingency is separate from our price.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {onAction && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction("I'd like to refine my estimate.")}
              >
                <Pencil />
                Refine
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction("I'd like the team to email my estimate.")}
              >
                <Mail />
                Email estimate
              </Button>
              <Button
                size="sm"
                onClick={() => onAction("I'd like to arrange a site visit and formal quotation.")}
              >
                Arrange a site visit
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Download estimate"
            title="Download estimate"
            onClick={download}
          >
            <Download />
          </Button>
        </div>
      </div>
    </article>
  );
}
