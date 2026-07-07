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
| `route` | multi-page | Pathname to navigate to before this step |
| `routeMatch` | no | `exact` (default), `suffix`, or `includes` |
| `routeLabel` | no | Shown while navigating, e.g. `"Project settings"` |

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
5. Mount `HandoffGate` on feature route
6. Test locally with toggle → Start → all steps
