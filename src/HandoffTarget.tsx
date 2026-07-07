import { useEffect, useRef, type ReactNode } from "react";
import { useHandoffOptional } from "./HandoffContext";

interface HandoffTargetProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Registers a DOM node for handoff spotlight targeting.
 * Wrap the visible control. No wrapper rendered when handoff is disabled.
 */
export function HandoffTarget({ id, children, className }: HandoffTargetProps) {
  const handoff = useHandoffOptional();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!handoff) {
      return undefined;
    }
    handoff.registerTarget(id, ref);
    return () => handoff.unregisterTarget(id);
  }, [handoff, id]);

  if (!handoff) {
    return children;
  }

  return (
    <div
      ref={ref}
      data-handoff-target={id}
      className={className}
      style={{ display: "inline-flex", alignItems: "center" }}>
      {children}
    </div>
  );
}
