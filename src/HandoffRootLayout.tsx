import type { ReactNode } from "react";
import type { HandoffManifest, HandoffNavigation } from "./types";
import { isHandoffEnabled } from "./isHandoffEnabled";
import { HandoffProvider } from "./HandoffContext";
import { HandoffChrome } from "./HandoffChrome";

interface HandoffRootLayoutProps {
  manifest: HandoffManifest;
  navigation?: HandoffNavigation;
  children: ReactNode;
}

/**
 * Mount at app root (e.g. layout wrapping `<Outlet />`) for multi-page tours.
 * Persists tour state across route changes via sessionStorage.
 */
export function HandoffRootLayout({
  manifest,
  navigation,
  children,
}: HandoffRootLayoutProps) {
  if (!isHandoffEnabled()) {
    return children;
  }

  return (
    <HandoffProvider
      manifest={manifest}
      navigation={navigation}
      persistTourState>
      {children}
      <HandoffChrome />
    </HandoffProvider>
  );
}
