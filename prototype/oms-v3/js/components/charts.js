/* ============================================================
   OMS v3 — Hand-rolled SVG charts (no chart library dependency)
   ============================================================ */
(function (OMS) {
  "use strict";
  var U = OMS.utils;

  // ---- Trend line + area, with hover tooltip ----
  function renderTrend(container, points, currency) {
    var w = 600, h = 92, pad = 6;
    var max = Math.max.apply(null, points.map(function (p) { return p.cumulative; })) || 1;
    function x(i) { return pad + (i / (points.length - 1)) * (w - pad * 2); }
    function y(v) { return h - pad - (v / max) * (h - pad * 2); }
    var d = points.map(function (p, i) { return (i === 0 ? "M" : "L") + x(i).toFixed(1) + "," + y(p.cumulative).toFixed(1); }).join(" ");
    var area = d + " L" + x(points.length - 1).toFixed(1) + "," + h + " L" + x(0).toFixed(1) + "," + h + " Z";

    container.innerHTML =
      '<div class="trend-wrap">' +
        '<svg class="trend-svg" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">' +
          '<defs><linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="var(--redline)" stop-opacity="0.28"/>' +
            '<stop offset="100%" stop-color="var(--redline)" stop-opacity="0"/>' +
          "</linearGradient></defs>" +
          '<path class="trend-fill" d="' + area + '"></path>' +
          '<path class="trend-path" d="' + d + '" pathLength="1"></path>' +
          '<circle class="trend-dot" cx="' + x(points.length - 1).toFixed(1) + '" cy="' + y(points[points.length - 1].cumulative).toFixed(1) + '" r="3.2"></circle>' +
          '<rect class="trend-hit" x="0" y="0" width="' + w + '" height="' + h + '" fill="transparent"></rect>' +
        "</svg>" +
        '<div class="trend-tooltip"></div>' +
      "</div>";

    var path = container.querySelector(".trend-path");
    var len = path.getTotalLength ? path.getTotalLength() : 1;
    if (!U.reduceMotion) {
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      requestAnimationFrame(function () {
        path.style.transition = "stroke-dashoffset 1.1s var(--ease-out)";
        path.style.strokeDashoffset = "0";
      });
      var fill = container.querySelector(".trend-fill");
      fill.style.opacity = "0";
      fill.style.transition = "opacity 900ms var(--ease-out) 500ms";
      requestAnimationFrame(function () { fill.style.opacity = "1"; });
    }

    var svg = container.querySelector("svg");
    var tooltip = container.querySelector(".trend-tooltip");
    svg.addEventListener("mousemove", function (e) {
      var rect = svg.getBoundingClientRect();
      var relX = ((e.clientX - rect.left) / rect.width) * w;
      var i = U.clamp(Math.round(((relX - pad) / (w - pad * 2)) * (points.length - 1)), 0, points.length - 1);
      var p = points[i];
      tooltip.textContent = U.fmtMoneyFull(p.cumulative, currency) + " · day " + p.day;
      tooltip.style.left = ((e.clientX - rect.left)) + "px";
      tooltip.style.top = (y(p.cumulative) - 6) + "px";
      tooltip.classList.add("is-visible");
    });
    svg.addEventListener("mouseleave", function () { tooltip.classList.remove("is-visible"); });
  }

  // ---- Horizontal bar chart ----
  function renderBars(container, data) {
    // data: [{label, value, color}]
    var max = Math.max.apply(null, data.map(function (d) { return d.value; })) || 1;
    container.innerHTML = '<div class="bars">' + data.map(function (d) {
      return '<div class="bar-row">' +
        '<div class="bl">' + U.escapeHtml(d.label) + "</div>" +
        '<div class="bar-track"><div class="bar-fill" data-w="' + Math.round((d.value / max) * 100) + '" style="background:' + d.color + '"></div></div>' +
        '<div class="bv tnum">' + d.value + "</div>" +
      "</div>";
    }).join("") + "</div>";
    requestAnimationFrame(function () {
      container.querySelectorAll(".bar-fill").forEach(function (el, i) {
        setTimeout(function () { el.style.width = el.getAttribute("data-w") + "%"; }, i * 60);
      });
    });
  }

  // ---- Donut chart ----
  function renderDonut(container, data, opts) {
    opts = opts || {};
    var total = data.reduce(function (s, d) { return s + d.value; }, 0) || 1;
    var r = 44, cx = 54, cy = 54, circumference = 2 * Math.PI * r;
    var offset = 0;
    var segs = data.map(function (d) {
      var frac = d.value / total;
      var seg = { color: d.color, len: frac * circumference, offset: offset };
      offset += frac * circumference;
      return seg;
    });
    container.innerHTML =
      '<div class="donut-wrap">' +
        '<svg width="108" height="108" viewBox="0 0 108 108">' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--line-faint)" stroke-width="14"></circle>' +
          segs.map(function (s, i) {
            return '<circle class="donut-seg" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="14" ' +
              'stroke-dasharray="' + s.len.toFixed(1) + " " + (circumference - s.len).toFixed(1) + '" ' +
              'stroke-dashoffset="' + (-s.offset).toFixed(1) + '" transform="rotate(-90 ' + cx + " " + cy + ')" data-i="' + i + '"></circle>';
          }).join("") +
        "</svg>" +
        '<div class="donut-legend">' + data.map(function (d) {
          return '<div class="donut-legend-item"><span class="sw" style="background:' + d.color + '"></span>' +
            U.escapeHtml(d.label) + '<span class="val tnum">' + Math.round((d.value / total) * 100) + "%</span></div>";
        }).join("") + "</div>" +
      "</div>";
    if (!U.reduceMotion) {
      container.querySelectorAll(".donut-seg").forEach(function (el) {
        var full = el.getAttribute("stroke-dasharray");
        el.style.strokeDasharray = "0 " + circumference;
        requestAnimationFrame(function () {
          el.style.transition = "stroke-dasharray 900ms var(--ease-out)";
          el.style.strokeDasharray = full;
        });
      });
    }
  }

  OMS.charts = { renderTrend: renderTrend, renderBars: renderBars, renderDonut: renderDonut };
})(window.OMS = window.OMS || {});
