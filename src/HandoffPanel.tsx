import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
  HandoffCopyBlock,
  HandoffCopyableSpecSection,
  HandoffCopyButton,
} from "./HandoffCopyBlock";
import { useHandoff } from "./HandoffContext";
import { HandoffCollapseIcon, HandoffExpandIcon } from "./HandoffPanelIcons";

export function HandoffPanel() {
  const {
    handoffOn,
    tourStarted,
    isNavigating,
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
    previews,
  } = useHandoff();
  const [expanded, setExpanded] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = useCallback(() => {
    if (currentStep?.code) {
      void navigator.clipboard.writeText(currentStep.code);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1500);
    }
  }, [currentStep?.code]);

  const copyAllCode = useCallback(() => {
    if (!currentStep) {
      return;
    }
    const blocks = currentStep.copyBlocks.map((b) => b.code).join("\n\n");
    const all = blocks ? `${blocks}\n\n${currentStep.code}` : currentStep.code;
    void navigator.clipboard.writeText(all);
    setCodeCopied(true);
    window.setTimeout(() => setCodeCopied(false), 1500);
  }, [currentStep]);

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

  const StepPreview = previews[currentStep.targetId];

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
        {isNavigating && (
          <p className="handoff-navigating">Navigating…</p>
        )}
        {!isNavigating && activeTab === "overview" && (
          <>
            <p className="handoff-panel-lead">{currentStep.why}</p>
            <HandoffCopyableSpecSection
              title="Ship checklist"
              copyKey="overview-acceptance"
              rows={currentStep.acceptance}
            />
            {currentStep.behaviors && currentStep.behaviors.length > 0 && (
              <HandoffCopyableSpecSection
                title="Interaction"
                copyKey="overview-behaviors"
                rows={currentStep.behaviors}
              />
            )}
            <HandoffCopyBlock
              label="Source file"
              copyKey="overview-source"
              text={currentStep.source}
            />
          </>
        )}
        {!isNavigating && activeTab === "spec" && (
          <>
            <HandoffCopyableSpecSection
              title="Dimensions & layout"
              copyKey="spec-dimensions"
              rows={currentStep.specRows}
            />
            {currentStep.states && currentStep.states.length > 0 && (
              <HandoffCopyableSpecSection
                title="Visual states"
                copyKey="spec-states"
                rows={currentStep.states}
              />
            )}
            {currentStep.a11y && currentStep.a11y.length > 0 && (
              <HandoffCopyableSpecSection
                title="Accessibility"
                copyKey="spec-a11y"
                rows={currentStep.a11y}
              />
            )}
            {StepPreview && (
              <div className="handoff-preview-root handoff-preview-root--reference">
                <StepPreview />
              </div>
            )}
          </>
        )}
        {!isNavigating && activeTab === "code" && (
          <>
            {currentStep.copyBlocks.map((block, index) => (
              <HandoffCopyBlock
                key={block.label}
                label={block.label}
                copyKey={`code-block-${index}`}
                text={block.code}
              />
            ))}
            <div className="handoff-code-wrap">
              <div className="handoff-code-header">
                <span className="handoff-code-label">Full implementation</span>
                <HandoffCopyButton
                  copied={codeCopied}
                  ariaLabel="Copy full implementation"
                  className="handoff-code-copy"
                  onClick={copyAllCode}
                />
              </div>
              <pre className="handoff-code">{currentStep.code}</pre>
            </div>
          </>
        )}
      </div>

      <div className="handoff-panel-nav">
        <button
          type="button"
          className="handoff-nav-btn"
          onClick={prevStep}
          disabled={stepIndex === 0 || isNavigating}>
          Previous
        </button>
        <button
          type="button"
          className="handoff-nav-btn handoff-nav-btn--next primary"
          onClick={nextStep}
          disabled={isNavigating}>
          {stepIndex >= totalSteps - 1 ? "Done" : "Next"}
        </button>
        <button
          type="button"
          className="handoff-nav-btn handoff-nav-btn--skip"
          onClick={endHandoff}>
          Skip
        </button>
      </div>
    </div>,
    document.body,
  );
}
