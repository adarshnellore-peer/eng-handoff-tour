import type { HandoffEnableOptions } from "./types";

const DEFAULT_ENV_KEYS = [
  "REACT_APP_HANDOFF_ENABLED",
  "VITE_HANDOFF_ENABLED",
  "NEXT_PUBLIC_HANDOFF_ENABLED",
  "PUBLIC_HANDOFF_ENABLED",
];

function readEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  // Vite client
  if (typeof import.meta !== "undefined") {
    const meta = import.meta as ImportMeta & { env?: Record<string, string> };
    if (meta.env?.[key]) {
      return meta.env[key];
    }
  }
  return undefined;
}

/**
 * Handoff is available when ANY gate matches:
 * - Local dev (NODE_ENV=development)
 * - Env flag (REACT_APP_/VITE_/NEXT_PUBLIC_HANDOFF_ENABLED=true)
 * - Hostname suffix (optional, e.g. staging)
 * - URL ?handoff=1
 *
 * Disable with ?handoff=0
 */
export function isHandoffEnabled(options?: HandoffEnableOptions): boolean {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("handoff") === "0") {
      return false;
    }
    if (params.get("handoff") === "1") {
      return true;
    }
  }

  const envKeys = options?.envKeys ?? DEFAULT_ENV_KEYS;
  for (const key of envKeys) {
    if (readEnv(key) === "true") {
      return true;
    }
  }

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const suffixes = options?.hostnameSuffixes ?? [];
  if (typeof window !== "undefined" && suffixes.length > 0) {
    const { hostname } = window.location;
    if (suffixes.some((s) => hostname.endsWith(s))) {
      return true;
    }
  }

  return false;
}
