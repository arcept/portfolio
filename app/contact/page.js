import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { aboutThemeGate } from '../about/theme';
import AboutMotion from '../about/AboutMotion';
import AboutThemeSwitch from '../about/AboutThemeSwitch';
import { display, sans } from '../about/fonts';
import ContactSoon from './ContactSoon';
import '../about/about.css';
import './contact.css';

// The Contact page. Not built yet; until it is, this says so and gives the ways to get in touch that
// already work. In the About page's system, so it takes the site's theme.
export const metadata = {
  title: 'Contact — Manik Madaan',
  description: 'How to get in touch with Manik Madaan, product design leader.',
  robots: { index: false, follow: true },
};

export default function Contact() {
  return (
    <AboutMotion>
      <div className={`abt ${display.variable} ${sans.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: aboutThemeGate() }} />
        <Nav actions={<AboutThemeSwitch />} />
        <ContactSoon />
        <Footer />
      </div>
    </AboutMotion>
  );
}
