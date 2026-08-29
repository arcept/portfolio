/* ============================================================
   OMS v3 — App left sidebar: workspace/role switcher, primary
   nav with a sliding active-indicator, mobile drawer + topbar.
   ============================================================ */
(function (OMS) {
  "use strict";
  var U = OMS.utils, I = OMS.icons, D = OMS.data, store = OMS.store;

  var NAV_ITEMS = [
    { route: "dashboard", label: "Home", icon: "grid" },
    { route: "deals", label: "Deals", icon: "layers" },
    { route: "payments", label: "Payments", icon: "creditCard", disabled: true }
  ];

  function roleMeta(person) {
    var map = {
      BDR: "Business Development Rep", ATL: "Associate Team Lead", TL: "Team Lead",
      TM: "Team Manager", ADMIN: "Sales Head / Admin"
    };
    return map[person.role] || person.role;
  }

  function scopeLine(person) {
    if (person.role === "ADMIN") return "Full floor visibility";
    if (person.role === "TM") return D.COURSES.find(function (c) { return c.id === person.courseId; }).short + " · owns 2 Team Leads";
    if (person.role === "TL") return "Owns " + D.reportsOf(person.id).length + " reps";
    return "Own leads only";
  }

  function isActiveRoute(item, s) {
    if (item.route === "dashboard") return s.route !== "deals" && s.route !== "dealDetail";
    if (item.route === "deals") return s.route === "deals" || s.route === "dealDetail";
    return false;
  }

  // render({sidebar, topbar, scrim})
  function render(els) {
    var menuOpen = false, drawerOpen = false, indicator = null;
    var lastPersonId = null;

    function paint() {
      var s = store.get();
      var person = store.currentPerson();

      els.sidebar.innerHTML =
        '<div class="sidebar-brand">' +
          '<span class="brand-mark"></span><span>OMS <span class="brand-sub">v3.0</span></span>' +
        "</div>" +
        '<button class="sidebar-workspace" data-nav="role-toggle" aria-haspopup="true" aria-expanded="' + menuOpen + '">' +
          '<span class="avatar">' + person.initials + "</span>" +
          '<span class="ws-text"><span class="ws-name">' + U.escapeHtml(person.name) + '</span><br/><span class="ws-role mono">' + person.role + "</span></span>" +
          I.chevronDown +
        "</button>" +
        renderMenu(person) +
        '<nav class="sidebar-nav" aria-label="Primary">' +
          '<div class="sidebar-nav-indicator" data-indicator></div>' +
          NAV_ITEMS.map(function (item) {
            var active = isActiveRoute(item, s);
            return '<button class="sidebar-link' + (active ? " is-active" : "") + '" data-nav="' + item.route + '"' + (item.disabled ? " disabled" : "") + ">" +
              I[item.icon] + "<span>" + item.label + "</span>" +
              (item.disabled ? '<span class="tag-soon">soon</span>' : "") +
            "</button>";
          }).join("") +
        "</nav>" +
        '<div class="sidebar-foot"><span class="eyebrow">' + roleMeta(person) + "</span></div>";

      lastPersonId = person.id;
      indicator = U.initSlidingIndicator(els.sidebar.querySelector(".sidebar-nav"), { axis: "y" });

      if (els.topbar) {
        els.topbar.innerHTML =
          '<button class="icon-btn" data-nav="drawer-toggle" aria-label="Open navigation">' + I.grid + "</button>" +
          '<span class="brand-mark"></span><span class="mobile-topbar-title">OMS</span>' +
          '<span style="margin-left:auto" class="pill pill-gray mono">' + person.role + "</span>";
      }

      bind();
    }

    function renderMenu(current) {
      function group(label, list) {
        if (!list.length) return "";
        return '<div class="role-menu-label">' + label + "</div>" +
          list.map(function (p) {
            return '<button class="role-menu-item' + (p.id === current.id ? " is-current" : "") + '" data-person="' + p.id + '">' +
              '<span class="avatar">' + p.initials + "</span>" +
              '<span><span class="name">' + U.escapeHtml(p.name) + '</span><br/><span class="meta">' + p.role + " · " + U.escapeHtml(scopeLine(p)) + "</span></span>" +
            "</button>";
          }).join("");
      }
      return '<div class="role-menu' + (menuOpen ? " is-open" : "") + '" role="menu">' +
        group("Admin", [D.ADMIN]) +
        group("Team Managers", D.TEAM_MANAGERS) +
        group("Team Leads", D.TEAM_LEADS) +
        group("BDR / ATL", D.BDRS) +
        "</div>";
    }

    function setDrawer(open) {
      drawerOpen = open;
      els.sidebar.classList.toggle("is-open", open);
      if (els.scrim) els.scrim.classList.toggle("is-open", open);
    }

    function bind() {
      U.on(els.sidebar, "click", '[data-nav="dashboard"]', function () { store.goto("dashboard"); setDrawer(false); });
      U.on(els.sidebar, "click", '[data-nav="deals"]', function () { store.goto("deals"); setDrawer(false); });
      U.on(els.sidebar, "click", '[data-nav="role-toggle"]', function (e) {
        e.stopPropagation();
        menuOpen = !menuOpen;
        var m = els.sidebar.querySelector(".role-menu");
        if (m) m.classList.toggle("is-open", menuOpen);
        els.sidebar.querySelector('[data-nav="role-toggle"]').setAttribute("aria-expanded", menuOpen);
      });
      U.on(els.sidebar, "click", "[data-person]", function (e, el) {
        var id = el.getAttribute("data-person");
        menuOpen = false;
        store.setPerson(id);
        var p = D.PEOPLE_BY_ID[id];
        U.toast("Viewing as " + p.name + " (" + p.role + ")", { icon: I.user });
      });
      if (els.topbar) {
        U.on(els.topbar, "click", '[data-nav="drawer-toggle"]', function () { setDrawer(!drawerOpen); });
      }
      if (els.scrim) {
        els.scrim.addEventListener("click", function () { setDrawer(false); });
      }
      document.addEventListener("click", function outside(e) {
        if (!els.sidebar.contains(e.target)) {
          if (menuOpen) { menuOpen = false; var m = els.sidebar.querySelector(".role-menu"); if (m) m.classList.remove("is-open"); }
        }
      });
    }

    function updateActiveOnly() {
      var s = store.get();
      els.sidebar.querySelectorAll("[data-nav]").forEach(function (btn) {
        var route = btn.getAttribute("data-nav");
        var item = NAV_ITEMS.filter(function (n) { return n.route === route; })[0];
        if (item) btn.classList.toggle("is-active", isActiveRoute(item, s));
      });
      if (indicator) indicator.update();
    }

    store.subscribe(function () {
      var s = store.get();
      if (s.personId !== lastPersonId) paint();
      else updateActiveOnly();
    });
    paint();
  }

  OMS.navComponent = { render: render };
})(window.OMS = window.OMS || {});
