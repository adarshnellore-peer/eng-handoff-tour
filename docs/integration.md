# Integration guide

## Install options

### Option A — Copy `src/` (recommended)

Copy the entire `src/` folder into your repo (e.g. `lib/handoff/`). Update imports to match your alias.

### Option B — Git submodule

```bash
git submodule add https://github.com/adarshnellore-peer/eng-handoff-tour.git vendor/eng-handoff-tour
```

Import from `vendor/eng-handoff-tour/src`.

## Bundler setup

Handoff uses relative imports within `src/`. Your bundler must resolve the folder you copy into.

### Webpack 5

```js
// config/webpack.common.js
resolve: {
  alias: {
    "@handoff": path.resolve(__dirname, "..", "lib/handoff"),
  },
},
```

### Vite

```ts
// vite.config.ts
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@handoff": path.resolve(__dirname, "lib/handoff"),
    },
  },
});
```

### Next.js

```js
// next.config.js
module.exports = {
  webpack(config) {
    config.resolve.alias["@handoff"] = path.join(__dirname, "lib/handoff");
    return config;
  },
};
```

## Mounting

Wrap the **smallest route subtree** that contains all tour targets:

```tsx
<HandoffGate manifest={myHandoff}>
  <FeatureLayout>{children}</FeatureLayout>
</HandoffGate>
```

For multiple manifests (different routes), use separate gates or swap manifest prop per route.

## HandoffTarget rules

1. One `HandoffTarget` per manifest step `targetId`
2. Wrap the **visible control** (button, toggle, menu trigger)
3. For precise spotlight, add `data-handoff-spotlight` on the exact element:

```tsx
<HandoffTarget id="save-button">
  <button data-handoff-spotlight type="button">Save</button>
</HandoffTarget>
```

4. When handoff is off, `HandoffTarget` renders `children` only — no wrapper div

## Enable options

```tsx
<HandoffGate
  manifest={myHandoff}
  enableOptions={{
    envKeys: ["VITE_HANDOFF_ENABLED"],
    hostnameSuffixes: [".staging.mycompany.com"],
  }}
>
```

## Preview deploy env vars

| Tool | Variable |
|------|----------|
| Create React App | `REACT_APP_HANDOFF_ENABLED=true` |
| Vite | `VITE_HANDOFF_ENABLED=true` |
| Next.js | `NEXT_PUBLIC_HANDOFF_ENABLED=true` |

## Verification checklist

- [ ] `npm run dev` — toggle appears bottom-right
- [ ] Flip toggle → intro panel with **Start**
- [ ] Each step spotlight aligns with control border
- [ ] Spec tab shows states for every button/menu step
- [ ] Code tab excerpts match repo (verbatim)
- [ ] Production build without env flag — no toggle, no wrapper overhead
