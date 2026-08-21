'use client';

import { useRef, useState } from 'react';

const labels = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
const xs = [50, 124.3, 198.6, 272.9, 347.1, 421.4, 495.7, 570];
const traffic = [100, 104, 98, 92, 95, 90, 93, 91];
const trafficY = [180, 174, 183, 192, 187.5, 195, 190.5, 193.5];
const conversion = [100, 108, 118, 132, 145, 158, 167, 176];
const conversionY = [180, 168, 153, 132, 112.5, 93, 79.5, 66];

const trafficPoints = xs.map((x, i) => `${x},${trafficY[i]}`).join(' ');
const conversionPoints = xs.map((x, i) => `${x},${conversionY[i]}`).join(' ');

function nearestIndex(px) {
  let closest = 0;
  let dist = Infinity;
  for (let i = 0; i < xs.length; i++) {
    const d = Math.abs(xs[i] - px);
    if (d < dist) {
      dist = d;
      closest = i;
    }
  }
  return closest;
}

export default function CROChart() {
  const chartRef = useRef(null);
  const wrapRef = useRef(null);
  const [active, setActive] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });

  function handlePointerMove(e) {
    const rect = chartRef.current.getBoundingClientRect();
    const scaleX = 680 / rect.width;
    const px = (e.clientX - rect.left) * scaleX;
    const i = nearestIndex(px);
    setActive(i);

    const wrapRect = wrapRef.current.getBoundingClientRect();
    setTooltipPos({
      left: e.clientX - wrapRect.left,
      top: e.clientY - wrapRect.top,
    });
  }

  function handlePointerLeave() {
    setActive(null);
  }

  return (
    <div className="viz-wrap">
      <div className="viz-root" ref={wrapRef}>
        <p className="viz-title">Traffic vs. conversion, indexed</p>
        <p className="viz-subtitle">Illustrative reconstruction of the pattern observed on the BIM course page</p>

        <div className="viz-legend">
          <span className="viz-legend__item">
            <span className="viz-legend__swatch" style={{ background: 'var(--chart-1)' }} />
            Traffic (indexed)
          </span>
          <span className="viz-legend__item">
            <span className="viz-legend__swatch" style={{ background: 'var(--chart-2)' }} />
            Conversion rate (indexed)
          </span>
        </div>

        <svg
          ref={chartRef}
          className="viz-chart-svg"
          viewBox="0 0 680 380"
          role="img"
          aria-label="Line chart showing traffic and conversion rate indexed to 100, with traffic drifting down slightly while conversion rate rises steadily over eight periods."
        >
          <line className="viz-gridline" x1="50" y1="30" x2="570" y2="30" />
          <line className="viz-gridline" x1="50" y1="105" x2="570" y2="105" />
          <line className="viz-gridline" x1="50" y1="180" x2="570" y2="180" />
          <line className="viz-gridline" x1="50" y1="255" x2="570" y2="255" />
          <line className="viz-baseline" x1="50" y1="330" x2="570" y2="330" />

          <text className="viz-axis-label" x="42" y="34" textAnchor="end">200</text>
          <text className="viz-axis-label" x="42" y="109" textAnchor="end">150</text>
          <text className="viz-axis-label" x="42" y="184" textAnchor="end">100</text>
          <text className="viz-axis-label" x="42" y="259" textAnchor="end">50</text>
          <text className="viz-axis-label" x="42" y="334" textAnchor="end">0</text>

          {labels.map((label, i) => (
            <text key={label} className="viz-axis-label" x={xs[i]} y="352" textAnchor="middle">{label}</text>
          ))}

          <polyline
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={trafficPoints}
          />
          <circle cx={xs[xs.length - 1]} cy={trafficY[trafficY.length - 1]} r="4" fill="var(--chart-1)" stroke="var(--carbon)" strokeWidth="2" />

          <polyline
            fill="none"
            stroke="var(--chart-2)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={conversionPoints}
          />
          <circle cx={xs[xs.length - 1]} cy={conversionY[conversionY.length - 1]} r="4" fill="var(--chart-2)" stroke="var(--carbon)" strokeWidth="2" />

          <rect x="578" y={trafficY[trafficY.length - 1] - 4} width="12" height="2" fill="var(--chart-1)" />
          <text className="viz-end-label" x="594" y={trafficY[trafficY.length - 1] + 4}>Traffic</text>

          <rect x="578" y={conversionY[conversionY.length - 1] - 4} width="12" height="2" fill="var(--chart-2)" />
          <text className="viz-end-label" x="594" y={conversionY[conversionY.length - 1] + 4}>Conversion</text>

          <line
            className="viz-crosshair"
            x1={active !== null ? xs[active] : 50}
            y1="30"
            x2={active !== null ? xs[active] : 50}
            y2="330"
            style={{ opacity: active !== null ? 1 : 0 }}
          />

          <rect
            x="50"
            y="0"
            width="520"
            height="380"
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        </svg>

        {active !== null && (
          <div
            className="viz-tooltip"
            style={{ opacity: 1, left: tooltipPos.left, top: tooltipPos.top }}
          >
            <div>{labels[active]}</div>
            <div><strong>{traffic[active]}</strong> Traffic (indexed)</div>
            <div><strong>{conversion[active]}</strong> Conversion rate (indexed)</div>
          </div>
        )}

        <details className="viz-table-toggle">
          <summary>View underlying data</summary>
          <table className="viz-table">
            <caption>Indexed values, base = 100 at M1</caption>
            <thead>
              <tr><th>Period</th><th>Traffic (indexed)</th><th>Conversion rate (indexed)</th></tr>
            </thead>
            <tbody>
              {labels.map((label, i) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{traffic[i]}</td>
                  <td>{conversion[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>

      <p className="disclosure">
        Note on this chart: this is an illustrative reconstruction built for this portfolio, using
        indexed values rather than the original Mixpanel/GA dashboard data (which I no longer have
        access to). The directional pattern — traffic drifting down slightly while conversion rose —
        reflects what was actually observed on the BIM course page during this project.
      </p>
    </div>
  );
}
