import type { ReactNode } from "react";
import type { HandoffManifest } from "./types";
import { HandoffProvider } from "./HandoffContext";
import { HandoffOverlay } from "./HandoffOverlay";
import { HandoffPanel } from "./HandoffPanel";
import { HandoffLauncher } from "./HandoffLauncher";
import "./handoff.css";

interface HandoffShellProps {
  manifest: HandoffManifest;
  children: ReactNode;
}

/** Wraps feature UI with handoff provider + overlay chrome (portals to document.body). */
export function HandoffShell({ manifest, children }: HandoffShellProps) {
  return (
    <HandoffProvider manifest={manifest}>
      {children}
      <HandoffLauncher />
      <HandoffOverlay />
      <HandoffPanel />
    </HandoffProvider>
  );
}
