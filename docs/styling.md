# Styling

All overlay chrome lives in `src/handoff.css`. Class prefix: `handoff-*`.

**Do not** style handoff UI with your app's design system — it must read as distinct eng tooling, not product UI.

## Visual language

| Element | Treatment |
|---------|-----------|
| Toggle + panel fill | Light sky cyan `rgb(240, 249, 255)` |
| Stroke | Electric blue `rgba(0, 102, 255, 0.5)` |
| Shadow | Blue-tinted drop shadow |
| Spotlight | 2px blue ring, no backdrop dim |
| CTA buttons | `rgb(0, 102, 255)` fill |

## Customization

Override CSS variables or replace `handoff.css` after copy. Suggested approach:

```css
/* your-app/handoff-overrides.css — import after handoff.css */
.handoff-panel {
  /* darker panel for dark-mode apps */
}
```

Keep z-index at `9999`/`10000` so handoff sits above app modals.

## Z-index stack

| Layer | z-index |
|-------|---------|
| Spotlight | 9999 |
| Toggle + panel | 10000 |

If your app uses higher z-index modals, bump handoff values consistently.
