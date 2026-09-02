'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export default function CaseStudyNav({ sections, projectFiles }) {
  const [activeId, setActiveId] = useState(sections.find((s) => s.id)?.id);
  const [indicator, setIndicator] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const sectionsRef = useRef(sections);
  const listRef = useRef(null);
  sectionsRef.current = sections;

  useEffect(() => {
    const targets = sectionsRef.current
      .filter(({ id }) => id)
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

  // Measure the active link's position so the rail indicator can slide to
  // it instead of jumping — re-measured whenever the active section changes.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !activeId) return;
    const activeLink = list.querySelector(`[data-id="${activeId}"]`);
    if (!activeLink) return;
    setIndicator({ top: activeLink.offsetTop, height: activeLink.offsetHeight });
  }, [activeId]);

  function handleClick(e, id) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <nav className="cs-toc" aria-label="Case study sections">
      <div className="cs-toc__list" ref={listRef}>
        <div className="cs-toc__track" aria-hidden="true" />
        {indicator && (
          <div
            className="cs-toc__indicator"
            aria-hidden="true"
            style={{
              transform: `translateY(${indicator.top}px)`,
              height: indicator.height,
              transition: shouldReduceMotion ? 'none' : undefined,
            }}
          />
        )}
        {sections.map(({ id, label }, index) => {
          const number = String(index + 1).padStart(2, '0');
          if (!id) {
            return (
              <span key={label} className="cs-toc__link cs-toc__link--disabled">
                <span className="cs-toc__index">{number}</span>
                {label}
              </span>
            );
          }
          return (
            <a
              key={id}
              data-id={id}
              href={`#${id}`}
              className={`cs-toc__link ${activeId === id ? 'is-active' : ''}`}
              onClick={(e) => handleClick(e, id)}
            >
              <span className="cs-toc__index">{number}</span>
              {label}
            </a>
          );
        })}
      </div>

      {projectFiles && projectFiles.length > 0 && (
        <div className="cs-toc__files">
          <p className="cs-toc__files-heading">Project Files</p>
          <div className="cs-toc__file-list">
            {projectFiles.map(({ label, type, href }) => (
              <a key={label} href={href} className="cs-toc__file">
                <span className="cs-toc__file-label">{label}</span>
                <span className="cs-toc__file-type">{type}</span>
                <img
                  src="/case-studies/oms/body/arrow-up-right.svg"
                  alt=""
                  className="cs-toc__file-icon"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
