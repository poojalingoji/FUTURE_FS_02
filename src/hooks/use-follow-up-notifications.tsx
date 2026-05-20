import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "browser_notify_enabled";
const NOTIFIED_KEY = "browser_notify_sent";

export function isBrowserNotifyEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1" && typeof Notification !== "undefined" && Notification.permission === "granted";
}

export function setBrowserNotifyEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
}

export function useFollowUpNotifications() {
  useEffect(() => {
    if (!isBrowserNotifyEnabled()) return;
    let cancelled = false;

    const check = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const sentRaw = localStorage.getItem(NOTIFIED_KEY);
      let sent: { date: string; ids: string[] } = sentRaw ? JSON.parse(sentRaw) : { date: today, ids: [] };
      if (sent.date !== today) sent = { date: today, ids: [] };

      const { data } = await supabase
        .from("leads")
        .select("id, full_name, follow_up_date")
        .eq("follow_up_date", today);
      if (cancelled || !data?.length) return;

      for (const lead of data) {
        if (sent.ids.includes(lead.id)) continue;
        try {
          new Notification("Follow-up reminder", {
            body: `Follow up with ${lead.full_name} today.`,
            icon: "/favicon.ico",
            tag: `lead-${lead.id}`,
          });
          sent.ids.push(lead.id);
        } catch {
          /* ignore */
        }
      }
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(sent));
    };

    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
}
