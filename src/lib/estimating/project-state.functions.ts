import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { customerState, emptyProject, nextProjectQuestion, choicePatch } from "./project-state";
import { projectSchema, headlineRange } from "./types";
const credentials = z.object({ sessionId: z.string().uuid(), token: z.string().uuid() });
export const getProjectState = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => credentials.parse(v))
  .handler(async ({ data }) => {
    const { verifySession } = await import("./session.server");
    await verifySession(data.sessionId, data.token);
    const { readProjectState } = await import("./project-state.server");
    const state = await readProjectState(data.sessionId);
    return state ? customerState(state) : null;
  });
export const selectProjectChoice = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => credentials.extend({ revision: z.number().int().nonnegative(),
    set: z.string().max(50), value: z.string().max(80), message: z.string().max(500),
    category: projectSchema.shape.category.optional() }).parse(v))
  .handler(async ({ data }) => {
    const { verifySession } = await import("./session.server");
    await verifySession(data.sessionId, data.token);
    const { readProjectState, updateProjectState } = await import("./project-state.server");
    let state = await readProjectState(data.sessionId);
    let response = "";
    if (data.category) {
      const spec = emptyProject(data.category, data.message);
      if (data.category === "extension") spec.extensionType = "rear";
      state = await updateProjectState(data.sessionId, spec, data.revision, true);
    } else {
      const patch = choicePatch(data.set, data.value);
      if (patch) state = await updateProjectState(data.sessionId, patch, data.revision);
      else if (data.set === "refine" || data.set === "refine_room") {
        const replies: Record<string, string> = { roof: "Which roof would you prefer?\n<choices>roof</choices>", doors: "Which doors would you prefer?\n<choices>doors</choices>", finishes: "What exterior finish are you thinking?\n<choices>walls</choices>", photos: "You can attach photos or plans below. PDFs will be securely stored for the team to review.", survey: "Of course. What's your name?" };
        response = replies[data.value] ?? "What would you like to explore next?";
      } else if (data.set === "sizes") response = "What dimensions do you have in mind? An approximate length and width is enough.";
      else throw new Error("Choose an available option.");
    }
    if (!response && state) {
      response = state.pricingStatus === "needs_input" ? nextProjectQuestion(state.specification, state.estimate?.missingInputs)
        : state.estimate && headlineRange(state.estimate) && state.estimateRevision === state.revision ? nextProjectQuestion(state.specification)
        : "This one is best priced properly on site, as the scope varies too much for a reliable guide figure. We can arrange a free visit; just tap below or tell us more.\n<choices>refine_room</choices>";
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: conversation } = await supabaseAdmin.from("chat_conversations").select("messages").eq("id", data.sessionId).maybeSingle();
    const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
    const { error: saveError } = await supabaseAdmin.from("chat_conversations").upsert({ id: data.sessionId,
      messages: [...messages, { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: data.message }] },
        { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: response }] }], updated_at: new Date().toISOString() });
    if (saveError) console.error("Choice conversation save failed", saveError);
    return { state: state ? customerState(state) : null, response };
  });