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
