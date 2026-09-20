'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { EASE, useReduce } from '@/components/case-study-kit/Motion';

// A figure inside a sentence: green, and it counts up once it scrolls into view. The final value
// is laid out (invisibly) from the start, so the line doesn't reflow while the digits are running.
export default function Num({ to, prefix = '', suffix = '', decimals = 0, duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const reduce = useReduce();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setValue(to);
      return undefined;
    }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: setValue });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  const final = `${prefix}${to.toFixed(decimals)}${suffix}`;
  return (
    <span ref={ref} className="px-num" aria-label={final}>
      <span className="px-num__final" aria-hidden="true">
        {final}
      </span>
      <span className="px-num__live" aria-hidden="true">
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
