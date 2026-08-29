/* ============================================================
   OMS v3 — Mock data layer
   Deterministic (seeded) synthetic dataset standing in for the
   real product's data — realistic shape, placeholder content,
   exactly as the source material (Figma mocks) was itself.
   ============================================================ */
(function (OMS) {
  "use strict";

  // ---- tiny seeded RNG (mulberry32) so the "randomness" is stable ----
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = mulberry32(88172645);
  function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
  function int(min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
  function daysAgo(n) { var d = new Date(NOW); d.setDate(d.getDate() - n); return d; }
  function daysFromNow(n) { var d = new Date(NOW); d.setDate(d.getDate() + n); return d; }
  function fmtISO(d) { return d.toISOString().slice(0, 10); }

  var NOW = new Date("2026-08-24T10:00:00Z");

  // ---------------------------------------------------------------
  // Courses
  // ---------------------------------------------------------------
  var COURSES = [
    { id: "bim-arch", code: "BIM_C005", name: "BIM for Architects", short: "BIM · Architects" },
    { id: "bim-civil", code: "BIM_C009", name: "BIM for Civil Engineers", short: "BIM · Civil" },
    { id: "mcd", code: "MCD_C004", name: "Master in Computational Design", short: "MCD" }
  ];

  // ---------------------------------------------------------------
  // Org hierarchy — Admin > Team Managers > Team Leads > (ATL) BDRs
  // ---------------------------------------------------------------
  var ADMIN = { id: "admin-1", role: "ADMIN", name: "Sales Head", initials: "SH", title: "VP, Sales" };

  var TEAM_MANAGERS = [
    { id: "tm-priya", role: "TM", name: "Priya Nair", initials: "PN", courseId: "bim-arch" },
    { id: "tm-arjun", role: "TM", name: "Arjun Mehta", initials: "AM", courseId: "bim-civil" },
    { id: "tm-kabir", role: "TM", name: "Kabir Sethi", initials: "KS", courseId: "mcd" }
  ];

  var TEAM_LEADS = [
    { id: "tl-rohan", role: "TL", name: "Rohan Verma", initials: "RV", tmId: "tm-priya" },
    { id: "tl-meera", role: "TL", name: "Meera Iyer", initials: "MI", tmId: "tm-priya" },
    { id: "tl-nikhat", role: "TL", name: "Nikhat Sheikh", initials: "NS", tmId: "tm-arjun" },
    { id: "tl-karan", role: "TL", name: "Karan Chopra", initials: "KC", tmId: "tm-arjun" },
    { id: "tl-diya", role: "TL", name: "Diya Malhotra", initials: "DM", tmId: "tm-kabir" },
    { id: "tl-vikram", role: "TL", name: "Vikram Suri", initials: "VS", tmId: "tm-kabir" }
  ];

  var BDRS = [
    { id: "bdr-ananya", role: "BDR", name: "Ananya Kapoor", initials: "AK", tlId: "tl-rohan", target: 14 },
    { id: "atl-ishaan", role: "ATL", name: "Ishaan Bhatt", initials: "IB", tlId: "tl-rohan", target: 16 },
    { id: "bdr-devika", role: "BDR", name: "Devika Rao", initials: "DR", tlId: "tl-rohan", target: 12 },
    { id: "bdr-farhan", role: "BDR", name: "Farhan Ali", initials: "FA", tlId: "tl-meera", target: 13 },
    { id: "bdr-simran", role: "BDR", name: "Simran Kaur", initials: "SK", tlId: "tl-meera", target: 15 },
    { id: "bdr-yusuf", role: "BDR", name: "Yusuf Khan", initials: "YK", tlId: "tl-nikhat", target: 12 },
    { id: "bdr-tara", role: "BDR", name: "Tara Menon", initials: "TM2", tlId: "tl-nikhat", target: 14 },
    { id: "bdr-riya", role: "BDR", name: "Riya Desai", initials: "RD", tlId: "tl-karan", target: 13 },
    { id: "bdr-omkar", role: "BDR", name: "Omkar Patil", initials: "OP", tlId: "tl-karan", target: 11 },
    { id: "bdr-aditya", role: "BDR", name: "Aditya Ranganathan", initials: "AR", tlId: "tl-diya", target: 12 },
    { id: "bdr-neha", role: "BDR", name: "Neha Joshi", initials: "NJ", tlId: "tl-diya", target: 15 },
    { id: "bdr-zara", role: "BDR", name: "Zara Ahmed", initials: "ZA", tlId: "tl-vikram", target: 13 },
    { id: "bdr-rahul", role: "BDR", name: "Rahul Bose", initials: "RB", tlId: "tl-vikram", target: 12 }
  ];

  var PEOPLE_BY_ID = {};
  [ADMIN].concat(TEAM_MANAGERS, TEAM_LEADS, BDRS).forEach(function (p) { PEOPLE_BY_ID[p.id] = p; });

  function tlOf(bdrId) { var p = PEOPLE_BY_ID[bdrId]; return p && p.tlId ? PEOPLE_BY_ID[p.tlId] : null; }
  function tmOf(bdrId) { var tl = tlOf(bdrId); return tl && tl.tmId ? PEOPLE_BY_ID[tl.tmId] : null; }

  // current "logged in" persona the prototype is scoped to by default
  var CURRENT_PERSON_ID = "bdr-ananya";

  // ---------------------------------------------------------------
  // Status model
  // ---------------------------------------------------------------
  var STATUS = {
    APP_PENDING:   { id: "APP_PENDING",   stage: "Application", label: "Pending",  color: "blue",  action: false, desc: "Application sent, awaiting the learner" },
    APP_EXPIRED:   { id: "APP_EXPIRED",   stage: "Application", label: "Expired",  color: "amber", action: false, desc: "Application link timed out" },
    APP_FILLED:    { id: "APP_FILLED",    stage: "Application", label: "Filled",   color: "green", action: true,  desc: "Learner filled it — offer not sent yet" },
    OFFER_PENDING: { id: "OFFER_PENDING", stage: "Offer",       label: "Pending",  color: "blue",  action: false, desc: "Offer sent, awaiting the learner" },
    OFFER_EXPIRED: { id: "OFFER_EXPIRED", stage: "Offer",       label: "Expired",  color: "amber", action: false, desc: "Offer's acceptance window timed out" },
    OFFER_ACCEPTED:{ id: "OFFER_ACCEPTED",stage: "Offer",       label: "Accepted", color: "green", action: true,  desc: "Accepted — no payment made yet" },
    PAY_ONGOING:   { id: "PAY_ONGOING",   stage: "Payment",     label: "Ongoing",  color: "green", action: false, desc: "First payment made, installments continuing" },
    PAY_COMPLETED: { id: "PAY_COMPLETED", stage: "Payment",     label: "Completed",color: "green", action: false, desc: "All installments paid" },
    ENR_CANCELLED: { id: "ENR_CANCELLED", stage: "Enrolment",   label: "Cancelled",color: "red",   action: false, desc: "Enrolment was cancelled (backend action)" },
    NOT_INTERESTED:{ id: "NOT_INTERESTED",stage: "Global",      label: "Not Interested", color: "gray", action: false, desc: "Learner is no longer interested" },
    REJECTED:      { id: "REJECTED",      stage: "Global",      label: "Rejected", color: "gray",  action: false, desc: "Disqualified by the BDR" },
    SAVED:         { id: "SAVED",         stage: "Global",      label: "Saved",    color: "gray",  action: false, desc: "Parked for a future sales cycle" }
  };

  // realistic funnel-shaped distribution — Application stage stays the
  // largest bucket, consistent with the Admin "Deal Stages" scenario
  var STATUS_WEIGHTS = [
    ["APP_PENDING", 16], ["APP_EXPIRED", 5], ["APP_FILLED", 9],
    ["OFFER_PENDING", 10], ["OFFER_EXPIRED", 3], ["OFFER_ACCEPTED", 8],
    ["PAY_ONGOING", 9], ["PAY_COMPLETED", 11],
    ["NOT_INTERESTED", 6], ["REJECTED", 3], ["SAVED", 2], ["ENR_CANCELLED", 1]
  ];
  function weightedStatus() {
    var total = STATUS_WEIGHTS.reduce(function (s, w) { return s + w[1]; }, 0);
    var r = rng() * total;
    for (var i = 0; i < STATUS_WEIGHTS.length; i++) {
      r -= STATUS_WEIGHTS[i][1];
      if (r <= 0) return STATUS[STATUS_WEIGHTS[i][0]];
    }
    return STATUS.APP_PENDING;
  }

  var FIRST_NAMES = ["Aarav","Vivaan","Diya","Ishita","Kabir","Meher","Sara","Aryan","Naina","Reyansh",
    "Anaya","Vihaan","Myra","Advika","Rehan","Trisha","Dhruv","Kiara","Yash","Alia",
    "James","Olivia","Daniel","Sophia","Lucas","Amelia","Noah","Grace","Ethan","Chloe",
    "Marco","Elena","Hassan","Layla","Omar","Fatima","Chen","Wei","Mei","Arjun"];
  var LAST_NAMES = ["Sharma","Gupta","Iyer","Reddy","Nair","Kapoor","Verma","Chopra","Bhatt","Rao",
    "Malhotra","Menon","Joshi","Bose","Sheikh","Suri","Desai","Patil","Ranganathan","Ahmed",
    "Fischer","Novak","Rossi","Dubois","Larsen","Okoye","Silva","Tanaka","Wong","Kim"];
  var CITIES = [["Mumbai","India"],["Bengaluru","India"],["Delhi","India"],["Pune","India"],["Hyderabad","India"],
    ["Dubai","UAE"],["Singapore","Singapore"],["London","UK"],["Toronto","Canada"],["Sydney","Australia"],["Lagos","Nigeria"]];
  var SOP_SOURCES = ["Instagram ad","LinkedIn post","Google search","referral from a friend","YouTube review","Novatr blog"];

  function genName() { return pick(FIRST_NAMES) + " " + pick(LAST_NAMES); }

  // ---------------------------------------------------------------
  // Deals
  // ---------------------------------------------------------------
  var DEALS = [];
  (function generateDeals() {
    var n = 58;
    for (var i = 0; i < n; i++) {
      var bdr = pick(BDRS.filter(function (b) { return b.role === "BDR" || b.role === "ATL"; }));
      var tl = tlOf(bdr.id);
      var tm = tmOf(bdr.id);
      var course = pick(COURSES);
      var status = weightedStatus();
      var created = daysAgo(int(1, 95));
      var lastUpdate = new Date(Math.min(NOW.getTime(), created.getTime() + int(0, 20) * 86400000));
      var currency = rng() < 0.72 ? "INR" : "USD";
      var courseFee = currency === "INR" ? pick([185000, 210000, 245000, 275000]) : pick([2400, 2800, 3200]);
      var discountPct = int(0, 20);
      var discount = Math.round(courseFee * (discountPct / 100));
      var netPayable = courseFee - discount;
      var city = pick(CITIES);
      var hasPlan = ["OFFER_PENDING","OFFER_EXPIRED","OFFER_ACCEPTED","PAY_ONGOING","PAY_COMPLETED","ENR_CANCELLED"].indexOf(status.id) > -1;
      var installments = [];
      if (hasPlan) {
        var modeChoices = currency === "INR" ? ["Razorpay","Manual","EMI_3P"] : ["Stripe","Stripe EMI"];
        var partPayment = rng() < 0.6;
        var count = partPayment ? int(2, 3) : 1;
        var remaining = netPayable;
        for (var k = 0; k < count; k++) {
          var mode = pick(modeChoices);
          var isEmi = mode.indexOf("EMI") > -1;
          var amt = k === count - 1 ? remaining : Math.round(remaining / (count - k) / 100) * 100;
          remaining -= amt;
          var paidFlag = status.id === "PAY_COMPLETED" ? true : (status.id === "PAY_ONGOING" ? k === 0 : false);
          var overdue = !paidFlag && status.id === "PAY_ONGOING" && k === 1 && rng() < 0.35;
          // paidOn: some day between the deal's creation and now — this is
          // what lets revenue actually be "realised" *within a period*,
          // distinct from when the underlying deal/plan was *booked*.
          var paidOn = paidFlag ? new Date(created.getTime() + int(1, Math.max(1, Math.round((NOW - created) / 86400000))) * 86400000) : null;
          if (paidOn && paidOn > NOW) paidOn = NOW;
          installments.push({
            label: partPayment ? "Installment " + (k + 1) : "Full payment",
            amount: amt, mode: mode, isEmi: isEmi,
            emiMonths: isEmi ? pick([3, 6, 12]) : null,
            emiInterest: isEmi ? pick([180, 340, 620]) : null,
            deadline: fmtISO(daysFromNow(int(-10, 30))),
            status: paidFlag ? "Paid" : (overdue ? "Overdue" : "Unpaid"),
            paidOn: paidOn
          });
        }
      }
      DEALS.push({
        id: "DL-" + (2100 + i),
        applicationId: "APP-" + (48000 + i * 3),
        name: genName(),
        email: null, // derived lazily in getters to keep this block scannable
        phone: "+" + pick(["91","1","44","971","65"]) + " " + int(700000000, 999999999),
        course: course,
        currency: currency,
        courseFee: courseFee,
        discount: discount,
        netPayable: netPayable,
        installments: installments,
        status: status,
        createdOn: created,
        lastUpdate: lastUpdate,
        bdrId: bdr.id,
        tlId: tl ? tl.id : null,
        tmId: tm ? tm.id : null,
        cohort: course.code + "-" + pick(["A","B","C"]),
        city: city[0], country: city[1],
        intlFlag: city[1] !== "India",
        sopSource: pick(SOP_SOURCES),
        reasonLog: []
      });
    }
    // reachedStage: furthest funnel step (0 Application / 1 Offer / 2 Payment-accepted / 3 Payment cleared)
    // this is the value that lets the funnel-card component bucket a
    // Not-Interested/Rejected/Saved deal at *where it actually stalled*,
    // rather than lumping every closed deal into one place.
    var STAGE_RANK = { APP_PENDING:0, APP_EXPIRED:0, APP_FILLED:0, OFFER_PENDING:1, OFFER_EXPIRED:1,
      OFFER_ACCEPTED:1, PAY_ONGOING:2, PAY_COMPLETED:3, ENR_CANCELLED:3 };
    DEALS.forEach(function (d) {
      d.email = d.name.toLowerCase().replace(/\s+/g, ".") + "@" + pick(["gmail.com","outlook.com","proton.me"]);
      d.reasonLog = buildActivityLog(d);
      if (STAGE_RANK.hasOwnProperty(d.status.id)) {
        d.reachedStage = STAGE_RANK[d.status.id];
      } else {
        // Not Interested / Rejected / Saved — stalled somewhere; weight toward earlier stages
        d.reachedStage = pick([0, 0, 0, 1, 1, 2]);
      }
    });
  })();

  function buildActivityLog(d) {
    var log = [];
    log.push({ ts: d.createdOn, text: "Deal created", reason: "PDE completed on call" });
    var stageOrder = ["APP_PENDING","APP_FILLED","OFFER_PENDING","OFFER_ACCEPTED","PAY_ONGOING","PAY_COMPLETED"];
    var idx = stageOrder.indexOf(d.status.id);
    if (idx === -1) idx = 0;
    if (idx >= 1) log.push({ ts: daysAgo(int(1, 60)), text: "Application filled by learner" });
    if (idx >= 2) log.push({ ts: daysAgo(int(1, 45)), text: "Offer letter sent", reason: "With Scholarship template" });
    if (idx >= 3) log.push({ ts: daysAgo(int(1, 30)), text: "Offer accepted by learner" });
    if (idx >= 4) log.push({ ts: daysAgo(int(1, 20)), text: "Down payment received" });
    if (idx >= 5) log.push({ ts: daysAgo(int(1, 5)), text: "Final installment received — payment completed" });
    if (d.status.id === "NOT_INTERESTED") log.push({ ts: daysAgo(int(1, 10)), text: "Marked Not Interested", reason: "Deferring to next year's cohort" });
    if (rng() < 0.25 && d.installments.length) {
      log.push({ ts: daysAgo(int(0, 4)), text: "Payment due date extended", reason: "Learner requested 5 extra days for fund transfer" });
    }
    log.push({ ts: daysAgo(int(1, 80)), text: "Deal assigned to " + PEOPLE_BY_ID[d.bdrId].name, reason: "Routine team allocation" });
    log.sort(function (a, b) { return a.ts - b.ts; });
    return log;
  }

  // ---------------------------------------------------------------
  // Scoping helpers — the whole rebuild thesis in three functions:
  // one dataset, filtered by whoever is asking.
  // ---------------------------------------------------------------
  function dealsForPerson(personId) {
    var p = PEOPLE_BY_ID[personId];
    if (!p) return [];
    if (p.role === "ADMIN") return DEALS.slice();
    if (p.role === "TM") return DEALS.filter(function (d) { return d.tmId === personId; });
    if (p.role === "TL") return DEALS.filter(function (d) { return d.tlId === personId; });
    return DEALS.filter(function (d) { return d.bdrId === personId; }); // BDR / ATL
  }

  function reportsOf(personId) {
    var p = PEOPLE_BY_ID[personId];
    if (!p) return [];
    if (p.role === "ADMIN") return TEAM_MANAGERS;
    if (p.role === "TM") return TEAM_LEADS.filter(function (t) { return t.tmId === personId; });
    if (p.role === "TL") return BDRS.filter(function (b) { return b.tlId === personId; });
    return [];
  }

  // ---------------------------------------------------------------
  // Date ranges — the dashboard's "This Month / Last Month / This
  // Quarter / Lifetime" pills. Each maps to a [from, to) window
  // relative to NOW; "lifetime" has no window (everything counts).
  // ---------------------------------------------------------------
  var RANGES = {
    thisMonth: function () { return [new Date(NOW.getFullYear(), NOW.getMonth(), 1), NOW]; },
    lastMonth: function () { return [new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1), new Date(NOW.getFullYear(), NOW.getMonth(), 1)]; },
    quarter: function () { return [new Date(NOW.getTime() - 90 * 86400000), NOW]; },
    lifetime: function () { return null; }
  };
  var RANGE_LABELS = { thisMonth: "This Month", lastMonth: "Last Month", quarter: "This Quarter", lifetime: "Lifetime" };
  function rangeWindow(range) { return (RANGES[range] || RANGES.thisMonth)(); }
  function inWindow(date, win) { return !win || (date >= win[0] && date < win[1]); }

  // deals whose *creation* falls in the window — used to scope the
  // Deal Stages / Payment Modes chart and the funnel-card block so the
  // whole dashboard reads consistently for a selected period, not just
  // the revenue figures.
  function dealsInRange(deals, range) {
    var win = rangeWindow(range);
    if (!win) return deals;
    return deals.filter(function (d) { return inWindow(d.createdOn, win); });
  }

  function performanceFor(personId, range) {
    var allDeals = dealsForPerson(personId);
    var win = rangeWindow(range);
    var p = PEOPLE_BY_ID[personId];
    var booked = 0, realisedThisPeriod = 0, realisedOfEarlier = 0, units = 0;
    allDeals.forEach(function (d) {
      var bookedInWindow = inWindow(d.createdOn, win);
      if (d.installments.length && bookedInWindow) {
        booked += toINR(d.netPayable, d.currency);
      }
      d.installments.forEach(function (ins) {
        if (ins.status !== "Paid" || !ins.paidOn || !inWindow(ins.paidOn, win)) return;
        if (bookedInWindow) realisedThisPeriod += toINR(ins.amount, d.currency);
        else realisedOfEarlier += toINR(ins.amount, d.currency);
      });
      if (d.status.id === "PAY_COMPLETED" && inWindow(d.lastUpdate, win)) units += 1;
    });
    var realised = realisedThisPeriod + realisedOfEarlier;
    // scale a per-person target to the window's rough length so
    // "Lifetime" and "This Quarter" don't show a impossibly-easy
    // one-month target — a deliberately simple linear approximation.
    var baseTarget = p && p.target ? p.target : (allDeals.length ? Math.round(allDeals.length * 0.9) : 10);
    var scale = range === "lifetime" ? 4 : range === "quarter" ? 3 : 1;
    return {
      range: range || "thisMonth", label: RANGE_LABELS[range] || RANGE_LABELS.thisMonth,
      target: baseTarget * scale, achieved: units,
      revenueBooked: booked, revenueRealised: realised,
      realisedThisPeriod: realisedThisPeriod, realisedOfEarlier: realisedOfEarlier,
      ats: units ? Math.round(realised / units) : 0
    };
  }

  function toINR(amount, currency) { return currency === "USD" ? amount * 83 : amount; }

  function dealById(id) { return DEALS.filter(function (d) { return d.id === id; })[0] || null; }

  function logActivity(deal, text, reason) {
    deal.reasonLog.push({ ts: NOW, text: text, reason: reason || null });
  }

  function setDealStatus(dealId, statusKey, reason) {
    var d = dealById(dealId);
    if (!d) return null;
    d.status = STATUS[statusKey];
    d.lastUpdate = NOW;
    logActivity(d, humanizeStatusChange(statusKey), reason);
    return d;
  }
  function humanizeStatusChange(key) {
    var map = {
      NOT_INTERESTED: "Deal marked Not Interested", REJECTED: "Deal marked Rejected", SAVED: "Deal saved for later",
      OFFER_PENDING: "Offer letter sent", APP_PENDING: "Deal Reopened"
    };
    return map[key] || ("Status changed to " + STATUS[key].label);
  }

  // ---------------------------------------------------------------
  // Revenue trend — a daily/weekly/monthly series shaped to whichever
  // range is selected, normalized to that range's own realised total
  // so the chart always agrees with the revenue card above it.
  // ---------------------------------------------------------------
  function revenueTrend(personId, range) {
    var perf = performanceFor(personId, range);
    var points = range === "lifetime" ? 12 : range === "quarter" ? 13 : (range === "lastMonth" ? 31 : NOW.getDate());
    points = Math.max(points, 4);
    var base = perf.revenueRealised / points;
    var pts = [];
    var cum = 0;
    for (var i = 0; i < points; i++) {
      var v = Math.max(0, base * (0.35 + rng() * 1.4));
      cum += v;
      pts.push({ day: i + 1, value: Math.round(v), cumulative: Math.round(cum) });
    }
    var scale = pts.length && pts[pts.length - 1].cumulative ? perf.revenueRealised / pts[pts.length - 1].cumulative : 1;
    pts.forEach(function (pt) { pt.cumulative = Math.round(pt.cumulative * scale); pt.value = Math.round(pt.value * scale); });
    return pts;
  }

  var OFFER_TEMPLATES = [
    { id: "early-bird", name: "Early Bird", blurb: "For learners who accept within the first 48 hours." },
    { id: "no-scholarship", name: "Without Scholarship", blurb: "Standard offer, no discount applied." },
    { id: "with-scholarship", name: "With Scholarship", blurb: "Includes the merit/need-based scholarship line." }
  ];

  OMS.data = {
    NOW: NOW,
    COURSES: COURSES,
    ADMIN: ADMIN,
    TEAM_MANAGERS: TEAM_MANAGERS,
    TEAM_LEADS: TEAM_LEADS,
    BDRS: BDRS,
    PEOPLE_BY_ID: PEOPLE_BY_ID,
    CURRENT_PERSON_ID: CURRENT_PERSON_ID,
    STATUS: STATUS,
    DEALS: DEALS,
    OFFER_TEMPLATES: OFFER_TEMPLATES,
    tlOf: tlOf, tmOf: tmOf,
    dealsForPerson: dealsForPerson,
    dealsInRange: dealsInRange,
    reportsOf: reportsOf,
    performanceFor: performanceFor,
    revenueTrend: revenueTrend,
    RANGE_LABELS: RANGE_LABELS,
    toINR: toINR,
    dealById: dealById,
    logActivity: logActivity,
    setDealStatus: setDealStatus
  };
})(window.OMS = window.OMS || {});
