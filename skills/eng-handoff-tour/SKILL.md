---
name: eng-handoff-tour
description: >-
  Add in-app React engineering handoff walkthroughs to any project using
  eng-handoff-tour (toggle, intro panel, spotlight, live Spec previews,
  spec/code tabs, multi-page navigation, portaled menu steps). Use when the
  user says eng-handoff-tour, eng handoff, handoff walkthrough, handoff tour,
  generate handoff manifest, add handoff targets, live preview in spec tab,
  or wants engineers to tour UI changes in the live app.
---

# Eng Handoff Tour

Portable in-app handoff for UI/IA PRs. Source of truth:

**https://github.com/adarshnellore-peer/eng-handoff-tour**

Copy `src/` into the target app. The running React app is the canvas — never generate standalone HTML handoff prototypes.

## When to run

- After a UI/IA change is implemented in React
- Before sharing a preview deploy with engineers
- User invokes `eng-handoff-tour`, `eng handoff`, or `handoff walkthrough`
- User wants **visual state/layout previews** in the Spec tab (not text-only)

## When NOT to run

- Do not build HTML handoff shells
- Do not paraphrase code in manifest `code` fields
- Do not style overlay chrome with the app's design system (use `handoff.css` only)
- Do not use raw Playwright `getBy*` in e2e when touching selectors (peer-fe rule)

## Module layout (in target app)

```text
lib/handoff/                              ← copy eng-handoff-tour/src
features/<feature>/
  handoffs/<id>.manifest.ts
  handoffs/previews/                      ← live Spec-tab preview components
    index.ts                              ← HandoffPreviewRegistry
  components/HandoffGate.tsx
```

For **multi-page** tours, mount `HandoffRootLayout` at app root instead of per-route `HandoffGate`.

## Pipeline

```text
- [ ] Stage 1: Preflight — diff UI files, propose steps (+ routes if multi-page)
- [ ] Stage 2: Copy handoff module + bundler alias
- [ ] Stage 3: Manifest + HandoffTarget + Gate or RootLayout + navigation
- [ ] Stage 4: specRows, states, behaviors, a11y, verbatim code
- [ ] Stage 4b: Live preview components per step → previews registry
- [ ] Stage 4c: Portaled menu steps (prepare:open + useHandoffPortalTarget) when needed
- [ ] Stage 5: Verify toggle → Start → steps (incl. cross-page + Spec visuals)
```

### Stage 1 — Preflight

```bash
git diff main...HEAD --name-only
```

Filter `.tsx` UI changes. Propose steps with `targetId`, `source`, `change`, and `route` when steps span pages. For dropdowns/menus, plan **two steps**: trigger + open panel.

### Stage 2 — Install

1. Copy `eng-handoff-tour/src/` → `lib/handoff/` (or `shared/handoff/`)
2. Bundler alias + tsconfig path — [docs/integration.md](docs/integration.md)

### Stage 3 — Wire

**Single-page / feature-scoped:**

```tsx
import {
  HandoffGate,
  HandoffTarget,
  useHandoffReactRouterNavigation,
} from "shared/handoff";
import { myHandoff } from "../handoffs/my-handoff.manifest";
import { myHandoffPreviews } from "../handoffs/previews";

function FeaturePage() {
  const navigation = useHandoffReactRouterNavigation();
  return (
    <HandoffGate
      manifest={myHandoff}
      navigation={navigation}
      previews={myHandoffPreviews}>
      <HandoffTarget id="my-control"><MyButton /></HandoffTarget>
    </HandoffGate>
  );
}
```

**Multi-page (required when steps have `route`):**

```tsx
import { HandoffRootLayout, useHandoffReactRouterNavigation } from "shared/handoff";

function AppLayout() {
  const navigation = useHandoffReactRouterNavigation();
  return (
    <HandoffRootLayout manifest={myHandoff} navigation={navigation} previews={myHandoffPreviews}>
      <Outlet />
    </HandoffRootLayout>
  );
}
```

Register `<HandoffTarget>` on every page that has tour steps.

### Stage 4 — Manifest fields

| Field | Rule |
|-------|------|
| `specRows` | CSS-property style `[label, value]` — not prose |
| `states` | **Required for buttons/menus** — default, hover, focus, disabled, open, busy |
| `behaviors` | Gating, side effects, menu contents |
| `a11y` | aria-*, keyboard |
| `code` | Verbatim excerpt from `source` file |
| `route` | Pathname to navigate to before step (multi-page) |
| `routeLabel` | Optional manifest note for the step's target page |
| `routeMatch` | `exact` (default), `suffix`, or `includes` |
| `prepare` | `"open"` — component auto-opens popover/menu for this step |

```ts
["Default", "Fill background.surface · Icon text.secondary · outline neutral"],
{ targetId: "datasources", route: `${base}/datasources`, routeLabel: "Data sources" },
```

Add `data-handoff-spotlight` on the exact element for tight spotlight fit.

### Stage 4b — Live Spec previews

**Rule:** Spec tab shows **live UI**, not text-only states. Each step with `states` or layout specs gets a preview component using the **same design-system controls** as production.

1. Create `handoffs/previews/<Feature>Preview.tsx` per step (or grouped by targetId).
2. Use primitives from the handoff module:

