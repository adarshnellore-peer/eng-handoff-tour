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

/** Copy-to-clipboard (two overlapping pages). Zero deps. */
export function HandoffCopyIcon({ className }: HandoffPanelIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden>
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
  );
}

/** Checkmark for copy confirmation. */
export function HandoffCheckIcon({ className }: HandoffPanelIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden>
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}
