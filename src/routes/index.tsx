import { createFileRoute, Link } from "@tanstack/react-router";

import { Reveal } from "@/components/reveal";
import { WorkCarousel, type WorkSlide } from "@/components/work-carousel";
import heroImage from "@/assets/hero-renovation.jpg";
import projectOne from "@/assets/project-one.jpg";
import projectTwo from "@/assets/project-two.jpg";
import projectThree from "@/assets/project-three.jpg";
import projectFour from "@/assets/project-four.jpg";
import projectFive from "@/assets/project-five.jpg";
import projectSix from "@/assets/project-six.jpg";
import gardenAfter from "@/assets/garden-east-london-after.jpg.asset.json";
import kitchenAfter from "@/assets/kitchen-maidstone-image-3.jpg.asset.json";
import allingtonGardenAfter from "@/assets/garden-allington-after.png.asset.json";

const title = "Homes by Hines — Renovation, Development & Landscaping";
const description =
  "A British renovation, property development and landscaping company restoring period homes, delivering considered new schemes and transforming gardens.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
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
    image: projectOne,
    name: "Albany Terrace",
    meta: "Full refurbishment · Orpington",
    caption:
      "A neglected Georgian townhouse taken back to brick, replanned, and finished with restored joinery throughout.",
    alt: "Restored Georgian townhouse interior with period detailing",
  },
  {
    image: kitchenAfter.url,
    name: "Kitchen redesign",
    meta: "Full kitchen redesign · Semi-detached house · Maidstone",
    caption:
      "A cramped kitchen in a semi-detached house in Maidstone opened up and rebuilt: grey shaker units, marble-effect worktops and a herringbone floor.",
    alt: "Grey shaker kitchen with marble-effect worktops and herringbone floor",
  },

  {
    image: projectFour,
    name: "No. 12 Sydney Place",
    meta: "Interior restoration · Maidstone",
    caption:
      "Cornice and shutters repaired rather than replaced, floors lifted and relaid, services hidden where they belong.",
    alt: "Restored drawing room with tall sash windows and original cornice",
  },
  {
    image: projectTwo,
    name: "Chapel Lane",
    meta: "Rear extension · Allington",
    caption:
      "Reclaimed stock brick and dark steel glazing opening a tight Victorian plan onto a walled garden.",
    alt: "Brick rear extension with steel glazing onto a garden",
  },
  {
    image: projectSix,
    name: "Millstream House",
    meta: "Kitchen & garden room · Eastbourne",
    caption:
      "A hand-built kitchen set into a lime-plastered shell, opened to the garden with crittall doors.",
    alt: "Dark green hand-built kitchen with marble worktop and brass fittings",
  },
  {
    image: projectThree,
    name: "Weaver's Row",
    meta: "Two-house development · Benfleet",
    caption:
      "A pair of houses built to sit quietly on a village street — slate, sash windows, proper proportions.",
    alt: "Pair of newly built traditional village houses",
  },
  {
    image: projectFive,
    name: "Fell Cottage",
    meta: "Whole-house renovation · Orpington",
    caption:
      "Stone repointed in lime, roof relaid in reclaimed slate, and a quiet contemporary wing added to the rear.",
    alt: "Renovated stone cottage at dusk with lit windows",
  },
  {
    image: gardenAfter.url,
    name: "Rear garden, terraced house",
    meta: "Garden landscaping · East London",
    caption:
      "A rubble-filled plot cleared and rebuilt — new turf, raised planting, fresh decking and a re-laid side path.",
    alt: "Rear garden with newly laid lawn, planting bed and timber decking",
  },
  {
    image: allingtonGardenAfter.url,
    name: "Garden refurbishment, Allington",
    meta: "Garden refurbishment · Allington · 6 weeks",
    caption:
      "Patio and patchy lawn replaced with full-width decking, level artificial grass, new fencing and a covered seating area.",
    alt: "Refurbished garden with composite decking, artificial lawn and pergola seating area",
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
    body: "Site appraisal, planning, build and handover on one- to six-unit residential schemes. One team from the first survey to the final snag, with the costs held where we said they would be.",
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImage}
            alt="A Victorian red-brick townhouse under renovation with scaffolding to the front elevation"
            width={1920}
            height={1280}
            className="ken-burns h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/25" />
        <div className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-end px-6 pb-20 pt-40">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-primary-foreground/70">
              <span className="block h-px w-10 bg-primary" aria-hidden="true" />
              Renovation, Development &amp; Landscaping
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-7 max-w-4xl font-display text-[2.6rem] leading-[1.04] text-primary-foreground sm:text-6xl lg:text-7xl">
              Old houses, put right.
              <br />
              New ones, built properly.
              <br />
              Gardens, transformed.
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-8 border-t border-primary-foreground/20 pt-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-lg text-primary-foreground/75">
                Homes by Hines takes on period refurbishments, extensions,
                small residential developments and garden landscaping across Kent,
                East Sussex and London — run directly, finished carefully, handed
                over clean.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/about"
                  hash="enquire"
                  className="inline-block bg-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Discuss a project
                </Link>
                <Link
                  to="/work"
                  className="inline-block border border-primary-foreground/35 px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-foreground"
                >
                  See the work
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
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
                Drag, or use the arrows. Nine recent projects across renovation,
                landscaping and development.
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
              ["Kent, Sussex & London", "Areas covered"],
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
