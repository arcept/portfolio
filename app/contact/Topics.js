'use client';

import { EMAIL } from './data';

// The "Write to me about" tile, over a faint dot pattern: each topic a row with its icon, and a link that
// opens an email with that subject already filled in.

const TOPICS = [
  {
    label: 'Design leadership roles',
    subject: 'A design leadership role',
    icon: <path d="M6 20.5V4m0 .5h11l-2.5 4 2.5 4H6" />,
  },
  {
    label: 'Senior product design roles',
    subject: 'A senior product design role',
    icon: (
      <>
        <path d="M12 3.5 18.5 10 12 20.5 5.5 10z" />
        <circle cx="12" cy="11" r="1.8" />
        <path d="M12 3.5v5.7" />
      </>
    ),
  },
  {
    label: 'Freelance or consulting',
    subject: 'Freelance or consulting work',
    icon: (
      <>
        <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
        <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 12.5h17" />
      </>
    ),
  },
  {
    label: 'Just saying hello',
    subject: 'Hello',
    icon: <path d="M5 18.5V7a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 7v6a2.5 2.5 0 0 1-2.5 2.5H9z M9 9.5h6M9 12h3.5" />,
  },
];

const mailto = (t) => `mailto:${EMAIL}?subject=${encodeURIComponent(t.subject)}`;

function Icon({ children }) {
  return (
    <svg className="tpc__icon" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function Topics() {
  return (
    <div className="tpc">
      <span className="tpc__dots" aria-hidden="true" />
      <h2 className="cth__tile-kicker">Write to me about</h2>
      <Rows />
    </div>
  );
}

function Rows() {
  return (
    <ul className="tpc__rows">
      {TOPICS.map((t) => (
        <li key={t.label}>
          <a href={mailto(t)}>
            <Icon>{t.icon}</Icon>
            <span className="tpc__label">{t.label}</span>
            <span className="tpc__go" aria-hidden="true">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
