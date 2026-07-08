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
  density = "auto",
  canvasAlign = "center",
}: {
  label: string;
  tokens?: string;
  children: ReactNode;
  /** Compact cards shrink-wrap for small triggers and single controls. */
  density?: "compact" | "auto";
  canvasAlign?: "center" | "start" | "stretch";
}) {
  return (
    <div
      className={[
        "handoff-preview-card",
        density === "compact" ? "handoff-preview-card--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}>
      <div className="handoff-preview-card-label">{label}</div>
      <div
        className={`handoff-preview-canvas handoff-preview-canvas--${canvasAlign}`}>
        {children}
      </div>
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
  const alignClass =
    align === "stretch"
      ? "handoff-preview-stage--stretch"
      : align === "start"
        ? "handoff-preview-stage--start"
        : "handoff-preview-stage--center";

  return (
    <div className={`handoff-preview-stage ${alignClass}`}>{children}</div>
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
}

function HandoffInlineMenuLabel({ label }: { label: ReactNode }) {
  if (typeof label === "string") {
    return <span className="handoff-inline-menu-label">{label}</span>;
  }
  return <div className="handoff-inline-menu-label">{label}</div>;
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
            ]
              .filter(Boolean)
              .join(" ")}
            role="menuitem"
            aria-disabled={item.disabled || undefined}>
            {item.icon && (
              <span className="handoff-inline-menu-icon">{item.icon}</span>
            )}
            <HandoffInlineMenuLabel label={item.label} />
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
