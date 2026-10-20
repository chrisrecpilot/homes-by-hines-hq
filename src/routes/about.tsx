import { createFileRoute } from "@tanstack/react-router";

import { EnquiryForm } from "@/components/enquiry-form";

const title = "About & Contact — Homes by Hines";
const description =
  "Who we are, how we work, and how to reach Homes by Hines about a renovation, development or landscaping project.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const standards = [
  [
    "You pay the trades directly",
    "Every builder and trade invoices you themselves. You see the real cost of the work; we charge a fee for managing it.",
  ],
  [
    "We deal with everyone",
    "Architects, engineers, the council, building control, regulatory bodies and the water company — coordinated by us, so you have one point of contact.",
  ],
  [
    "Old-building literacy",
    "Lime where lime belongs, breathable build-ups, and repair before replacement.",
  ],
  [
    "A clean site",
    "Dust protection, tidy at the end of each day, and neighbours kept informed.",
  ],
];

function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <p className="eyebrow text-primary">About</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl">
          We plan it, manage it and see it through
        </h1>
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
          <p className="text-muted-foreground">
            Homes by Hines began on site — a small team taking on the
            refurbishments other firms found awkward: listed frontages, failing
            structures, gardens left to run wild, houses that had been altered
            badly for fifty years. That work taught us how buildings actually
            fail, and how they should be put back.
          </p>
          <p className="text-muted-foreground">
            Today we plan and project-manage renovations, developments and
            gardens end to end — from the architect and the planning application
            to building control sign-off. You pay the trades directly and we
            charge a fee for running the job, so the costs stay transparent.
          </p>
        </div>
      </section>

      <section className="bg-stone-band">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl">How we work</h2>
          <div className="mt-10 grid gap-px bg-foreground/15 sm:grid-cols-2">
            {standards.map(([heading, body]) => (
              <div key={heading} className="bg-stone-band p-8">
                <h3 className="text-xl">{heading}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <p className="eyebrow text-primary">Contact</p>
            <h2 className="mt-4 text-3xl">Start an enquiry</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Tell us about the property or the site. We reply to every enquiry
              ourselves, usually within one working day.
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="eyebrow text-muted-foreground">Email</dt>
                <dd className="mt-1">hello@homesbyhines.co.uk</dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Telephone</dt>
                <dd className="mt-1">01234 567 890</dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Office hours</dt>
                <dd className="mt-1">Monday to Friday, 8am – 5pm</dd>
              </div>
            </dl>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
