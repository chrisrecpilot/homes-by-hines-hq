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
- Estimates validate category-specific inputs and approved whole-project scope coverage before pricing; needs_input has no money, incomplete costs remain internal, and only applicable regional/storey benchmarks or scope-complete costs feed the shared headlineRange selector. Why: intent and partial allowances must never masquerade as whole-project budgets.
- Visual choices map through a shared server-safe choice registry into validated project patches; the capability-protected server function persists choices and conversation turns without an AI round trip. Why: deterministic progression and retained customer corrections.
- The session project_state/project_revision is authoritative; optimistic compare-and-swap protects concurrent changes and immutable estimate_versions retains each pricing snapshot. The compact panel expands to the sole estimate card, hides superseded money, and stays valid for non-pricing chat. Why: one current budget independent of message history.
- Visitor estimate/chat ownership uses a random browser capability token stored only as a SHA-256 hash server-side; private uploads are checked against that session on every use. Why: a conversation UUID alone is not authorization.
- Homepage embeds the existing AI Elements conversation and composer; other public pages retain the floating chat. Why: the project description remains in one continuous estimating conversation.
- Homepage estimating uses a viewport-bounded grid with the composer outside the scrollable conversation and a desktop image/introduction column. Why: messages and estimates must not push the input off the first screen.
- Chat never renders tool-execution cards; only the latest valid EstimateCard and genuine errors surface, and the assistant never acknowledges answers ("noted/saved/updated") — selections silently update state. Why: customers should see a builder-like conversation, not an AI workflow.
- Structured questions use <choices> tags for editable service-specific sets; server functions return the deterministic next question and current project state, while natural language remains on the existing streaming AI route. Why: small predictable edits do not require full AI specification reconstruction.
- Extensions price early on type + size + storeys alone: an approved Kent & South East benchmark applies provisionally when location is null, disclosed as an assumption; locations are normalised server-side (UK postcodes, "near …"). Why: a credible budget in two or three interactions beats a complete questionnaire.

- Customer estimates pass through customerEstimate before crossing server boundaries; missing pricing and partial line costs remain solely in immutable admin snapshots. Why: customers and AI must not mistake internal diagnostics or allowances for whole-job prices.
- Kitchen benchmarks are scope/spec/region-matched whole-job records with applicability bounds; catalogue approval never seeds invented rates. Why: floor area alone cannot price cabinets, appliances and services.
- PDFs remain private team-review uploads because the configured model advertises text/image inputs only; the next drawing step requires a supported PDF extraction service and explicit measurement confirmation. Why: stored files must never be represented as analysed drawings.
- Chat applies customer details through one update_project tool: the model sends a partial patch in the customer's units, the server (buildPatch) converts to metric, drops any non-spec fields and reprices deterministically. Why: several changes in one sentence, and no chat text can touch prices or markup.
- Enquiries are phone-first: phone required and email optional, enforced in the shared enquirySchema and the enquiries insert policy; chat enquiries append the current project summary and shown budget. Why: the team follows up by phone.
