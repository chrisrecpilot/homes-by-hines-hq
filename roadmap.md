# Current tasks

## World-class estimator UX/UI pass
- [ ] Centre the homepage experience over faded real-project photography; premium input, category pills and restrained motion.
- [ ] Add an editable project snapshot, refine result and image choices, and surface Garden room without invented pricing.
- [ ] Verify desktop/mobile, saved-state continuity and current estimating flows; capture both views.

## Full AI estimator upgrade (lean scope)
- [x] Expert UK-builder prompt with security rules; single update_project tool for multi-detail changes; ft/ft² conversion.
- [x] Sourced kitchen/bathroom market-guidance benchmarks (Checkatrade 2026, Fixatrader 2025), editable in admin.
- [x] Phone-first follow-up (name → phone → optional email); phone required/email optional in DB and form.
- [x] Measured kitchen/bathroom size cards, extension sizes/roof cards, site-visit refinement, lighter choice echoes, wider estimator, cleaner card.
- [x] 70 tests pass; kitchen, extension (natural language + revision + advice + injection), bathroom mobile and site-visit journeys verified.
- [ ] Chat rate limiting: no standard backend primitive yet. Needs your OK for an ad-hoc limit.
- [ ] Your own job data to replace national kitchen/bathroom guidance; loft/landscaping benchmarks still unsourced.

## Estimating experience improvement brief
- [x] P0: category-specific inputs, safe customer summaries/exports, scoped benchmark eligibility and regression tests; no invented category rates.
- [x] P1: capability-owned versioned project state, direct editable choices, deterministic progression and price continuity.
- [x] P1: compact mobile estimate, attachment previews/recovery and actionable admin diagnostics.
- [x] Verified natural extension/kitchen/bathroom journeys, editable roof choices, reload continuity, non-pricing discussion, safe download and private PDF upload; 57 tests pass, no browser errors or mobile overflow.
- [ ] Automatic PDF interpretation — configured model advertises text/image only; requires supported document extraction infrastructure and measurement-confirmation flow.
- [ ] Staff editing/actuals end-to-end verification — no confirmed team account exists; session minting reports no auth users.

## P0 — simplify the estimating experience
- [x] Hide all internal tool-execution cards from customers; only the current estimate card and genuine errors render.
- [x] Remove acknowledgement language ("noted/saved/updated"); selections silently update state and progress to the next question.
- [x] One-tap choice sets for size (3×4–6×6m, custom, not sure), storeys, roof/doors/walls/flooring and post-estimate refinement actions.
- [x] Price early: type + size + storeys trigger an immediate estimate on the approved Kent & South East baseline; location no longer blocks the first price and is asked naturally afterwards.
- [x] Seed approved double-storey Kent benchmark (£1,500–£2,200/m² total floor area); 6×6m double-storey prices 72m² at £108,000–£158,400.
- [x] Normalise UK postcodes and "near …" locations server-side (ME160PP → ME16 0PP).
- [x] Tested full journey A–G on desktop and mobile: no tool cards, no ack language, correct prices, no overflow, no console errors; 45 engine tests pass.

## Incomplete-estimate safeguards
- [x] Add minimum information and scope-completeness validation with distinct input, indicative, detailed and review statuses; 40 calculation tests passed.
- [x] Make chat collect size/storeys/location and preserve progressive benchmark estimates and selected specifications; starter returned needs_input without money; 36m² Maidstone returned indicative_estimate £64,800–£90,000, expected £77,400, plus VAT to confirm.
- [x] Keep card and header consistent, suppress invalid/stale prices, and preserve uploads and homepage layout; only newest valid card shown.
- [x] Extend selectable doors, exterior finishes and flooring; live French-to-sliding door and flat-roof selections verified, 7×5m recalculated £63,000–£87,500; desktop/mobile verified without errors or horizontal overflow.

- [x] Upgrade homepage estimating UX: first-screen mobile experience, desktop split layout, and contained conversation scrolling; verified mobile/desktop, live estimate, conversation restoration/reset and attachment controls.
- [x] Replace direct-trade-payment and separate-management-fee language across site copy, metadata and chat instructions with end-to-end delivery and full-job pricing.
- [x] Integrate prominent homepage quotation input with the existing conversation and private attachments.
- [x] Build editable pricing, settings, templates, immutable estimates and actual-cost review with admin-only access.
- [x] Implement deterministic quantities, person-day labour, missing-price handling, markup, VAT and ranges.
- [x] Connect estimating tools and present revisable estimates without collecting contact details first.

## P0 upgrade — fix estimate generation, visual choices, live pricing

- [x] Replace all-or-nothing pricing gate with tiered statuses (verified / approved provisional / missing) so provisional allowances still produce indicative ranges.
- [x] Seed approved provisional South East/Kent baselines for single-storey extension phases plus an approved regional £/m² benchmark (source, date, inclusions, VAT basis recorded).
- [x] Progressive pricing in chat: preliminary benchmark/provisional price early, refine automatically as details arrive, detailed cost-based estimate when data allows.
- [x] Distinguish preliminary benchmark vs provisional vs detailed estimates in the estimate card.
- [x] Visual roof selector (flat/pitched/not sure) with selectable image cards in chat.
- [x] Persistent compact estimate panel that updates as the specification changes and flags stale prices.
- [x] Re-test the 36m² Maidstone conversation end-to-end: £64,800–£90,000 + VAT benchmark headline, recalculation on roof choice and dimension change verified on desktop and mobile.
- [ ] Make visual choice images manageable from the admin area (currently a code registry in visual-choices.tsx).
- [x] Expand the visual selection library for French/bifold/sliding doors, brick/render and LVT/timber/tiles; selections persist and rerun validated pricing without invented product rates.
- [ ] Add kitchen/bathroom specification-level visuals — depends on a future category-pricing scope.
- [ ] Improve architectural drawing/PDF interpretation — uploads preserved; PDFs currently stored for team review without content analysis.
- [ ] Seed approved provisional baselines for non-extension categories (kitchen, bathroom, loft, garden) so they price like extensions.
- [ ] Verify admin editing and actual-cost review end-to-end — requires a confirmed team account; session minting reports no auth users.
- [ ] Extend completed-job calibration to task-level quantities and productivity recommendations — requires actual job records for meaningful validation.
