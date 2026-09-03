import { createFileRoute, Link } from "@tanstack/react-router";

import heroImage from "@/assets/hero-renovation.jpg";
import projectOne from "@/assets/project-one.jpg";
import projectTwo from "@/assets/project-two.jpg";
import projectThree from "@/assets/project-three.jpg";

const title = "Homes by Hines — Renovation & Property Development";
const description =
  "A British renovation and property development company restoring period homes and delivering considered new schemes.";

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

const projects = [
  {
    image: projectOne,
    name: "Albany Terrace",
    location: "Full refurbishment · Bath",
    caption:
      "A neglected Georgian townhouse taken back to brick, replanned, and finished with restored joinery throughout.",
  },
  {
    image: projectTwo,
    name: "Chapel Lane",
    location: "Rear extension · Oxfordshire",
    caption:
      "Reclaimed stock brick and dark steel glazing opening a tight Victorian plan onto a walled garden.",
  },
  {
    image: projectThree,
    name: "Weaver's Row",
    location: "Two-house development · Suffolk",
    caption:
      "A pair of houses built to sit quietly on a village street — slate, sash windows, proper proportions.",
  },
];

function Home() {
  return (
    <>
      <section className="relative">
        <img
          src={heroImage}
          alt="A Victorian red-brick townhouse under renovation with scaffolding to the front elevation"
          width={1920}
          height={1280}
          className="h-[78vh] min-h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-6 pb-16">
            <p className="eyebrow text-primary-foreground/80">
              Renovation &amp; Property Development
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.1] text-primary-foreground sm:text-6xl">
              Old houses, put right. New ones, built properly.
            </h1>
            <p className="mt-6 max-w-xl text-primary-foreground/80">
              Homes by Hines takes on period refurbishments, extensions and small
              residential developments across Britain — run directly, finished
              carefully, handed over clean.
            </p>
            <Link
              to="/about"
              hash="enquire"
              className="mt-9 inline-block bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Discuss a project
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-14 border-t border-border pt-14 md:grid-cols-2 md:gap-20">
          <div>
            <p className="eyebrow text-primary">01 — Renovation</p>
            <h2 className="mt-4 text-3xl">Work that respects the building</h2>
            <p className="mt-4 text-muted-foreground">
              Full refurbishments, extensions, loft and outbuilding conversions.
              We keep what is worth keeping — the cornice, the sash, the floor
              — and rebuild the rest to a standard that will outlast us.
            </p>
          </div>
          <div>
            <p className="eyebrow text-primary">02 — Development</p>
            <h2 className="mt-4 text-3xl">Small schemes, seen through</h2>
            <p className="mt-4 text-muted-foreground">
              Site appraisal, planning, build and handover on one- to
              six-unit residential schemes. One team from the first survey to
              the final snag, with the costs held where we said they would be.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-stone-band">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-3xl">Selected work</h2>
            <Link
              to="/work"
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              All capability
            </Link>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.name}>
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="aspect-[4/3] w-full object-cover"
                />
                <h3 className="mt-5 text-xl">{project.name}</h3>
                <p className="eyebrow mt-2 text-muted-foreground">
                  {project.location}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {project.caption}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <dl className="grid gap-10 border-y border-border py-12 sm:grid-cols-3">
          {[
            ["18 years", "Building and developing"],
            ["60+ homes", "Renovated and delivered"],
            ["South & East", "Counties covered"],
          ].map(([figure, label]) => (
            <div key={label}>
              <dt className="font-display text-4xl">{figure}</dt>
              <dd className="eyebrow mt-3 text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl font-display text-3xl text-primary-foreground sm:text-4xl">
            Have a house, a site, or an idea of one?
          </h2>
          <Link
            to="/about"
            hash="enquire"
            className="inline-block shrink-0 bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start an enquiry
          </Link>
        </div>
      </section>
    </>
  );
}
