import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

const types = [
  { value: "renovation", label: "Renovation" },
  { value: "development", label: "Development" },
  { value: "general", label: "General" },
];

const fieldClass =
  "mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

export function EnquiryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || null,
      enquiry_type: String(data.get("enquiry_type") ?? "general"),
      message: String(data.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast.error("Please add your name, email and a short message.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("enquiries").insert(payload);
    setSubmitting(false);

    if (error) {
      toast.error("That didn't send. Please try again or call us.");
      return;
    }

    form.reset();
    setDone(true);
    toast.success("Thank you — we'll come back to you shortly.");
  }

  if (done) {
    return (
      <div className="border border-border bg-card p-8">
        <h3 className="text-2xl">Enquiry received</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you. We read every enquiry ourselves and will reply within one
          working day.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 text-xs uppercase tracking-[0.18em] text-primary"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          Name
          <input name="name" required className={fieldClass} autoComplete="name" />
        </label>
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className={fieldClass}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          Phone
          <input name="phone" className={fieldClass} autoComplete="tel" />
        </label>
        <label className="block text-sm">
          Enquiry about
          <select name="enquiry_type" defaultValue="renovation" className={fieldClass}>
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-5 block text-sm">
        The project
        <textarea
          name="message"
          required
          rows={5}
          className={fieldClass}
          placeholder="Where it is, what you're hoping to do, and roughly when."
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
