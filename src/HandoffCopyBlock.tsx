import { useCallback, useState } from "react";
import {
  HandoffCheckIcon,
  HandoffCopyIcon,
} from "./HandoffPanelIcons";

function useCopyFeedback() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  return { copiedKey, copy };
}

export function HandoffCopyButton({
  copied,
  ariaLabel,
  className = "",
  onClick,
}: {
  copied: boolean;
  ariaLabel: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`handoff-copy-btn${className ? ` ${className}` : ""}`}
      onClick={onClick}
      aria-label={copied ? `${ariaLabel} copied` : ariaLabel}>
      {copied ? (
        <HandoffCheckIcon className="handoff-copy-btn-icon" />
      ) : (
        <HandoffCopyIcon className="handoff-copy-btn-icon" />
      )}
    </button>
  );
}

export function HandoffCopyBlock({
  label,
  text,
  copyKey,
  variant = "mono",
}: {
  label: string;
  text: string;
  copyKey: string;
  variant?: "mono" | "prose";
}) {
  const { copiedKey, copy } = useCopyFeedback();
  const copied = copiedKey === copyKey;

  return (
    <div className="handoff-copy-block">
      <div className="handoff-copy-block-header">
        <span className="handoff-copy-block-label">{label}</span>
        <HandoffCopyButton
          copied={copied}
          ariaLabel={`Copy ${label.toLowerCase()}`}
          onClick={() => void copy(copyKey, text)}
        />
      </div>
      <pre
        className={
          variant === "mono"
            ? "handoff-copy-block-text handoff-copy-block-text--mono"
            : "handoff-copy-block-text"
        }>
        {text}
      </pre>
    </div>
  );
}

export function HandoffCopyableSpecSection({
  title,
  rows,
  copyKey,
}: {
  title: string;
  rows: [label: string, value: string][];
  copyKey: string;
}) {
  const { copiedKey, copy } = useCopyFeedback();
  const allText = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const allCopied = copiedKey === `${copyKey}-all`;

  return (
    <div className="handoff-spec-section">
      <div className="handoff-copy-block-header handoff-copyable-spec-header">
        <span className="handoff-spec-section-title">{title}</span>
        <HandoffCopyButton
          copied={allCopied}
          ariaLabel={`Copy all ${title.toLowerCase()}`}
          onClick={() => void copy(`${copyKey}-all`, allText)}
        />
      </div>
      <table className="handoff-spec-table handoff-spec-table--copyable">
        <tbody>
          {rows.map(([label, value]) => {
            const rowKey = `${copyKey}-${label}`;
            const rowCopied = copiedKey === rowKey;
            return (
              <tr key={label}>
                <td>{label}</td>
                <td>{value}</td>
                <td className="handoff-spec-copy-cell">
                  <HandoffCopyButton
                    copied={rowCopied}
                    ariaLabel={`Copy ${label}`}
                    className="handoff-copy-btn--row"
                    onClick={() => void copy(rowKey, value)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
