interface HandoffPanelIconProps {
  className?: string;
}

/** Material-style fullscreen expand (four outward corners). Zero deps. */
export function HandoffExpandIcon({ className }: HandoffPanelIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden>
      <path d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z" />
    </svg>
  );
}

/** Material-style fullscreen exit (four inward corners). */
export function HandoffCollapseIcon({ className }: HandoffPanelIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden>
      <path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z" />
    </svg>
  );
}
