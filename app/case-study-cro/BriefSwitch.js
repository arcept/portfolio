'use client';

import { BRIEFS } from './briefs';

// The "In brief" layouts as links pinned to the window, shown only with ?compare on the URL (CroBody.js). Each
// link keeps ?compare, so the switcher stays while you move between them.
export default function BriefSwitch({ current }) {
  return (
    <nav className="cro-dirs" aria-label="In brief layout">
      <div className="cro-dirs__group" role="group" aria-label="In brief">
        <span className="cro-dirs__label">In brief</span>
        {BRIEFS.map(({ id, name }, i) => (
          <a key={id} href={`?compare&brief=${id}`} className="cro-dirs__opt" aria-current={current === id ? 'page' : undefined}>
            <span className="cro-dirs__id">{i + 1}</span>
            {name}
          </a>
        ))}
      </div>
    </nav>
  );
}
