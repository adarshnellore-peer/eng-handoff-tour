export type HandoffRouteMatch = "exact" | "suffix" | "includes";

export interface HandoffNavigation {
  /** Current path for comparison — typically pathname + search */
  getPath: () => string;
  /** Navigate when a step declares a different route */
  navigate: (path: string) => void | Promise<void>;
}

export type SpecRow = [label: string, value: string];

export interface HandoffStep {
  targetId: string;
  title: string;
  change: string;
  why: string;
  source: string;
  specRows: SpecRow[];
  states?: SpecRow[];
  behaviors?: SpecRow[];
  a11y?: SpecRow[];
  code: string;
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
