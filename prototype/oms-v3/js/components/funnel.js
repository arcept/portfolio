/* ============================================================
   OMS v3 — Funnel-card block: the single component that renders
   a BDR's own numbers, a Team Manager's numbers (once per TM),
   and a drilled-into person's numbers, scope passed in as `deals`.
   This is the concrete "one component, five views" rebuild thesis.
   ============================================================ */
(function (OMS) {
  "use strict";
  var U = OMS.utils, I = OMS.icons;

  function computeFunnelCards(deals) {
    var S = OMS.data.STATUS;
    function count(pred) { return deals.filter(pred).length; }
    var reached = function (n) { return function (d) { return d.reachedStage >= n; }; };
    var totalAll = deals.length, totalOffer = count(reached(1)), totalAccepted = count(reached(2));

    return [
      {
        label: "Applications Sent", denom: null, denomTotal: null,
        total: deals.length,
        rows: [
          { label: "Pending", count: count(function (d) { return d.status.id === "APP_PENDING"; }), color: "var(--signal-blue)" },
          { label: "Expired", count: count(function (d) { return d.status.id === "APP_EXPIRED"; }), color: "var(--signal-amber)" },
          { label: "Filled", count: count(function (d) { return d.reachedStage >= 1 || d.status.id === "APP_FILLED"; }), color: "var(--signal-green)" },
          { label: "Not Interested / Rejected", count: count(function (d) { return d.reachedStage === 0 && (d.status.id === "NOT_INTERESTED" || d.status.id === "REJECTED"); }), color: "var(--graphite)" }
        ]
      },
      {
        label: "Offers Shared", denom: "of Filled", denomTotal: totalAll,
        total: count(reached(1)),
        rows: [
          { label: "Pending", count: count(function (d) { return d.status.id === "OFFER_PENDING"; }), color: "var(--signal-blue)" },
          { label: "Expired", count: count(function (d) { return d.status.id === "OFFER_EXPIRED"; }), color: "var(--signal-amber)" },
          { label: "Accepted", count: count(reached(2)), color: "var(--signal-green)" },
          { label: "Not Interested / Rejected", count: count(function (d) { return d.reachedStage === 1 && (d.status.id === "NOT_INTERESTED" || d.status.id === "REJECTED"); }), color: "var(--graphite)" }
        ]
      },
      {
        label: "Converted", denom: "of Offers Shared", denomTotal: totalOffer,
        total: count(reached(2)),
        rows: [
          { label: "DP Not Paid", count: count(function (d) { return d.status.id === "OFFER_ACCEPTED"; }), color: "var(--signal-blue)" },
          { label: "Payment Overdue", count: count(function (d) { return d.status.id === "PAY_ONGOING" && d.installments.some(function (i) { return i.status === "Overdue"; }); }), color: "var(--signal-amber)" },
          { label: "Payment Cleared", count: count(reached(3)), color: "var(--signal-green)" },
          { label: "Not Interested / Rejected", count: count(function (d) { return d.reachedStage === 2 && (d.status.id === "NOT_INTERESTED" || d.status.id === "REJECTED"); }), color: "var(--graphite)" }
        ]
      },
      {
        label: "Payment Clearance", denom: "of Converted", denomTotal: totalAccepted,
        total: count(reached(3)),
        rows: [
          { label: "Payment Completed", count: count(function (d) { return d.status.id === "PAY_COMPLETED"; }), color: "var(--signal-green)" },
          { label: "Enrolment Cancelled", count: count(function (d) { return d.status.id === "ENR_CANCELLED"; }), color: "var(--signal-red)" }
        ]
      }
    ];
  }

  var blockSeq = 0;

  // renders into `container`; `deals` scopes the data, `personId` scopes performance KPIs
  function renderFunnelBlock(container, opts) {
    var deals = opts.deals, personId = opts.personId, title = opts.title || "Funnel";
    var compact = !!opts.compact;
    var id = "fb" + (blockSeq++);
    var mode = "overview";

    function paint() {
      if (mode === "overview") {
        var cards = computeFunnelCards(deals);
        container.querySelector(".funnel-row").innerHTML = cards.map(function (c, i) {
          return '<div class="funnel-card" data-reveal data-reveal-delay="' + (i * 60) + '">' +
            '<span class="step-index">' + (i + 1) + " / 4</span>" +
            '<div class="fc-label">' + U.escapeHtml(c.label) + "</div>" +
            '<div class="fc-value tnum"><span class="fc-num" data-count="' + c.total + '">0</span>' +
              (c.denom ? '<span class="fc-denom"> / ' + c.denomTotal + "</span>" : "") +
            "</div>" +
            (c.denom ? '<div style="font-size:var(--text-micro);color:var(--graphite);margin-top:-6px;margin-bottom:8px">' + c.denom + "</div>" : "") +
            '<div class="fc-breakdown">' + c.rows.map(function (r) {
              return '<div class="fc-breakdown-row"><span class="lbl"><span class="dot" style="background:' + r.color + '"></span>' + U.escapeHtml(r.label) + '</span><span class="val tnum">' + r.count + "</span></div>";
            }).join("") + "</div>" +
          "</div>";
        }).join("");
        container.querySelectorAll(".fc-num[data-count]").forEach(function (el) {
          U.countUp(el, parseInt(el.getAttribute("data-count"), 10), { duration: 700 });
        });
        OMS.utils.initScrollReveal(container);
      } else {
        var perf = OMS.data.performanceFor(personId);
        var pct = perf.target ? Math.round((perf.achieved / perf.target) * 100) : 0;
        container.querySelector(".funnel-row").outerHTML =
          '<div class="kpi-grid">' +
            '<div class="kpi-card"><div class="kl">Unit Sales — Target vs Achieved</div><div class="kv tnum">' + perf.achieved + " / " + perf.target + '</div><div class="kd">' + pct + "% to target</div></div>" +
            '<div class="kpi-card"><div class="kl">Revenue Booked</div><div class="kv tnum">' + U.fmtMoney(perf.revenueBooked, "INR") + "</div></div>" +
            '<div class="kpi-card"><div class="kl">Revenue Realised</div><div class="kv tnum">' + U.fmtMoney(perf.revenueRealised, "INR") + "</div></div>" +
            '<div class="kpi-card"><div class="kl">Average Ticket Size (ATS)</div><div class="kv tnum">' + U.fmtMoney(perf.ats, "INR") + "</div></div>" +
          "</div>";
      }
    }

    container.innerHTML =
      '<div class="funnel-block-head">' +
        '<div class="funnel-block-title">' + (opts.icon ? '<span style="width:16px;height:16px;color:var(--graphite)">' + opts.icon + "</span>" : "") + U.escapeHtml(title) + "</div>" +
        '<div class="tab-toggle" role="tablist"><button class="is-active" data-mode="overview">Overview</button><button data-mode="performance">Performance</button></div>' +
      "</div>" +
      '<div class="funnel-row"></div>';

    U.on(container, "click", "[data-mode]", function (e, el) {
      mode = el.getAttribute("data-mode");
      var head = container.querySelector(".funnel-block-head");
      head.querySelectorAll("[data-mode]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-mode") === mode); });
      var old = container.querySelector(".funnel-row, .kpi-grid");
      var fresh = document.createElement("div");
      fresh.className = "funnel-row";
      old.replaceWith(fresh);
      paint();
    });

    paint();
  }

  OMS.funnel = { renderFunnelBlock: renderFunnelBlock, computeFunnelCards: computeFunnelCards };
})(window.OMS = window.OMS || {});
