'use client';

import { useEffect, useState } from 'react';

// Which colour the first principle's glass gem is: 'blue' or 'emerald'. Change GEM to switch it
// everywhere (the gem itself, and the phone card's tint). While comparing, ?gem=blue or ?gem=emerald
// on the URL overrides it for that visit.
export const GEM = 'emerald';

export default function useGem() {
  const [gem, setGem] = useState(GEM);
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get('gem');
    if (asked === 'blue' || asked === 'emerald') setGem(asked);
  }, []);
  return gem;
}
