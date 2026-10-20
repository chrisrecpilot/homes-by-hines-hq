import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Team sign in — Homes by Hines" },
      { name: "description", content: "Sign in to the Homes by Hines team area." },
      { property: "og:title", content: "Team sign in — Homes by Hines" },
      { property: "og:description", content: "Sign in to the Homes by Hines team area." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const fieldClass =
  "mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      navigate({ to: "/admin", replace: true });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <p className="eyebrow text-primary">Team only</p>
      <h1 className="mt-4 font-display text-4xl">
        {mode === "signin" ? "Sign in" : "Create team account"}
      </h1>
      {sent ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Check your inbox and click the confirmation link, then come back and sign in.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5 border border-border bg-card p-8">
          <label className="block text-sm">
            Email
            <input name="email" type="email" required autoComplete="email" className={fieldClass} />
          </label>
          <label className="block text-sm">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className={fieldClass}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "First time? Create an account" : "Have an account? Sign in"}
          </button>
        </form>
      )}
    </section>
  );
}
