import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enquirySchema } from "./enquiry";
export const submitQuoteRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ sessionId: z.string().uuid(), token: z.string().uuid(), enquiry: enquirySchema,
    transcript: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(10000) })).max(100) }).parse(input))
  .handler(async ({ data }) => {
    const { verifySession } = await import("./session.server");
    await verifySession(data.sessionId, data.token);
    const { readProjectState } = await import("./project-state.server");
    const { saveLead } = await import("./lead.server");
    const state = await readProjectState(data.sessionId);
    const id = await saveLead(data.sessionId, state, data.enquiry);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("chat_conversations").upsert({ id: data.sessionId, enquiry_id: id,
      messages: data.transcript.map((m) => ({ id: crypto.randomUUID(), role: m.role, parts: [{ type: "text", text: m.text }] })), updated_at: new Date().toISOString() });
    if (error) console.error("Follow-up transcript save failed", error.code);
    return { ok: true };
  });