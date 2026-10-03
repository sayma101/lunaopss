import { Dust, Stars } from './sky'

type Props = { variant?: 'title' | 'base'; className?: string }

export function LunarScene({ variant = 'title', className = '' }: Props) {
  const title = variant === 'title'
  return (
    <div className={`absolute inset-0 overflow-hidden bg-[#04070d] ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,#0d1b2e_0%,#060b14_55%,#03050a_100%)]" />
      <Stars />

      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="earth" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#7fc4e8" />
            <stop offset="0.5" stopColor="#2a6fa8" />
            <stop offset="1" stopColor="#0a2342" />
          </radialGradient>
          <radialGradient id="earthGlow">
            <stop offset="0.6" stopColor="#4aa8e0" stopOpacity="0.35" />
            <stop offset="1" stopColor="#4aa8e0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9bcc2" />
            <stop offset="0.35" stopColor="#7d818a" />
            <stop offset="1" stopColor="#2b2e36" />
          </linearGradient>
          <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b606b" />
            <stop offset="1" stopColor="#262932" />
          </linearGradient>
          <linearGradient id="hab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2f4f7" />
            <stop offset="1" stopColor="#9aa1ad" />
          </linearGradient>
          <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1d3d6b" />
            <stop offset="1" stopColor="#0c1d3a" />
          </linearGradient>
          <radialGradient id="windowGlow">
            <stop offset="0" stopColor="#ffd08a" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunrim" cx="100%" cy="0%" r="80%">
            <stop offset="0" stopColor="#fff5df" stopOpacity="0.28" />
            <stop offset="1" stopColor="#fff5df" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Earth */}
        <circle cx="1400" cy="260" r="150" fill="url(#earthGlow)" />
        <circle cx="1400" cy="260" r="74" fill="url(#earth)" />
        <path transform="translate(0 30)" d="M1365 200c14-14 36-8 44 4s-6 22-18 24-34-12-26-28z" fill="#3f8c5a" opacity="0.7" />
        <path transform="translate(0 30)" d="M1410 250c12-4 28 6 22 20s-24 14-30 2 0-18 8-22z" fill="#3f8c5a" opacity="0.6" />
        <path transform="translate(0 30)" d="M1350 240c20 6 40-6 60 4" stroke="#fff" strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="1425" cy="285" r="74" fill="#020611" opacity="0.28" />

        {/* distant ridge */}
        <path
          d="M0 640 L120 600 L240 628 L380 570 L520 620 L680 585 L840 630 L1000 575 L1180 625 L1340 590 L1480 620 L1600 595 L1600 900 L0 900Z"
          fill="url(#ridge)"
        />
        {/* ground */}
        <path
          d="M0 700 C300 660 600 690 900 676 C1200 662 1450 690 1600 672 L1600 900 L0 900Z"
          fill="url(#ground)"
        />
        <path d="M0 700 C300 660 600 690 900 676 C1200 662 1450 690 1600 672 L1600 900 L0 900Z" fill="url(#sunrim)" />
        {/* craters */}
        {[
          [260, 790, 110, 16],
          [1180, 820, 150, 20],
          [620, 850, 90, 12],
          [1420, 760, 70, 10],
          [90, 860, 80, 11],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={w} ry={h} fill="#20232b" opacity="0.55" />
            <ellipse cx={x} cy={y - 3} rx={w - 6} ry={h - 3} fill="#4b4f59" opacity="0.45" />
          </g>
        ))}

        {/* Habitat complex */}
        <g transform={title ? 'translate(0 0)' : 'translate(40 10)'}>
          <ellipse cx="800" cy="716" rx="330" ry="22" fill="#000" opacity="0.4" />
          {/* connector tunnel */}
          <rect x="660" y="662" width="280" height="22" rx="8" fill="#8b919c" />
          {/* left module */}
          <rect x="520" y="620" width="150" height="76" rx="16" fill="url(#hab)" />
          <rect x="534" y="640" width="122" height="5" fill="#69707c" opacity="0.6" />
          {/* main dome */}
          <path d="M690 700 A110 110 0 0 1 910 700Z" fill="url(#hab)" />
          <path d="M690 700 A110 110 0 0 1 800 590" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" fill="none" />
          <rect x="690" y="690" width="220" height="14" fill="#7b828e" />
          <rect x="750" y="650" width="100" height="46" rx="6" fill="#0b1626" />
          <g className="lights">
            <circle cx="800" cy="672" r="38" fill="url(#windowGlow)" opacity="0.7" />
            <rect x="758" y="658" width="24" height="26" rx="3" fill="#ffc977" />
            <rect x="788" y="658" width="24" height="26" rx="3" fill="#ffc977" />
            <rect x="818" y="658" width="24" height="26" rx="3" fill="#ffb25c" />
          </g>
          {/* right module */}
          <rect x="930" y="630" width="130" height="68" rx="14" fill="url(#hab)" />
          <g className="lights">
            <circle cx="995" cy="660" r="9" fill="#ffc977" />
            <circle cx="1025" cy="660" r="9" fill="#ffc977" />
          </g>
          {/* cyan status strip */}
          <rect x="560" y="676" width="90" height="3" rx="1.5" fill="#5fd6e8" opacity="0.85" />
          <rect x="950" y="680" width="90" height="3" rx="1.5" fill="#5fd6e8" opacity="0.85" />

          {/* Solar arrays */}
          {[
            { x: 180, w: 300, rows: 2 },
            { x: 1120, w: 300, rows: 2 },
          ].map((a, i) => (
            <g key={i}>
              <rect x={a.x + a.w / 2 - 3} y="690" width="6" height="32" fill="#aeb4be" />
              <path
                d={`M${a.x} 700 L${a.x + 36} 640 L${a.x + a.w + 36} 640 L${a.x + a.w} 700Z`}
                fill="url(#panel)"
                stroke="#9fb4d1"
                strokeOpacity="0.6"
              />
              {Array.from({ length: 7 }, (_, k) => (
                <line
                  key={k}
                  x1={a.x + (a.w / 7) * (k + 1)}
                  y1="700"
                  x2={a.x + 36 + (a.w / 7) * (k + 1)}
                  y2="640"
                  stroke="#9fb4d1"
                  strokeOpacity="0.4"
                />
              ))}
              <line x1={a.x + 18} y1="670" x2={a.x + a.w + 18} y2="670" stroke="#9fb4d1" strokeOpacity="0.4" />
              <path
                d={`M${a.x + 20} 700 L${a.x + 50} 645 L${a.x + 120} 645 L${a.x + 90} 700Z`}
                fill="#cfe6ff"
                opacity="0.12"
              />
            </g>
          ))}

          {/* Antenna */}
          <g>
            <line x1="1120" y1="700" x2="1120" y2="560" stroke="#c4c9d2" strokeWidth="4" />
            <line x1="1120" y1="700" x2="1100" y2="720" stroke="#c4c9d2" strokeWidth="3" />
            <line x1="1120" y1="700" x2="1140" y2="720" stroke="#c4c9d2" strokeWidth="3" />
            <path d="M1090 560 Q1120 590 1150 560 Q1120 572 1090 560Z" fill="#e4e8ee" />
            <circle className="beacon" cx="1120" cy="552" r="4" fill="#ff6a4a" />
          </g>
        </g>

        {/* Rover */}
        <g className="rover-move">
          <g transform="translate(340 770)">
            <ellipse cx="40" cy="38" rx="52" ry="6" fill="#000" opacity="0.4" />
            <rect x="8" y="10" width="64" height="18" rx="6" fill="#d6dae1" />
            <rect x="24" y="0" width="30" height="14" rx="5" fill="#eef0f4" />
            <rect x="30" y="3" width="18" height="7" rx="2" fill="#0b1626" />
            <rect x="10" y="22" width="60" height="3" fill="#f5a524" />
            {[12, 40, 68].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="30" r="9" fill="#2a2d35" />
                <circle cx={cx} cy="30" r="4" fill="#8b919c" />
              </g>
            ))}
            <line x1="62" y1="10" x2="72" y2="-8" stroke="#c4c9d2" strokeWidth="2" />
          </g>
        </g>

        {/* foreground rocks */}
        <path d="M-20 900 L40 830 L120 850 L170 900Z" fill="#14161c" />
        <path d="M1420 900 L1490 820 L1570 840 L1630 900Z" fill="#14161c" />
      </svg>

      <Dust />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,4,8,0.75)_100%)]" />
      {title && <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#04070d]/70 to-transparent" />}
    </div>
  )
}
