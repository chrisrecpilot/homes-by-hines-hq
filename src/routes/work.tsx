import { createFileRoute, Link } from "@tanstack/react-router";

import projectOne from "@/assets/project-one.jpg";
import projectTwo from "@/assets/project-two.jpg";
import projectThree from "@/assets/project-three.jpg";

const title = "Renovation & Development — Homes by Hines";
const description =
  "Refurbishments, extensions, conversions and small residential developments, from site appraisal through to handover.";

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
];

const process = [
  {
    step: "01",
    heading: "Site appraisal",
    body: "We walk the property, take the survey, and tell you plainly what is possible and what it will realistically cost.",
  },
  {
    step: "02",
    heading: "Design & planning",
    body: "Drawings, consultants and the planning or listed-building application, coordinated by us so nothing waits on a handover.",
  },
  {
    step: "03",
    heading: "Build",
    body: "Directly employed trades, a fixed programme, weekly reporting, and a site kept in a state you would not mind visiting.",
  },
  {
    step: "04",
    heading: "Handover",
    body: "Commissioning, snagging closed out before you move in, warranties and manuals collated, and a call back at six months.",
  },
];

const projects = [
  {
    image: projectOne,
    name: "Albany Terrace",
    meta: "Georgian townhouse · Bath · 11 months",
    before:
      "Subdivided into bedsits in the 1970s, with the original plan lost and the front elevation failing.",
    after:
      "Returned to a single family house: replanned ground floor, restored cornice and shutters, new services throughout.",
  },
  {
    image: projectTwo,
    name: "Chapel Lane",
    meta: "Rear extension · Oxfordshire · 5 months",
    before:
      "A dark galley kitchen and a lean-to with no foundation to speak of.",
    after:
      "Reclaimed stock brick, dark steel glazing and a level threshold onto a re-laid walled garden.",
  },
  {
    image: projectThree,
    name: "Weaver's Row",
    meta: "Two-house development · Suffolk · 14 months",
    before: "An overgrown infill plot between two listed cottages.",
    after:
      "Two houses on slate and sash proportions, consented at the first attempt and sold before completion.",
  },
  {
    image: projectFive,
    name: "Fell Cottage",
    meta: "Whole-house renovation · Cumbria · 9 months",
    before:
      "Cement-pointed stone holding damp, a failing slate roof and rooms that had never been insulated.",
    after:
      "Repointed in lime, reroofed in reclaimed slate, and a quiet contemporary wing added to the rear.",
  },
  {
    image: projectSix,
    name: "Millstream House",
    meta: "Kitchen & garden room · Wiltshire · 4 months",
    before: "A partitioned back-of-house with one small window onto the garden.",
    after:
      "One lime-plastered room with a hand-built kitchen and crittall doors the full width of the wall.",
  },
];

function WorkPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-14">
        <p className="eyebrow text-primary">Capability</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl">
          Renovation and development, run by the people doing the work
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          We are a small firm on purpose. The person who prices your job is on
          site while it is built, and there is no layer of account management
          between you and the trades.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {capability.map((item) => (
            <div key={item.heading} className="bg-background p-8">
              <h2 className="text-2xl">{item.heading}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
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
                  className={`overflow-hidden ${index % 2 === 1 ? "md:order-2" : ""}`}
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    loading="lazy"
                    width={1600}
                    height={1200}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.03]"
                  />
                </div>
                <div className="md:pt-2">
                  <h3 className="font-display text-2xl sm:text-3xl">
                    {project.name}
                  </h3>
                  <p className="eyebrow mt-3 text-muted-foreground">
                    {project.meta}
                  </p>
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
