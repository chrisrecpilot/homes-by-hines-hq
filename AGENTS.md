<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Team chat streams via server route /api/chat (AI SDK + Lovable AI Gateway); conversations saved server-side to chat_conversations and in browser localStorage; chat-collected leads go into enquiries. Why: one lead inbox, staff can review chats.
- Admin access = role in user_roles, auto-granted by DB trigger to confirmed emails on the allowed domain; all staff tables gated by has_role(admin) RLS. Why: signup alone must never grant access.
- Visitor analytics are first-party: PageTracker posts to /api/track, stored in page_views. Chat quick replies come from a <suggestions> line the model appends, stripped client-side.
- Estimating uses deterministic quantity/person-day calculations with whole-penny money, editable admin-only catalogue data and immutable estimate snapshots; AI orchestrates tools but never supplies prices. Why: traceable costs and reliable revisions.
- Estimates validate mandatory extension inputs and major phase coverage before pricing; needs_input has no money, incomplete costs remain internal, and only applicable regional/storey benchmarks or scope-complete costs feed the shared headlineRange selector. Why: intent and partial allowances must never masquerade as whole-project budgets.
- Chat visual choices (e.g. roof) flow through a <choices>set-id</choices> tag parsed client-side into image cards in src/components/visual-choices.tsx; selections are ordinary user messages that trigger recalculation. Why: structured answers without a second tool round-trip.
- A persistent EstimatePanel and the sole current EstimateCard derive from the newest calculate_estimate output and hide money during pending or stale revisions. Why: the header and card must never show conflicting or obsolete budgets.
- Visitor estimate/chat ownership uses a random browser capability token stored only as a SHA-256 hash server-side; private uploads are checked against that session on every use. Why: a conversation UUID alone is not authorization.
- Homepage embeds the existing AI Elements conversation and composer; other public pages retain the floating chat. Why: the project description remains in one continuous estimating conversation.
- Homepage estimating uses a viewport-bounded grid with the composer outside the scrollable conversation and a desktop image/introduction column. Why: messages and estimates must not push the input off the first screen.
