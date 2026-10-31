import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const uploadEstimateFile = createServerFn({ method: "POST" })
  .inputValidator((value: FormData) => {
    if (!(value instanceof FormData)) throw new Error("Invalid upload");
    return value;
  }).handler(async ({ data }) => {
    const sessionId = z.string().uuid().parse(data.get("sessionId"));
    const token = z.string().uuid().parse(data.get("token"));
    const file = data.get("file");
    if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024) throw new Error("Choose a file up to 10MB.");
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) throw new Error("Choose a JPG, PNG, WebP or PDF.");
    const { verifySession } = await import("./session.server");
    await verifySession(sessionId, token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const valid = file.type === "application/pdf" ? new TextDecoder().decode(bytes.slice(0,5)) === "%PDF-" : file.type === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 : file.type === "image/png" ? bytes[0] === 137 && bytes[1] === 80 : new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP";
    if (!valid) throw new Error("The file contents do not match its format.");
    const path = `${sessionId}/${crypto.randomUUID()}`;
    const { error } = await supabaseAdmin.storage.from("estimate-uploads").upload(path, bytes, { contentType: file.type });
    if (error) throw new Error("Could not upload the file.");
    const { data: row, error: saveError } = await supabaseAdmin.from("estimate_uploads").insert({ session_id: sessionId, storage_path: path, name: file.name.slice(0,200), mime_type: file.type }).select("id").single();
    if (saveError || !row) {
      await supabaseAdmin.storage.from("estimate-uploads").remove([path]);
      throw new Error("Could not save the uploaded file.");
    }
    return { type: "file" as const, url: `estimate-upload:${row.id}`, mediaType: file.type, filename: file.name.slice(0,200) };
  });

export const getAdminUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ path: z.string().max(300) }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!allowed) throw new Error("Access denied");
    const { data: signed, error } = await context.supabase.storage.from("estimate-uploads").createSignedUrl(data.path, 60);
    if (error || !signed) throw new Error("File is unavailable");
    return { url: signed.signedUrl.replace(process.env["SUPABASE_URL"] ?? "", process.env["VITE_SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"]) };
  });