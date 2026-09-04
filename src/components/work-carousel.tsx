import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export type WorkSlide = {
  image: string;
  beforeImage?: string;
  name: string;
  meta: string;
  caption: string;
  alt: string;
  beforeAlt?: string;
};

const pad = (value: number) => String(value + 1).padStart(2, "0");

/** Shared before/after phase so every slide flips in step. */
function useBeforeAfterPhase(interval = 4000) {
  const [showAfter, setShowAfter] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setShowAfter((current) => !current);
    }, interval);
    return () => window.clearInterval(id);
  }, [interval]);

  return showAfter;
}


export function WorkCarousel({ slides }: { slides: WorkSlide[] }) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    duration: 32,
  });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect).on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect).off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!embla) return;
      if (event.key === "ArrowLeft") embla.scrollPrev();
      if (event.key === "ArrowRight") embla.scrollNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embla]);

  const active = slides[selected];
  const showAfter = useBeforeAfterPhase();

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <figure
              key={slide.name}
              className="relative min-w-0 shrink-0 grow-0 basis-[86%] pr-4 sm:basis-[62%] sm:pr-6 lg:basis-[48%]"
              aria-roledescription="slide"
              aria-label={`${pad(index)} — ${slide.name}`}
            >
              <div
                className={`group relative aspect-[4/3] w-full overflow-hidden bg-ink transition-[transform,opacity,filter] duration-[900ms] ease-out ${
                  index === selected
                    ? "scale-100 opacity-100 saturate-100"
                    : "scale-[1.04] opacity-45 saturate-[0.65]"
                }`}
              >
                {slide.beforeImage ? (
                  <img
                    src={slide.beforeImage}
                    alt={slide.beforeAlt ?? `${slide.name} before`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out"
                    style={{ opacity: showAfter ? 0 : 1 }}
                  />
                ) : null}
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading="lazy"
                  width={1600}
                  height={1200}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out"
                  style={{ opacity: slide.beforeImage && !showAfter ? 0 : 1 }}
                />
                <span className="pointer-events-none absolute left-0 top-0 bg-background px-4 py-2 font-display text-sm tabular-nums">
                  {pad(index)}
                </span>
                {slide.beforeImage ? (
                  <span
                    className={`pointer-events-none absolute bottom-0 left-0 px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors duration-500 ${
                      showAfter
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground"
                    }`}
                  >
                    {showAfter ? "After" : "Before"}
                  </span>
                ) : null}
              </div>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 border-t border-primary-foreground/15 pt-8 md:flex-row md:items-start md:justify-between">
        <div key={active?.name} className="reveal reveal-in max-w-xl">
          <p className="eyebrow text-primary">{active?.meta}</p>
          <h3 className="mt-3 font-display text-2xl text-primary-foreground sm:text-3xl">
            {active?.name}
          </h3>
          <p className="mt-3 text-sm text-primary-foreground/70">
            {active?.caption}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-display text-sm tabular-nums text-primary-foreground">
              {pad(selected)}
            </span>
            <span className="relative block h-px w-28 bg-primary-foreground/25">
              <span
                className="absolute left-0 top-0 block h-px bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${((selected + 1) / slides.length) * 100}%` }}
              />
            </span>
            <span className="text-sm tabular-nums text-primary-foreground/50">
              {pad(slides.length - 1)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => embla?.scrollPrev()}
              aria-label="Previous project"
              className="flex h-11 w-11 items-center justify-center border border-primary-foreground/30 text-primary-foreground transition-colors hover:border-primary hover:bg-primary"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              aria-label="Next project"
              className="flex h-11 w-11 items-center justify-center border border-primary-foreground/30 text-primary-foreground transition-colors hover:border-primary hover:bg-primary"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
