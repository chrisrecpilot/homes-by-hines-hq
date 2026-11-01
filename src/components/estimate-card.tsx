import { Download, Paperclip, MapPin, Pencil, Ruler, CalendarDays, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gbp, headlineRange, type EstimateResult } from "@/lib/estimating/types";

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
  const isBenchmark = estimate.estimateType === "benchmark" && bench;
  const shownRange = headlineRange(estimate);
  if (estimate.status === "needs_input") return null;
  const vatDisclosure = isBenchmark
    ? bench.vatBasis === "inclusive" ? "VAT included" : bench.vatBasis === "not_applicable" ? "VAT not applicable" : "plus VAT (to confirm)"
    : estimate.vatConfirmed ? (estimate.vat?.expected ? "VAT included" : "VAT not applicable") : "plus VAT (to confirm)";
  function download() {
    const text = [
      "Homes by Hines — Indicative estimate",
      s.description,
      s.location ?? "Location unconfirmed",
      shownRange
        ? `${gbp(shownRange.low)}–${gbp(shownRange.high)} | Expected: ${gbp(shownRange.expected)}`
        : "Manual pricing review required — no complete budget available",
      estimate.estimateType ? `Estimate type: ${TYPE_LABELS[estimate.estimateType]}` : "",
      vatDisclosure,
      "Any cost lines below are a separate build-up, not additions to a benchmark or a complete project subtotal.",
      ...(estimate.scopeComplete && !isBenchmark ? estimate.lines : []).map(
        (l) =>
          `${l.name}: ${l.quantity.expected.toFixed(2)} ${l.unit} × ${gbp(l.rates.expected)} = ${gbp(l.cost.expected)}`,
      ),
      ...estimate.customerNotes ?? [],
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
    <article className="budget-result my-3 w-full min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <div className="border-b border-border p-4 sm:p-5">
        <p className="text-xs font-medium text-primary">
          {isBenchmark && bench.unit === "job" ? "UK market guidance · not a quotation" : estimate.estimateType ? TYPE_LABELS[estimate.estimateType] : "Estimate"}
        </p>
        <h3 className="mt-2 text-xl">{shownRange ? "Your estimated project budget" : "Best priced on site"}</h3>
        <p className="mt-2 text-xs capitalize text-muted-foreground">{s.category.replaceAll("_", " ")} · {estimate.confidence.toLowerCase()} confidence</p>
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
      <div className="p-4 sm:p-5">
        {shownRange ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2 font-display text-3xl sm:text-4xl">
              <span>{gbp(shownRange.low)}</span><span className="text-border">–</span><span>{gbp(shownRange.high)}</span>
            </p>
            <p className="mt-2 text-sm">
              Expected cost: <strong>{gbp(shownRange.expected)}</strong>
              <span className="text-muted-foreground"> · {vatDisclosure}</span>
            </p>
            {isBenchmark ? (
              <details className="group mt-5 border-t border-border pt-4 text-sm">
                <summary className="cursor-pointer text-xs font-medium">
                  What this is based on
                </summary>
                <div className="mt-3 space-y-2">
                <p className="text-muted-foreground">
                  {bench.unit === "job"
                    ? <>Published market guidance for: {bench.specLevel ?? "this scope"}. Source: {bench.source}, reviewed{" "}</>
                    : <>Based on {gbp(bench.perUnit.low)}–{gbp(bench.perUnit.high)} per {bench.unit} for a{" "}
                  {bench.specLevel ?? "standard specification"} ({bench.quantity}
                  {bench.unit}), from {bench.source}, dated{" "}</>}
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
              </details>
            ) : (
              <details className="mt-5 border-t border-border pt-4 text-sm"><summary className="cursor-pointer text-xs font-medium">Calculated breakdown &amp; price method</summary><dl className="mt-3 space-y-2">
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
              </dl></details>
            )}
            {estimate.missing.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {estimate.unpricedCount > 0
                  ? isBenchmark ? "The separate cost breakdown is incomplete; the whole-project benchmark remains the preliminary budget." : `${estimate.unpricedCount} items need confirmed pricing.`
                  : "Some details still need team confirmation."}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              The scope varies too much for a reliable guide figure. A free visit lets us price it properly.
            </p>
          </>
        )}
        <details className="mt-5 border-t border-border pt-3 text-xs">
          <summary className="cursor-pointer font-medium">
            Assumptions &amp; inclusions / exclusions
          </summary>
          <div className="mt-3 space-y-3">
            {estimate.customerNotes?.map((note) => <p key={note}>{note}</p>)}
            {(estimate.scopeComplete && !isBenchmark ? estimate.lines : []).map((l) => (
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
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Indicative, not a binding quotation. Subject to a site visit and confirmed specifications. Contingency is separate.
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
                Refine estimate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction("I'd like to upload plans or photos.")}
              >
                <Paperclip />
                Upload plans
              </Button>
              <Button
                size="sm"
                onClick={() => onAction("I'd like to arrange a site visit and formal quotation.")}
              >
                <ArrowUpRight />
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
