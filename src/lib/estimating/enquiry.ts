import { z } from "zod";

/** Phone-first follow-up: phone required, email optional. Mirrors the enquiries insert policy. */
export const enquirySchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(50).refine((p) => { const d = p.replace(/\D/g, ""); return d.length >= 7 && d.length <= 15; }),
  email: z.string().trim().max(200).email().nullable().or(z.literal("").transform(() => null)),
  enquiry_type: z.enum(["renovation", "development", "landscaping", "general"]),
  request: z.enum(["site_visit", "callback", "formal_quote", "estimate_copy"]),
  message: z.string().trim().min(1).max(3000),
});
