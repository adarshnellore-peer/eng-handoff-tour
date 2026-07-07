import type { CSSProperties, ReactNode } from "react";

export function HandoffPreviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="handoff-preview-section">
      <div className="handoff-preview-section-title">{title}</div>
      {children}
    </div>
  );
}

export function HandoffPreviewGrid({ children }: { children: ReactNode }) {
  return <div className="handoff-preview-grid">{children}</div>;
}

export function HandoffPreviewCard({
  label,
  tokens,
  children,
  simulated,
}: {
  label: string;
  tokens?: string;
  children: ReactNode;
  /** Hover/focus states that cannot be prop-driven */
  simulated?: "hover" | "focus";
}) {
  const simClass =
    simulated === "hover"
      ? " handoff-preview-card--sim-hover"
      : simulated === "focus"
        ? " handoff-preview-card--sim-focus"
        : "";

  return (
    <div className={`handoff-preview-card${simClass}`}>
      <div className="handoff-preview-card-label">{label}</div>
      <div className="handoff-preview-canvas">{children}</div>
      {tokens && <div className="handoff-preview-card-tokens">{tokens}</div>}
    </div>
  );
}

export function HandoffPreviewStage({
  children,
  align = "center",
}: {
  children: ReactNode;
  align?: "center" | "start" | "stretch";
}) {
  return (
    <div
      className="handoff-preview-stage"
      style={{ justifyContent: align === "center" ? "center" : align }}>
      {children}
    </div>
  );
}

export interface HandoffInlineMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  dividerAfter?: boolean;
  indent?: boolean;
}

/** Inline menu surface — same item structure as DS Menu, without portaling. */
export function HandoffInlineMenu({
  items,
  maxWidth = 240,
  ariaLabel,
}: {
  items: HandoffInlineMenuItem[];
  maxWidth?: number;
  ariaLabel?: string;
}) {
  return (
    <div
      className="handoff-inline-menu"
      style={{ maxWidth } as CSSProperties}
      role="menu"
      aria-label={ariaLabel}>
      {items.map((item) => (
        <div key={item.key}>
          <div
            className={[
              "handoff-inline-menu-item",
              item.selected ? "handoff-inline-menu-item--selected" : "",
              item.disabled ? "handoff-inline-menu-item--disabled" : "",
              item.indent ? "handoff-inline-menu-item--indent" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="menuitem"
            aria-disabled={item.disabled || undefined}>
            {item.icon && (
              <span className="handoff-inline-menu-icon">{item.icon}</span>
            )}
            <span className="handoff-inline-menu-label">{item.label}</span>
            {item.trailing && (
              <span className="handoff-inline-menu-trailing">{item.trailing}</span>
            )}
          </div>
          {item.dividerAfter && <div className="handoff-inline-menu-divider" />}
        </div>
      ))}
    </div>
  );
}
