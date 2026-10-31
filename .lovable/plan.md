# Full AI Estimator Upgrade — Plan

Goal: a customer describes their idea, taps a few clear choices, gets an honest price range, and refines it without starting again. The backend keeps pricing deterministic and secure.

## Phase 1 — Assistant, pricing and security

**1. A smarter, more natural assistant**
- Rewrite the chat instructions so the assistant sounds like a knowledgeable British builder: it infers the project type ("extend the kitchen into the garden" means rear extension), never asks twice for something already given, explains terms, and gives balanced advice (for example flat vs pitched roof) without claiming to be an architect, engineer or building-control officer.
- Add England-first regulatory awareness (planning, permitted development, Building Regs, CDM, certification). It should not assume the same rules apply in Wales, Scotland or Northern Ireland.
- Remove the hard reply-length limit: short by default, longer when the customer asks for advice.

**2. Understanding several changes in one message**
- A new structured "update project" tool lets the AI apply many fields at once, e.g. "6m wide, French doors, flat roof, three rooflights". The server validates these changes and merges them into the saved project, then recalculates once. Earlier details are kept unless the customer changes them.
- Unit conversion runs on the server (m, ft, m², ft², "15 by 12 feet") and everything is stored in metric. Footprint and total floor area are kept separate for double-storey projects.

**3. Pricing that reaches a real number**
- Find published UK figures for kitchen refresh, replacement and full renovation, and for bathroom refresh, replacement and full refurbishment, using Kent/South East sources where possible. Each figure is recorded as a whole-job benchmark with its source, date, region, spec level, inclusions, exclusions and VAT basis.
- Show the benchmark to customers only if it is approved. See the decision below.
- Check pricing coverage early. If a project type has no approved pricing, the assistant switches to a useful summary straight away: what drives the cost and an offer to arrange a survey. It never asks six questions and then shows a dead end.
- A price is never invented, and a partial subtotal is never shown as the full budget. The 12% markup is never added on top of market benchmarks.

**4. Security**
- Add prompt-injection rules and refusal behaviour for requests for system prompts, keys, supplier data or other customers' details.
- The real boundary is on the server: the AI's tools return only customer-safe data, pricing assumptions and markup cannot be changed by chat text, and uploaded file text is treated as untrusted.
- Add basic rate limiting on chat requests.
- Scan the repository for committed secrets and report what is found.

## Phase 2 — Look and feel

- **Homepage:** the estimator gets more width than the photo on desktop (about 60/40), with a larger input labelled "Describe your project…" and "Add photos or drawings". On mobile the input shows near the top and the photo shrinks to a slim band.
- **Choices:** bring back the extension size cards (3×4, 4×5, 5×6, 6×6, custom, not sure). Kitchen and bathroom sizes show real measurements (e.g. "Compact · up to 8 m²"). The roof image picker is always offered during refinement, and the door, wall, floor and rooflight choices stay available. Add kitchen layout cards (straight, L, U, island), a bathroom bath/shower/wet-room choice, and landscaping surfaces (patio, decking, fencing, turf). Images are used only where seeing the options helps.
- **Conversation:** a tapped choice no longer creates a large dark message bubble. The selected card stays highlighted and can be changed. A compact "Your project" summary lists the current answers, and tapping one edits it.
- **Estimate card:** a "Your estimated project budget" heading over a large price range, then a single summary line: project type · area · location · price type · confidence · VAT. Expandable sections cover assumptions, inclusions/exclusions and method. Labour/material splits appear only when they were genuinely calculated. Actions: Refine estimate, Upload plans, Arrange a survey.
- **Uploads:** PDFs are still saved for team review, and the chat says so honestly. Photos go to the model as images.

## Phase 3 — Verification
- Add regression tests for unit conversion, multi-field updates, the early coverage check, and the kitchen/bathroom benchmarks.
- Run the nine scenarios from the brief in the browser on desktop and mobile, and send screenshots along with a delivery report.

## Decision needed
The kitchen and bathroom figures will come from published UK cost guides, not your own job data. Option A: approve them as provisional benchmarks so customers see a range now, clearly labelled as market guidance. Option B: save them as drafts for you to approve in the admin panel first. Kitchens and bathrooms show no price until you do. Unless you choose B, I'll go with A.

## Technical notes
- Files: `src/routes/api/chat.ts` (prompt, new `update_project` tool, rate limit), `src/lib/estimating/{project-state,validation,calculate,units(new)}.ts`, `project-state.server.ts`, `components/{team-chat,visual-choices,estimate-card,estimate-composer}.tsx`, `routes/index.tsx`, a seed migration for the benchmark rows, new choice images generated only for kitchen layout, bathroom type and landscaping surfaces.
- Existing architecture is kept: the compare-and-swap project state, immutable estimate snapshots, the `customerEstimate` filter and capability tokens.
- Automatic PDF dimension reading is still out of scope. The current model accepts text and images only.
