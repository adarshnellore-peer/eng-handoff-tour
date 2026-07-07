---
name: eng-handoff-tour
description: >-
  Add in-app React engineering handoff walkthroughs to any project using
  eng-handoff-tour (toggle, intro panel, spotlight, spec/code tabs, multi-page
  navigation). Use when the user says eng-handoff-tour, eng handoff, handoff
  walkthrough, handoff tour, generate handoff manifest, add handoff targets,
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

## When NOT to run

- Do not build HTML handoff shells
- Do not paraphrase code in manifest `code` fields
- Do not style overlay chrome with the app's design system (use `handoff.css` only)

## Module layout (in target app)

```text
lib/handoff/                         ← copy eng-handoff-tour/src
features/<feature>/
  handoffs/<id>.manifest.ts
  components/HandoffGate.tsx         ← single-page or feature-scoped
```

For **multi-page** tours, mount `HandoffRootLayout` at app root instead of per-route `HandoffGate`.

## Pipeline

```text
- [ ] Stage 1: Preflight — diff UI files, propose steps (+ routes if multi-page)
- [ ] Stage 2: Copy handoff module + bundler alias
- [ ] Stage 3: Manifest + HandoffTarget + Gate or RootLayout + navigation
- [ ] Stage 4: specRows, states, behaviors, a11y, verbatim code
- [ ] Stage 5: Verify toggle → Start → steps (incl. cross-page navigation)
```

### Stage 1 — Preflight

```bash
git diff main...HEAD --name-only
```

Filter `.tsx` UI changes. Propose steps with `targetId`, `source`, `change`, and `route` when steps span pages.

### Stage 2 — Install

1. Copy `eng-handoff-tour/src/` → `lib/handoff/`
2. Bundler alias + tsconfig path — [docs/integration.md](docs/integration.md)

### Stage 3 — Wire

**Single-page / feature-scoped:**

```tsx
import { HandoffGate, HandoffTarget, useHandoffReactRouterNavigation } from "@handoff";

function FeaturePage() {
  const navigation = useHandoffReactRouterNavigation();
  return (
    <HandoffGate manifest={myHandoff} navigation={navigation}>
      <HandoffTarget id="my-control"><MyButton /></HandoffTarget>
    </HandoffGate>
  );
}
```

**Multi-page (required when steps have `route`):**

```tsx
import { HandoffRootLayout, useHandoffReactRouterNavigation } from "@handoff";

function AppLayout() {
  const navigation = useHandoffReactRouterNavigation();
  return (
    <HandoffRootLayout manifest={myHandoff} navigation={navigation}>
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
| `routeLabel` | Shown while navigating |
| `routeMatch` | `exact` (default), `suffix`, or `includes` |

```ts
["Default", "Fill background.surface · Icon text.secondary · outline neutral"],
{ targetId: "datasources", route: `${base}/datasources`, routeLabel: "Data sources" },
```

Add `data-handoff-spotlight` on the exact element for tight spotlight fit.

### Stage 5 — Verify

- Toggle bottom-right → intro panel → **Start**
- Spotlight hugs inner `button`; Spec tab has states; Code tab is verbatim
- Multi-page: auto-navigate on Next/Prev, panel shows "Navigating…", state persists
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
- **No backdrop dim** — app stays fully visible
- Electric-blue spotlight on inner control border
- Light cyan panel + blue stroke — isolated from product DS
- Auto-scroll target into view; auto-navigate when step declares `route`

## Reference

- [README](README.md)
- [docs/manifest-schema.md](docs/manifest-schema.md)
- [docs/multi-page-tours.md](docs/multi-page-tours.md)
- [examples/sample.manifest.ts](examples/sample.manifest.ts)

## Install this skill in Cursor

Copy `skills/eng-handoff-tour/SKILL.md` to `~/.cursor/skills/eng-handoff-tour/SKILL.md`.
