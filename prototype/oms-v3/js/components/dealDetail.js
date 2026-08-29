/* ============================================================
   OMS v3 — Deal Detail: 4 independently-completable sections,
   milestone timeline + free-text activity log, and an inline
   EMI re-approval editor (closes the "EMI can't be edited"
   capability gap from the roadmap).
   ============================================================ */
(function (OMS) {
  "use strict";
  var U = OMS.utils, I = OMS.icons, D = OMS.data;

  function hash(str) { var h = 0; for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; } return Math.abs(h); }
  function pickStable(id, arr) { return arr[hash(id) % arr.length]; }

  var TOOLS = ["AutoCAD, Revit", "Rhinoceros 3D, Grasshopper", "Revit, Navisworks", "AutoCAD only", "Rhino, AutoCAD"];
  var ENGLISH = ["Fluent", "Advanced", "Intermediate"];
  var QUALS = ["B.Arch", "M.Arch", "B.E. Civil", "B.Tech Civil", "Diploma in Architecture"];
  var ROLES = ["Junior Architect", "Design Engineer", "Site Engineer", "Architecture Intern", "Freelance Designer"];
  var EXP = ["0–1 years", "1–3 years", "3–5 years", "5+ years"];
  var INCOME = ["₹3–5 LPA", "₹5–8 LPA", "₹8–12 LPA", "Not disclosed"];

  function render(container, dealId) {
    var d = D.dealById(dealId);
    var person = OMS.store.currentPerson();
    if (!d) { container.innerHTML = '<div class="page"><div class="empty-state">Deal not found.</div></div>'; return; }

    var openSections = { application: true, plan: true, offer: false, enrollment: false };

    var el = document.createElement("div");
    el.className = "page";
    el.innerHTML =
      '<button class="back-link" data-back>' + I.chevronLeft + "Back to Deals</button>" +
      '<div class="dd-header" data-reveal>' +
        '<div class="dd-id-row"><span class="pill pill-' + d.status.color + '"><span class="pill-dot"></span>' + d.status.stage + " · " + d.status.label + "</span>" +
        (d.status.action ? '<span class="pill pill-red">Action needed</span>' : "") + "</div>" +
        '<div class="dd-name">' + U.escapeHtml(d.name) + "</div>" +
        '<div class="dd-meta-line">' +
          mi(I.layers, d.course.name) + mi(I.mail, d.email) + mi(I.clock, "Created " + U.fmtDate(d.createdOn)) + mi(I.calendar, "Updated " + U.relativeTime(d.lastUpdate)) +
        "</div>" +
      "</div>" +
      '<div class="deal-detail-grid">' +
        '<div class="dd-left" data-reveal data-reveal-delay="60"></div>' +
        '<div class="dd-main" data-reveal data-reveal-delay="100"></div>' +
        '<div class="dd-right" data-reveal data-reveal-delay="140"></div>' +
      "</div>";
    container.appendChild(el);

    function mi(icon, text) { return '<span class="mi">' + icon + U.escapeHtml(text) + "</span>"; }

    paintLeft();
    paintMain();
    paintRight();
    U.initScrollReveal(el);

    U.on(el, "click", "[data-back]", function () { OMS.store.goto("deals"); });
    U.on(el, "click", "[data-copy-id]", function () {
      U.toast("Application ID copied", { icon: I.copy, duration: 1600 });
    });
    U.on(el, "click", "[data-global-status]", function (e, btn) {
      var key = btn.getAttribute("data-global-status");
      var reasons = {
        NOT_INTERESTED: "No longer pursuing this cohort",
        REJECTED: "Does not meet course prerequisites",
        SAVED: "Parked for the next intake"
      };
      D.setDealStatus(d.id, key, reasons[key]);
      U.toast(d.name + " → " + D.STATUS[key].label, { icon: I.flag });
      rerenderAll();
    });
    U.on(el, "click", "[data-reopen]", function () {
      d.status = D.STATUS.APP_PENDING;
      d.lastUpdate = D.NOW;
      D.logActivity(d, "Deal Reopened", "Learner reached back out");
      U.toast("Deal reopened for " + d.name, { icon: I.reload });
      rerenderAll();
    });
    U.on(el, "click", "[data-section]", function (e, btn) {
      var key = btn.getAttribute("data-section");
      openSections[key] = !openSections[key];
      btn.closest(".section-card").classList.toggle("is-open", openSections[key]);
    });
    U.on(el, "click", "[data-offer-cta]", function () {
      OMS.offerWizard.open(d.id, { onDone: rerenderAll });
    });
    U.on(el, "click", "[data-emi-edit]", function (e, btn) {
      var idx = btn.getAttribute("data-emi-edit");
      var form = el.querySelector('[data-emi-form="' + idx + '"]');
      form.classList.toggle("is-open");
      form.style.display = form.classList.contains("is-open") ? "block" : "none";
    });
    U.on(el, "click", "[data-emi-submit]", function (e, btn) {
      var idx = parseInt(btn.getAttribute("data-emi-submit"), 10);
      var form = btn.closest(".emi-edit-form");
      var months = form.querySelector('[data-f="months"]').value;
      var amt = form.querySelector('[data-f="amount"]').value;
      D.logActivity(d, "EMI revision requested on Installment " + (idx + 1), "New terms: " + months + " months at ₹" + amt + "/mo — pending Sales Ops approval");
      U.toast("EMI change submitted for Sales Ops approval", { icon: I.shield, tone: "info" });
      form.innerHTML += '<div class="pending-approval-note">' + I.clock + "Awaiting Sales Ops approval</div>";
    });
    U.on(el, "click", "[data-view-app]", function () { openApplicationSlideover(d); });
    U.on(el, "click", "[data-ext]", function (e, btn) {
      U.toast("Opening in " + btn.getAttribute("data-ext") + "…", { icon: I.external, duration: 1400 });
    });

    function rerenderAll() {
      el.querySelector(".dd-id-row").innerHTML =
        '<span class="pill pill-' + d.status.color + '"><span class="pill-dot"></span>' + d.status.stage + " · " + d.status.label + "</span>" +
        (d.status.action ? '<span class="pill pill-red">Action needed</span>' : "");
      paintLeft(); paintMain(); paintRight();
    }

    function paintLeft() {
      var host = el.querySelector(".dd-left");
      var bdr = D.PEOPLE_BY_ID[d.bdrId], tl = D.PEOPLE_BY_ID[d.tlId], tm = D.PEOPLE_BY_ID[d.tmId];
      host.innerHTML =
        '<div class="side-block">' +
          '<h4>Identity</h4>' +
          '<button class="copy-id" data-copy-id>' + I.copy + d.applicationId + "</button>" +
          '<div class="side-row"><span class="k">Phone</span><span class="v mono">' + d.phone + "</span></div>" +
          '<div class="side-row"><span class="k">Location</span><span class="v">' + d.city + ", " + d.country + "</span></div>" +
          '<div class="side-row"><span class="k">Currency</span><span class="v mono">' + d.currency + "</span></div>" +
        "</div>" +
        '<div class="side-block">' +
          '<button class="ext-link-btn" data-ext="HubSpot">' + I.hubspot + '<span>View on HubSpot</span>' + I.external + "</button>" +
          '<button class="ext-link-btn" data-ext="WhatsApp">' + I.whatsapp + '<span>Chat on WhatsApp</span>' + I.external + "</button>" +
        "</div>" +
        '<div class="side-block">' +
          "<h4>Assignment</h4>" +
          '<div class="side-row"><span class="k">' + bdr.role + "</span><span class=\"v\">" + U.escapeHtml(bdr.name) + "</span></div>" +
          (tl ? '<div class="side-row"><span class="k">TL</span><span class="v">' + U.escapeHtml(tl.name) + "</span></div>" : "") +
          (tm ? '<div class="side-row"><span class="k">TM</span><span class="v">' + U.escapeHtml(tm.name) + "</span></div>" : "") +
          '<div class="side-row"><span class="k">Cohort</span><span class="v mono">' + d.cohort + "</span></div>" +
        "</div>" +
        '<div class="side-block">' +
          "<h4>Global status</h4>" +
          '<div class="status-global-btns">' +
            (d.status.id === "NOT_INTERESTED" ?
              '<button class="btn btn-secondary btn-sm" data-reopen>' + I.reload + "Reopen deal</button>" :
              '<button class="btn btn-secondary btn-sm" data-global-status="NOT_INTERESTED">Not interested</button>' +
              '<button class="btn btn-secondary btn-sm" data-global-status="REJECTED">Mark reject</button>' +
              '<button class="btn btn-secondary btn-sm" data-global-status="SAVED">Save for later</button>') +
          "</div>" +
        "</div>";
    }

    function sectionHtml(key, title, complete, bodyHtml) {
      var isOpen = openSections[key];
      return '<div class="section-card panel' + (isOpen ? " is-open" : "") + '">' +
        '<div class="section-head' + (complete ? " is-complete" : "") + '" data-section="' + key + '">' +
          '<span class="si">' + (complete ? I.check : "") + "</span>" +
          '<span class="st">' + title + "</span>" + I.chevronDown +
        "</div>" +
        '<div class="section-body"><div class="section-body-inner">' + bodyHtml + "</div></div>" +
      "</div>";
    }

    function paintMain() {
      var host = el.querySelector(".dd-main");
      var appComplete = d.reachedStage >= 1 || d.status.id === "APP_FILLED";
      var offerComplete = d.reachedStage >= 1;
      var planComplete = d.installments.length > 0;
      var enrollComplete = d.reachedStage >= 2;

      host.innerHTML =
        sectionHtml("application", "1 · Application", appComplete,
          '<div class="side-row"><span class="k">Course</span><span class="v">' + d.course.name + "</span></div>" +
          '<div class="side-row"><span class="k">Duration</span><span class="v">' + pickStable(d.id, ["6 months", "9 months", "12 months"]) + "</span></div>" +
          '<div class="side-row"><span class="k">Start date</span><span class="v mono">' + U.fmtDate(new Date(D.NOW.getTime() + 20 * 86400000)) + "</span></div>" +
          '<div style="margin-top:12px"><button class="btn btn-secondary btn-sm" data-view-app>' + I.external + (appComplete ? "View application" : "Application not filled yet") + "</button></div>"
        ) +
        sectionHtml("plan", "2 · Payment Plan", planComplete, renderPlanBody()) +
        sectionHtml("offer", "3 · Offer Letter", offerComplete, renderOfferBody(offerComplete)) +
        sectionHtml("enrollment", "4 · Enrollment", enrollComplete, renderEnrollBody(enrollComplete));

      el.querySelectorAll(".section-card").forEach(function (card, i) {
        var key = card.querySelector("[data-section]").getAttribute("data-section");
        card.classList.toggle("is-open", !!openSections[key]);
      });
    }

    function renderPlanBody() {
      if (!d.installments.length) {
        return '<div class="empty-state" style="padding:24px 0">' + I.receipt + "<div>No payment plan yet.</div>" +
          '<div style="margin-top:12px"><button class="btn btn-primary btn-sm" data-offer-cta>Send offer letter</button></div></div>';
      }
      var html =
        '<div class="fee-line"><span>Course Fee</span><span class="fv">' + U.fmtMoneyFull(d.courseFee, d.currency) + "</span></div>" +
        '<div class="fee-line"><span>Discount</span><span class="fv">−' + U.fmtMoneyFull(d.discount, d.currency) + "</span></div>" +
        '<div class="fee-line total"><span>Net Payable Fee</span><span class="fv">' + U.fmtMoneyFull(d.netPayable, d.currency) + "</span></div>" +
        '<div style="margin-top:8px;font-size:var(--text-caption);color:var(--graphite);font-weight:600;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.05em">Installments</div>';
      html += d.installments.map(function (ins, i) {
        var colorMap = { Paid: "green", Unpaid: "blue", Overdue: "amber" };
        var body = '<div class="installment-row">' +
          '<div class="ii">' + (ins.isEmi ? I.creditCard : I.receipt) + "</div>" +
          '<div class="installment-main"><div class="im-top"><span>' + ins.label + (ins.isEmi ? " · EMI" : "") + '</span><span class="im-amt">' + U.fmtMoneyFull(ins.amount, d.currency) + "</span></div>" +
          '<div class="im-bottom"><span class="pill pill-' + colorMap[ins.status] + '">' + ins.status + "</span><span>" + ins.mode + "</span>" +
          (ins.isEmi ? "<span>" + ins.emiMonths + " months</span>" : "<span>Due " + U.fmtDateShort(new Date(ins.deadline)) + "</span>") + "</div></div>" +
          (ins.isEmi ? '<button class="icon-btn" data-emi-edit="' + i + '" title="Edit EMI terms">' + I.pencil + "</button>" : "") +
        "</div>";
        if (ins.isEmi) {
          body += '<div class="emi-edit-form" data-emi-form="' + i + '" style="display:none">' +
            '<div class="ef-row"><div><label style="display:block;font-size:11px;color:var(--graphite);margin-bottom:4px">Tenure (months)</label><input type="number" data-f="months" value="' + ins.emiMonths + '" /></div>' +
            '<div><label style="display:block;font-size:11px;color:var(--graphite);margin-bottom:4px">Monthly amount</label><input type="number" data-f="amount" value="' + Math.round(ins.amount / ins.emiMonths) + '" /></div></div>' +
            '<button class="btn btn-primary btn-sm" data-emi-submit="' + i + '">Submit for re-approval</button>' +
          "</div>";
        }
        return body;
      }).join("");
      return html;
    }

    function renderOfferBody(complete) {
      var label = d.reachedStage >= 1 ? "Revise offer letter" : "Send offer letter";
      var tpl = complete ? pickStable(d.id, D.OFFER_TEMPLATES) : null;
      return (complete ?
        '<div class="side-row"><span class="k">Template used</span><span class="v">' + tpl.name + "</span></div>" +
        '<div class="side-row"><span class="k">Sent on</span><span class="v mono">' + U.fmtDate(d.createdOn) + "</span></div>"
        : '<div class="empty-state" style="padding:16px 0">No offer sent yet — build a payment plan first.</div>') +
        '<div style="margin-top:12px"><button class="btn btn-secondary btn-sm" data-offer-cta>' + I.mail + label + "</button></div>";
    }

    function renderEnrollBody(complete) {
      if (!complete) return '<div class="empty-state" style="padding:16px 0">Enrollment unlocks after the first payment.</div>';
      return '<div class="side-row"><span class="k">Applicant ID (LMS)</span><span class="v mono">LMS-' + (10000 + hash(d.id) % 8999) + "</span></div>" +
        '<div class="side-row"><span class="k">Admission Counsellor</span><span class="v">' + D.PEOPLE_BY_ID[d.bdrId].name + " (BDR)</span></div>" +
        '<div class="side-row"><span class="k">First session</span><span class="v mono">' + U.fmtDate(new Date(D.NOW.getTime() + 12 * 86400000)) + "</span></div>";
    }

    function paintRight() {
      var host = el.querySelector(".dd-right");
      var milestones = ["Application Sent", "Application Filled", "Offer Shared", "Offer Accepted", "Payment Ongoing", "Payment Completed"];
      var rankMap = [0, 0, 1, 1, 2, 3]; // which reachedStage unlocks which milestone
      var currentIdx = milestoneIndexFor(d);
      host.innerHTML =
        '<div class="side-block"><h4>Milestones</h4><div class="timeline">' +
          milestones.map(function (m, i) {
            var cls = i < currentIdx ? "is-done" : i === currentIdx ? "is-current" : "";
            return '<div class="tl-item ' + cls + '"><span class="tl-dot"></span><span class="tl-text">' + m + "</span></div>";
          }).join("") +
        "</div></div>" +
        '<div class="side-block"><h4>Activity Log</h4>' +
          d.reasonLog.slice().reverse().map(function (l) {
            return '<div class="log-item"><div class="log-text">' + U.escapeHtml(l.text) + "</div>" +
              (l.reason ? '<div class="log-reason">“' + U.escapeHtml(l.reason) + '”</div>' : "") +
              '<div class="log-time">' + U.fmtDate(l.ts) + "</div></div>";
          }).join("") +
        "</div>";
    }

    function milestoneIndexFor(deal) {
      if (deal.status.id === "APP_PENDING" || deal.status.id === "APP_EXPIRED") return 0;
      if (deal.status.id === "APP_FILLED") return 1;
      if (deal.status.id === "OFFER_PENDING" || deal.status.id === "OFFER_EXPIRED") return 2;
      if (deal.status.id === "OFFER_ACCEPTED") return 3;
      if (deal.status.id === "PAY_ONGOING") return 4;
      if (deal.status.id === "PAY_COMPLETED") return 5;
      return deal.reachedStage >= 3 ? 5 : deal.reachedStage >= 2 ? 4 : deal.reachedStage >= 1 ? 2 : 0;
    }
  }

  function openApplicationSlideover(d) {
    var scrim = document.createElement("div");
    scrim.className = "overlay-scrim";
    var panel = document.createElement("div");
    panel.className = "wizard-panel";
    panel.style.width = "min(560px, 100vw)";
    panel.innerHTML =
      '<div class="wizard-head"><span class="panel-title">Application Details</span><button class="icon-btn" data-close>' + I.x + "</button></div>" +
      '<div class="wizard-body"><div class="wizard-form">' +
        group("Basic Information", [["Name", d.name], ["Mobile", d.phone], ["Email", d.email], ["City / Country", d.city + ", " + d.country]]) +
        group("Professional Details", [["Current role", pickStable(d.id + "r", ROLES)], ["Experience", pickStable(d.id + "e", EXP)], ["Tools", pickStable(d.id + "t", TOOLS)], ["English level", pickStable(d.id + "l", ENGLISH)], ["Income band", pickStable(d.id + "i", INCOME)]]) +
        group("Educational Details", [["Qualification", pickStable(d.id + "q", QUALS)], ["CV uploaded", "Yes"], ["LinkedIn", "linkedin.com/in/" + d.name.toLowerCase().replace(/\s+/g, "-")]]) +
        '<div class="field-group"><label>Statement of Purpose</label><p style="font-size:var(--text-small);color:var(--fog);line-height:1.6">Discovered Novatr through a ' + d.sopSource + '. Looking to strengthen practical, industry-relevant skills in ' + d.course.name + ' to move into a more technical role within the next year.</p></div>' +
      "</div></div>";
    document.body.appendChild(scrim);
    document.body.appendChild(panel);
    requestAnimationFrame(function () { scrim.classList.add("is-open"); panel.classList.add("is-open"); });
    function close() {
      scrim.classList.remove("is-open"); panel.classList.remove("is-open");
      setTimeout(function () { scrim.remove(); panel.remove(); }, 260);
    }
    scrim.addEventListener("click", close);
    panel.querySelector("[data-close]").addEventListener("click", close);
    function group(title, rows) {
      return '<div class="field-group"><label style="color:var(--paper);font-size:var(--text-small)">' + title + "</label>" +
        rows.map(function (r) { return '<div class="side-row"><span class="k">' + r[0] + '</span><span class="v">' + U.escapeHtml(r[1]) + "</span></div>"; }).join("") +
      "</div>";
    }
  }

  OMS.dealDetailComponent = { render: render };
})(window.OMS = window.OMS || {});
