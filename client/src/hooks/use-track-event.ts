import { useCallback } from "react";
import { getAuthHeaders } from "@/lib/auth-context";

export type TrackEventType =
  | "video_play"
  | "video_complete"
  | "audio_play"
  | "page_view"
  | "login"
  | "video_save"
  | "video_unsave"
  | "audio_save"
  | "audio_unsave"
  | "video_like"
  | "video_unlike";

export interface TrackEventPayload {
  eventType: TrackEventType;
  resourceId?: string;
  resourceTitle?: string;
  resourceType?: "video" | "audio" | "rss" | "page";
  metadata?: Record<string, any>;
}

async function sendEvent(payload: TrackEventPayload) {
  try {
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently ignore — analytics must never break the app
  }
}

export function useTrackEvent() {
  return useCallback((payload: TrackEventPayload) => {
    sendEvent(payload);
  }, []);
}

// Standalone fire-and-forget tracker (for use outside components)
export { sendEvent as trackEvent };
