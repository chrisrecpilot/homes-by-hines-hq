# Estimator Upgrade — Lean Plan

Goal: a homeowner describes their project, gets a credible indicative budget where possible, and can easily arrange a call or site visit. The plan reuses the existing images, project state and pricing logic, and adds no new dependencies.

## 1. Smarter conversation
- Tighten the chat instructions so the assistant sounds like a friendly, knowledgeable UK builder. It works out the project type from a plain description, never asks again for something already given, explains terms, and gives balanced advice (for example flat vs pitched roof) without claiming to be an architect or engineer.
- Replies are short by default and longer only when the customer asks for advice. There are no confirmation messages.

## 2. Several details in one message
- Add one "update project" tool so a message like "6m wide, French doors, flat roof, Maidstone" is applied in a single step. The server merges the changes into the saved project and then recalculates once.
- Add simple server-side unit conversion (m, ft, m², ft², "15 by 12 feet"), with everything stored in metric.

## 3. Reliable indicative pricing
- Add sourced UK benchmarks for kitchen refresh, replacement and full renovation, and for bathroom refresh, replacement and full refurbishment, using Kent/South East sources where possible.
- Each benchmark is approved provisional market guidance. It records its source, date, scope, inclusions, exclusions and VAT basis, and can be edited in the admin area.
- Customers see these labelled as "market guidance", never as our own detailed costing.
- Check pricing coverage early. If a range exists, show it before suggesting anything else. If none exists, recommend a site visit straight away instead of asking more questions.

## 4. Phone-first follow-up
- When the customer wants a quote, callback or visit, the assistant asks in this exact order:
  1. "Of course. What's your name?"
  2. "And what's the best number to reach you on?"
  3. "Would you like to add an email address as well?" (optional; skipping it is fine)
- Contact details are never requested before a price is shown, where pricing is available.
- The enquiry is saved with the project details and current estimate. The phone number becomes required and email optional, enforced both on the server and in the database rules. There is no marketing opt-in.
- The admin enquiry list shows phone first, along with the project summary and estimate.
- The site's existing contact form keeps working; email becomes optional there too, and phone becomes required.

## 5. Restore useful choices (existing components only)
- Extension size cards (3×4, 4×5, 5×6, 6×6, custom, not sure) are always shown in the extension journey.
- The roof image picker comes up when roof type is asked and stays available as refinement after a price is shown. Selections remain editable.
- Kitchen and bathroom sizes are labelled with real areas (e.g. "Compact · up to 8 m²") instead of Small/Standard/Large, alongside an "enter my own" option.
- No new image categories.

## 6. Focused visual pass
- A more prominent homepage input ("Describe your project…", "Add photos or drawings"), with the estimator taking slightly more width than the photo on desktop and appearing higher on mobile.
- Tighter conversation spacing, and tapped choices no longer echo as large dark bubbles.
- A cleaner estimate card: a large range, then a single summary line (type · area · location · price type · VAT). Assumptions and inclusions are collapsible. Actions: Refine, Upload plans, Arrange a visit.

## 7. Security
- Prompt rules refuse requests for system prompts, keys, supplier data or other customers' details.
- The real protection is on the server: the AI's tools return only customer-safe data, chat text cannot change pricing settings or markup, uploaded text is treated as untrusted, and every tool checks the session.
- A quick scan for any secrets committed to the repo.

## 8. Testing
- Regression tests for unit conversion, multi-detail updates, kitchen/bathroom benchmark selection and the phone-required enquiry rules.
- Browser runs on desktop and mobile of the extension, kitchen, bathroom and site-visit journeys, plus one prompt-injection attempt.

Deferred: new image categories, automatic PDF reading, extra analytics.

## Technical notes
- Files touched: `src/routes/api/chat.ts` (prompt, `update_project` tool, enquiry tool phone-first), `src/lib/estimating/{project-state,validation,calculate}.ts`, a small new `units.ts`, `project-state.server.ts`, `components/{team-chat,visual-choices,estimate-card,estimate-composer}.tsx`, `routes/index.tsx`, the admin enquiries view, and the about-page form.
- Database: replace the enquiries insert policy with a phone-required/email-optional check, make email nullable, and seed six benchmark rows (inserted as data, not as a migration).
