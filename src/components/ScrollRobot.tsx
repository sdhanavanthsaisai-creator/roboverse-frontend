import { motion, type MotionStyle } from 'framer-motion';

type Props = { style?: MotionStyle; className?: string };

/**
 * Stylized side-view rover (chassis, four wheels, ultrasonic eyes, sensor mast).
 * Pure SVG so the real CAD-based model can swap in later without layout changes.
 */
export default function ScrollRobot({ style, className = '' }: Props) {
  return (
    <motion.div className={className} style={style} aria-hidden>
      <svg viewBox="0 0 420 240" className="h-full w-full drop-shadow-[0_0_40px_rgba(0,229,255,0.35)]">
        <defs>
          <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16202d" />
            <stop offset="100%" stopColor="#0a0e14" />
          </linearGradient>
          <linearGradient id="beam" x1="1" y1="0.5" x2="0" y2="0.5">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="wheel" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#2a3646" />
            <stop offset="70%" stopColor="#111823" />
            <stop offset="100%" stopColor="#05070a" />
          </radialGradient>
        </defs>

        {/* headlight beam */}
        <path d="M400 118 L420 92 L420 150 L400 136 Z" fill="url(#beam)" />
        <polygon points="398,116 900,60 900,200 398,140" fill="url(#beam)" opacity="0.5" />

        {/* chassis */}
        <rect x="70" y="92" width="300" height="74" rx="14" fill="url(#body)" stroke="#1b2532" strokeWidth="2" />
        <rect x="86" y="106" width="180" height="34" rx="8" fill="#0e141d" stroke="#233141" />
        <text x="98" y="129" fill="#00e5ff" fontSize="15" fontFamily="monospace" letterSpacing="3">
          ROBOTO·01
        </text>

        {/* payload bay marker (5 kg limit) */}
        <rect x="280" y="104" width="74" height="40" rx="7" fill="#0e141d" stroke="#b6ff3c" strokeOpacity="0.5" />
        <text x="291" y="129" fill="#b6ff3c" fontSize="13" fontFamily="monospace">
          5kg
        </text>

        {/* sensor mast */}
        <rect x="150" y="44" width="10" height="52" rx="4" fill="#1b2532" />
        <g className="spin-slow" style={{ transformOrigin: '155px 40px' }}>
          <rect x="126" y="32" width="58" height="14" rx="7" fill="#00e5ff" fillOpacity="0.85" />
          <circle cx="155" cy="39" r="4" fill="#05070a" />
        </g>
        <circle cx="155" cy="39" r="16" fill="none" stroke="#00e5ff" strokeOpacity="0.35" strokeDasharray="4 6" />

        {/* ultrasonic eyes */}
        <circle cx="378" cy="112" r="7" fill="#00e5ff" fillOpacity="0.9" />
        <circle cx="378" cy="140" r="7" fill="#00e5ff" fillOpacity="0.6" />

        {/* wheels */}
        {[
          { cx: 128 },
          { cx: 312 },
        ].map(({ cx }) => (
          <g key={cx}>
            <circle cx={cx} cy="176" r="40" fill="url(#wheel)" stroke="#1b2532" strokeWidth="3" />
            <circle cx={cx} cy="176" r="15" fill="none" stroke="#b6ff3c" strokeOpacity="0.7" strokeWidth="3" />
            <line x1={cx} y1="146" x2={cx} y2="206" stroke="#1b2532" strokeWidth="3" className="spin-slow" style={{ transformOrigin: `${cx}px 176px` }} />
          </g>
        ))}

        {/* ground shadow */}
        <ellipse cx="220" cy="226" rx="180" ry="9" fill="#00e5ff" fillOpacity="0.12" />
      </svg>
    </motion.div>
  );
}
