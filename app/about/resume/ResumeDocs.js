'use client';

import { EDUCATION, EXPERIENCE, PERSON, SKILLS, SUMMARY } from './resume-content';

// The two résumés, as A4 documents laid out in millimetres and points so the print matches the screen:
// the designed one, for reading, and the ATS-friendly one, for job portals. Both read the same content
// (resume-content.js). They are printed to PDF by scripts/build-resume.mjs from /about/resume/print.
//
// A company's small square badge: its own square logo, its mark on its coloured tile (Leo Burnett), its
// mark alone, or an empty square.
function Badge({ r, size = '6.2mm' }) {
  const box = { width: size, height: size };
  if (r.badge) return <img className="rs-badge" src={r.badge} alt="" style={box} />;
  if (r.tile)
    return (
      <span className="rs-badge rs-badge--tile" style={{ ...box, background: r.tile.color }}>
        <span className="rs-badge__mask" style={{ WebkitMaskImage: `url(${r.tile.mark})`, maskImage: `url(${r.tile.mark})` }} />
      </span>
    );
  if (r.mark?.endsWith('.png')) return <img className="rs-badge rs-badge--plain" src={r.mark} alt="" style={box} />;
  if (r.mark)
    return (
      <span className="rs-badge rs-badge--plain" style={box}>
        <span className="rs-badge__mask rs-badge__mask--ink" style={{ WebkitMaskImage: `url(${r.mark})`, maskImage: `url(${r.mark})` }} />
      </span>
    );
  return <span className="rs-badge rs-badge--empty" style={box} />;
}

