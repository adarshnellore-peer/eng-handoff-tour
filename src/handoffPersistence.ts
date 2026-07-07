import type { HandoffPersistedTourState } from "./types";

const STORAGE_KEY = "eng-handoff-tour-state";

export function readPersistedTourState(): HandoffPersistedTourState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as HandoffPersistedTourState;
    if (
      typeof parsed.manifestId !== "string" ||
      typeof parsed.handoffOn !== "boolean" ||
      typeof parsed.tourStarted !== "boolean" ||
      typeof parsed.stepIndex !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writePersistedTourState(state: HandoffPersistedTourState | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (!state || !state.handoffOn) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
