import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { TeamChat } from "@/components/team-chat";
import { Reveal } from "@/components/reveal";
import { WorkCarousel, type WorkSlide } from "@/components/work-carousel";
import gardenAfter from "@/assets/garden-east-london-after.jpg.asset.json";
import gardenBefore from "@/assets/garden-east-london-before.jpg.asset.json";
import kitchenAfter from "@/assets/kitchen-maidstone-image-3.jpg.asset.json";
import kitchenBefore from "@/assets/kitchen-maidstone-image-2.jpg.asset.json";
import allingtonGardenAfter from "@/assets/garden-allington-after.png.asset.json";
import allingtonGardenBefore from "@/assets/garden-allington-before.png.asset.json";
import maidstoneExtensionBuild from "@/assets/maidstone-extension-build.jpg.asset.json";
import maidstoneScaffold from "@/assets/maidstone-scaffold.jpg.asset.json";

const title = "Homes by Hines — Renovation, Development & Landscaping";
const description =
  "We project-manage renovations, developments and gardens across Kent and London, England. Architects, builders, council and building control — all handled.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: allingtonGardenAfter.url },
      { name: "twitter:image", content: allingtonGardenAfter.url },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GeneralContractor",
          name: "Homes by Hines",
          description,
          email: "hello@homesbyhines.co.uk",
          telephone: "01234 567 890",
          areaServed: "United Kingdom",
        }),
      },
    ],
  }),
  component: Home,
});

const slides: WorkSlide[] = [
  {
    image: kitchenAfter.url,
    beforeImage: kitchenBefore.url,
    name: "Kitchen redesign",
    meta: "Full kitchen redesign · Semi-detached house · Maidstone",
    caption:
      "A cramped kitchen in a semi-detached house in Maidstone opened up and rebuilt: grey shaker units, marble-effect worktops and a herringbone floor.",
    alt: "Grey shaker kitchen with marble-effect worktops and herringbone floor",
    beforeAlt: "Cramped kitchen with cream cabinets and laminate worktops before renovation",
  },
  {
    image: gardenAfter.url,
    beforeImage: gardenBefore.url,
    name: "Rear garden, terraced house",
    meta: "Garden landscaping · East London",
    caption:
      "A rubble-filled plot cleared and rebuilt — new turf, raised planting, fresh decking and a re-laid side path.",
    alt: "Rear garden with newly laid lawn, planting bed and timber decking",
    beforeAlt: "Overgrown rear garden with collapsed outbuilding and waste before clearance",
  },
  {
    image: allingtonGardenAfter.url,
    beforeImage: allingtonGardenBefore.url,
    name: "Garden refurbishment, Allington",
    meta: "Garden refurbishment · Allington · 6 weeks",
    caption:
      "Patio and patchy lawn replaced with full-width decking, level artificial grass, new fencing and a covered seating area.",
    alt: "Refurbished garden with composite decking, artificial lawn and pergola seating area",
    beforeAlt: "Tired garden with block-paved patio and patchy lawn before refurbishment",
  },
];

const heroSlides = [
  {
    image: allingtonGardenAfter.url,
    alt: "A refurbished rear garden with composite decking, level lawn and a covered seating area",
    place: "Allington",
    label: "Garden refurbishment",
  },
  {
    image: maidstoneExtensionBuild.url,
    alt: "A rear extension under construction in blockwork at a Maidstone home",
    place: "Maidstone",
    label: "Extension, in build",
  },
  {
    image: gardenAfter.url,
    alt: "Rear garden with newly laid lawn, planting bed and timber decking",
    place: "East London",
    label: "Garden landscaping",
  },
  {
    image: maidstoneScaffold.url,
    alt: "Scaffolding around a Maidstone house during extension and renovation works",
    place: "Maidstone",
    label: "Renovation, in build",
  },
  {
    image: kitchenAfter.url,
    alt: "Grey shaker kitchen with marble-effect worktops and herringbone floor",
    place: "Maidstone",
    label: "Kitchen redesign",
  },
];

