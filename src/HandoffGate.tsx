import type { ReactNode } from "react";
import type { HandoffEnableOptions, HandoffManifest } from "./types";
import { isHandoffEnabled } from "./isHandoffEnabled";
import { HandoffShell } from "./HandoffShell";

interface HandoffGateProps {
  manifest: HandoffManifest;
  children: ReactNode;
  /** Optional overrides for isHandoffEnabled (env keys, hostname suffixes) */
  enableOptions?: HandoffEnableOptions;
}

/**
 * Conditionally wraps children with HandoffShell when handoff gates match.
 * When disabled, renders children only — HandoffTarget becomes a no-op.
 */
export function HandoffGate({
  manifest,
  children,
  enableOptions,
}: HandoffGateProps) {
  if (!isHandoffEnabled(enableOptions)) {
    return children;
  }

  return <HandoffShell manifest={manifest}>{children}</HandoffShell>;
}
