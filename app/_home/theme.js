import { ABT_ATTR, ABT_KEY } from '@/app/about/theme';

// The homepage uses the About page's theme (the same switch and stored choice), but opens light: an
// inline script declares that default on <html> (data-abt-default, which the switch reads when it
// mounts) and applies it before first paint, unless the visitor chose a theme with the switch this
// visit. Every way off the page is a full page load, so the declaration never reaches another page.
export function homeThemeGate() {
  return `(function(){try{var r=document.documentElement;r.dataset.abtDefault='light';var s=null;try{s=sessionStorage.getItem('${ABT_KEY}')}catch(e){}r.setAttribute('${ABT_ATTR}',(s==='light'||s==='dark')?s:'light')}catch(e){}})();`;
}
