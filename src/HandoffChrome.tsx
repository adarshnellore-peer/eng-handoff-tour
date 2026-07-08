import { HandoffLauncher } from "./HandoffLauncher";
import { HandoffOverlay } from "./HandoffOverlay";
import { HandoffPanel } from "./HandoffPanel";
import "./handoff.css";

/** Portal UI — mount once alongside routes inside HandoffProvider. */
export function HandoffChrome() {
  return (
    <>
      <HandoffLauncher />
      <HandoffOverlay />
      <HandoffPanel />
    </>
  );
}
