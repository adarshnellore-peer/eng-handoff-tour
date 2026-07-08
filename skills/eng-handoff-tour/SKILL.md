---
name: eng-handoff-tour
description: >-
  Add in-app React engineering handoff walkthroughs to any project using
  eng-handoff-tour (toggle, intro panel, spotlight, live Spec previews,
  copyable design spec, spec/code tabs, multi-page navigation, portaled menu
  steps). Use when the user says eng-handoff-tour, eng handoff, handoff
  walkthrough, handoff tour, generate handoff manifest, add handoff targets,
  live preview in spec tab, or wants engineers to tour UI changes in the live app.
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
- Do not fake hover/focus-visible in Spec preview cards (tour spotlight blue ring must never appear in specs)
- Do not use raw Playwright `getBy*` in e2e when touching selectors (peer-fe rule)

## Module layout (in target app)

```text
lib/handoff/                              ← copy eng-handoff-tour/src
features/<feature>/
  handoffs/<id>.manifest.ts
  handoffs/previews/                      ← live Spec-tab preview components
    index.ts                              ← HandoffPreviewRegistry
    handoffPreviewFixtures.tsx            ← shared preview helpers (optional)
  components/HandoffGate.tsx | HandoffRoot.tsx
```

For **multi-page** tours, mount `HandoffRootLayout` at app root instead of per-route `HandoffGate`.

## Pipeline

```text
- [ ] Stage 1: Preflight — diff UI files, propose steps (+ routes if multi-page)
- [ ] Stage 2: Copy handoff module + bundler alias
- [ ] Stage 3: Manifest + HandoffTarget + Gate or RootLayout + navigation
- [ ] Stage 4: why, overview, copyBlocks, specRows (with px/hex), states, behaviors, a11y, verbatim code
- [ ] Stage 4b: Live preview components per step → previews registry (prop-driven states only)
- [ ] Stage 4c: Portaled menu steps (prepare:open + useHandoffPortalTarget) when needed
- [ ] Stage 5: Verify toggle → Start → steps (incl. cross-page + Spec visuals + copy buttons)
```

### Stage 1 — Preflight

```bash
git diff main...HEAD --name-only
```

Filter `.tsx` UI changes. Propose steps with `targetId`, `source`, `change`, and `route` when steps span pages. For dropdowns/menus, plan **two steps**: trigger + open panel.

### Stage 2 — Install

