import type { ReactNode } from "react";
import type { HandoffManifest, HandoffNavigation, HandoffPreviewRegistry, HandoffEnableOptions } from "./types";
import { isHandoffEnabled } from "./isHandoffEnabled";
import { HandoffProvider } from "./HandoffContext";
import { HandoffChrome } from "./HandoffChrome";

interface HandoffRootLayoutProps {
  manifest: HandoffManifest;
  navigation?: HandoffNavigation;
  children: ReactNode;
  previews?: HandoffPreviewRegistry;
  navigationPath?: string;
  enableOptions?: HandoffEnableOptions;
}

/**
 * Mount at app root (e.g. layout wrapping `<Outlet />`) for multi-page tours.
 * Persists tour state across route changes via sessionStorage.
 */
export function HandoffRootLayout({
  manifest,
  navigation,
  children,
  previews,
  navigationPath,
  enableOptions,
}: HandoffRootLayoutProps) {
  if (!isHandoffEnabled(enableOptions)) {
    return children;
  }

  return (
    <HandoffProvider
      manifest={manifest}
      navigation={navigation}
      persistTourState
      previews={previews}
      navigationPath={navigationPath}>
      {children}
      <HandoffChrome />
    </HandoffProvider>
  );
}
