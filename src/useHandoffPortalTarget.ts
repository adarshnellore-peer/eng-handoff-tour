import { useEffect } from "react";
import { useHandoffOptional } from "./HandoffContext";

/**
 * Registers a portaled element (menu, modal) by query selector while `active`.
 * Re-polls while active so the spotlight tracks after open animations.
 */
export function useHandoffPortalTarget(
  targetId: string,
  queryElement: () => HTMLElement | null,
  active: boolean,
) {
  const handoff = useHandoffOptional();

  useEffect(() => {
    if (!handoff || !active) {
      if (handoff) {
        handoff.registerTargetElement(targetId, null);
      }
      return undefined;
    }

    const sync = () => {
      handoff.registerTargetElement(targetId, queryElement());
    };

    sync();
    const pollId = window.setInterval(sync, 200);
    return () => {
      window.clearInterval(pollId);
      handoff.registerTargetElement(targetId, null);
    };
  }, [handoff, targetId, active, queryElement]);
}

export function useHandoffStepActive(targetId: string): boolean {
  const handoff = useHandoffOptional();
  return Boolean(
    handoff?.tourActive && handoff.currentStep?.targetId === targetId,
  );
}
