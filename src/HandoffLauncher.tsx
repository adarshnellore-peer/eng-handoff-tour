import { createPortal } from "react-dom";
import { useHandoff } from "./HandoffContext";

export function HandoffLauncher() {
  const { handoffOn, setHandoffOn } = useHandoff();

  return createPortal(
    <label className="handoff-switch" htmlFor="handoff-switch-input">
      <input
        id="handoff-switch-input"
        type="checkbox"
        className="handoff-switch-input"
        checked={handoffOn}
        onChange={(e) => setHandoffOn(e.target.checked)}
        aria-label="Eng handoff walkthrough"
      />
      <span className="handoff-switch-track" aria-hidden>
        <span className="handoff-switch-thumb" />
      </span>
      <span className="handoff-switch-label">Eng handoff</span>
    </label>,
    document.body,
  );
}
