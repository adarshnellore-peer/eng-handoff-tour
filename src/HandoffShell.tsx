import type { ReactNode } from "react";
import type { HandoffManifest, HandoffNavigation, HandoffPreviewRegistry } from "./types";
import { HandoffProvider } from "./HandoffContext";
import { HandoffChrome } from "./HandoffChrome";

interface HandoffShellProps {
  manifest: HandoffManifest;
  children: ReactNode;
  navigation?: HandoffNavigation;
  /** Enable sessionStorage persistence (recommended when steps use `route`) */
  persistTourState?: boolean;
  previews?: HandoffPreviewRegistry;
}

/** Wraps a single feature route. For multi-page tours prefer HandoffRootLayout. */
export function HandoffShell({
  manifest,
  children,
  navigation,
  persistTourState,
  previews,
}: HandoffShellProps) {
  return (
    <HandoffProvider
      manifest={manifest}
      navigation={navigation}
      persistTourState={persistTourState}
      previews={previews}>
      {children}
      <HandoffChrome />
    </HandoffProvider>
  );
}
