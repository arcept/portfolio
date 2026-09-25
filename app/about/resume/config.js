// The résumé download, in one place.
//
// RESUME_GATE: true asks for a name and email before the download; false keeps only the choice of
// file and the button. It is a courtesy, not a lock: the PDFs are ordinary files on a static site.
export const RESUME_GATE = true;

// Where the name and email are sent: the Google Apps Script web app that appends a row to the sheet
// and emails a notification (docs/resume/apps-script.gs). null until it is deployed; the gate still
// works, it just records nothing.
export const GATE_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyVEKavjW4Yzx_J2BhB-GmrPT_Ao99Pw8aneDjqZcLvKe8kftgljnChZAv6XxDdA9ct/exec';

// When the PDFs were last generated, for the downloaded file names ("…-Sep-2026.pdf").
export const RESUME_DATE = { month: 'Sep', year: 2026 };

const stamp = `${RESUME_DATE.month}-${RESUME_DATE.year}`;

export const RESUME_FILES = {
  design: { src: '/about/resume/resume-design.pdf', name: `Manik-Madaan-Resume-${stamp}.pdf` },
  ats: { src: '/about/resume/resume-ats.pdf', name: `Manik-Madaan-Resume-ATS-${stamp}.pdf` },
};

// The pop-up's illustration and its credit, shown over the foot of the image: a portrait version for the
// two-column desktop dialog, a landscape one for the band across the top on phones.
export const ILLUSTRATION = {
  src: '/about/resume/illustration.webp',
  width: 900,
  height: 1200,
  wide: '/about/resume/illustration-wide.webp',
  credit: 'Generated with AI,', // then "inspired by …"; on desktop the two halves take a line each
  inspiredBy: [
    { name: 'Arunas Kacinskas', href: 'https://dribbble.com/Yellowcardas' },
    { name: 'MUTI', href: 'https://dribbble.com/studioMUTI' },
  ],
};
