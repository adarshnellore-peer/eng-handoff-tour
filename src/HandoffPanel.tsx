import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useHandoff } from "./HandoffContext";
import type { SpecRow } from "./types";
import { HandoffCollapseIcon, HandoffExpandIcon } from "./HandoffPanelIcons";

function SpecSection({ title, rows }: { title: string; rows: SpecRow[] }) {
  return (
    <div className="handoff-spec-section">
      <div className="handoff-spec-section-title">{title}</div>
      <table className="handoff-spec-table">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HandoffPanel() {
  const {
    handoffOn,
    tourStarted,
    manifest,
    currentStep,
    stepIndex,
    totalSteps,
    activeTab,
    setActiveTab,
    beginTour,
    endHandoff,
    nextStep,
    prevStep,
  } = useHandoff();
  const [expanded, setExpanded] = useState(false);

  const copyCode = useCallback(() => {
    if (currentStep?.code) {
      void navigator.clipboard.writeText(currentStep.code);
    }
  }, [currentStep?.code]);

  if (!handoffOn) {
    return null;
  }

  if (!tourStarted) {
    return createPortal(
      <div
        className="handoff-panel handoff-panel--intro"
        role="dialog"
        aria-label="Eng handoff">
        <div className="handoff-intro-body">
          <div className="handoff-panel-step-label">Engineering handoff</div>
          <div className="handoff-panel-title">{manifest.title}</div>
          {manifest.intro && (
            <p className="handoff-intro-text">{manifest.intro}</p>
          )}
          <p className="handoff-intro-meta">
            {totalSteps} steps · branch {manifest.branch}
            {manifest.commit ? ` · ${manifest.commit}` : ""}
          </p>
        </div>
        <div className="handoff-panel-nav handoff-panel-nav--intro">
          <button
            type="button"
            className="handoff-nav-btn"
            onClick={endHandoff}>
            Cancel
          </button>
          <button
            type="button"
            className="handoff-nav-btn primary"
            onClick={beginTour}>
            Start
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  if (!currentStep) {
    return null;
  }

  return createPortal(
    <div
      className={`handoff-panel${expanded ? " handoff-panel--expanded" : ""}`}
      role="dialog"
      aria-label="Handoff tour">
      <div className="handoff-panel-header">
        <div>
          <div className="handoff-panel-step-label">
            Step {stepIndex + 1} of {totalSteps}
          </div>
          <div className="handoff-panel-title">{currentStep.title}</div>
          <div className="handoff-panel-change">{currentStep.change}</div>
        </div>
        <div className="handoff-panel-actions">
          <button
            type="button"
            className="handoff-panel-icon-btn"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse panel" : "Expand panel"}>
            {expanded ? (
              <HandoffCollapseIcon className="handoff-panel-icon" />
            ) : (
              <HandoffExpandIcon className="handoff-panel-icon" />
            )}
          </button>
          <button
            type="button"
            className="handoff-panel-icon-btn"
            onClick={endHandoff}
            aria-label="Close tour">
            ×
          </button>
        </div>
      </div>

      <div className="handoff-tabs">
        {(["overview", "spec", "code"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`handoff-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="handoff-panel-body">
        {activeTab === "overview" && (
          <>
            <p>{currentStep.why}</p>
            {currentStep.behaviors && currentStep.behaviors.length > 0 && (
              <SpecSection title="Behavior" rows={currentStep.behaviors} />
            )}
            <code className="handoff-source">{currentStep.source}</code>
          </>
        )}
        {activeTab === "spec" && (
          <>
            <SpecSection title="Layout & tokens" rows={currentStep.specRows} />
            {currentStep.states && currentStep.states.length > 0 && (
              <SpecSection
                title="Interaction states"
                rows={currentStep.states}
              />
            )}
            {currentStep.a11y && currentStep.a11y.length > 0 && (
              <SpecSection title="Accessibility" rows={currentStep.a11y} />
            )}
          </>
        )}
        {activeTab === "code" && (
          <div className="handoff-code-wrap">
            <button
              type="button"
              className="handoff-code-copy"
              onClick={copyCode}>
              Copy
            </button>
            <pre className="handoff-code">{currentStep.code}</pre>
          </div>
        )}
      </div>

      <div className="handoff-panel-nav">
        <button
          type="button"
          className="handoff-nav-btn"
          onClick={prevStep}
          disabled={stepIndex === 0}>
          Previous
        </button>
        <button type="button" className="handoff-nav-btn" onClick={endHandoff}>
          Skip
        </button>
        <button
          type="button"
          className="handoff-nav-btn primary"
          onClick={nextStep}>
          {stepIndex >= totalSteps - 1 ? "Done" : "Next"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
