import type { ComponentType, ReactNode } from "react";

export type HandoffRouteMatch = "exact" | "suffix" | "includes";

export interface HandoffNavigation {
  /** Current path for comparison — typically pathname + search */
  getPath: () => string;
  /** Navigate when a step declares a different route */
  navigate: (path: string) => void | Promise<void>;
  /**
   * Resolve manifest route tokens to concrete paths (e.g. inject study/document ids).
   * Return value is used for both navigation and route matching.
   */
  resolveRoute?: (route: string, step: HandoffStep) => string;
}

export type SpecRow = [label: string, value: string];

export type HandoffCopySnippet = {
  label: string;
  code: string;
};

export interface HandoffStep {
  targetId: string;
  title: string;
  change: string;
  /** One-sentence design intent — shown as the Overview lead. */
  why: string;
  /** Detailed component explanation for Overview — anatomy, UX, placement, behavior in prose. */
  overview: string;
  source: string;
  /** Copy-paste snippets for Code tab — imports, JSX, config. Must be runnable code, not prose. */
  copyBlocks: HandoffCopySnippet[];
  /** Authoring-only — interaction notes; not shown in panel (covered by overview + code). */
  behaviors?: SpecRow[];
  specRows: SpecRow[];
  states?: SpecRow[];
  a11y?: SpecRow[];
  code: string;
  /**
   * When "open", the target component should open its popover/menu on this step.
   * Pair with useHandoffPortalTarget for portaled dropdown panels.
   */
  prepare?: "open";
  /**
   * App route to open before spotlighting this step.
   * Use full pathname (preferred) or a suffix segment with routeMatch: "suffix".
   */
  route?: string;
  routeMatch?: HandoffRouteMatch;
  /** Shown in panel while navigating, e.g. "Document editor" */
  routeLabel?: string;
}

export interface HandoffRegistrationChange {
  id: string;
  region: string;
  position: string;
  priority: number;
  note?: string;
}

export interface HandoffManifestMeta {
  removedRegistrations?: HandoffRegistrationChange[];
  addedRegistrations?: HandoffRegistrationChange[];
}

export interface HandoffManifest {
  id: string;
  title: string;
  branch: string;
  commit?: string;
  intro?: string;
  steps: HandoffStep[];
  meta?: HandoffManifestMeta;
}

export type HandoffTab = "overview" | "spec" | "code";

export interface HandoffEnableOptions {
  envKeys?: string[];
  hostnameSuffixes?: string[];
}

export interface HandoffPersistedTourState {
  manifestId: string;
  handoffOn: boolean;
  tourStarted: boolean;
  stepIndex: number;
}

/** Renders live UI previews for a tour step's Spec tab (states, layout, menus). */
export type HandoffStepPreview = ComponentType;

export type HandoffPreviewRegistry = Record<string, HandoffStepPreview>;
