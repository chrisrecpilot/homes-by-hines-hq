import type { UIMessage } from "ai";
export const QUOTE_STORAGE_KEY = "hbh-active-quote-v2";
export type StoredQuote = { id: string; token: string; messages: UIMessage[] };
export function readQuote(storage: Pick<Storage, "getItem">): StoredQuote | null {
  try {
    const value = JSON.parse(storage.getItem(QUOTE_STORAGE_KEY) ?? "null");
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return value && uuid.test(value.id) && uuid.test(value.token) && Array.isArray(value.messages) ? value : null;
  } catch { return null; }
}