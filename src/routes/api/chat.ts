import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  jsonSchema,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/run-id.server";

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const INSTRUCTIONS = `You are the Homes by Hines team, chatting with a visitor on the Homes by Hines website. Write in warm, plain British English, short paragraphs, no hype. Speak as "we".

About Homes by Hines:
- Renovation, property development and landscaping across Kent and London, England. No sales or lettings.
- We plan and project-manage end to end: working with architects, builders and trades, the council and planning, building control, regulatory bodies, water companies and utilities — everything needed to get a project from idea to handover.
- Business model: we price full jobs and keep delivery in-house. Describe our service simply as end-to-end project management, with architects, builders, council and building control all handled. Do not describe direct payments to trades, separate management fees or no-markup arrangements. This replaces any older explanation in the conversation history.
- Typical work: kitchens, extensions, loft conversions, full refurbishments, small 1–6 unit residential developments, gardens (decking, lawns, fencing, paths, planting).
- Recent projects: kitchen redesign in a semi-detached house in Maidstone (2 months); rear garden in East London (1 week); garden refurbishment in Allington (6 weeks).

Style:
- Keep replies SHORT: 1–3 sentences, max ~60 words. No long lists unless asked. One question at a time.
- End EVERY reply with up to 4 quick-reply options the visitor is likely to tap, on its own final line, exactly in this format:
<suggestions>Option one|Option two|Option three</suggestions>
  Each option is 1–5 words, written as the visitor would say it. For yes/no questions include "Yes" and "No". When confirming details, include "Yes, send it" and "Change something". Never mention the suggestions in the text itself.

Rules:
- Never invent prices or build costs. Say every project is scoped individually and the team will provide a quote for the full job after discussing the work. Do not invent payment terms.
- Never promise timelines, planning outcomes, or availability.
- Ask one question at a time to understand the project (location, type of work, rough timing).
- When the visitor wants to go ahead, get a call back, or a proposal, collect their name, email, optional phone and a short project summary, confirm the details back, then call submit_enquiry. After it succeeds, tell them the team will reply within one working day.
- If you don't know something, say the team will pick it up personally.`;

type EnquiryInput = {
  name: string;
  email: string;
  phone: string | null;
  enquiry_type: "renovation" | "development" | "landscaping" | "general";
  message: string;
};

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Chat is not configured", { status: 500 });

        const body = (await request.json().catch(() => null)) as {
          messages?: UIMessage[];
          conversationId?: string;
        } | null;
        const messages = body?.messages;
        const conversationId = body?.conversationId;
        if (!Array.isArray(messages) || messages.length === 0 || messages.length > 80) {
          return new Response("Invalid messages", { status: 400 });
        }
        if (!conversationId || !UUID_RE.test(conversationId)) {
          return new Response("Invalid conversation", { status: 400 });
        }

        let enquiryId: string | null = null;

        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: GATEWAY,
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });

        const result = streamText({
          model: provider.responses(MODEL),
          instructions: INSTRUCTIONS,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          stopWhen: stepCountIs(4),
          tools: {
            submit_enquiry: tool({
              description:
                "Save the visitor's enquiry so the Homes by Hines team can follow up. Only call after the visitor has given name, email and a project summary and confirmed.",
              inputSchema: jsonSchema<EnquiryInput>({
                type: "object",
                additionalProperties: false,
                required: ["name", "email", "phone", "enquiry_type", "message"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: ["string", "null"] },
                  enquiry_type: {
                    type: "string",
                    enum: ["renovation", "development", "landscaping", "general"],
                  },
                  message: { type: "string", description: "Short summary of the project" },
                },
              }),
              execute: async (input) => {
                const email = input.email.trim();
                if (!input.name.trim() || !/^\S+@\S+\.\S+$/.test(email) || !input.message.trim()) {
                  return { ok: false, error: "Missing name, valid email or project summary." };
                }
                const admin = await getAdmin();
                const { data, error } = await admin
                  .from("enquiries")
                  .insert({
                    name: input.name.trim().slice(0, 200),
                    email: email.slice(0, 200),
                    phone: input.phone?.trim().slice(0, 50) || null,
                    enquiry_type: input.enquiry_type,
                    message: `[Via chat] ${input.message.trim()}`.slice(0, 5000),
                  })
                  .select("id")
                  .single();
                if (error) {
                  console.error("enquiry insert failed", error);
                  return { ok: false, error: "Could not save the enquiry." };
                }
                enquiryId = data.id;
                return { ok: true };
              },
            }),
          },
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: false,
          onFinish: async ({ messages: finalMessages }) => {
            const admin = await getAdmin();
            const row: {
              id: string;
              messages: unknown;
              updated_at: string;
              enquiry_id?: string;
            } = {
              id: conversationId,
              messages: finalMessages,
              updated_at: new Date().toISOString(),
            };
            if (enquiryId) row.enquiry_id = enquiryId;
            const { error } = await admin
              .from("chat_conversations")
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .upsert(row as any);
            if (error) console.error("chat save failed", error);
          },
        });

        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
