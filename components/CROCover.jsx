import { Space_Grotesk } from 'next/font/google';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'] });

export default function CROCover() {
  return (
    <div className="croCoverFrame">
      <style>{`
        .croCoverFrame {
          --cro-display: ${display.style.fontFamily};
          container-type: inline-size;
          width: 100%;
          margin-bottom: 16px;
        }
        .croCover {
          position: relative;
          width: 100%;
          aspect-ratio: 1112 / 240;
          min-height: 150px;
          border-radius: 12px;
          overflow: hidden;
          background: #1b1f4b;
        }
        .croCover__field,
        .croCover__wash {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .croCover__field {
          background: linear-gradient(115deg, #0f1a3c 0%, #16307a 26%, #2b3ac0 52%, #5b3fd6 78%, #6d47e0 100%);
        }
        .croCover__wash--cobalt {
          inset: -30%;
          background: radial-gradient(52% 66% at 20% 90%, rgba(56,132,255,.40), rgba(56,132,255,0) 72%);
        }
        .croCover__wash--deep {
          inset: -30%;
          background: radial-gradient(40% 56% at 88% 18%, rgba(14,18,48,.85), rgba(14,18,48,0) 70%);
        }
        .croCover__panel {
          position: absolute;
          border-radius: 12px;
        }
        .croCover__panel--back {
          left: 8.63cqw; right: 3.42cqw; top: 7.5%; bottom: 14.2%;
          background: rgba(236,231,217,.32);
          transform: rotate(-1deg);
        }
        .croCover__panel--mid {
          left: 6.83cqw; right: 3.96cqw; top: 9.2%; bottom: 11.3%;
          background: rgba(244,241,231,.6);
          transform: rotate(-0.4deg);
        }
        .croCover__sheet {
          position: absolute;
          left: 5.04cqw; right: 4.68cqw; top: 10.8%; bottom: 8.3%;
          background: #fff;
          border-radius: 12px;
          display: grid;
          grid-template-columns: 1fr 32cqw;
          gap: 2.52cqw;
          padding: 1.62cqw 2.16cqw 1.62cqw 10.8cqw;
        }
        .croCover__col {
          display: flex;
          flex-direction: column;
          gap: 1.98cqw;
          min-width: 0;
        }
        .croCover__label {
          display: flex;
          align-items: baseline;
          gap: 0.9cqw;
          border-bottom: 1px solid rgba(27,31,75,.18);
          padding-bottom: 0.72cqw;
        }
        .croCover__labelKicker {
          font-size: 0.99cqw;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7099;
          white-space: nowrap;
        }
        .croCover__labelName {
          font-family: var(--cro-display);
          font-size: 1.8cqw;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #171a3d;
        }
        .croCover__title {
          flex: 1;
          display: flex;
          align-items: center;
          padding-bottom: 0.54cqw;
          font-family: var(--cro-display);
          font-size: 2.43cqw;
          line-height: 1.15;
          letter-spacing: -0.02em;
          font-weight: 700;
          color: #171a3d;
          text-wrap: balance;
        }
        .croCover__chart {
          display: flex;
          flex-direction: column;
          gap: 0.54cqw;
          min-width: 0;
        }
        .croCover__chartCaption {
          font-size: 0.99cqw;
          color: #6b7099;
          white-space: nowrap;
        }
        .croCover__chart svg {
          width: 100%;
          flex: 1;
          min-height: 0;
        }
        .croCover__chips {
          position: absolute;
          left: 2.34cqw;
          top: 30.8%;
          width: 17.99cqw;
          height: auto;
          overflow: visible;
        }
        /* Phone layout: title and label drop out — the card's own headline
           carries them — leaving the sheet as chart only, with the metric
           chips hidden entirely (too small to read at this size). */
        @container (max-width: 640px) {
          .croCover { aspect-ratio: 3 / 2; }
          .croCover__sheet {
            grid-template-columns: 1fr;
            gap: 3cqw;
            padding: 5cqw;
          }
          .croCover__col { display: none; }
          .croCover__chart { flex: 1; gap: 1.6cqw; }
          .croCover__chartCaption { font-size: 2.6cqw; }
          .croCover__chips { display: none; }
        }
      `}</style>

      <div className="croCover">
      <div className="croCover__field" />
      <div className="croCover__wash croCover__wash--cobalt" />
      <div className="croCover__wash croCover__wash--deep" />
      <div className="croCover__panel croCover__panel--back" />
      <div className="croCover__panel croCover__panel--mid" />

      <div className="croCover__sheet">
        <div className="croCover__col">
          <div className="croCover__label">
            <span className="croCover__labelKicker">Label</span>
            <span className="croCover__labelName">Novatr101</span>
          </div>
          <div className="croCover__title">Landing Page Conversion Rate Optimisation</div>
        </div>

        <div className="croCover__chart">
          <span className="croCover__chartCaption">Total conversion, unique users</span>
          <svg viewBox="0 0 372 150" preserveAspectRatio="none" role="img" aria-label="Conversion against target, with the post-launch band filled">
            <defs>
              <linearGradient id="croCoverArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b3fd6" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#5b3fd6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g stroke="rgba(27,31,75,.10)" strokeWidth="1">
              <line x1="26" y1="18" x2="366" y2="18" />
              <line x1="26" y1="54" x2="366" y2="54" />
              <line x1="26" y1="90" x2="366" y2="90" />
              <line x1="26" y1="126" x2="366" y2="126" />
            </g>
            <path d="M34,86 L60,104 L86,70 L112,74 L138,26 L164,88 L190,86 L216,118 L242,132 L268,96 L294,100 L320,72 L346,62 L346,132 L34,132 Z" fill="url(#croCoverArea)" />
            <line x1="26" y1="66" x2="366" y2="66" stroke="#171a3d" strokeWidth="1" strokeDasharray="4 4" opacity="0.45" />
            <text x="366" y="60" textAnchor="end" fill="#171a3d" fontFamily="Inter, sans-serif" fontSize="9" opacity="0.6">Target</text>
            <polyline points="34,86 60,104 86,70 112,74 138,26 164,88 190,86 216,118 242,132 268,96 294,100 320,72 346,62" fill="none" stroke="#5b3fd6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="138" cy="26" r="3" fill="#fff" stroke="#5b3fd6" strokeWidth="2" />
            <circle cx="346" cy="62" r="3.5" fill="#5b3fd6" />
            <g fill="#6b7099" fontFamily="Inter, sans-serif" fontSize="9">
              <text x="0" y="21">100</text>
              <text x="6" y="57">80</text>
              <text x="6" y="93">60</text>
              <text x="6" y="129">40</text>
              <text x="30" y="146">Feb 24</text>
              <text x="112" y="146">Feb 28</text>
              <text x="194" y="146">Mar 3</text>
              <text x="276" y="146">Mar 7</text>
            </g>
          </svg>
        </div>
      </div>

      <svg className="croCover__chips" viewBox="0 0 200 120" role="img" aria-label="Down 7.31 percent, up 52.7 percent, up 7.33 percent">
        <defs>
          <filter id="croCoverChipShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#0f112e" floodOpacity="0.42" />
          </filter>
        </defs>
        <g filter="url(#croCoverChipShadow)" fontFamily={display.style.fontFamily} fontSize="15" fontWeight="700">
          <g transform="rotate(-2 90 15)">
            <rect x="34" y="0" width="112" height="30" rx="6" fill="#2b2f7a" stroke="rgba(255,255,255,.16)" />
            <text x="90" y="20" textAnchor="middle" fill="#c8ccff">↓ 7.31%</text>
          </g>
          <g transform="rotate(1.4 68 53)">
            <rect x="12" y="38" width="112" height="30" rx="6" fill="#171a3d" stroke="rgba(255,255,255,.14)" />
            <text x="68" y="58" textAnchor="middle" fill="#ffffff">↑ 52.7%</text>
          </g>
          <g transform="rotate(-1 82 91)">
            <rect x="26" y="76" width="112" height="30" rx="6" fill="#5b3fd6" stroke="rgba(255,255,255,.22)" />
            <text x="82" y="96" textAnchor="middle" fill="#ffffff">↑ 7.33%</text>
          </g>
        </g>
      </svg>
      </div>
    </div>
  );
}
