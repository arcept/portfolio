// Numbers as written in the page's language. English is left exactly as it was (toFixed); German and Italian
// write the decimal comma (55,5), and German sets the percent sign apart (30 %) with a non-breaking space.
export function formatNumber(value, decimals, lang) {
  if (!lang || lang === 'en') return value.toFixed(decimals);
  return value.toLocaleString(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false });
}

export function localSuffix(suffix, lang) {
  return lang === 'de' && suffix === '%' ? ' %' : suffix;
}
