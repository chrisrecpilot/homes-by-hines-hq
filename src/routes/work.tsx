import { createFileRoute, Link } from "@tanstack/react-router";

import { Reveal } from "@/components/reveal";
import { PhotoFadePair } from "@/components/photo-fade";
import gardenAfter from "@/assets/garden-east-london-after.jpg.asset.json";
import gardenBefore from "@/assets/garden-east-london-before.jpg.asset.json";
import kitchenBeforeOne from "@/assets/kitchen-maidstone-image.jpg.asset.json";
import kitchenBeforeTwo from "@/assets/kitchen-maidstone-image-2.jpg.asset.json";
import kitchenAfterOne from "@/assets/kitchen-maidstone-image-3.jpg.asset.json";
import kitchenAfterTwo from "@/assets/kitchen-maidstone-image-4.jpg.asset.json";
import allingtonGardenBefore from "@/assets/garden-allington-before.png.asset.json";
import allingtonGardenAfter from "@/assets/garden-allington-after.png.asset.json";


const title = "Renovation, Development & Landscaping — Homes by Hines";
const description =
  "End-to-end planning and project management for renovations, developments and gardens — architects, builders, council, building control and utilities, all coordinated. You pay the trades directly.";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/work" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/work" }],
  }),
  component: WorkPage,
});

const capability = [
  {
    heading: "Period refurbishment",
    body: "Whole-house works on Georgian, Victorian and Edwardian stock: structural repair, damp and timber, rewires and replumbs, restored joinery and plaster.",
  },
  {
    heading: "Extensions",
    body: "Side returns, rear and wrap-around extensions in brick, stone and timber, detailed to read as part of the original house rather than bolted onto it.",
  },
  {
    heading: "Conversions",
    body: "Lofts, cellars, garages and outbuildings brought into use with proper insulation, daylight and headroom — not the cheapest possible box.",
  },
  {
    heading: "Residential development",
    body: "One- to six-unit schemes: land appraisal, feasibility, planning and delivery, with a build programme and cost plan you can hold us to.",
  },
  {
    heading: "Landscaping & gardens",
    body: "Clearance, levelling, planting, decking, fencing, paths and outdoor lighting. We treat the garden as part of the same project, not an afterthought.",
  },
];

const process = [
  {
    step: "01",
    heading: "Site appraisal",
    body: "We walk the property, take the survey, and tell you plainly what is possible, what it involves and who needs to be brought in.",
  },
  {
    step: "02",
    heading: "Design & approvals",
    body: "We brief the architect and engineers, handle the council and planning, building control, party walls and the water company — so nothing waits on a handover.",
  },
  {
    step: "03",
    heading: "Build",
    body: "We source and schedule vetted builders and trades, run the programme and the site, and report weekly. You pay each trade directly — no markup in between.",
  },
  {
    step: "04",
    heading: "Handover",
    body: "Building control sign-off, snagging closed out, certificates, warranties and manuals collated, and a call back at six months.",
  },
];

type Project = {
  images?: string[];
  beforeImages?: string[];
  aspect?: string;
  name: string;
  meta: string;
  before?: string;
  after?: string;
  comingSoon?: boolean;
  note?: string;
};

const projects: Project[] = [
  {
    images: [kitchenAfterTwo.url, kitchenAfterOne.url],
    beforeImages: [kitchenBeforeOne.url, kitchenBeforeTwo.url],
    aspect: "aspect-[3/4]",
    name: "Kitchen redesign",
    meta: "Full kitchen redesign · Semi-detached house · Maidstone · 2 months",
    before:
      "A cramped kitchen in a semi-detached house in Maidstone: cream cabinets, laminate worktops, tiled splashbacks and a dark cooker recess, with the room still split by the original partition.",
    after:
      "Shaker units in soft grey, marble-effect worktops and a full-height bank of cabinetry, herringbone floor, brass tap and Belfast sink, with a seating peninsula opening onto the garden doors.",
  },
  {
    images: [gardenAfter.url],
    beforeImages: [gardenBefore.url],
    aspect: "aspect-[3/4]",
    name: "Rear garden, terraced house",
    meta: "Garden landscaping · East London · 1 week",
    before:
      "A collapsed timber outbuilding, rotten decking and fly-tipped waste filling the whole plot, with the boundary hedge left to run wild.",
    after:
      "Cleared and levelled, new turf laid to the length of the garden, raised planting bed, fresh decking off the house and a re-laid concrete side path.",
  },
  {
    images: [allingtonGardenAfter.url],
    beforeImages: [allingtonGardenBefore.url],
    aspect: "aspect-[4/3]",
    name: "Garden refurbishment, Allington",
    meta: "Garden refurbishment · Allington · 6 weeks",
    before:
      "A tired block-paved patio, patchy lawn and mixed fence panels, with the far end of the garden given over to worn borders and storage.",
    after:
      "Full-width composite decking off the house, artificial lawn laid level across the plot, new close-board fencing and a pergola-covered seating and hot tub area.",
  },
  {
    name: "Garden landscaping",
    meta: "Garden project · Details to follow",
    comingSoon: true,
    note: "Another garden transformation, recently completed. Photographs coming soon.",
  },
  {
    name: "Loft conversion",
    meta: "Upstairs loft conversion · Details to follow",
    comingSoon: true,
    note: "An upstairs loft turned into usable living space. Photographs coming soon.",
  },
  {
    name: "Kitchen extension",
    meta: "Kitchen extension · Details to follow",
    comingSoon: true,
    note: "A rear kitchen extension opening the ground floor onto the garden. Photographs coming soon.",
  },
];


function WorkPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-14">
        <p className="eyebrow text-primary">Capability</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl">
          We plan it, manage it and deal with everyone — you pay the trades
          directly
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Homes by Hines runs your project end to end: architects, builders and
          trades, the council, building control, regulatory bodies, water and
          utilities. The trades invoice you directly, so you see exactly what the
          work costs. We charge a clear fee for planning and managing it.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {capability.map((item) => (
            <div key={item.heading} className="bg-background p-8">
              <h2 className="text-2xl">{item.heading}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
          <div className="flex flex-col justify-between bg-background p-8">
            <div>
              <h2 className="text-2xl">Start a project</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Tell us what you are looking at and we will reply with plain advice and a clear fee proposal.
              </p>
            </div>
            <Link
              to="/about"
              hash="enquire"
              className="mt-8 inline-block border border-foreground px-6 py-3 text-center text-xs uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
            >
              Enquire now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-10 border-y border-border py-14 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div>
            <p className="eyebrow text-primary">How we charge</p>
            <h2 className="mt-4 text-3xl">You pay the trades. We charge for the management.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              ["Trades paid direct", "Builders, electricians, plumbers and landscapers invoice you themselves. No hidden markup on labour or materials."],
              ["One management fee", "Our fee covers planning, design coordination, approvals and running the job from first survey to handover."],
              ["We deal with everyone", "Architects, engineers, council, building control, regulators and the water company — one point of contact: us."],
            ].map(([h, b]) => (
              <div key={h}>
                <h3 className="text-lg">{h}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-band">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl">How a project runs</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-4">
            {process.map((stage) => (
              <li key={stage.step} className="border-t border-foreground/20 pt-5">
                <span className="eyebrow text-primary">{stage.step}</span>
                <h3 className="mt-3 text-xl">{stage.heading}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{stage.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl sm:text-5xl">Projects</h2>
        <div className="mt-14 space-y-20">
          {projects.map((project, index) => (
            <Reveal key={project.name} as="article">
              <div className="grid gap-8 border-t border-foreground pt-10 md:grid-cols-2 md:gap-14">
                <div
                  className={`space-y-4 ${index % 2 === 1 ? "md:order-2" : ""}`}
                >
                  {project.comingSoon ? (
                    <div className="flex aspect-[4/3] w-full items-center justify-center border border-dashed border-border bg-muted/40 px-8 text-center">
                      <p className="eyebrow text-muted-foreground">
                        Photographs coming soon
                      </p>
                    </div>
                  ) : (
                    <PhotoFadePair
                      beforeImages={project.beforeImages ?? []}
                      afterImages={project.images ?? []}
                      name={project.name}
                      aspect={project.aspect}
                    />
                  )}
                </div>
                <div className="md:pt-2">
                  <h3 className="font-display text-2xl sm:text-3xl">
                    {project.name}
                  </h3>
                  <p className="eyebrow mt-3 text-muted-foreground">
                    {project.meta}
                  </p>
                  {project.comingSoon ? (
                    <p className="mt-8 border-l border-border pl-5 text-sm text-muted-foreground">
                      {project.note}
                    </p>
                  ) : (
                  <div className="mt-8 space-y-6">
                    <div className="border-l border-border pl-5">
                      <p className="eyebrow text-muted-foreground">Before</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {project.before}
                      </p>
                    </div>
                    <div className="border-l border-primary pl-5">
                      <p className="eyebrow text-primary">After</p>
                      <p className="mt-2 text-sm">{project.after}</p>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl font-display text-3xl text-primary-foreground sm:text-4xl">
            Tell us what you are looking at.
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
