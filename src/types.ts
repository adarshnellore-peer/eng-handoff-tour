export type SpecRow = [label: string, value: string];

export interface HandoffStep {
  /** Must match a HandoffTarget id in the app */
  targetId: string;
  title: string;
  /** Short delta label, e.g. "Dropdown → ToggleGroup" */
  change: string;
  why: string;
  /** Repo-relative path to source file */
  source: string;
  /** Layout, sizing, tokens — CSS-property style rows */
  specRows: SpecRow[];
  /** Default / hover / focus / disabled / open / selected */
  states?: SpecRow[];
  /** Gating, side effects, navigation */
  behaviors?: SpecRow[];
  /** aria-*, keyboard, screen reader */
  a11y?: SpecRow[];
  /** Verbatim code excerpt — do not paraphrase */
  code: string;
}

/** Optional IA / plugin registration notes for complex refactors */
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
  /** Shown on intro screen before step 1 */
  intro?: string;
  steps: HandoffStep[];
  meta?: HandoffManifestMeta;
}

export type HandoffTab = "overview" | "spec" | "code";

export interface HandoffEnableOptions {
  /** Env var names checked for value "true" (CRA, Vite, Next, etc.) */
  envKeys?: string[];
  /** Hostname suffixes that auto-enable handoff, e.g. ".staging.myapp.com" */
  hostnameSuffixes?: string[];
}
