import AboutMe from '@/app/_home/AboutMe';
import { display, sans } from '@/app/about/fonts';
import './site-footer.css';

// The homepage's closing section (app/_home/AboutMe.js) as the foot of a case study, in place of the old
// footer, opening with whatever the case study ends on (`children`, its CaseStudyEnd) on the same glow.
// It is built in the homepage's system, so it brings that system's scope (.abt, .hx-i: its tokens and
// buttons) and fonts with it; site-footer.css carries the light theme over from the homepage's
// attribute to the case studies', and fades the band in from the page above.
// `fontVars` are the case study's own faces (its display face), for an end set in its language.
export default function SiteFooter({ children, fontVars = '' }) {
  return (
    <div className={`abt abt--foot ${display.variable} ${sans.variable} ${fontVars}`}>
      <div className="hx-i">
        <AboutMe lead={children} />
      </div>
    </div>
  );
}
