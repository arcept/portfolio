import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { aboutThemeGate } from '../theme';
import AboutMotion from '../AboutMotion';
import AboutThemeSwitch from '../AboutThemeSwitch';
import { display, sans } from '../fonts';
import StoryComingSoon from './StoryComingSoon';
import '../about.css';
import './story.css';

// The Story page: the longer, more personal version the About page leads to. Not written yet; until it
// is, this says so and offers the way back.
export const metadata = {
  title: 'Story — Manik Madaan',
  description: 'The longer version of the About page: how Manik Madaan became a designer, how he thinks and leads, and why he stepped away.',
  robots: { index: false, follow: true },
};

export default function Story() {
  return (
    <AboutMotion>
      <div className={`abt ${display.variable} ${sans.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: aboutThemeGate() }} />
        <Nav actions={<AboutThemeSwitch />} />
        <StoryComingSoon />
        <Footer />
      </div>
    </AboutMotion>
  );
}
