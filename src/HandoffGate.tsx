import type { ReactNode } from "react";
import type { HandoffEnableOptions, HandoffManifest, HandoffNavigation, HandoffPreviewRegistry } from "./types";
import { isHandoffEnabled } from "./isHandoffEnabled";
import { HandoffShell } from "./HandoffShell";

interface HandoffGateProps {
  manifest: HandoffManifest;
  children: ReactNode;
  navigation?: HandoffNavigation;
  enableOptions?: HandoffEnableOptions;
  /** Pass true when any step declares a `route` */
  persistTourState?: boolean;
  previews?: HandoffPreviewRegistry;
}

export function HandoffGate({
  manifest,
  children,
  navigation,
  enableOptions,
  persistTourState,
  previews,
}: HandoffGateProps) {
  if (!isHandoffEnabled(enableOptions)) {
    return children;
  }

  return (
    <HandoffShell
      manifest={manifest}
      navigation={navigation}
      persistTourState={persistTourState}
      previews={previews}>
      {children}
    </HandoffShell>
  );
}
