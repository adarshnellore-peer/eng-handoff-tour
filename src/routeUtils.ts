import type { HandoffRouteMatch } from "./types";

function normalizePath(path: string): string {
  const withoutHash = path.split("#")[0] ?? path;
  return withoutHash.split("?")[0] ?? withoutHash;
}

/** Returns true when the app is already on the step's route. */
export function matchesHandoffRoute(
  currentPath: string,
  stepRoute: string,
  match: HandoffRouteMatch = "exact",
): boolean {
  const current = normalizePath(currentPath);
  const target = normalizePath(stepRoute);

  if (match === "exact") {
    return current === target || currentPath === stepRoute;
  }
  if (match === "suffix") {
    return current.endsWith(target) || currentPath.includes(stepRoute);
  }
  return current.includes(target) || currentPath.includes(stepRoute);
}

/** Deferred routes resolved at navigation time (e.g. handoff:document-roadmap). */
export function isHandoffRouteToken(route: string): boolean {
  return route.startsWith("handoff:");
}
