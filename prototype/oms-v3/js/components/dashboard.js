/* ============================================================
   OMS v3 — Dashboard / Home. Role-scoped: BDR sees just their own
   numbers; TL/TM/Admin get progressively richer drill-downs, all
   built from the same funnel-card + table primitives.
   ============================================================ */
(function (OMS) {
  "use strict";
  var U = OMS.utils, I = OMS.icons, D = OMS.data;

  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  function render(container) {
    var person = OMS.store.currentPerson();
    // the Deal Stages/Payment Modes chart and the funnel-card block stay
    // scoped to the *whole* pipeline (not the selected date range) —
    // they answer "what does my pipeline look like right now", where
    // the revenue card and trend line answer "how did a given period
    // go"; only the latter needs to react to the range pills.
    var deals = D.dealsForPerson(person.id);
    var range = "thisMonth";
    var perf = D.performanceFor(person.id, range);
    var trend = D.revenueTrend(person.id, range);
    var chartMode = "stages";

    var scopeNoun = person.role === "ADMIN" ? "the floor" : person.role === "TM" ? "your course" : person.role === "TL" ? "your team" : "your pipeline";

    var el = document.createElement("div");
    el.className = "page";
    el.innerHTML =
      '<div class="page-head" data-reveal>' +
        '<div><div class="page-title">' + greeting() + ", " + firstName(person.name) + "</div>" +
        '<div class="page-sub">Here’s how ' + scopeNoun + " is tracking — viewing as <strong style=\"color:var(--fog)\">" + person.role + "</strong>.</div></div>" +
        '<div class="range-pills" id="range-pills">' +
          ["thisMonth:This Month", "lastMonth:Last Month", "quarter:This Quarter", "lifetime:Lifetime"].map(function (r) {
            var parts = r.split(":");
            return '<button class="range-pill' + (parts[0] === range ? " is-active" : "") + '" data-range="' + parts[0] + '">' + parts[1] + "</button>";
          }).join("") +
        "</div>" +
      "</div>" +
      '<div class="dash-top-grid">' +
        '<div class="panel" data-reveal data-reveal-delay="60">' +
          '<div class="panel-body" id="revenue-card"></div>' +
        "</div>" +
        '<div class="panel" data-reveal data-reveal-delay="120">' +
          '<div class="panel-head">' +
            '<span class="panel-title">Deal Stages / Payment Modes</span>' +
            '<div class="chart-tabs" id="chart-tabs">' +
              '<button class="chart-tab is-active" data-chart="stages">' + I.barChart + "Stages</button>" +
              '<button class="chart-tab" data-chart="modes">' + I.pieChart + "Modes</button>" +
            "</div>" +
          "</div>" +
          '<div class="panel-body" id="chart-body"></div>' +
        "</div>" +
      "</div>" +
      '<div id="funnel-mount"></div>' +
      '<div id="drill-mount"></div>';

    container.appendChild(el);

    paintRevenue();
    paintChart();
    OMS.funnel.renderFunnelBlock(el.querySelector("#funnel-mount"), {
      deals: deals, personId: person.id,
      title: person.role === "BDR" || person.role === "ATL" ? "Your Funnel" : person.role + " Funnel — " + person.name
    });
    renderDrilldown(el.querySelector("#drill-mount"), person);
    U.initScrollReveal(el);
    U.on(el, "click", "[data-range]", function (e, btn) {
      range = btn.getAttribute("data-range");
      el.querySelectorAll("[data-range]").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      U.toast("Showing " + btn.textContent.trim(), { icon: I.calendar, duration: 1600 });
      recompute();
    });
    U.on(el, "click", "[data-chart]", function (e, btn) {
      chartMode = btn.getAttribute("data-chart");
      el.querySelectorAll("[data-chart]").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      paintChart();
    });

    // range pill click re-derives everything the dashboard shows from
    // the newly selected window — the fix for the v2.0 bug where
    // switching "This Month"/"Last Month" left every number frozen.
    function recompute() {
      perf = D.performanceFor(person.id, range);
      trend = D.revenueTrend(person.id, range);
      paintRevenue();
    }

    function paintRevenue() {
      var wrap = el.querySelector("#revenue-card");
      var bookedPct = perf.revenueBooked ? Math.round((perf.realisedThisPeriod / perf.revenueBooked) * 100) : 0;
      wrap.innerHTML =
        '<div class="revenue-label">Booked — ' + perf.label + "</div>" +
        '<div class="revenue-figure tnum" id="rev-booked">' + U.fmtMoney(0) + "</div>" +
        '<div class="revenue-badge">' + I.trend + " Out of which " + U.fmtMoney(perf.realisedThisPeriod) + " is realised (" + bookedPct + "%)</div>" +
        '<div class="revenue-split">' +
          '<div class="revenue-split-item"><div class="v tnum">' + U.fmtMoney(perf.revenueRealised) + '</div><div class="l">Total realised — ' + perf.label + "</div></div>" +
          '<div class="revenue-split-item"><div class="v tnum">' + U.fmtMoney(perf.realisedOfEarlier) + '</div><div class="l">Realised of previously booked</div></div>' +
        "</div>" +
        '<div id="trend-mount"></div>';
      U.countUp(wrap.querySelector("#rev-booked"), perf.revenueBooked, { format: function (v) { return U.fmtMoney(v); }, duration: 700 });
      OMS.charts.renderTrend(wrap.querySelector("#trend-mount"), trend, "INR");
    }

    function paintChart() {
      var body = el.querySelector("#chart-body");
      if (chartMode === "stages") {
        var stageCounts = [
          { label: "Application", value: deals.filter(function (d) { return d.status.stage === "Application"; }).length, color: "var(--chart-1)" },
          { label: "Offer", value: deals.filter(function (d) { return d.status.stage === "Offer"; }).length, color: "var(--chart-2)" },
          { label: "Payment", value: deals.filter(function (d) { return d.status.stage === "Payment"; }).length, color: "var(--chart-3)" },
          { label: "Not Interested", value: deals.filter(function (d) { return d.status.id === "NOT_INTERESTED"; }).length, color: "var(--chart-4)" },
          { label: "Rejected", value: deals.filter(function (d) { return d.status.id === "REJECTED"; }).length, color: "var(--chart-4)" }
        ];
        OMS.charts.renderBars(body, stageCounts);
      } else {
        var modeMap = {};
        deals.forEach(function (d) { d.installments.forEach(function (ins) {
          if (ins.status !== "Paid") return;
          var key = ins.mode.replace(" EMI", "").replace("_3P", "");
          modeMap[key] = (modeMap[key] || 0) + 1;
        }); });
        var palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
        var data = Object.keys(modeMap).map(function (k, i) { return { label: k, value: modeMap[k], color: palette[i % palette.length] }; });
        if (!data.length) data = [{ label: "No realised payments in " + perf.label.toLowerCase(), value: 1, color: "var(--line-strong)" }];
        OMS.charts.renderDonut(body, data);
      }
    }
  }

  function firstName(n) { return n.split(" ")[0]; }

  // ---------------- role-scoped drill-down ----------------
  function renderDrilldown(mount, person) {
    if (person.role === "BDR" || person.role === "ATL") { mount.innerHTML = ""; return; }

    var selection = { tm: null, tl: null, bdr: null };
    var search = "";

    if (person.role === "TL") {
      buildSingleColumn(D.reportsOf(person.id), "BDR performance");
    } else if (person.role === "TM") {
      var tls = D.reportsOf(person.id);
      buildCascade([{ label: "Team Leads", items: tls, key: "tl" }, { label: "BDRs", items: [], key: "bdr" }]);
    } else if (person.role === "ADMIN") {
      buildAdminView();
    }

    function personRow(p, key, isSelected) {
      var perf = D.performanceFor(p.id);
      var pct = perf.target ? Math.round((perf.achieved / perf.target) * 100) : 0;
      return '<button class="drill-row' + (isSelected ? " is-selected" : "") + '" data-drill="' + key + '" data-id="' + p.id + '">' +
        '<span class="avatar">' + p.initials + "</span>" +
        '<span class="rn truncate">' + U.escapeHtml(p.name) + "</span>" +
        '<span class="rv tnum">' + U.fmtMoney(perf.revenueRealised) + "</span>" +
        '<span class="rt tnum">' + pct + "%</span>" +
      "</button>";
    }

    function buildSingleColumn(list, label) {
      mount.innerHTML =
        '<div class="drill-wrap" data-reveal>' +
          '<div class="funnel-block-head"><div class="funnel-block-title">' + I.users + label + "</div>" +
          '<div class="drill-search"><input type="text" placeholder="Search BDR…" data-search /></div></div>' +
          '<div class="drill-cols cols-1"><div>' +
            '<div class="drill-col-head">Name · Revenue · Target vs Achieved</div>' +
            '<div class="drill-list" data-list></div>' +
          "</div></div>" +
          '<div class="detail-panel" data-detail></div>' +
        "</div>";
      paintList(list);
      renderDetail(null);
      U.on(mount, "input", "[data-search]", U.debounce(function (e) { search = e.target.value.toLowerCase(); paintList(list); }, 120));
      U.on(mount, "click", "[data-drill]", function (e, elx) { selection.bdr = elx.getAttribute("data-id"); paintList(list); renderDetail(selection.bdr); });

      function paintList(l) {
        var filtered = l.filter(function (p) { return p.name.toLowerCase().indexOf(search) > -1; });
        mount.querySelector("[data-list]").innerHTML = filtered.length ? filtered.map(function (p) { return personRow(p, "bdr", selection.bdr === p.id); }).join("") :
          '<div class="empty-state" style="padding:24px">No matches.</div>';
      }
    }

    function buildCascade(cols) {
      mount.innerHTML =
        '<div class="drill-wrap" data-reveal>' +
          '<div class="funnel-block-head"><div class="funnel-block-title">' + I.users + "Team drill-down</div>" +
          '<div class="drill-search"><input type="text" placeholder="Search BDR…" data-search /></div></div>' +
          '<div class="drill-cols cols-' + cols.length + '">' +
            cols.map(function (c) { return '<div><div class="drill-col-head">' + c.label + '</div><div class="drill-list" data-col="' + c.key + '"></div></div>'; }).join("") +
          "</div>" +
          '<div class="detail-panel" data-detail></div>' +
        "</div>";
      renderDetail(null);
      paint();
      U.on(mount, "click", "[data-drill]", function (e, elx) {
        var key = elx.getAttribute("data-drill");
        var id = elx.getAttribute("data-id");
        if (key === "tl") { selection.tl = id; selection.bdr = null; }
        if (key === "tm") { selection.tm = id; selection.tl = null; selection.bdr = null; }
        if (key === "bdr") { selection.bdr = id; renderDetail(id); }
        paint();
      });
      U.on(mount, "input", "[data-search]", U.debounce(function (e) { search = e.target.value.toLowerCase(); paint(); }, 120));

      function paint() {
        cols.forEach(function (c) {
          var items = c.items;
          if (c.key === "tl") items = D.reportsOf(person.id);
          if (c.key === "bdr") items = selection.tl ? D.reportsOf(selection.tl) : [];
          if (search) items = items.filter(function (p) { return p.name.toLowerCase().indexOf(search) > -1; });
          var selId = c.key === "tl" ? selection.tl : selection.bdr;
          var host = mount.querySelector('[data-col="' + c.key + '"]');
          host.innerHTML = items.length ? items.map(function (p) { return personRow(p, c.key, p.id === selId); }).join("") :
            '<div class="empty-state" style="padding:18px;font-size:13px">' + (c.key === "bdr" ? "Select a Team Lead" : "None") + "</div>";
        });
      }
    }

    function buildAdminView() {
      mount.innerHTML =
        '<div class="drill-wrap" data-reveal>' +
          '<div id="tm-funnels"></div>' +
          '<div class="funnel-block-head" style="margin-top:var(--space-6)"><div class="funnel-block-title">' + I.users + "Team Managers → Team Leads → BDRs</div>" +
          '<div class="drill-search"><input type="text" placeholder="Search BDR…" data-search /></div></div>' +
          '<div class="drill-cols cols-3">' +
            '<div><div class="drill-col-head">Team Managers</div><div class="drill-list" data-col="tm"></div></div>' +
            '<div><div class="drill-col-head">Team Leads</div><div class="drill-list" data-col="tl"></div></div>' +
            '<div><div class="drill-col-head">BDRs</div><div class="drill-list" data-col="bdr"></div></div>' +
          "</div>" +
          '<div class="detail-panel" data-detail></div>' +
        "</div>";
      D.TEAM_MANAGERS.forEach(function (tm, i) {
        var box = document.createElement("div");
        box.className = "funnel-block";
        box.setAttribute("data-reveal", ""); box.setAttribute("data-reveal-delay", i * 70);
        mount.querySelector("#tm-funnels").appendChild(box);
        OMS.funnel.renderFunnelBlock(box, { deals: D.dealsForPerson(tm.id), personId: tm.id, title: tm.name + " — " + D.COURSES.find(function (c) { return c.id === tm.courseId; }).short });
      });
      renderDetail(null);
      paint();
      U.on(mount, "click", "[data-drill]", function (e, elx) {
        var key = elx.getAttribute("data-drill");
        var id = elx.getAttribute("data-id");
        if (key === "tm") { selection.tm = id; selection.tl = null; selection.bdr = null; }
        if (key === "tl") { selection.tl = id; selection.bdr = null; }
        if (key === "bdr") { selection.bdr = id; renderDetail(id); }
        paint();
      });
      U.on(mount, "input", "[data-search]", U.debounce(function (e) { search = e.target.value.toLowerCase(); paint(); }, 120));

      function paint() {
        var tms = D.TEAM_MANAGERS;
        var tls = selection.tm ? D.reportsOf(selection.tm) : [];
        var bdrs = selection.tl ? D.reportsOf(selection.tl) : [];
        if (search) { tms = tms.filter(function (p) { return p.name.toLowerCase().indexOf(search) > -1; }); }
        mount.querySelector('[data-col="tm"]').innerHTML = tms.map(function (p) { return personRow(p, "tm", p.id === selection.tm); }).join("");
        mount.querySelector('[data-col="tl"]').innerHTML = tls.length ? tls.map(function (p) { return personRow(p, "tl", p.id === selection.tl); }).join("") : '<div class="empty-state" style="padding:18px;font-size:13px">Select a Team Manager</div>';
        mount.querySelector('[data-col="bdr"]').innerHTML = bdrs.length ? bdrs.map(function (p) { return personRow(p, "bdr", p.id === selection.bdr); }).join("") : '<div class="empty-state" style="padding:18px;font-size:13px">Select a Team Lead</div>';
      }
    }

    function renderDetail(bdrId) {
      var host = mount.querySelector("[data-detail]");
      if (!bdrId) {
        host.innerHTML = '<div class="detail-panel-empty">' + I.arrowUpRight + "<br/>Select a BDR above to view their funnel.</div>";
        return;
      }
      var p = D.PEOPLE_BY_ID[bdrId];
      var box = document.createElement("div");
      box.className = "funnel-block";
      host.innerHTML = "";
      host.appendChild(box);
      OMS.funnel.renderFunnelBlock(box, { deals: D.dealsForPerson(bdrId), personId: bdrId, title: p.name + "’s Funnel" });
    }
  }

  OMS.dashboardComponent = { render: render };
})(window.OMS = window.OMS || {});
