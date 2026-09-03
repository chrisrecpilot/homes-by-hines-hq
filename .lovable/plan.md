# Homes by Hines — website

A three-page marketing site for a British renovation and property development business, with enquiries saved to a backend you can review. No sales or lettings content.

## Brand direction

Traditional British, restrained and confident — not startup-modern.

- Signal red `#EF0107` as the hero/accent colour, used sparingly against warm stone, off-white and deep charcoal-navy.
- Typography: an English serif for headings (Playfair-style editorial weight), clean grotesque for body.
- Details: fine hairline rules, generous margins, square-ish corners, understated hover states. No gradients, no glassmorphism.

## Pages

**Home (`/`)**
- Full-bleed hero: red-toned overlay on a British period-property renovation image, name, one-line positioning, single CTA to enquire.
- Two-pillar split: Renovation and Property Development, each with a short statement.
- Selected work strip — three project cards (image, location, short caption).
- Credentials band (years building, homes delivered, areas covered) — placeholder numbers for you to confirm.
- Closing enquiry CTA.

**Renovation & Development (`/work`)**
- Capability statement: refurbishments, extensions, conversions, full-scheme development.
- Process in four numbered stages (site appraisal → design & planning → build → handover).
- Project gallery with before/after framing.
- Enquiry CTA.

**About + Contact (`/about`)**
- Company story, standards and approach.
- Contact details block.
- Enquiry form: name, email, phone, enquiry type (renovation / development / general), message.

## Enquiries

Lovable Cloud is enabled to store submissions. Each submission is written to an `enquiries` table with timestamp, name, email, phone, type and message. Anyone can submit; only signed-in staff can read, so submissions aren't publicly exposed. You'll be able to review them in the backend data view.

## Technical notes

- Routes: `src/routes/index.tsx`, `work.tsx`, `about.tsx`; shared header/footer in `__root.tsx`.
- Design tokens (colours, fonts, radii) defined in `src/styles.css`; fonts loaded via `<link>` in the root head.
- Hero and project imagery generated as assets under `src/assets/`.
- Form posts through a server function into the `enquiries` table with Zod validation; RLS: public insert, authenticated read, plus explicit grants.
- Per-page SEO metadata (title, description, og/twitter) on each route.

## Placeholders to replace

Phone, email, service areas, project names/locations and credential figures are placeholders — send me the real details and I'll swap them in.
