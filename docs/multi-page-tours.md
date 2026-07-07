# Multi-page tours

When handoff steps span **multiple routes**, the tour must:

1. **Navigate** automatically when the user moves to a step on another page
2. **Persist** tour state across route changes
3. **Wait** for the target control to mount before showing the spotlight

## 1. Mount at app root

Use `HandoffRootLayout` once in your layout (wrapping `<Outlet />` or `{children}`):

```tsx
import { HandoffRootLayout, useHandoffReactRouterNavigation } from "@handoff";

function AppLayout() {
  const navigation = useHandoffReactRouterNavigation();

  return (
    <HandoffRootLayout
      manifest={myHandoff}
      navigation={navigation}
    >
      <Outlet />
    </HandoffRootLayout>
  );
}
```

Do **not** mount separate `HandoffShell` instances per route — use one root provider.

## 2. Declare routes on steps

```ts
{
  targetId: "save-button",
  title: "Save button",
  route: "/projects/abc/settings",
  routeLabel: "Project settings",
  routeMatch: "exact", // default
  // ...
},
{
  targetId: "header-logo",
  title: "Header",
  route: "/dashboard",
  routeMatch: "suffix", // pathname.endsWith("/dashboard")
  // ...
}
```

| `routeMatch` | Behavior |
|--------------|----------|
| `exact` | Pathname equals `route` (default) |
| `suffix` | Pathname ends with `route` |
| `includes` | Pathname contains `route` |

Build dynamic paths from current URL params when authoring manifests:

```ts
const base = `/studies/${studyId}/documents/${documentId}`;
steps: [
  { targetId: "view-mode", route: `${base}/roadmap`, routeLabel: "Editor", /* ... */ },
  { targetId: "datasources", route: `${base}/datasources`, routeLabel: "Data sources", /* ... */ },
];
```

## 3. Register targets on each page

Each route's components must include `<HandoffTarget id="…">` for steps on that page.

## 4. What happens on Next

1. Panel shows **Navigating…**
2. Router navigates to `step.route`
3. Tour state persists in `sessionStorage`
4. Polls until `HandoffTarget` mounts (up to 12s)
5. Spotlight + scroll into view

## Single-page tours

If all steps are on one route, skip `route` fields. Optional `HandoffGate` on the feature route is enough (no root layout required).

## Next.js / custom routers

Implement `HandoffNavigation`:

```ts
const navigation: HandoffNavigation = {
  getPath: () => router.asPath,
  navigate: (path) => router.push(path),
};
```

Pass to `HandoffRootLayout` or `HandoffShell`.
