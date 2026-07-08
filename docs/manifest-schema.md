# Manifest schema

## HandoffManifest

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Stable slug, e.g. `header-redesign` |
| `title` | yes | Shown on intro screen |
| `branch` | yes | Git branch for this handoff |
| `commit` | no | Short SHA |
| `intro` | no | Paragraph before **Start** |
| `steps` | yes | Ordered tour steps |
| `meta` | no | Optional IA registration notes |

## HandoffStep

| Field | Required | Description |
|-------|----------|-------------|
| `targetId` | yes | Matches `<HandoffTarget id="…">` |
| `title` | yes | Step heading |
| `change` | yes | Short delta, e.g. `Dropdown → ToggleGroup` |
| `why` | yes | Design rationale (Overview lead) — one sentence, plain language |
| `overview` | yes | Detailed component explanation for Overview — anatomy, UX, placement, behavior in prose |
| `copyBlocks` | yes | Paste-ready code snippets for Code tab — imports, JSX, config (never prose) |
| `source` | yes | Repo-relative file path |
| `specRows` | yes | Layout & token rows `[label, value][]` |
| `states` | recommended | Interaction states — **required for buttons/menus** |
| `behaviors` | recommended | Gating, side effects, menu items |
| `a11y` | recommended | aria-*, keyboard |
| `code` | yes | Verbatim excerpt — never paraphrase |
| `prepare` | portaled menus | Set `"open"` when step spotlights an open dropdown/modal panel |
| `route` | multi-page | Pathname to navigate to before this step |
| `routeMatch` | no | `exact` (default), `suffix`, or `includes` |
| `routeLabel` | no | Optional label for manifest authors (e.g. `"Project settings"`) |

## Panel tabs

| Tab | Renders |
|-----|---------|
| Overview | `why` (lead) + `overview` (detailed component explanation) + source path |
| Spec | **Dimensions & layout** first · visual states · accessibility · live preview at bottom |
| Code | `copyBlocks` (paste-ready snippets) + full verbatim `code` |

Copy actions use icon buttons (`HandoffCopyBlock`, `HandoffCopyableSpecSection`).

## Writing `copyBlocks`

Split into labeled, paste-ready snippets. Read DS source for measurements in `specRows`.

```ts
copyBlocks: [
  { label: "Imports", code: `import { Button, Icon } from "@your/design-system";` },
  { label: "Render", code: `<Button aria-label="Save document" … />` },
],
specRows: [
  ["Button size", "sm · height 32px"],
  ["Icon", "20px · size=\"md\""],
],
```

Never use prose recipes like `Component: ToggleGroup · Wrapper: Row`.

## Writing `why`

Lead with the user/workflow problem. Do not mention tour mechanics or implementation shorthand.

```ts
// Bad
why: "Portaled menu panel under the gear trigger. Spotlight the open panel.",

// Good
why: "This is the panel users read and tap — not just the gear behind it. It puts data-source management and theme choices in one scannable list.",
```

## Live previews (Spec tab)

Register `HandoffPreviewRegistry` on `HandoffShell` / `HandoffGate` / `HandoffRootLayout`:

```tsx
const previews: HandoffPreviewRegistry = {
  "download-button": DownloadButtonPreview,
};

<HandoffGate manifest={manifest} previews={previews}>…</HandoffGate>
```

Each preview component renders real app UI (design-system `Button`, `ToggleGroup`, etc.) in a flex-wrap grid of state cards.

**Preview rules:**
- Only prop-driven states in cards (default, selected, open, disabled, busy)
- Hover / focus-visible → text rows in spec sheet only — never fake in preview cards
- `density="compact"` for small triggers; `canvasAlign="stretch"` for menus
- Menu sub-items must match production label JSX (real `displayName`, not placeholder text)

## Multi-page tours

Steps on different routes need `route` + root-level `HandoffRootLayout` with `navigation`.
See [multi-page-tours.md](multi-page-tours.md).

## specRows / states format

Use **CSS-property style** rows, not prose:

```ts
["Fill · default", "background.surface"],
["Fill · hover", "background.canvas"],
["Icon", "text.secondary · md"],
```

For buttons, document **each state** with differing visuals:

- Default
- Hover (text-only in spec if not prop-driven)
- Focus-visible (text-only in spec if not prop-driven)
- Disabled
- Open / selected (menus, toggles)
- Busy / loading (spinner)

Pattern: `["State name", "Fill X · Text Y · Border Z"]`

## meta (optional)

For plugin/router IA refactors:

```ts
meta: {
  addedRegistrations: [
    { id: "gear-menu", region: "HEADER", position: "RIGHT", priority: 8 },
  ],
  removedRegistrations: [
    { id: "old-button", region: "HEADER", position: "RIGHT", priority: 0, note: "Moved to menu" },
  ],
}
```

## Authoring pipeline

1. `git diff main...HEAD --name-only` → filter UI `.tsx`
2. Propose steps: `targetId`, `source`, `change`
3. Read each source file → fill `why`, `overview`, `copyBlocks`, `specRows`, `states`, `behaviors`, `a11y`, `code`
4. Wrap controls with `HandoffTarget`
5. Add preview components per step → pass `previews` registry to gate
6. Mount `HandoffGate` or `HandoffRootLayout`

## Portaled menus / modals

When a step spotlights an **open** dropdown (rendered in a portal, not inside `HandoffTarget`):

1. Add a **separate step** after the trigger step with its own `targetId`.
2. Set `prepare: "open"` on that step (documentation for authors).
3. In the component: auto-open on that step (`useHandoffStepActive` + set anchor/open state).
4. Register the portal root with `useHandoffPortalTarget(id, queryFn, active)`.
5. Close the menu when leaving that step.

```tsx
const isMenuStep = useHandoffStepActive("document-settings-menu");

useEffect(() => {
  if (isMenuStep && triggerRef.current) setAnchor(triggerRef.current);
  else if (!isGearStep) setAnchor(null);
}, [isMenuStep, isGearStep]);

useHandoffPortalTarget(
  "document-settings-menu",
  () => document.querySelector('[aria-label="Document settings menu"][role="dialog"]'),
  isMenuStep && Boolean(anchor),
);
```
