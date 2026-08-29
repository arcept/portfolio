/* ============================================================
   OMS v3 — Offer Wizard: Create Payment Plan → Choose Template.
   Carries forward the two guardrails the source spec calls out
   as worth keeping: a live "Amount Left" validator, and a live
   preview of the exact email before it sends.
   ============================================================ */
(function (OMS) {
  "use strict";
  var U = OMS.utils, I = OMS.icons, D = OMS.data;

  var MODES_INR = ["Razorpay", "Manual", "EMI_3P"];
  var MODES_USD = ["Stripe", "Stripe EMI"];
  var EMI_TENURES = [3, 6, 12];

  function open(dealId, opts) {
    opts = opts || {};
    var d = D.dealById(dealId);
    var isRevise = d.reachedStage >= 1;

    var state = {
      step: 1,
      planType: d.installments.length > 1 ? "part" : "upfront",
      discount: d.discount || 0,
      installments: d.installments.length ? d.installments.map(function (i) { return { amount: i.amount, mode: i.mode, deadline: i.deadline, isEmi: i.isEmi, emiMonths: i.emiMonths }; }) :
        [{ amount: Math.max(0, d.courseFee - (d.discount || 0)), mode: d.currency === "INR" ? "Razorpay" : "Stripe", deadline: isoInDays(14), isEmi: false, emiMonths: null }],
      templateId: "with-scholarship",
      offerDeadline: isoInDays(7)
    };

    var scrim = document.createElement("div"); scrim.className = "overlay-scrim";
    var panel = document.createElement("div"); panel.className = "wizard-panel";
    document.body.appendChild(scrim); document.body.appendChild(panel);
    requestAnimationFrame(function () { scrim.classList.add("is-open"); panel.classList.add("is-open"); document.body.style.overflow = "hidden"; });

    function close() {
      scrim.classList.remove("is-open"); panel.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () { scrim.remove(); panel.remove(); }, 380);
    }
    scrim.addEventListener("click", close);

    function netPayable() { return Math.max(0, d.courseFee - Number(state.discount || 0)); }
    function totalAssigned() { return state.installments.reduce(function (s, r) { return s + (Number(r.amount) || 0); }, 0); }
    function amountLeft() { return state.planType === "upfront" ? 0 : netPayable() - totalAssigned(); }

    function paintChrome() {
      panel.innerHTML =
        '<div class="wizard-head">' +
          '<div><div class="panel-title">' + (isRevise ? "Revise" : "Send") + " offer letter</div>" +
          '<div style="font-size:var(--text-caption);color:var(--graphite);margin-top:2px">' + U.escapeHtml(d.name) + " · " + d.course.short + "</div></div>" +
          '<div class="wizard-steps">' +
            step(1, "Payment Plan") + '<span class="wizard-step-line"></span>' + step(2, "Template") +
          "</div>" +
          '<button class="icon-btn" data-close>' + I.x + "</button>" +
        "</div>" +
        '<div class="wizard-body" id="wiz-body"></div>' +
        '<div class="wizard-foot" id="wiz-foot"></div>';
      panel.querySelector("[data-close]").addEventListener("click", close);
      paintBody(); paintFoot();
      function step(n, label) {
        var cls = state.step === n ? "is-active" : state.step > n ? "is-done" : "";
        return '<div class="wizard-step-dot ' + cls + '"><span class="n">' + (state.step > n ? "✓" : n) + "</span>" + label + "</div>";
      }
    }

    function paintBody() {
      var body = panel.querySelector("#wiz-body");
      if (state.step === 1) {
        body.className = "wizard-body";
        body.innerHTML = '<div class="wizard-form">' + step1Html() + "</div>";
        bindStep1();
      } else if (state.step === 2) {
        body.className = "wizard-body has-preview";
        body.innerHTML = '<div class="wizard-form">' + step2Html() + '</div><div class="wizard-preview" id="wiz-preview"></div>';
        paintPreview();
        bindStep2();
      } else {
        body.className = "wizard-body";
        body.innerHTML =
          '<div class="confirm-screen">' +
            '<div class="confirm-icon">' + I.check + "</div>" +
            '<div class="confirm-title">Offer sent to ' + U.escapeHtml(d.name.split(" ")[0]) + "!</div>" +
            '<div class="confirm-sub">They’ll receive it by email, with a link back to their offer. You can track acceptance from their Deal.</div>' +
            '<button class="btn btn-primary" style="margin-top:24px" data-goto-deal>' + I.arrowRight + "View deal</button>" +
          "</div>";
        var gotoBtn = panel.querySelector("[data-goto-deal]");
        if (gotoBtn) gotoBtn.addEventListener("click", function () { close(); OMS.store.openDeal(d.id); });
      }
    }

    function step1Html() {
      var modes = d.currency === "INR" ? MODES_INR : MODES_USD;
      return (
        '<div class="field-group">' +
          '<label>Payment type</label>' +
          '<div class="segmented" id="plan-type-toggle">' +
            '<button data-plan="upfront" class="' + (state.planType === "upfront" ? "is-active" : "") + '">Upfront</button>' +
            '<button data-plan="part" class="' + (state.planType === "part" ? "is-active" : "") + '">Part Payment</button>' +
          "</div>" +
        "</div>" +
        '<div class="field-group">' +
          '<label>Discount (' + d.currency + ")</label>" +
          '<input type="number" id="discount-input" value="' + state.discount + '" min="0" max="' + d.courseFee + '" />' +
        "</div>" +
        '<div class="field-group">' +
          '<div class="fee-line"><span>Course Fee</span><span class="fv">' + U.fmtMoneyFull(d.courseFee, d.currency) + "</span></div>" +
          '<div class="fee-line total"><span>Net Payable Fee</span><span class="fv" id="net-payable-fig">' + U.fmtMoneyFull(netPayable(), d.currency) + "</span></div>" +
        "</div>" +
        '<div class="field-group" id="installments-field">' +
          '<label>Installments</label>' +
          '<div id="installments-list">' + state.installments.map(function (r, i) { return installmentRowHtml(r, i, modes); }).join("") + "</div>" +
          (state.planType === "part" ? '<button class="btn btn-secondary btn-sm" id="add-installment">' + I.plus + "Add Installment</button>" : "") +
        "</div>" +
        (state.planType === "part" ? amountLeftHtml() : "")
      );
    }

    function installmentRowHtml(r, i, modes) {
      return '<div class="installment-builder-row" data-row="' + i + '">' +
        (state.planType === "part" ?
          '<div><label style="font-size:11px;color:var(--graphite);display:block;margin-bottom:4px">Amount</label><input type="number" class="inst-amount" data-idx="' + i + '" value="' + r.amount + '" /></div>' :
          '<div><label style="font-size:11px;color:var(--graphite);display:block;margin-bottom:4px">Amount</label><input type="number" value="' + netPayable() + '" disabled /></div>') +
        '<div><label style="font-size:11px;color:var(--graphite);display:block;margin-bottom:4px">Mode</label><select class="inst-mode" data-idx="' + i + '">' +
          modes.map(function (m) { return '<option value="' + m + '"' + (r.mode === m ? " selected" : "") + ">" + m + "</option>"; }).join("") +
        "</select></div>" +
        (r.isEmi ?
          '<div><label style="font-size:11px;color:var(--graphite);display:block;margin-bottom:4px">Start date</label><input type="date" class="inst-deadline" data-idx="' + i + '" value="' + r.deadline + '" /></div>' :
          '<div><label style="font-size:11px;color:var(--graphite);display:block;margin-bottom:4px">Deadline</label><input type="date" class="inst-deadline" data-idx="' + i + '" value="' + r.deadline + '" /></div>') +
        (state.planType === "part" && state.installments.length > 1 ?
          '<button class="icon-btn rm-btn" data-remove="' + i + '" title="Remove">' + I.trash + "</button>" : "<span></span>") +
        (r.isEmi ? emiCardsHtml(r, i) : "") +
      "</div>";
    }

    function emiCardsHtml(r, i) {
      return '<div class="emi-cards" style="grid-column:1/-1">' + EMI_TENURES.map(function (m) {
        var monthly = Math.round((Number(r.amount) || 0) / m);
        var interest = Math.round((Number(r.amount) || 0) * (m === 3 ? 0.03 : m === 6 ? 0.06 : 0.1));
        return '<div class="emi-card' + (r.emiMonths === m ? " is-selected" : "") + '" data-emi-select="' + i + '" data-months="' + m + '">' +
          '<div class="em">' + U.fmtMoneyFull(monthly, d.currency) + " / mo</div>" +
          '<div class="ei">for ' + m + " months · " + U.fmtMoneyFull(interest, d.currency) + " interest</div>" +
        "</div>";
      }).join("") + '<div style="grid-column:1/-1;font-size:11px;color:var(--graphite);margin-top:4px">Payment link will be sent to the learner directly by the gateway.</div></div>';
    }

    function amountLeftHtml() {
      var left = amountLeft();
      var settled = left === 0;
      return '<div class="amount-left-bar" id="amount-left-bar">' +
        '<div class="al-row"><span class="al-label">Amount Left</span><span class="al-value ' + (settled ? "is-settled" : "is-open") + '" id="al-value">' + U.fmtMoneyFull(left, d.currency) + "</span></div>" +
        '<div class="al-track"><div class="al-fill ' + (settled ? "is-settled" : "") + '" id="al-fill" style="width:' + Math.min(100, Math.round((totalAssigned() / (netPayable() || 1)) * 100)) + '%"></div></div>' +
      "</div>";
    }

    function step2Html() {
      return D.OFFER_TEMPLATES.map(function (t) {
        return '<div class="template-card' + (state.templateId === t.id ? " is-selected" : "") + '" data-template="' + t.id + '">' +
          '<span class="radio"></span><div><div class="tn">' + t.name + '</div><div class="tb">' + t.blurb + "</div></div>" +
        "</div>";
      }).join("") +
      '<div class="field-group" style="margin-top:20px"><label>Choose deadline</label><input type="date" id="offer-deadline" value="' + state.offerDeadline + '" /></div>';
    }

    function paintPreview() {
      var host = panel.querySelector("#wiz-preview");
      var tpl = D.OFFER_TEMPLATES.filter(function (t) { return t.id === state.templateId; })[0];
      var discountPct = d.courseFee ? Math.round((state.discount / d.courseFee) * 100) : 0;
      host.innerHTML =
        '<div class="email-preview">' +
          '<div class="email-preview-header"><div class="eb">Exclusive offer</div><div class="et">' + d.course.name + " — for Career Growth</div></div>" +
          '<div class="email-preview-body">' +
            "<p>Hi " + d.name.split(" ")[0] + ",</p>" +
            "<p>Congratulations — you’re one step away from starting <strong style=\"color:var(--paper)\">" + d.course.name + "</strong>. This offer (" + tpl.name + ") is valid until <strong style=\"color:var(--paper)\">" + U.fmtDate(new Date(state.offerDeadline)) + "</strong>.</p>" +
            '<div class="email-cta">Accept Your Offer</div>' +
            (state.discount > 0 ? '<p>Your personalised scholarship: <span class="email-discount-tag">' + U.fmtMoneyFull(state.discount, d.currency) + " (" + discountPct + "% off)</span></p>" : "") +
            benefit("No-cost EMI options, up to 24 months") + benefit("Reduced down payment for the next cohort") +
            benefit("Recorded material for two electives") + benefit("Early access to pre-course material") +
          "</div>" +
        "</div>";
      function benefit(text) { return '<div class="email-benefit">' + I.check + "<span>" + text + "</span></div>"; }
    }

    function paintFoot() {
      var foot = panel.querySelector("#wiz-foot");
      if (state.step === 3) { foot.innerHTML = ""; return; }
      var nextDisabled = state.step === 1 && state.planType === "part" && amountLeft() !== 0;
      foot.innerHTML =
        '<span class="wizard-foot-note">*Lead will receive this offer on their email</span>' +
        '<div style="display:flex;gap:8px">' +
          (state.step === 2 ? '<button class="btn btn-secondary" data-back>' + I.chevronLeft + "Back</button>" : "") +
          '<button class="btn btn-primary" data-next' + (nextDisabled ? " disabled" : "") + ">" + (state.step === 1 ? "Next Step" : "Send") + (state.step === 1 ? "" : "") + "</button>" +
        "</div>";
      var nextBtn = foot.querySelector("[data-next]");
      if (nextBtn) nextBtn.addEventListener("click", function () {
        if (nextDisabled) return;
        if (state.step === 1) { state.step = 2; paintChrome(); }
        else if (state.step === 2) { submit(); }
      });
      var backBtn = foot.querySelector("[data-back]");
      if (backBtn) backBtn.addEventListener("click", function () { state.step = 1; paintChrome(); });
    }

    function bindStep1() {
      var body = panel.querySelector("#wiz-body");
      body.querySelectorAll("[data-plan]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.planType = btn.getAttribute("data-plan");
          if (state.planType === "upfront") {
            state.installments = [{ amount: netPayable(), mode: state.installments[0].mode, deadline: isoInDays(14), isEmi: false, emiMonths: null }];
          } else if (state.installments.length === 1) {
            state.installments[0].amount = netPayable();
          }
          rebuildStep1();
        });
      });
      body.querySelector("#discount-input").addEventListener("input", function (e) {
        state.discount = Number(e.target.value) || 0;
        panel.querySelector("#net-payable-fig").textContent = U.fmtMoneyFull(netPayable(), d.currency);
        if (state.planType === "upfront") { state.installments[0].amount = netPayable(); body.querySelector('.inst-amount, input[disabled]').value = netPayable(); }
        updateAmountLeftOnly();
      });
      body.addEventListener("input", function (e) {
        if (e.target.classList.contains("inst-amount")) {
          var idx = Number(e.target.getAttribute("data-idx"));
          state.installments[idx].amount = Number(e.target.value) || 0;
          updateAmountLeftOnly();
        }
      });
      body.addEventListener("change", function (e) {
        if (e.target.classList.contains("inst-mode")) {
          var idx = Number(e.target.getAttribute("data-idx"));
          var mode = e.target.value;
          state.installments[idx].mode = mode;
          state.installments[idx].isEmi = /EMI/.test(mode);
          if (state.installments[idx].isEmi && !state.installments[idx].emiMonths) state.installments[idx].emiMonths = 6;
          rebuildStep1();
        }
        if (e.target.classList.contains("inst-deadline")) {
          var idx2 = Number(e.target.getAttribute("data-idx"));
          state.installments[idx2].deadline = e.target.value;
        }
      });
      body.addEventListener("click", function (e) {
        var addBtn = e.target.closest("#add-installment");
        if (addBtn) {
          state.installments.push({ amount: Math.max(0, amountLeft()), mode: d.currency === "INR" ? "Razorpay" : "Stripe", deadline: isoInDays(21), isEmi: false, emiMonths: null });
          rebuildStep1(); return;
        }
        var rm = e.target.closest("[data-remove]");
        if (rm) { state.installments.splice(Number(rm.getAttribute("data-remove")), 1); rebuildStep1(); return; }
        var emiSel = e.target.closest("[data-emi-select]");
        if (emiSel) {
          var i = Number(emiSel.getAttribute("data-emi-select"));
          state.installments[i].emiMonths = Number(emiSel.getAttribute("data-months"));
          rebuildStep1(); return;
        }
      });
    }

    function rebuildStep1() {
      var body = panel.querySelector("#wiz-body");
      body.innerHTML = '<div class="wizard-form">' + step1Html() + "</div>";
      bindStep1();
      paintFoot();
    }

    function updateAmountLeftOnly() {
      var bar = panel.querySelector("#amount-left-bar");
      if (!bar) return;
      var left = amountLeft(), settled = left === 0;
      var valEl = panel.querySelector("#al-value"), fillEl = panel.querySelector("#al-fill");
      valEl.textContent = U.fmtMoneyFull(left, d.currency);
      valEl.className = "al-value " + (settled ? "is-settled" : "is-open");
      fillEl.className = "al-fill " + (settled ? "is-settled" : "");
      fillEl.style.width = Math.min(100, Math.round((totalAssigned() / (netPayable() || 1)) * 100)) + "%";
      paintFoot();
    }

    function bindStep2() {
      var body = panel.querySelector("#wiz-body");
      body.querySelectorAll("[data-template]").forEach(function (card) {
        card.addEventListener("click", function () {
          state.templateId = card.getAttribute("data-template");
          body.querySelectorAll("[data-template]").forEach(function (c) { c.classList.toggle("is-selected", c === card); });
          paintPreview();
        });
      });
      body.querySelector("#offer-deadline").addEventListener("input", function (e) { state.offerDeadline = e.target.value; paintPreview(); });
    }

    function submit() {
      d.courseFee = d.courseFee; // unchanged
      d.discount = state.discount;
      d.netPayable = netPayable();
      d.installments = state.installments.map(function (r, i) {
        return {
          label: state.planType === "part" ? "Installment " + (i + 1) : "Full payment",
          amount: Number(r.amount) || 0, mode: r.mode, isEmi: r.isEmi,
          emiMonths: r.isEmi ? r.emiMonths : null,
          emiInterest: r.isEmi ? Math.round(r.amount * 0.06) : null,
          deadline: r.deadline, status: "Unpaid"
        };
      });
      d.status = D.STATUS.OFFER_PENDING;
      d.reachedStage = Math.max(d.reachedStage, 1);
      d.lastUpdate = D.NOW;
      D.logActivity(d, isRevise ? "Offer letter revised" : "Offer letter sent", D.OFFER_TEMPLATES.filter(function (t) { return t.id === state.templateId; })[0].name + " template");
      state.step = 3;
      paintChrome();
      if (opts.onDone) opts.onDone();
    }

    function isoInDays(n) { var dt = new Date(D.NOW.getTime() + n * 86400000); return dt.toISOString().slice(0, 10); }

    paintChrome();
  }

  OMS.offerWizard = { open: open };
})(window.OMS = window.OMS || {});
