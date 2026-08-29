/* ============================================================
   OMS v3 — Deals list. Status tabs whose counts are always derived
   from the same filtered set the table shows (fixes the confirmed
   v2.0 bug), on-hover assignee disclosure instead of 4 fixed
   columns, and inline row actions.
   ============================================================ */
(function (OMS) {
  "use strict";
  var U = OMS.utils, I = OMS.icons, D = OMS.data;

  var TABS = [
    { key: "all", label: "All" },
    { key: "application", label: "Application", test: function (d) { return d.status.stage === "Application"; } },
    { key: "offer", label: "Offer", test: function (d) { return d.status.stage === "Offer"; } },
    { key: "payment", label: "Payment", test: function (d) { return d.status.stage === "Payment"; } },
    { key: "action", label: "Action Required", action: true, test: function (d) { return d.status.action; } },
    { key: "closed", label: "Closed", test: function (d) { return d.status.stage === "Global" || d.status.id === "ENR_CANCELLED"; } }
  ];
  TABS[0].test = function () { return true; };

  var popoverEl = null;
  function ensurePopover() {
    if (!popoverEl) {
      popoverEl = document.createElement("div");
      popoverEl.className = "assignee-pop";
      document.body.appendChild(popoverEl);
    }
    return popoverEl;
  }

  function render(container) {
    var person = OMS.store.currentPerson();
    var canSeePeopleFilters = person.role === "TL" || person.role === "TM" || person.role === "ADMIN";
    var scoped = D.dealsForPerson(person.id);

    var state = {
      tab: "all", search: "", filtersOpen: false,
      filters: { course: "", currency: "", person: "", updated: "" }
    };

    var el = document.createElement("div");
    el.className = "page";
    el.innerHTML =
      '<div class="page-head" data-reveal>' +
        '<div><div class="page-title">Deals</div><div class="page-sub">' + scoped.length + " deal" + (scoped.length === 1 ? "" : "s") + " in view — scoped to " + (person.role === "ADMIN" ? "the whole floor" : person.role === "BDR" || person.role === "ATL" ? "you" : "your team") + ".</div></div>" +
        '<div class="deals-toolbar" style="margin:0">' +
          '<div class="search-input">' + I.search + '<input type="text" placeholder="Search name or email…" data-search /></div>' +
          '<button class="btn btn-secondary btn-sm" data-toggle-filters>' + I.filter + "Filters</button>" +
        "</div>" +
      "</div>" +
      '<div class="deals-tabs" id="deals-tabs" data-reveal data-reveal-delay="60"></div>' +
      '<div id="filter-panel-mount"></div>' +
      '<div id="chips-mount"></div>' +
      '<div class="deals-table-wrap" data-reveal data-reveal-delay="120"><table class="deals-table">' +
        '<thead><tr>' +
          "<th>Applicant</th><th>Course</th><th>Status</th><th>Created</th><th>Last update</th><th>Assigned</th><th></th>" +
        '</tr></thead><tbody id="deals-tbody"></tbody>' +
      "</table></div>";
    container.appendChild(el);

    paintFilterPanel();
    paintAll();
    U.initScrollReveal(el);

    U.on(el, "input", "[data-search]", U.debounce(function (e) { state.search = e.target.value.toLowerCase(); paintAll(); }, 140));
    U.on(el, "click", "[data-toggle-filters]", function () { state.filtersOpen = !state.filtersOpen; paintFilterPanel(); });
    U.on(el, "click", "[data-tab]", function (e, btn) { state.tab = btn.getAttribute("data-tab"); paintAll(); });
    U.on(el, "click", "[data-clear-filters]", function () { state.filters = { course: "", currency: "", person: "", updated: "" }; paintAll(); });
    U.on(el, "click", "[data-remove-filter]", function (e, btn) { state.filters[btn.getAttribute("data-remove-filter")] = ""; paintAll(); });
    U.on(el, "change", "[data-filter]", function (e, elx) { state.filters[elx.getAttribute("data-filter")] = elx.value; paintAll(); });
    U.on(el, "click", "[data-row]", function (e, row) {
      if (e.target.closest("[data-stop]")) return;
      OMS.store.openDeal(row.getAttribute("data-row"));
    });
    U.on(el, "mouseenter", "[data-assignee]", function (e, trig) { showAssignee(trig); });
    U.on(el, "mouseleave", "[data-assignee]", function () { hideAssignee(); });
    U.on(el, "click", "[data-action]", function (e, btn) {
      e.stopPropagation();
      var dealId = btn.getAttribute("data-deal");
      var action = btn.getAttribute("data-action");
      handleRowAction(action, dealId);
    });

    function filteredDeals() {
      return scoped.filter(function (d) {
        if (state.search && d.name.toLowerCase().indexOf(state.search) === -1 && d.email.toLowerCase().indexOf(state.search) === -1) return false;
        if (state.filters.course && d.course.id !== state.filters.course) return false;
        if (state.filters.currency && d.currency !== state.filters.currency) return false;
        if (state.filters.person && d.bdrId !== state.filters.person) return false;
        if (state.filters.updated) {
          var days = { "7": 7, "30": 30, "90": 90 }[state.filters.updated];
          var diff = (D.NOW - d.lastUpdate) / 86400000;
          if (diff > days) return false;
        }
        return true;
      });
    }

    function paintAll() {
      var filtered = filteredDeals(); // the SAME set both tab counts and the table read from
      paintTabs(filtered);
      paintChips();
      var tabDeals = filtered.filter(TABS.filter(function (t) { return t.key === state.tab; })[0].test)
        .sort(function (a, b) { return b.lastUpdate - a.lastUpdate; });
      paintTable(tabDeals);
    }

    function paintTabs(filtered) {
      el.querySelector("#deals-tabs").innerHTML = TABS.map(function (t) {
        var n = filtered.filter(t.test).length;
        return '<button class="deals-tab' + (state.tab === t.key ? " is-active" : "") + (t.action ? " is-action" : "") + '" data-tab="' + t.key + '">' +
          U.escapeHtml(t.label) + '<span class="count tnum">' + n + "</span></button>";
      }).join("");
    }

    function paintChips() {
      var chips = [];
      if (state.filters.course) chips.push(["course", D.COURSES.find(function (c) { return c.id === state.filters.course; }).short]);
      if (state.filters.currency) chips.push(["currency", state.filters.currency]);
      if (state.filters.person) chips.push(["person", D.PEOPLE_BY_ID[state.filters.person].name]);
      if (state.filters.updated) chips.push(["updated", "Updated ≤ " + state.filters.updated + "d"]);
      var host = el.querySelector("#chips-mount");
      if (!chips.length) { host.innerHTML = ""; return; }
      host.innerHTML = '<div class="deals-toolbar">' +
        '<span class="filters-count">' + chips.length + " filter" + (chips.length > 1 ? "s" : "") + " applied</span>" +
        '<div class="filter-chips">' + chips.map(function (c) {
          return '<span class="chip">' + U.escapeHtml(c[1]) + '<button data-remove-filter="' + c[0] + '">' + I.x + "</button></span>";
        }).join("") + '<button class="btn btn-ghost btn-sm" data-clear-filters>Clear all</button></div>' +
      "</div>";
    }

    function paintFilterPanel() {
      var host = el.querySelector("#filter-panel-mount");
      if (!state.filtersOpen) { host.innerHTML = ""; return; }
      var bdrOptions = (person.role === "ADMIN" ? D.BDRS : person.role === "TM" ? D.BDRS.filter(function (b) { return D.tmOf(b.id) && D.tmOf(b.id).id === person.id; }) : D.reportsOf(person.id));
      host.innerHTML = '<div class="filter-panel">' +
        field("Course", "course", [["", "Any course"]].concat(D.COURSES.map(function (c) { return [c.id, c.short]; }))) +
        field("Currency", "currency", [["", "Any"], ["INR", "INR"], ["USD", "USD"]]) +
        field("Last update", "updated", [["", "Any time"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]]) +
        (canSeePeopleFilters ? field("BDR", "person", [["", "Anyone"]].concat(bdrOptions.map(function (b) { return [b.id, b.name]; }))) : "") +
        '<div class="filter-panel-actions"><button class="btn btn-ghost btn-sm" data-clear-filters>Clear all</button><button class="btn btn-secondary btn-sm" data-toggle-filters>Done</button></div>' +
      "</div>";
      function field(label, key, opts) {
        return '<div class="filter-field"><label>' + label + '</label><select data-filter="' + key + '">' +
          opts.map(function (o) { return '<option value="' + o[0] + '"' + (state.filters[key] === o[0] ? " selected" : "") + ">" + U.escapeHtml(o[1]) + "</option>"; }).join("") +
        "</select></div>";
      }
    }

    function paintTable(deals) {
      var tbody = el.querySelector("#deals-tbody");
      if (!deals.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">' + I.search + "<div>No deals match these filters.</div></div></td></tr>";
        return;
      }
      tbody.innerHTML = deals.map(function (d) {
        var tl = D.PEOPLE_BY_ID[d.tlId], tm = D.PEOPLE_BY_ID[d.tmId];
        var offerLabel = d.reachedStage >= 1 ? "Revise offer letter" : "Send offer letter";
        var canOffer = d.status.stage !== "Enrolment" && d.status.id !== "PAY_COMPLETED";
        return '<tr data-row="' + d.id + '" tabindex="0">' +
          "<td><div class=\"dt-name\">" + U.escapeHtml(d.name) + (d.intlFlag ? ' <span title="International" style="color:var(--graphite)">' + I.globe + "</span>" : "") + '</div><div class="dt-sub mono">' + d.id + "</div></td>" +
          '<td class="dt-course">' + d.course.short + "</td>" +
          '<td><span class="pill pill-' + d.status.color + '"><span class="pill-dot"></span>' + d.status.stage + " · " + d.status.label + "</span></td>" +
          '<td class="dt-date">' + U.fmtDateShort(d.createdOn) + "</td>" +
          '<td class="dt-date">' + U.relativeTime(d.lastUpdate) + "</td>" +
          '<td data-stop><span class="assignee-trigger" data-assignee data-bdr="' + d.bdrId + '" data-tl="' + (tl ? tl.id : "") + '" data-tm="' + (tm ? tm.id : "") + '">' + D.PEOPLE_BY_ID[d.bdrId].name.split(" ")[0] + "</span></td>" +
          '<td data-stop><div class="dt-actions">' +
            (canOffer ? '<button class="icon-btn" data-action="offer" data-deal="' + d.id + '" title="' + offerLabel + '">' + I.mail + "</button>" : "") +
            '<button class="icon-btn" data-action="not-interested" data-deal="' + d.id + '" title="Mark as not interested">' + I.x + "</button>" +
            '<button class="icon-btn" data-action="link" data-deal="' + d.id + '" title="Get form link">' + I.link + "</button>" +
          "</div></td>" +
        "</tr>";
      }).join("");
    }

    function showAssignee(trig) {
      var pop = ensurePopover();
      var bdr = D.PEOPLE_BY_ID[trig.getAttribute("data-bdr")];
      var tl = D.PEOPLE_BY_ID[trig.getAttribute("data-tl")];
      var tm = D.PEOPLE_BY_ID[trig.getAttribute("data-tm")];
      pop.innerHTML =
        row("LC", bdr) + (bdr && bdr.role === "ATL" ? row("ATL", bdr) : "") + row("TL", tl) + row("TM", tm);
      var r = trig.getBoundingClientRect();
      pop.style.left = U.clamp(r.left, 12, window.innerWidth - 232) + "px";
      pop.style.top = (r.bottom + 8) + "px";
      requestAnimationFrame(function () { pop.classList.add("is-open"); });
      function row(label, p) { return p ? '<div class="assignee-pop-row"><span class="k">' + label + '</span><span class="v">' + U.escapeHtml(p.name) + "</span></div>" : ""; }
    }
    function hideAssignee() { if (popoverEl) popoverEl.classList.remove("is-open"); }

    function handleRowAction(action, dealId) {
      var d = D.dealById(dealId);
      if (action === "offer") { OMS.offerWizard.open(dealId, { onDone: paintAll }); return; }
      if (action === "not-interested") {
        D.setDealStatus(dealId, "NOT_INTERESTED", "Marked from the Deals list");
        U.toast("Marked " + d.name + " as Not Interested", { icon: I.x });
        paintAll();
        return;
      }
      if (action === "link") {
        U.toast("Application link copied for " + d.name, { icon: I.link });
        return;
      }
    }
  }

  OMS.dealsListComponent = { render: render };
})(window.OMS = window.OMS || {});
