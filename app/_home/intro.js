import { INTRO_ATTR } from '@/app/about/intro';

// The homepage's loading curtain: the About page's (same look, same attribute, so about.css shows it
// and locks the scroll), remembered on its own. It shows on the first visit to the homepage in a
// browser tab, whether or not /about has shown its curtain in that tab, and is skipped on later visits.
//
// For previewing: /?intro shows the curtain on every load.

export const HOME_INTRO_KEY = 'home-intro-seen';
export { INTRO_ATTR };

export function homeIntroGate() {
  return `(function(){try{if(!/[?&]intro\\b/.test(location.search)&&sessionStorage.getItem('${HOME_INTRO_KEY}'))return}catch(e){}document.documentElement.setAttribute('${INTRO_ATTR}','')})();`;
}
