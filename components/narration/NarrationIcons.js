// The transport icons, shared by the full player and the small one.

const Icon = ({ children, ...props }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    {children}
  </svg>
);

export const PlayIcon = () => (
  <Icon className="nr-i-fill">
    <path d="M8 5.5v13a.75.75 0 0 0 1.14.64l10.4-6.5a.75.75 0 0 0 0-1.28L9.14 4.86A.75.75 0 0 0 8 5.5Z" />
  </Icon>
);

export const PauseIcon = () => (
  <Icon className="nr-i-fill">
    <rect x="6.5" y="5" width="4" height="14" rx="1" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" />
  </Icon>
);

// Circular arrows, like the skip buttons in a music or podcast app: back turns anticlockwise, forward clockwise.
export const RewindIcon = () => (
  <Icon className="nr-i-line">
    <path d="M4.6 12.2a7.4 7.4 0 1 0 2.3-5.3" />
    <path d="M4.4 4.6v4h4" />
  </Icon>
);

export const ForwardIcon = () => (
  <Icon className="nr-i-line">
    <path d="M19.4 12.2a7.4 7.4 0 1 1-2.3-5.3" />
    <path d="M19.6 4.6v4h-4" />
  </Icon>
);
