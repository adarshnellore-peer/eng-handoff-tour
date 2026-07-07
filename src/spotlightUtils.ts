/** Prefer the interactive control inside a HandoffTarget wrapper for tight spotlight fit. */
export function resolveSpotlightElement(wrapper: HTMLElement): HTMLElement {
  if (
    wrapper.getAttribute("role") === "dialog" ||
    wrapper.getAttribute("role") === "menu"
  ) {
    return wrapper;
  }

  const marked = wrapper.querySelector<HTMLElement>("[data-handoff-spotlight]");
  if (marked) {
    return marked;
  }

  const interactive = wrapper.querySelector<HTMLElement>(
    "button, [role='button'], [role='switch'], a[href]",
  );
  if (interactive && wrapper.contains(interactive)) {
    return interactive;
  }

  const first = wrapper.firstElementChild;
  if (first instanceof HTMLElement) {
    const nested = first.querySelector<HTMLElement>("button, [role='button']");
    if (nested) {
      return nested;
    }
    return first;
  }

  return wrapper;
}

export function measureSpotlightRect(el: HTMLElement): DOMRect {
  const target = resolveSpotlightElement(el);
  const rect = target.getBoundingClientRect();
  return {
    ...rect,
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    x: rect.x,
    y: rect.y,
    toJSON: rect.toJSON.bind(rect),
  };
}

export function readSpotlightRadius(el: HTMLElement): string {
  const target = resolveSpotlightElement(el);
  return window.getComputedStyle(target).borderRadius || "6px";
}
