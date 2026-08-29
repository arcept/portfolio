/* ============================================================
   OMS v3 — Icon set: thin (1.6px) stroke, 24×24 viewBox, no fills.
   Kept as a small hand-authored set rather than an icon library,
   so the whole prototype has zero external/CDN dependencies.
   ============================================================ */
(function (OMS) {
  "use strict";
  function svg(inner, extra) {
    return '<svg class="i-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' + (extra || "") + ">" + inner + "</svg>";
  }
  OMS.icons = {
    check: svg('<path d="M4 12.5 9.5 18 20 6"/>'),
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    chevronDown: svg('<path d="M6 9l6 6 6-6"/>'),
    chevronRight: svg('<path d="M9 6l6 6-6 6"/>'),
    chevronLeft: svg('<path d="M15 6l-6 6 6 6"/>'),
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>'),
    filter: svg('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a1 1 0 0 1 1-1h9"/>'),
    external: svg('<path d="M14 5h5v5M19 5l-8.5 8.5M8 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    trash: svg('<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"/>'),
    bolt: svg('<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/>'),
    arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    arrowUpRight: svg('<path d="M7 17 17 7M9 7h8v8"/>'),
    clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5l3 2"/>'),
    calendar: svg('<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    user: svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'),
    users: svg('<circle cx="9" cy="8" r="3"/><path d="M2.5 19a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="8.5" r="2.5"/><path d="M15.5 13a5.5 5.5 0 0 1 5.5 6"/>'),
    layers: svg('<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M3 13l9 5 9-5M3 18l9 5 9-5" opacity="0.55"/>'),
    grid: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>'),
    barChart: svg('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
    pieChart: svg('<path d="M12 3v9l7.8 4.5"/><circle cx="12" cy="12" r="8.5"/>'),
    trend: svg('<path d="M4 16l5.5-6 4 4L20 6"/><path d="M14 6h6v6"/>'),
    creditCard: svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>'),
    receipt: svg('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6"/>'),
    mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 6.5l8 6 8-6"/>'),
    whatsapp: svg('<path d="M7 17.5 4.5 20l1-3.4a8 8 0 1 1 3 2.6L7 17.5Z"/><path d="M9 9c0 3 2 5.5 5 6" opacity="0.6"/>'),
    hubspot: svg('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="1.8"/><circle cx="18.5" cy="15.5" r="1.8"/><circle cx="5.5" cy="15.5" r="1.8"/><path d="M12 8v1M15.7 14l-2-1.2M8.3 14l2-1.2"/>'),
    flag: svg('<path d="M5 3v18"/><path d="M5 4h13l-3 4 3 4H5"/>'),
    reload: svg('<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>'),
    globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.3 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.3-3.8-8.5S9.5 5.9 12 3.5Z"/>'),
    link: svg('<path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 5.7 5.7l-1.7 1.7M13 18l-1 1a4 4 0 0 1-5.7-5.7l1.7-1.7"/>'),
    dots: svg('<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>'),
    pencil: svg('<path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19 4 20Z"/>'),
    shield: svg('<path d="M12 3 5 6v6c0 4.2 3 7 7 9 4-2 7-4.8 7-9V6l-7-3Z"/><path d="M9 12l2 2 4-4.5" />'),
    sparkle: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>')
  };
})(window.OMS = window.OMS || {});
