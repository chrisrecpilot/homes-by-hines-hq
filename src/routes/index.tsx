import { createFileRoute, Link } from "@tanstack/react-router";

import { TeamChat } from "@/components/team-chat";
import { Reveal } from "@/components/reveal";
import { WorkCarousel, type WorkSlide } from "@/components/work-carousel";
import gardenAfter from "@/assets/garden-east-london-after.jpg.asset.json";
import gardenBefore from "@/assets/garden-east-london-before.jpg.asset.json";
import kitchenAfter from "@/assets/kitchen-maidstone-image-3.jpg.asset.json";
import kitchenBefore from "@/assets/kitchen-maidstone-image-2.jpg.asset.json";
import allingtonGardenAfter from "@/assets/garden-allington-after.png.asset.json";
import allingtonGardenBefore from "@/assets/garden-allington-before.png.asset.json";

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
      <section className="estimate-home grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="estimate-intro relative min-w-0 overflow-hidden bg-ink">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={allingtonGardenAfter.url}
              alt="A refurbished rear garden with composite decking, level lawn and a covered seating area"
              width={1920}
              height={1280}
              className="ken-burns h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-ink/60" />
          <div className="relative flex h-full flex-col justify-center px-6 py-6 lg:px-12 lg:py-12 xl:px-16">
            <div className="max-w-lg">
              <p className="text-xs text-primary-foreground/80">
                Homes by Hines · Kent &amp; London
              </p>
              <h1 className="mt-3 font-display text-3xl leading-tight text-primary-foreground lg:mt-6 lg:text-5xl xl:text-6xl">
                Tell us what you're building.
              </h1>
              <p className="mt-3 max-w-sm text-sm text-primary-foreground/85 lg:mt-6 lg:text-lg">
                Your next project starts here. An AI-assisted estimate, backed by our team.
              </p>
              <p className="mt-8 hidden border-t border-primary-foreground/25 pt-5 text-sm text-primary-foreground/80 lg:block">
                Renovation. Development. Landscaping.
                <br />
                <span className="mt-2 block">
                  One team, from the first idea to the final detail.
                </span>
              </p>
            </div>
            <div className="absolute inset-x-12 bottom-10 hidden items-end justify-between gap-4 border-t border-primary-foreground/25 pt-4 text-xs text-primary-foreground/80 lg:flex xl:inset-x-16">
              <span>
                Allington
                <br />
                <span className="mt-1 block text-primary-foreground">Garden refurbishment</span>
              </span>
              <Link to="/work" className="underline underline-offset-4">
                View our work ↗
              </Link>
            </div>
          </div>
        </div>
        <div className="min-h-0 min-w-0 bg-background text-foreground">
          <TeamChat inline />
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