```tsx
import {
  HandoffPreviewSection,
  HandoffPreviewGrid,
  HandoffPreviewCard,
  HandoffPreviewStage,
  HandoffInlineMenu,
} from "shared/handoff";
import { Button, Icon, Spinner } from "@your/design-system";

export function DownloadButtonPreview() {
  return (
    <>
      <HandoffPreviewSection title="Layout">
        <HandoffPreviewGrid>
          <HandoffPreviewCard label="Segment · last" tokens="solid brand sm · -1px overlap">
            <HandoffPreviewStage>
              <Button variant="solid" tone="brand" size="sm" … />
            </HandoffPreviewStage>
          </HandoffPreviewCard>
        </HandoffPreviewGrid>
      </HandoffPreviewSection>
      <HandoffPreviewSection title="Interaction states">
        <HandoffPreviewGrid>
          <HandoffPreviewCard label="Busy · downloading" tokens="Spinner sm · no chevron">
            <HandoffPreviewStage>
              <Button leadingIcon={<Spinner size="sm" />} … />
            </HandoffPreviewStage>
          </HandoffPreviewCard>
          <HandoffPreviewCard label="Hover" simulated="hover" tokens="DS hover">
            …
          </HandoffPreviewCard>
        </HandoffPreviewGrid>
      </HandoffPreviewSection>
    </>
  );
}
```

3. Register in `handoffs/previews/index.ts`:

```tsx
import type { HandoffPreviewRegistry } from "shared/handoff/types";

export const myHandoffPreviews: HandoffPreviewRegistry = {
  "download-button": DownloadButtonPreview,
  "share-button": ShareButtonPreview,
};
```

4. Pass `previews={myHandoffPreviews}` on `HandoffGate` / `HandoffShell` / `HandoffRootLayout`.

**Menu panels in previews:** DS `Menu` portals to `#ds-portal-root` — use `HandoffInlineMenu` in previews (same icons/labels/dividers/selected row) so visuals stay inside the panel. Triggers use real `Button` with production styles.

**Hover / focus-visible:** use `simulated="hover"` or `simulated="focus"` on `HandoffPreviewCard` when the state is not prop-driven.

Manifest `specRows` / `states` / `a11y` remain as compact **token reference** tables below the visual grid.

### Stage 4c — Portaled menu tour steps

When a step spotlights an **open** dropdown (portal, not inside `HandoffTarget`):

1. Add a **second step** after the trigger with its own `targetId`.
2. Set `prepare: "open"` on that manifest step.
3. In the component — auto-open on that step, close when leaving:

```tsx
import {
  useHandoffOptional,
  useHandoffStepActive,
  useHandoffPortalTarget,
} from "shared/handoff";

const isMenuStep = useHandoffStepActive("document-settings-menu");
const isGearStep = useHandoffStepActive("document-settings-gear");

useEffect(() => {
  if (!handoff?.tourActive) return;
  if (isMenuStep && triggerRef.current) setAnchor(triggerRef.current);
  else if (isGearStep || !isMenuStep) setAnchor(null);
}, [handoff?.tourActive, isMenuStep, isGearStep]);

useHandoffPortalTarget(
  "document-settings-menu",
  () =>
    document.querySelector('[aria-label="Document settings menu"][role="dialog"]'),
  isMenuStep && Boolean(anchor),
);
```

4. Extend `HandoffContext.registerTargetElement` so spotlight finds portaled nodes.
5. Add matching **menu panel preview** for the Spec tab.

See [docs/manifest-schema.md](docs/manifest-schema.md#portaled-menus--modals).

### Stage 5 — Verify

- Toggle bottom-right → intro panel → **Start**
- Spotlight hugs inner `button` or dialog panel; expand panel for Spec grid
- Spec tab: live preview cards for layout + each interaction state
- Code tab is verbatim; token reference tables still present under previews
- Multi-page: auto-navigate on Next/Prev, panel shows "Navigating…", state persists
- Portaled menu step: menu auto-opens, spotlight on dialog, closes on Next
- Preview: `VITE_HANDOFF_ENABLED=true` / `REACT_APP_HANDOFF_ENABLED=true`
- Production: env unset → no toggle, `HandoffTarget` is no-op

## Activation gates

| Context | How |
|---------|-----|
| Local dev | `NODE_ENV=development` |
| CRA preview | `REACT_APP_HANDOFF_ENABLED=true` |
| Vite preview | `VITE_HANDOFF_ENABLED=true` |
| Next preview | `NEXT_PUBLIC_HANDOFF_ENABLED=true` |
| Staging host | `enableOptions.hostnameSuffixes` |
| Force | `?handoff=1` / `?handoff=0` |

## Tour UX (do not regress)

- Real toggle switch bottom-right (electric blue when on)
- Intro screen with **Start** before step 1
- Bottom-left floating panel, expandable (fullscreen icons)
- Panel nav: **Previous** left · **Next** + **Skip** right (Skip far right, ghost style)
- While route/target loads, panel shows **Navigating…** (no route label in UI)
- **No backdrop dim** — app stays fully visible
- Electric-blue spotlight on inner control border (or full dialog for menus)
- Light cyan panel + blue stroke — isolated from product DS
- Spec tab: **visual preview grid first**, token reference tables second
- Auto-scroll target into view; auto-navigate when step declares `route`

## Reference

- [README](README.md)
- [docs/manifest-schema.md](docs/manifest-schema.md)
- [docs/multi-page-tours.md](docs/multi-page-tours.md)
- [examples/sample.manifest.ts](examples/sample.manifest.ts)

## Install this skill in Cursor

Copy `skills/eng-handoff-tour/SKILL.md` to `~/.cursor/skills/eng-handoff-tour/SKILL.md`.
