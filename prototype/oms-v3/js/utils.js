/* ============================================================
   OMS v3 — Utilities: formatting, DOM helpers, motion primitives
   ============================================================ */
(function (OMS) {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (e) {
    reduceMotion = e.matches;
  });

  function fmtMoney(amount, currency) {
    currency = currency || "INR";
    var abs = Math.abs(amount);
    if (currency === "INR") {
      var str;
      if (abs >= 10000000) str = (amount / 10000000).toFixed(2) + " Cr";
      else if (abs >= 100000) str = (amount / 100000).toFixed(2) + " L";
      else str = amount.toLocaleString("en-IN");
      return "₹" + str;
    }
    return "$" + amount.toLocaleString("en-US");
  }

  function fmtMoneyFull(amount, currency) {
    currency = currency || "INR";
    var sym = currency === "INR" ? "₹" : "$";
    return sym + Math.round(amount).toLocaleString(currency === "INR" ? "en-IN" : "en-US");
  }

  function fmtDate(d) {
    if (!(d instanceof Date)) d = new Date(d);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  function fmtDateShort(d) {
    if (!(d instanceof Date)) d = new Date(d);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }
  function relativeTime(d) {
    if (!(d instanceof Date)) d = new Date(d);
    var diff = Math.round((OMS.data.NOW - d) / 86400000);
    if (diff <= 0) return "today";
    if (diff === 1) return "yesterday";
    if (diff < 30) return diff + "d ago";
    return Math.round(diff / 30) + "mo ago";
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function uid() { return "id" + Math.random().toString(36).slice(2, 10); }

  // event delegation: on(root, "click", "[data-x]", handler)
  function on(root, event, selector, handler) {
    root.addEventListener(event, function (e) {
      var el = e.target.closest ? e.target.closest(selector) : null;
      if (el && root.contains(el)) handler(e, el);
    });
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  // requestAnimationFrame count-up for numbers (respects reduced motion)
  function countUp(el, to, opts) {
    opts = opts || {};
    var format = opts.format || function (v) { return Math.round(v).toLocaleString(); };
    var duration = reduceMotion ? 1 : (opts.duration || 900);
    var from = opts.from || 0;
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function tick(ts) {
      if (start === null) start = ts;
      var p = clamp((ts - start) / duration, 0, 1);
      var v = from + (to - from) * ease(p);
      el.textContent = format(v);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = format(to);
    }
    requestAnimationFrame(tick);
  }

  // damped follow — same framerate-independent formula the arcept.in
  // site standardizes on for eased-follow motion: pos += (target-pos)*(1-e^(-decay*dt))
  function dampedFollow(getTarget, onUpdate, decay) {
    decay = decay || 8;
    var pos = null, raf = null, last = null;
    function tick(ts) {
      if (last === null) last = ts;
      var dt = (ts - last) / 1000;
      last = ts;
      var target = getTarget();
      if (pos === null) pos = target;
      pos += (target - pos) * (1 - Math.exp(-decay * dt));
      onUpdate(pos);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function stop() { cancelAnimationFrame(raf); };
  }

  // scroll-reveal via IntersectionObserver — adds .is-visible once, then unobserves
  function initScrollReveal(root) {
    var items = root.querySelectorAll("[data-reveal]");
    if (reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(function () { el.classList.add("is-visible"); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  // sliding active-indicator for a tab/nav list — a hand-rolled stand-in
  // for a Framer-Motion layoutId shared-element transition. `container`
  // holds both the indicator element (data-indicator) and the buttons;
  // call update() whenever the active item or the layout changes. Uses
  // the same framerate-independent damped-follow formula as dampedFollow
  // above (pos += (target-pos)*(1-e^(-decay*dt))), just seeded from the
  // indicator's current position/size rather than snapping to target —
  // dampedFollow itself always seeds pos=target on its first tick, which
  // is right for a continuous chase (e.g. a cursor-follower) but wrong
  // here, where the whole point is animating *from* the last spot.
  function initSlidingIndicator(container, opts) {
    opts = opts || {};
    var axis = opts.axis || "x"; // "x" (tabs) or "y" (sidebar)
    var indicator = container.querySelector("[data-indicator]");
    if (!indicator) return { update: function () {} };
    var raf = null, pos = null, size = null;

    function measure() {
      var active = container.querySelector(opts.activeSelector || ".is-active");
      if (!active) return null;
      var cr = container.getBoundingClientRect(), ar = active.getBoundingClientRect();
      return axis === "y"
        ? { pos: ar.top - cr.top, size: ar.height }
        : { pos: ar.left - cr.left, size: ar.width };
    }
    function paint(p, s) {
      if (axis === "y") { indicator.style.transform = "translateY(" + p + "px)"; indicator.style.height = s + "px"; }
      else { indicator.style.transform = "translateX(" + p + "px)"; indicator.style.width = s + "px"; }
    }
    function update(instant) {
      var target = measure();
      if (!target) { indicator.classList.remove("is-visible"); return; }
      indicator.classList.add("is-visible");
      if (pos === null || reduceMotion || instant) {
        pos = target.pos; size = target.size;
        paint(pos, size);
        return;
      }
      if (raf) cancelAnimationFrame(raf);
      var last = null;
      function tick(ts) {
        if (last === null) last = ts;
        var dt = Math.min((ts - last) / 1000, 0.1);
        last = ts;
        pos += (target.pos - pos) * (1 - Math.exp(-14 * dt));
        size += (target.size - size) * (1 - Math.exp(-14 * dt));
        paint(pos, size);
        if (Math.abs(target.pos - pos) > 0.4 || Math.abs(target.size - size) > 0.4) {
          raf = requestAnimationFrame(tick);
        } else {
          pos = target.pos; size = target.size; paint(pos, size); raf = null;
        }
      }
      raf = requestAnimationFrame(tick);
    }
    update(true);
    return { update: update };
  }

  var toastHost = null;
  function toast(message, opts) {
    opts = opts || {};
    if (!toastHost) {
      toastHost = document.createElement("div");
      toastHost.className = "toast-host";
      document.body.appendChild(toastHost);
    }
    var el = document.createElement("div");
    el.className = "toast" + (opts.tone ? " toast--" + opts.tone : "");
    el.innerHTML =
      '<span class="toast-icon">' + (opts.icon || OMS.icons.check) + "</span>" +
      '<span class="toast-text">' + escapeHtml(message) + "</span>";
    toastHost.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () {
      el.classList.remove("is-in");
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 300);
    }, opts.duration || 3200);
  }

  // simple crossfade+rise swap of a container's content, used for view transitions
  function swapContent(container, renderFn) {
    if (reduceMotion) { container.innerHTML = ""; renderFn(container); return; }
    var outgoing = container.firstElementChild;
    if (!outgoing) { renderFn(container); return; }
    outgoing.style.position = "absolute";
    outgoing.style.inset = "0";
    outgoing.classList.add("view-out");
    var wrap = document.createElement("div");
    wrap.className = "view-in";
    container.appendChild(wrap);
    renderFn(wrap);
    container.style.position = "relative";
    requestAnimationFrame(function () { wrap.classList.add("is-in"); });
    setTimeout(function () { if (outgoing && outgoing.parentNode) outgoing.remove(); }, 360);
  }

  OMS.utils = {
    fmtMoney: fmtMoney, fmtMoneyFull: fmtMoneyFull,
    fmtDate: fmtDate, fmtDateShort: fmtDateShort, relativeTime: relativeTime,
    escapeHtml: escapeHtml, initials: initials, clamp: clamp, uid: uid,
    on: on, debounce: debounce, countUp: countUp, dampedFollow: dampedFollow,
    initScrollReveal: initScrollReveal, initSlidingIndicator: initSlidingIndicator,
    toast: toast, swapContent: swapContent,
    get reduceMotion() { return reduceMotion; }
  };
})(window.OMS = window.OMS || {});
