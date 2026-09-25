'use client';

import { useEffect, useState } from 'react';
import { ResumeATS, ResumeDesign } from '../ResumeDocs';

export default function ResumePrint() {
  const [only, setOnly] = useState(null);
  useEffect(() => setOnly(new URLSearchParams(location.search).get('only') ?? 'design'), []);
  if (!only) return null;
  return only === 'ats' ? <ResumeATS /> : <ResumeDesign />;
}
