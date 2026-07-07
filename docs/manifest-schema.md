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
| `why` | yes | Rationale (Overview tab) |
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

## Live previews (Spec tab)

Register `HandoffPreviewRegistry` on `HandoffShell` / `HandoffGate` / `HandoffRootLayout`:

```tsx
const previews: HandoffPreviewRegistry = {
  "download-button": DownloadButtonPreview,
};

<HandoffGate manifest={manifest} previews={previews}>…</HandoffGate>
```

Each preview component renders real app UI (design-system `Button`, `ToggleGroup`, etc.) in a grid of state cards using `HandoffPreviewCard` / `HandoffInlineMenu`. Manifest `specRows` / `states` remain as compact token reference below the visuals.

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
- Hover
- Focus-visible
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
3. Read each source file → fill `specRows`, `states`, `behaviors`, `a11y`, `code`
4. Wrap controls with `HandoffTarget`
5. Add preview components per step → pass `previews` registry to gate
6. Mount `HandoffGate` on feature route

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
