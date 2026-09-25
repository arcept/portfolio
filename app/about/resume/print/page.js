import { sans } from '../../fonts';
import ResumePrint from './ResumePrint';
import '../resume-docs.css';

// The two résumés on their own, for scripts/build-resume.mjs to print to PDF: ?only=design or ?only=ats.
// Not linked from anywhere and not indexed.
export const metadata = {
  title: 'Résumé (print)',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className={sans.variable}>
      <ResumePrint />
    </div>
  );
}
