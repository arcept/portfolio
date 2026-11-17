import Nav from '@/components/Nav';
import { aboutThemeGate } from '../about/theme';
import AboutMotion from '../about/AboutMotion';
import AboutThemeSwitch from '../about/AboutThemeSwitch';
import { display, sans } from '../about/fonts';
import ContactHybrid from './ContactHybrid';
import '../about/about.css';
import '../_home/home.css';
import '../about/resume/resume.css';
import './contact-hybrid.css';

// The Contact page (ContactHybrid.js). In the About page's system, so it takes the site's theme. It is its
// own footer.
export const metadata = {
  title: 'Contact — Manik Madaan',
  description: 'How to get in touch with Manik Madaan, product design leader.',
};

export default function Contact() {
  return (
    <AboutMotion>
      <div className={`abt ${display.variable} ${sans.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: aboutThemeGate() }} />
        <Nav actions={<AboutThemeSwitch />} />
        <ContactHybrid />
      </div>
    </AboutMotion>
  );
}
