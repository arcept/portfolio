'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'motion/react';

// Selecting a card (click/hover) is a separate, exclusive "read more"
// affordance from the rail — only one card is expanded at a time. The rail
// itself (icon + connecting line) is scroll-scrubbed, not click-driven: see
// DecisionItem below.
const SURFACE_TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

function DecisionItem({
  decision,
  index,
  isLast,
  isDone,
  isSelected,
  isHovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onLineProgress,
  shouldReduceMotion,
}) {
  const iconRef = useRef(null);
  const lineRef = useRef(null);
  const transition = shouldReduceMotion ? { duration: 0 } : SURFACE_TRANSITION;
  const hasDetail = Boolean(decision.detail);

  // The connecting line to the next item fills top-to-bottom as it crosses
  // a fixed reference line ~85% down the viewport — a direct, reversible
  // function of scroll position (like CaseStudySection's fade), not a
  // timed color swap. The last item renders no line, so lineRef would
  // never attach to anything — falling back to iconRef there keeps
  // useScroll's target always valid; the resulting value just goes unused
  // since isLast skips rendering it.
  const { scrollYProgress: lineProgress } = useScroll({
    target: isLast ? iconRef : lineRef,
    offset: ['start 85%', 'end 85%'],
  });
  const fillHeight = useTransform(lineProgress, [0, 1], ['0%', '100%']);

  // The NEXT item's icon checks off once this line finishes filling — not
  // its own independent scroll tracking. An icon tracking its own ~20px
  // transit was flaky over a long scroll (it would silently revert while
  // still scrolling forward, past the icon, not just on an actual
  // reversal) — driving it off the same value that already animates the
  // fill keeps the two perfectly consistent and only un-checks a step
  // when its incoming line actually recedes back below the line.
  useMotionValueEvent(lineProgress, 'change', (value) => {
    if (shouldReduceMotion || isLast) return;
    onLineProgress(index, value >= 1);
  });

  return (
    <div className="cs-decision">
      <div className="cs-decision__rail">
        <img
          ref={iconRef}
          src={
            isDone
              ? '/case-studies/oms/body/step-check.svg'
              : '/case-studies/oms/body/step-outline.svg'
          }
          alt=""
          className="cs-decision__icon"
        />
        {!isLast && (
          <div className="cs-decision__line" ref={lineRef}>
            <motion.div
              className="cs-decision__line-fill"
              style={{ height: shouldReduceMotion ? '0%' : fillHeight }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        className="cs-decision__body"
        aria-expanded={isSelected}
        onClick={() => onSelect(index)}
        onPointerEnter={() => onHoverStart(index)}
        onPointerLeave={onHoverEnd}
        onFocus={() => onHoverStart(index)}
        onBlur={onHoverEnd}
      >
        <motion.div
          className="cs-decision__surface"
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isSelected ? 1 : isHovered ? 0.6 : 0,
            borderRadius: isSelected || isHovered ? 16 : 0,
          }}
          transition={transition}
        />

        <div className="cs-decision__content">
          <p className="cs-decision__number">{decision.number}</p>
          <p className="cs-decision__heading">{decision.heading}</p>
          <p className="cs-decision__desc">{decision.desc}</p>

          {hasDetail && (
            <motion.div
              initial={false}
              animate={{
                height: isSelected ? 'auto' : 0,
                opacity: isSelected ? 1 : 0,
              }}
              transition={transition}
              style={{ overflow: 'hidden' }}
            >
              <div className="cs-decision__detail">
                <div>
                  <p className="cs-decision__detail-label">Rejected</p>
                  <p className="cs-decision__detail-desc">{decision.detail.rejected}</p>
                </div>
                <div>
                  <p className="cs-decision__detail-label">At stake</p>
                  <p className="cs-decision__detail-desc">{decision.detail.atStake}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </button>
    </div>
  );
}

export default function DecisionStepper({ decisions }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  // doneStates[i] = whether item i's icon is checked. Item 0 starts checked
  // (nothing precedes it to scroll past); every other item is driven by
  // the previous item's line-fill progress via onLineProgress below.
  const [doneStates, setDoneStates] = useState(() => decisions.map((_, i) => i === 0));
  const shouldReduceMotion = useReducedMotion();

  const handleLineProgress = (index, isPast) => {
    setDoneStates((prev) => {
      if (prev[index + 1] === isPast) return prev;
      const next = [...prev];
      next[index + 1] = isPast;
      return next;
    });
  };

  return (
    <div className="cs-decision-list">
      {decisions.map((decision, index) => (
        <DecisionItem
          key={decision.number}
          decision={decision}
          index={index}
          isLast={index === decisions.length - 1}
          isDone={doneStates[index]}
          isSelected={index === selectedIndex}
          isHovered={index === hoveredIndex && index !== selectedIndex}
          onSelect={setSelectedIndex}
          onHoverStart={setHoveredIndex}
          onHoverEnd={() => setHoveredIndex(null)}
          onLineProgress={handleLineProgress}
          shouldReduceMotion={shouldReduceMotion}
        />
      ))}
    </div>
  );
}
