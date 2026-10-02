'use client';

import { motion } from 'motion/react';
import Action from '@/app/_home/Action';
import { CASES, MORE } from '@/app/_home/cases';
import { useT } from '@/components/i18n/LangProvider';

// The end of a case study, opening the site's footer (SiteFooter.js) on its glow and at the width of
// the letter below it: "Up next" with the way back to all the work and the way to get in touch (the
// homepage's pills) on one line, then two more case studies (`following`). Each is a tile in its own
// colour (a hairline, a wash from one corner, its ✦) with its cover (or, until it has one, the ✦ large
// on a wash) over the case study's own type: a mono eyebrow, the title in the display face, its line
// and an underlined link. `current` is the case study's slug in app/_home/cases.js.

const EASE = [0.16, 1, 0.3, 1];
const STAR = 'M12 0C12.6 6.6 17.4 11.4 24 12 17.4 12.6 12.6 17.4 12 24 11.4 17.4 6.6 12.6 0 12 6.6 11.4 11.4 6.6 12 0Z';

const rise = (delay = 0, y = 20) => ({
  initial: { opacity: 0, y, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1, ease: EASE, delay },
});

export default function CaseStudyEnd({ current }) {
  const t = useT();
  const next = following(current);

  return (
    <section className="cse" aria-labelledby="cse-title">
      <div className="cse__head">
        <motion.h2 className="cse__heading" id="cse-title" {...rise(0, 12)}>
          <motion.svg
            className="cse__star"
            viewBox="0 0 24 24"
            aria-hidden="true"
            initial={{ scale: 0, rotate: -90 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
          >
            <path d={STAR} />
          </motion.svg>
          {t('footer.next', 'Up next')}
        </motion.h2>
        <motion.div className="cse__buttons" {...rise(0.1, 12)}>
          <Action href="/#work" arrow="←" variant="ghost">
            {t('footer.all', 'All work')}
          </Action>
          <Action href="/contact">{t('footer.contact', 'Get in touch')}</Action>
        </motion.div>
      </div>

      <ol className="cse__list">
        {next.map((work, i) => (
          <motion.li key={work.slug} style={{ '--accent': work.accent }} {...rise(0.12 + i * 0.08, 28)}>
            <Card work={work} read={t('footer.read', 'Read the case study')} />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

// The two that follow: for a featured case study, the next two in the homepage's order, round to the
// first; for one still being written, the next one being written (if any) and then the featured ones
// from the first.
function following(current) {
  const at = CASES.findIndex((w) => w.slug === current);
  if (at >= 0) return [1, 2].map((step) => CASES[(at + step) % CASES.length]).filter((w) => w.slug !== current);
  const more = MORE.findIndex((w) => w.slug === current);
  return [...MORE.slice(more + 1, more + 2), ...CASES].slice(0, 2);
}

function Card({ work, read }) {
  return (
    <a href={work.href} className="cse__card">
      <span className={work.image ? 'cse__media' : 'cse__media cse__media--soon'}>
        {work.image ? (
          <img src={work.image.src} alt="" width={work.image.w} height={work.image.h} loading="lazy" />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={STAR} />
          </svg>
        )}
      </span>
      <svg className="cse__mark" viewBox="0 0 24 24" aria-hidden="true">
        <path d={STAR} />
      </svg>
      <span className="cse__text">
        <span className="cse__kicker">
          <span className="cse__num">{work.index}</span>
          {work.kicker}
        </span>
        <span className="cse__title">{work.title}</span>
        <span className="cse__line">{work.line}</span>
        <span className="cse__read">
          <span className="cse__read-label">{read}</span>
          <span className="cse__read-arrow" aria-hidden="true">
            →
          </span>
        </span>
      </span>
    </a>
  );
}