1. Copy `eng-handoff-tour/src/` → `lib/handoff/` (or `shared/handoff/`)
2. Bundler alias + tsconfig path — [docs/integration.md](docs/integration.md)
3. Ensure `HandoffChrome` imports `./handoff.css`

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
| `why` | **Design intent** for Overview lead — one sentence; see [Writing `why`](#writing-why-overview-lead) |
| `overview` | **Required.** Detailed component explanation for Overview — anatomy, UX, placement, user workflow. Prose only; no px/hex tables or code |
| `copyBlocks` | **Required.** Copy-paste code snippets for **Code tab** — imports, JSX, config. **Runnable code only — never prose recipes.** |
| `specRows` | **Measurements & tokens** with px, rem, or hex values — read from DS source, not vague labels |
| `states` | **Required for buttons/menus** — include hex/px where visuals differ |
| `behaviors` | Authoring-only interaction notes — not shown in panel (fold unique UX into `overview`; details in `code`) |
| `a11y` | aria-*, keyboard |
| `code` | Full verbatim implementation from `source` file (Code tab) |
| `route` | Pathname to navigate to before step (multi-page) |
| `routeLabel` | Optional manifest note for the step's target page |
| `routeMatch` | `exact` (default), `suffix`, or `includes` |
| `prepare` | `"open"` — component auto-opens popover/menu for this step |

#### Writing `why` (Overview lead)

The Overview tab opens with `why` — one or two sentences of **design rationale** for engineers and reviewers. Write for a designer explaining a decision to a builder, not for a diff comment.

**Do:**
- Lead with the user or workflow problem this solves
- Explain *why* this placement, grouping, or pattern was chosen
- Use plain language; name UI labels users see ("Manage data sources", "Roadmap view")

**Do not:**
- Mention tour mechanics ("spotlight", "handoff step", "prepare:open")
- Use implementation shorthand ("portaled", "publish theme.changed", "anchor-element pattern", "plugin level")
- Repeat token tables or component props — that belongs in `copyBlocks` / Spec measurements

```ts
// Bad — implementation slop
why: "Portaled menu panel under the gear trigger. theme rows publish theme.changed. Spotlight the open panel, not just the trigger.",

// Good — design justification
why: "This is the panel users read and tap — not just the gear behind it. It puts data-source management (when allowed) and theme choices in one scannable list, so secondary settings are easy to find without leaving the editor.",
```

#### `copyBlocks` (Code tab — paste-ready snippets)

Split the component into **labeled snippets an engineer can paste directly**. Read the DS source for real measurements and put those in `specRows`.

**Do:**
- Separate blocks: Imports · Options/config · JSX render · Menu items · Handoff wiring
- Use exact prop values from production (`size="sm"`, `aria-label="View mode"`)
- Include a static example when production uses dynamic data (e.g. `EXAMPLE_OPTIONS` for ToggleGroup)

**Do not:**
- Write prose recipes ("Component: ToggleGroup · Wrapper: Row")
- Omit imports or props an engineer needs to compile
- Use placeholder text instead of real labels/icons from the design

```ts
copyBlocks: [
  {
    label: "Imports",
    code: `import { Icon, Row, ToggleGroup, type ToggleOption } from "@peer/design-system";`,
  },
  {
    label: "Segment options (icon-only)",
    code: `const options: ToggleOption[] = [
  { value: "document", icon: <Icon name="Edit" size="md" /> },
  { value: "roadmap", icon: <Icon name="Roadmap" size="md" /> },
];`,
  },
  {
    label: "Render",
    code: `<ToggleGroup
  options={options}
  value={activeMode}
  onChange={handleChange}
  size="sm"
  aria-label="View mode"
/>`,
  },
],
specRows: [
  ["Segment padding", "4px 8px (space xs · space sm)"],
  ["Icon size", "20px · Icon size=\\"md\\""],
  ["Border", "1px solid · border-radius 6px (radii.control)"],
  ["Selected · background", "#FEDBDA (primary.100)"],
],
```

#### Writing `overview` (Overview body)

After the `why` lead, Overview shows a multi-paragraph **component explanation** — what the control is, where it lives in the IA, how users interact with it, and when it appears or hides.

**Do:**
- Explain anatomy and placement in the header/toolbar/page
- Describe user-facing behavior and gating in plain language
- Cover workflow context (why this grouping, what moved from where)

**Do not:**
- Repeat `specRows` measurements, hex values, or token names — Spec tab owns those
- Paste JSX or prop lists — Code tab owns those
- Duplicate the ship checklist — eng verifies via Spec + Code, not a third table

```ts
overview: `The view mode control is a two-segment ToggleGroup in the document header…

It replaces a text dropdown that took too much width…

Modes come from registered view-mode plugins…`,
```

#### Panel tab roles

| Tab | Content |
|-----|---------|
| **Overview** | `why` (lead) + `overview` (detailed component explanation) + source path |
| **Spec** | **`Dimensions & layout`** first · visual states · accessibility · live preview reference at bottom |
| **Code** | `copyBlocks` (imports, JSX snippets) + full verbatim `code` |

All copy actions use **copy icons** (not "Copy" text) via `HandoffCopyBlock` / `HandoffCopyableSpecSection` / `HandoffCopyButton`.

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
          <HandoffPreviewCard
            label="Segment · last"
            density="compact"
            tokens="solid brand sm · -1px overlap">
            <HandoffPreviewStage>
              <Button variant="solid" tone="brand" size="sm" … />
            </HandoffPreviewStage>
          </HandoffPreviewCard>
          <HandoffPreviewCard
            label="Menu · bottom-end"
            canvasAlign="stretch"
            tokens="maxWidth 251 · 3 items + divider">
            <HandoffPreviewStage align="stretch">
              <HandoffInlineMenu items={…} />
            </HandoffPreviewStage>
          </HandoffPreviewCard>
        </HandoffPreviewGrid>
      </HandoffPreviewSection>
    </>
  );
}
```

#### Preview card layout

Cards use **flex-wrap** with `align-items: flex-start` — each card shrink-wraps to its content (no row-height stretching).

| Prop | When |
|------|------|
| `density="compact"` | Small triggers, single icon buttons, segmented controls |
| `canvasAlign="stretch"` | Menus, stacked trigger+menu open states |
| `HandoffPreviewStage align="stretch"` | Vertical stacks (open trigger above menu) |

**Only render states you can drive with real props** (default, selected, open, disabled, busy). Hover and focus-visible belong in the copyable spec sheet as text rows — **never** fake them in preview cards. Do not use `simulated="hover"` / `simulated="focus"` — removed from the module.

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

**Sub-menu rows:** Match production label JSX exactly — e.g. attached style guides use `Row + ChevronRight + Typography` with `guide.displayName`, not generic placeholder text like "Attached Style Guide". Extract shared fixtures in `handoffPreviewFixtures.tsx`.

```tsx
// Matches production SettingsButton attached-style-guide sub-items
export function attachedStyleGuideMenuItem(displayName: string, guideId = "preview") {
  return {
    key: `attached-style-guide-${guideId}`,
    label: (
      <Row gap="xs" align="center" style={{ paddingLeft: space("md") }}>
        <Icon name="ChevronRight" size="xs" color="text.muted" />
        <Typography variant="body2">{displayName}</Typography>
      </Row>
    ),
  };
}
```

Do **not** use a fake `indent` prop — indentation comes from the label's `paddingLeft` only.

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
- Spec tab: live preview cards shrink-wrap (no excess whitespace on small triggers)
- Overview `why` reads as design rationale, not implementation slop
- All copy buttons show icons (checkmark briefly after copy)
- Code tab is verbatim; design spec is copyable below previews
- Multi-page: auto-navigate on Next/Prev, panel shows **Navigating…** (no route label), state persists
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
- Electric-blue spotlight on inner control border (or full dialog for menus) — **never in Spec previews**
- Light cyan panel + blue stroke — isolated from product DS
- Spec tab: **dimensions & layout first**, then visual states, then preview reference at bottom
- Overview lead (`why`): design rationale in plain language — not implementation notes
- Auto-scroll target into view; auto-navigate when step declares `route`

## Reference

- [README](README.md)
- [docs/manifest-schema.md](docs/manifest-schema.md)
- [docs/multi-page-tours.md](docs/multi-page-tours.md)
- [examples/sample.manifest.ts](examples/sample.manifest.ts)

## Install this skill in Cursor

Copy `skills/eng-handoff-tour/SKILL.md` to `~/.cursor/skills/eng-handoff-tour/SKILL.md`.
