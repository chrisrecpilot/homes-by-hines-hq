# Current tasks

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
- [ ] Expand the visual selection library (doors, finishes, flooring, kitchen/bathroom levels) — P2.
- [ ] Improve architectural drawing/PDF interpretation — uploads preserved; PDFs currently stored for team review without content analysis.
- [ ] Seed approved provisional baselines for non-extension categories (kitchen, bathroom, loft, garden) so they price like extensions.
- [ ] Verify admin editing and actual-cost review end-to-end — requires a confirmed team account; session minting reports no auth users.
- [ ] Extend completed-job calibration to task-level quantities and productivity recommendations — requires actual job records for meaningful validation.