function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % heroSlides.length),
      6000,
    );
    return () => window.clearInterval(id);
  }, []);

  const current = heroSlides[active] ?? heroSlides[0];
  if (!current) return null;

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {heroSlides.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={i === active ? slide.alt : ""}
            aria-hidden={i !== active}
            width={1920}
            height={1280}
            className={`slow-zoom absolute inset-0 h-full w-full object-cover transition-opacity duration-[2500ms] ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="estimate-backdrop absolute inset-0" />
      <HeroCaption place={current.place} label={current.label} />
    </>
  );
}

function HeroCaption({ place, label }: { place: string; label: string }) {
  return (
    <div className="absolute inset-x-8 bottom-5 hidden items-end justify-between gap-4 text-xs text-muted-foreground lg:flex">
      <span key={place + label} className="hero-caption">
        {place}
        <br />
        <span className="mt-1 block">{label}</span>
      </span>
      <Link to="/work" className="underline underline-offset-4">
        View our work ↗
      </Link>
    </div>
  );
}

const pillars = [
  {
    index: "01",
    label: "Renovation",
    heading: "Work that respects the building",
    body: "Full refurbishments, extensions, loft and outbuilding conversions. We keep what is worth keeping — the cornice, the sash, the floor — and rebuild the rest to a standard that will outlast us.",
  },
  {
    index: "02",
    label: "Development",
    heading: "Small schemes, seen through",
    body: "Site appraisal, architects, planning, building control and delivery on one- to six-unit residential schemes. One point of contact from the first survey to the final snag.",
  },
  {
    index: "03",
    label: "Landscaping",
    heading: "Gardens that finish the job",
    body: "Outdoor spaces cleared, levelled and planted: decking, lawns, fencing, paths, raised beds and lighting. Built to the same detail as the house, so the whole property holds together.",
  },
];

function Home() {
  return (
    <>
      <section className="estimate-home relative isolate overflow-hidden">
        <HeroSlideshow />
        <div className="estimate-stage relative mx-auto flex h-full w-full max-w-3xl min-h-0 flex-col px-5 sm:px-8">
          <div className="estimate-heading shrink-0 text-center">
              <p className="text-xs font-medium text-muted-foreground">
                Homes by Hines · Kent &amp; London
              </p>
              <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-5xl">
                Tell us what you're building.
              </h1>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Describe your project. Refine the details. Find your budget.
              </p>
          </div>
          <div className="estimate-experience min-h-0 min-w-0 flex-1 text-foreground">
          <TeamChat inline />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="grid gap-14 md:grid-cols-3 md:gap-10">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.index} delay={index * 120} as="article">
              <div className="border-t border-foreground pt-8">
                <p className="eyebrow flex items-baseline gap-3 text-primary">
                  <span className="font-display text-base">{pillar.index}</span>
                  {pillar.label}
                </p>
                <h2 className="mt-5 text-3xl sm:text-4xl">{pillar.heading}</h2>
                <p className="mt-5 text-muted-foreground">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-primary-foreground/20 pb-8">
              <div>
                <p className="eyebrow text-primary">Portfolio</p>
                <h2 className="mt-4 font-display text-3xl text-primary-foreground sm:text-5xl">
                  Selected work
                </h2>
              </div>
              <p className="max-w-xs text-sm text-primary-foreground/60">
                Drag, or use the arrows. Recent completed projects, photographed on site.
              </p>
            </div>
          </Reveal>
          <Reveal delay={140} className="mt-12">
            <WorkCarousel slides={slides} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <dl className="grid gap-10 border-y border-border py-14 sm:grid-cols-3">
            {[
              ["18 years", "Building and developing"],
              ["60+ homes", "Renovated and delivered"],
              ["Kent & London", "Areas covered"],
            ].map(([figure, label]) => (
              <div key={label}>
                <dt className="font-display text-4xl sm:text-5xl">{figure}</dt>
                <dd className="eyebrow mt-4 text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="bg-stone-band">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-2xl font-display text-3xl sm:text-5xl">
                Have a house, a site, or an idea of one?
              </h2>
              <Link
                to="/about"
                hash="enquire"
                className="inline-block shrink-0 bg-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start an enquiry
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
