/* ============================================================
   OMS v3 — App bootstrap / router
   ============================================================ */
(function (OMS) {
  "use strict";

  var appEl = document.getElementById("app-view");
  var sidebarEl = document.getElementById("app-sidebar");
  var topbarEl = document.getElementById("mobile-topbar");
  var scrimEl = document.getElementById("sidebar-scrim");
  var contentEl = document.getElementById("app-content");
  var navMounted = false;

  function openApp() {
    appEl.classList.add("is-active");
    document.body.style.overflow = "";
    if (!navMounted) { OMS.navComponent.render({ sidebar: sidebarEl, topbar: topbarEl, scrim: scrimEl }); navMounted = true; }
    renderRoute();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderRoute() {
    var s = OMS.store.get();
    OMS.utils.swapContent(contentEl, function (mount) {
      if (s.route === "deals") OMS.dealsListComponent.render(mount);
      else if (s.route === "dealDetail") OMS.dealDetailComponent.render(mount, s.selectedDealId);
      else OMS.dashboardComponent.render(mount);
    });
  }

  var lastRoute = null, lastPerson = null;
  OMS.store.subscribe(function (s) {
    if (!appEl.classList.contains("is-active")) return;
    if (s.route !== lastRoute || s.personId !== lastPerson) {
      lastRoute = s.route; lastPerson = s.personId;
      renderRoute();
    }
  });

  OMS.app = { openApp: openApp };

  // ---- boot ----
  // The marketing landing page has been removed — this always boots
  // straight into the product now, regardless of embed/hash context.
  openApp();
})(window.OMS = window.OMS || {});
