import { createFileRoute } from "@tanstack/react-router";

function classifySource(referrer: string | null, host: string | null): string {
  if (!referrer) return "Direct";
  try {
    const r = new URL(referrer).hostname.replace(/^www\./, "");
    if (host && r === host.replace(/^www\./, "")) return "Internal";
    if (/google\./.test(r)) return "Google";
    if (/bing\./.test(r)) return "Bing";
    if (/instagram\./.test(r)) return "Instagram";
    if (/facebook\.|fb\./.test(r)) return "Facebook";
    if (/linkedin\./.test(r)) return "LinkedIn";
    if (/t\.co$|twitter\.|x\.com/.test(r)) return "X / Twitter";
    if (/checkatrade|rated ?people|mybuilder/.test(r)) return r;
    return r;
  } catch {
    return "Direct";
  }
}

function classifyDevice(ua: string): string {
  if (/bot|crawl|spider|slurp|preview/i.test(ua)) return "Bot";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  if (/mobi|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          visitorId?: string;
          path?: string;
          referrer?: string | null;
        } | null;
        const visitorId = String(body?.visitorId ?? "").slice(0, 64);
        const path = String(body?.path ?? "").slice(0, 300);
        if (!visitorId || !path.startsWith("/")) return new Response(null, { status: 400 });
        if (path.startsWith("/admin") || path.startsWith("/auth")) return new Response(null, { status: 204 });

        const ua = request.headers.get("user-agent") ?? "";
        const device = classifyDevice(ua);
        if (device === "Bot") return new Response(null, { status: 204 });

        const referrer = body?.referrer ? String(body.referrer).slice(0, 500) : null;
        const host = request.headers.get("host");
        const source = classifySource(referrer, host);
        // Cloudflare provides rough geo on the request
        const cf = (request as unknown as { cf?: { country?: string; city?: string } }).cf;
        const country = cf?.country ?? request.headers.get("cf-ipcountry") ?? null;
        const city = cf?.city ?? null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("page_views").insert({
          visitor_id: visitorId,
          path,
          referrer,
          source: source === "Internal" ? null : source,
          device,
          country,
          city,
        });
        if (error) console.error("page view insert failed", error);
        return new Response(null, { status: 204 });
      },
    },
  },
});
