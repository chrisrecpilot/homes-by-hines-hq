import { z } from "zod";
import { enquirySchema } from "./enquiry";
export const followUpSchema = z.object({ request: z.enum(["callback", "site_visit"]), step: z.enum(["name", "phone", "email", "address", "preference", "ready"]), name: z.string().default(""), phone: z.string().default(""), email: z.string().nullable().default(null), address: z.string().nullable().default(null), preference: z.string().nullable().default(null) });
export type FollowUp = z.infer<typeof followUpSchema>;
export function advanceFollowUp(flow: FollowUp, text: string): { flow: FollowUp; prompt: string; error?: boolean } {
  const value = text.trim();
  if (flow.step === "name") {
    if (!enquirySchema.shape.name.safeParse(value).success) return { flow, prompt: "What's your name?", error: true };
    return { flow: { ...flow, name: value, step: "phone" }, prompt: "And what's the best number to reach you on?" };
  }
  if (flow.step === "phone") {
    if (!enquirySchema.shape.phone.safeParse(value).success) return { flow, prompt: "Please enter a phone number with 7–15 digits.", error: true };
    return { flow: { ...flow, phone: value, step: "email" }, prompt: "Would you like to add an email address as well? (Optional.)" };
  }
  if (flow.step === "email") {
    const declined = /^(no|no thanks|no thank you|none|not needed|skip|don't have one)[.!]?$/i.test(value);
    const email = declined ? null : value;
    if (!enquirySchema.shape.email.safeParse(email).success) return { flow, prompt: "Please enter an email address, or say no if you'd prefer not to add one.", error: true };
    const next = flow.request === "site_visit" ? (flow.address ? "preference" : "address") : "ready";
    return { flow: { ...flow, email, step: next }, prompt: next === "address" ? "What's the site address or postcode?" : next === "preference" ? "Is there a preferred day, or morning or afternoon? You can leave that with us." : "" };
  }
  if (flow.step === "address") {
    if (!value || value.length > 500) return { flow, prompt: "Please enter the site address or postcode.", error: true };
    return { flow: { ...flow, address: value, step: "preference" }, prompt: "Is there a preferred day, or morning or afternoon? You can leave that with us." };
  }
  return { flow: { ...flow, preference: value.slice(0, 300) || null, step: "ready" }, prompt: "" };
}