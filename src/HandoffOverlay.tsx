import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useHandoff } from "./HandoffContext";
import { measureSpotlightRect, readSpotlightRadius } from "./spotlightUtils";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
}

export function HandoffOverlay() {
  const { tourActive, currentStep, getTargetElement } = useHandoff();
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const measure = useCallback(() => {
    if (!tourActive || !currentStep) {
      setRect(null);
      return;
    }
    const wrapper = getTargetElement(currentStep.targetId);
    if (!wrapper) {
      setRect(null);
      return;
    }
    const r = measureSpotlightRect(wrapper);
    setRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      borderRadius: readSpotlightRadius(wrapper),
    });
    wrapper.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [tourActive, currentStep, getTargetElement]);

  useEffect(() => {
    measure();
    if (!tourActive) {
      return undefined;
    }
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const id = window.setInterval(measure, 200);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.clearInterval(id);
    };
  }, [measure, tourActive, currentStep?.targetId]);

  if (!tourActive || !rect) {
    return null;
  }

  return createPortal(
    <div
      className="handoff-spotlight"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: rect.borderRadius,
      }}
      aria-hidden
    />,
    document.body,
  );
}
