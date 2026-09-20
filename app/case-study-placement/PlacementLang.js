'use client';

import { LangProvider } from '@/components/i18n/LangProvider';

// The languages this case study is offered in, and how each is loaded (only when first chosen). English is the
// page's own text; a dictionary supplies the rest. To add a language: write ui.<code>.js and i18n/<code>.js,
// then add it here (see docs/i18n/README.md).
const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', short: 'IT', flag: '🇮🇹' },
];

// Each language is two dictionaries merged: the shared interface words (buttons, labels; reusable by other case
// studies) and this case study's own text.
const merged = (ui, page) => Promise.all([ui(), page()]).then(([u, p]) => ({ default: { ...u.default, ...p.default } }));

const LOADERS = {
  de: () => merged(() => import('@/components/i18n/ui.de'), () => import('./i18n/de')),
  it: () => merged(() => import('@/components/i18n/ui.it'), () => import('./i18n/it')),
};

export default function PlacementLang({ children }) {
  return (
    <LangProvider languages={LANGUAGES} loaders={LOADERS}>
      {children}
    </LangProvider>
  );
}
