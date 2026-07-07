import type { HandoffManifest } from "../src/types";

/** Example manifest — copy and adapt for your feature PR */
export const sampleHandoff: HandoffManifest = {
  id: "header-toolbar-redesign",
  title: "Header toolbar redesign",
  branch: "feat/header-toolbar",
  commit: "abc1234",
  intro:
    "Guided tour of header changes for engineering review. Toggle targets in the live app.",
  steps: [
    {
      targetId: "save-button",
      title: "Save button",
      change: "Text label → icon-only",
      why: "Reduces header clutter. Same save behavior on click.",
      source: "src/components/Header/SaveButton.tsx",
      specRows: [
        ["Component", "Button variant=outline size=sm"],
        ["Icon", "Save · md · text.secondary"],
        ["Placement", "Header right, before profile menu"],
      ],
      states: [
        [
          "Default",
          "Fill background.surface · Icon text.secondary · outline neutral",
        ],
        ["Hover", "DS button hover token"],
        ["Disabled", "While save in flight · Spinner replaces icon"],
        ["Focus-visible", "DS focus ring"],
      ],
      behaviors: [
        ["On click", "Triggers save(); disabled while isSaving"],
        ["Gating", "Hidden when readOnly"],
      ],
      a11y: [
        ['aria-label', '"Save document"'],
        ["Keyboard", "Enter/Space activates"],
      ],
      code: `      <Button
        variant="outline"
        size="sm"
        aria-label="Save document"
        disabled={isSaving}
        onClick={handleSave}
      />`,
    },
  ],
};
