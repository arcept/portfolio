'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export default function CaseStudyNav({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const shouldReduceMotion = useReducedMotion();
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  useEffect(() => {
    const targets = sectionsRef.current
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    if (targets.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleClick(e, id) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <nav className="cs-toc" aria-label="Case study sections">
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`cs-toc__link ${activeId === id ? 'is-active' : ''}`}
          onClick={(e) => handleClick(e, id)}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
