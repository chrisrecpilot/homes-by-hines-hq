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
import { z } from "zod";
import { projectSchema, type ProjectSpec } from "@/lib/estimating/types";

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
- Only add quick replies when there are useful discrete choices (project type, roof type, yes/no). They are OPTIONAL. Never add them when requesting a name, email, phone, measurements or a free-text description. Never offer hesitation, refusal, skipping or reluctance. If useful, add up to 4 on a final line:
<suggestions>Option one|Option two|Option three</suggestions>
  Each option is 1–5 words, written as the visitor would say it. For yes/no questions include "Yes" and "No". When confirming details, include "Yes, send it" and "Change something". Never mention the suggestions in the text itself.

Rules:
- You can now provide indicative cost-based estimates ONLY using calculate_estimate. Never invent quantities, person-days, rates, ranges, prices or financial arithmetic. Do not quote market-average prices as our prices.
- Ask one or two relevant questions at a time, reuse supplied dimensions and specifications. For an extension collect location, length/width, storeys, roof type, doors/openings, finishes, heating and whether a structural opening is needed. Other projects require only relevant scope. No contact details required for estimates.
- When asked to calculate, call calculate_estimate with the complete current specification. Null means unknown, not zero. Assumptions must be explicit; never assume structural design or foundation adequacy. Photographs help understand scope, not accurate dimensions. PDF drawings are stored for team review; do not claim to have read them.
- The tool derives quantities and costs from editable approved pricing and productivity. If review_required, do NOT present base/markup/partial lines as a complete budget. Explain briefly that local rates/specifications need confirmation and offer a survey. An incomplete estimate is saved for team review.
- If estimated, the estimate card shows the authoritative breakdown. Explain it is indicative, not a binding quotation. Missing VAT must never be presented as zero. Our 12% (admin-configured 10–15%) business allowance is part of the full job price, not a separate management-only service. Do not imply customers pay trades directly.
- Revisions replace the relevant measurements/specifications and call calculate_estimate again, preserving other known details. For unknown scope use general and request team review. Never promise instant numeric estimates when essential pricing is unavailable.
- Offer refine/change specifications, upload drawings, request email of estimate, site visit or formal quotation. Email requests go to the team via submit_enquiry; never claim an email was sent automatically.
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
          sessionToken?: string;
        } | null;
        const messages = body?.messages;
        const conversationId = body?.conversationId;
        if (!Array.isArray(messages) || messages.length === 0 || messages.length > 80) {
          return new Response("Invalid messages", { status: 400 });
        }
        if (!conversationId || !UUID_RE.test(conversationId)) {
          return new Response("Invalid conversation", { status: 400 });
        }
        if (!body?.sessionToken || !UUID_RE.test(body.sessionToken)) return new Response("Invalid conversation credentials", { status: 400 });
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) return new Response("Request not allowed", { status: 403 });
        const { verifySession } = await import("@/lib/estimating/session.server");
        try { await verifySession(conversationId, body.sessionToken); }
        catch { return new Response("Conversation access denied", { status: 403 }); }
        if (JSON.stringify(messages).length > 200000) return new Response("Conversation is too large", { status: 400 });
        const admin = await getAdmin();
        const modelMessages = structuredClone(messages);
        for (const message of modelMessages) {
          if (!["user", "assistant"].includes(message.role) || !Array.isArray(message.parts)) return new Response("Invalid message", { status: 400 });
          for (const part of message.parts) {
            if (part.type !== "file") continue;
            if (!part.url.startsWith("estimate-upload:")) return new Response("Invalid file reference", { status: 400 });
            const fileId = part.url.slice("estimate-upload:".length);
            if (!UUID_RE.test(fileId)) return new Response("Invalid file", { status: 400 });
            const { data: file } = await admin.from("estimate_uploads").select("*").eq("id", fileId).eq("session_id", conversationId).single();
            if (!file) return new Response("File access denied", { status: 403 });
            part.mediaType = file.mime_type;
            part.filename = file.name;
            if (file.mime_type === "application/pdf") {
              Object.assign(part, { type: "text", text: `[PDF drawing attached for team review: ${file.name}. Do not claim its contents have been analysed.]` });
            } else {
              const { data: downloaded, error } = await admin.storage.from("estimate-uploads").download(file.storage_path);
              if (error || !downloaded) return new Response("Uploaded photo is unavailable", { status: 400 });
              const bytes = new Uint8Array(await downloaded.arrayBuffer());
              let binary = "";
              for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
              part.url = `data:${file.mime_type};base64,${btoa(binary)}`;
            }
          }
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
          messages: await convertToModelMessages(modelMessages),
          abortSignal: request.signal,
          stopWhen: stepCountIs(4),
          tools: {
            calculate_estimate: tool({
              description: "Generate and save a deterministic cost-based indicative estimate from current project specifications. Unknown fields must be null. Never invent prices; missing approved pricing returns review_required.",
              inputSchema: jsonSchema<ProjectSpec>({
                type: "object", additionalProperties: false,
                required: ["category","location","length","width","height","storeys","openingArea","foundationDepth","foundationWidth","roof","bifolds","underfloorHeating","structuralOpening","description","assumptions","exclusions"],
                properties: {
                  category: { type: "string", enum: ["extension","loft","bathroom","kitchen","garden_wall","plastering","knock_through","repair","general"] },
                  location: { type: ["string","null"] },
                  length: { type: ["number","null"] }, width: { type: ["number","null"] }, height: { type: ["number","null"] }, storeys: { type: ["integer","null"] }, openingArea: { type: ["number","null"] }, foundationDepth: { type: ["number","null"] }, foundationWidth: { type: ["number","null"] },
                  roof: { type: ["string","null"], enum: ["flat","pitched","not_applicable",null] },
                  bifolds: { type: ["boolean","null"] }, underfloorHeating: { type: ["boolean","null"] }, structuralOpening: { type: ["boolean","null"] },
                  description: { type: "string" }, assumptions: { type: "array", items: { type: "string" } }, exclusions: { type: "array", items: { type: "string" } },
                },
              }),
              execute: async (input) => {
                try {
                  const spec = projectSchema.parse(input);
                  const { generateEstimate } = await import("@/lib/estimating/estimate.server");
                  return await generateEstimate(conversationId, spec);
                } catch (error) {
                  return { error: error instanceof Error ? error.message : "Could not calculate estimate" };
                }
              },
            }),
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
                const validation = z.object({ name: z.string().trim().min(1).max(200), email: z.string().trim().email().max(200), phone: z.string().max(50).nullable(), enquiry_type: z.enum(["renovation","development","landscaping","general"]), message: z.string().trim().min(1).max(4500) }).safeParse(input);
                if (!validation.success) return { ok: false, error: "Please check the contact details and project summary." };
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
          onError: (error) => error instanceof Error ? error.message : "Chat could not complete this request.",
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
