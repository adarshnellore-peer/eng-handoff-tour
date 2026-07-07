# eng-handoff-tour

In-app **React engineering handoff walkthrough** for UI/IA changes. The running app is the canvas — no HTML prototypes.

- **Toggle** (bottom-right) — flip Eng handoff on/off
- **Intro panel** (bottom-left) — Start before step 1
- **Spotlight** — electric-blue ring hugging the target control (no backdrop dim)
- **Panel tabs** — Overview · Spec · Code with interaction states, behavior, a11y

## Quick start

### 1. Copy `src/` into your app

```text
your-app/
  lib/handoff/          ← copy eng-handoff-tour/src here
  features/my-feature/
    handoffs/my-feature.manifest.ts
    components/HandoffGate.tsx   ← optional thin wrapper
```

Or submodule:

```bash
git submodule add https://github.com/adarshnellore-peer/eng-handoff-tour.git vendor/eng-handoff-tour
```

### 2. Bundle resolver alias

**Webpack** (`webpack.common.js`):

```js
alias: {
  "@handoff": path.resolve(__dirname, "..", "lib/handoff"),
}
```

**Vite** (`vite.config.ts`):

```ts
resolve: {
  alias: { "@handoff": path.resolve(__dirname, "lib/handoff") },
},
```

**TypeScript** (`tsconfig.json`):

```json
"paths": { "@handoff": ["lib/handoff"], "@handoff/*": ["lib/handoff/*"] }
```

Import CSS once via `HandoffShell` (included automatically).

### 3. Create a manifest

See [examples/sample.manifest.ts](examples/sample.manifest.ts) and [docs/manifest-schema.md](docs/manifest-schema.md).

### 4. Wire targets + gate

```tsx
import { HandoffGate, HandoffTarget } from "@handoff";
import { myFeatureHandoff } from "./handoffs/my-feature.manifest";

export function FeaturePage() {
  return (
    <HandoffGate manifest={myFeatureHandoff}>
      <Header>
        <HandoffTarget id="save-button">
          <SaveButton />
        </HandoffTarget>
      </Header>
      {/* ... */}
    </HandoffGate>
  );
}
```

`HandoffTarget` is a no-op when handoff is disabled — zero DOM wrapper in production builds.

### 5. Enable locally

| Context | How |
|---------|-----|
| Local dev | Automatic (`NODE_ENV=development`) |
| Preview deploy | `VITE_HANDOFF_ENABLED=true` or `REACT_APP_HANDOFF_ENABLED=true` |
| Staging hostname | Pass `hostnameSuffixes: [".staging.example.com"]` to `HandoffGate` |
| Force on/off | `?handoff=1` / `?handoff=0` |

**Do not** enable in customer production unless intentional.

## Architecture

```text
HandoffGate (conditional)
  └── HandoffShell
        ├── HandoffProvider (context + tour state)
        ├── HandoffLauncher (toggle portal)
        ├── HandoffOverlay (spotlight portal)
        └── HandoffPanel (docs portal)
```

Per-PR content lives in **manifests** beside your feature code. The overlay chrome (`handoff.css`) is intentionally **not** your app's design system.

## Docs

- [Integration guide](docs/integration.md)
- [Manifest schema](docs/manifest-schema.md)
- [Styling](docs/styling.md)

## Requirements

- React 18+
- CSS import support in bundler (included by `HandoffShell`)

No runtime dependencies beyond React.

## License

MIT
