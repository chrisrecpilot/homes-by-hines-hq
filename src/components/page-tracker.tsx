import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const KEY = "hbh-visitor";

export function PageTracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const first = useRef(true);

  useEffect(() => {
    if (path.startsWith("/admin") || path.startsWith("/auth")) return;
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    const referrer = first.current ? document.referrer || null : null;
    first.current = false;
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId: id, path, referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);

  return null;
}