function RoleLg({ r, badge = true, earlyLine = false }) {
  return (
    <article className={`rx-role${r.early ? ' rx-role--early' : ''}`}>
      {badge && <Badge r={r} size={r.early ? '7mm' : '9mm'} />}
      <div className="rx-role__body">
        <div className="rx-role__top">
          <h3>{r.role}</h3>
          <span className="rx-when">{r.dates}</span>
        </div>
        <p className="rx-company">
          <strong>{r.company}</strong>
          {r.aka && <span> · {r.aka}</span>}
          <span className="rx-place"> · {r.place}</span>
        </p>
        {r.early ? (
          earlyLine && <p className="rx-line">{r.bullets[0]}</p>
        ) : (
          <ul className="rx-bullets">
            {r.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

// Skills as short rows, a group name then its items: compact enough to keep the résumé to two pages.
const SkillChips = () => (
  <div className="rx-skills">
    {SKILLS.map((g) => (
      <p key={g.group} className="rx-skillrow">
        <strong>{g.group}</strong>
        <span>{g.items.join('  ·  ')}</span>
      </p>
    ))}
  </div>
);

// The designed résumé: header and lede; experience with the dates on the right;
// Timeline's education (two by two, now with each school's logo),
// skills and contact, the contact in a tinted card. Email, LinkedIn and website are real links in the PDF.

const Links = ({ sep = '   ·   ' }) => (
  <>
    <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
    {sep}
    <a href={PERSON.linkedinUrl}>{PERSON.linkedin}</a>
    {sep}
    <a href={PERSON.websiteUrl}>{PERSON.website}</a>
    {sep}
    {PERSON.location}
  </>
);

function SchoolLogo({ s }) {
  if (!s.logo) return null;
  // Same visual weight for a tall mark and a long wordmark: size by area, capped in width.
  const h = Math.min(5.8, 16.5 / Math.sqrt(s.logo.ratio));
  return <img className="rx-edlogo" src={s.logo.src} alt="" style={{ height: `${h}mm`, maxWidth: '20mm' }} />;
}

// A short note beside each school.
const EDNOTE = { domus: 'Master’s degree', pearl: 'Merit scholarship', santafe: 'Short course', northcap: 'Dropped out' };
// Education in order of weight: the two degrees, then the short course, then the unfinished B.Tech.
const ED_ORDER = ['domus', 'pearl', 'santafe', 'northcap'];

export function ResumeDesign() {
  return (
    <div className="rs-doc rx rx-mo rx-mp">
      <header className="rx-mo__head">
        <div>
          <h1>{PERSON.name}</h1>
          <p className="rx-title">{PERSON.title}</p>
        </div>
        <img className="rs-photo" src={PERSON.photo} alt="" />
      </header>
      <p className="rx-mo__contact">
        <Links />
        <span className="rx-phone">{PERSON.phone}</span>
      </p>
      <p className="rx-mo__lede">{SUMMARY}</p>
      <h2 className="rx-h">
          <span className="rx-h__n">01</span>
          Experience
        </h2>
      {EXPERIENCE.filter((r) => r.id !== 'independent').map((r) => (
        <RoleLg key={r.id} r={r} earlyLine />
      ))}
      <section className="rs-keep">
        <h2 className="rx-h">
          <span className="rx-h__n">02</span>
          Education
        </h2>
        {/* One row per school, latest first: logo, degree, school and place, the note, then the years. */}
        <div className="rx-mp__edu">
          {ED_ORDER.map((id) => EDUCATION.find((e) => e.id === id)).map((s) => (
            <div key={s.id} className="rx-mp__edrow">
              <span className="rx-mp__logo">
                <SchoolLogo s={s} />
              </span>
              <p className="rx-mp__edtext">
                <strong>{s.programme}</strong>
                <span className="rx-mp__edsep"> · </span>
                {s.school}
                <span className="rx-mp__edplace">{s.place.replace(', New Mexico', '')}</span>
              </p>
              <span className={`rx-mp__ednote${s.id === 'northcap' ? ' rx-mp__stamp' : ''}`}>{EDNOTE[s.id]}</span>
              <span className="rx-when">{s.years}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="rx-tl__pair rx-mp__end">
        <section>
          <h2 className="rx-h">
          <span className="rx-h__n">03</span>
          Skills
        </h2>
          <SkillChips />
        </section>
        <section className="rx-mp__card">
          <h2 className="rx-h">
          <span className="rx-h__n">04</span>
          Contact
        </h2>
          <ul className="rx-contactlist">
            <li>
              <span>Email</span>
              <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
            </li>
            <li>
              <span>LinkedIn</span>
              <a href={PERSON.linkedinUrl}>{PERSON.linkedin}</a>
            </li>
            <li>
              <span>Phone</span>
              {PERSON.phone}
            </li>
            <li>
              <span>Website</span>
              <a href={PERSON.websiteUrl}>{PERSON.website}</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export function ResumeATS() {
  // The same content as the designed résumé (layout 8): no freelance line, education in order of weight
  // with the same notes, and real links.
  const edu = ED_ORDER.map((id) => EDUCATION.find((e) => e.id === id));
  return (
    <div className="rs-doc rs-ats">
      <h1>{PERSON.name}</h1>
      <p>{PERSON.title}</p>
      <p>
        {PERSON.location} | <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a> | {PERSON.phone} |{' '}
        <a href={PERSON.linkedinUrl}>{PERSON.linkedin}</a> | <a href={PERSON.websiteUrl}>{PERSON.website}</a>
      </p>
      <h2>Summary</h2>
      <p>{SUMMARY}</p>
      <h2>Experience</h2>
      {EXPERIENCE.filter((r) => r.id !== 'independent').map((r) => (
        <div key={r.id} className="rs-ats__role">
          <h3>
            {r.role}, {r.company}
            {r.aka && ` (${r.aka})`}
          </h3>
          <p>
            {r.dates} | {r.place}
          </p>
          <ul>
            {r.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
      <h2>Education</h2>
      {edu.map((s) => (
        <div key={s.id} className="rs-ats__role">
          <h3>
            {s.programme}, {s.school}
            {s.formerly && ` (formerly ${s.formerly})`}
          </h3>
          <p>
            {s.years} | {s.place} | {EDNOTE[s.id]}
          </p>
        </div>
      ))}
      <h2>Skills</h2>
      {SKILLS.map((g) => (
        <p key={g.group}>
          {g.group}: {g.items.join(', ')}
        </p>
      ))}
    </div>
  );
}
