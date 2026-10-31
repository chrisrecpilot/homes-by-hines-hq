import { Download, Mail, MapPin, Pencil, Ruler, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gbp, type EstimateResult } from "@/lib/estimating/types";

const TYPE_LABELS = {
  benchmark: "Preliminary estimate · South East regional construction costs",
  provisional: "Provisional cost-based estimate",
  detailed: "Detailed cost-based estimate",
} as const;

export function EstimateCard({
  estimate,
  onAction,
}: {
  estimate: EstimateResult;
  onAction?: (text: string) => void;
}) {
  const s = estimate.specification;
  const bench = estimate.benchmarkEstimate;
  const isBenchmark = estimate.estimateType === "benchmark" && bench && !estimate.total;
  const shownRange = isBenchmark ? bench.range : estimate.total;
  function download() {
    const text = [
      "Homes by Hines — Indicative estimate",
      s.description,
      s.location ?? "Location unconfirmed",
      shownRange
        ? `${gbp(shownRange.low)}–${gbp(shownRange.high)} | Expected: ${gbp(shownRange.expected)}`
        : "Manual pricing review required — no complete budget available",
      estimate.estimateType ? `Estimate type: ${TYPE_LABELS[estimate.estimateType]}` : "",
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
        <p className="eyebrow text-primary">
          Homes by Hines · {estimate.estimateType ? TYPE_LABELS[estimate.estimateType] : "Estimate"}
        </p>
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
        {shownRange ? (
          <>
            <p className="text-sm text-muted-foreground">
              Your estimated building budget · {estimate.confidence.toLowerCase()} confidence
            </p>
            <p className="mt-2 font-display text-3xl">
              {gbp(shownRange.low)}–{gbp(shownRange.high)}
            </p>
            <p className="mt-2 text-sm">
              Expected cost: <strong>{gbp(shownRange.expected)}</strong>
              {!estimate.vatConfirmed && (
                <span className="text-muted-foreground"> · plus VAT (to confirm)</span>
              )}
            </p>
            {isBenchmark ? (
              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <p className="text-muted-foreground">
                  Based on {gbp(bench.perUnit.low)}–{gbp(bench.perUnit.high)} per {bench.unit} for a{" "}
                  {bench.specLevel ?? "standard specification"} ({bench.quantity}
                  {bench.unit}), from {bench.source}, checked{" "}
                  {new Date(bench.sourceDate).toLocaleDateString("en-GB")}.
                </p>
                {bench.marginIncluded && (
                  <p className="text-xs text-muted-foreground">
                    This regional benchmark already includes a builder's overhead and margin — we do
                    not add our coordination allowance on top of it.
                  </p>
                )}
                {bench.inclusions.length > 0 && (
                  <div className="text-xs">
                    <p className="font-medium">Includes</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                      {bench.inclusions.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {bench.exclusions.length > 0 && (
                  <div className="text-xs">
                    <p className="font-medium">Excludes</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                      {bench.exclusions.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
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
                {estimate.provisionalCount > 0 && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    {estimate.provisionalCount} of {estimate.lines.length} cost lines use approved
                    provisional allowances pending supplier verification.
                  </p>
                )}
              </dl>
            )}
            {estimate.missing.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {estimate.unpricedCount > 0
                  ? `${estimate.unpricedCount} item${estimate.unpricedCount === 1 ? "" : "s"} still need confirmed pricing and are not yet included above.`
                  : "Some details still need team confirmation."}
              </p>
            )}
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
