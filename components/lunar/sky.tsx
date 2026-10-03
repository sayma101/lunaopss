function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function Stars({ count = 140, seed = 7 }: { count?: number; seed?: number }) {
  const r = rng(seed)
  const stars = Array.from({ length: count }, () => ({
    x: r() * 100,
    y: r() * 70,
    s: r() < 0.9 ? 1 : 2,
    o: 0.3 + r() * 0.7,
    d: 3 + r() * 5,
    dl: r() * 5,
  }))
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-white"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              '--o': s.o,
              '--d': `${s.d}s`,
              '--dl': `${s.dl}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function Dust({ count = 14 }: { count?: number }) {
  const r = rng(31)
  const p = Array.from({ length: count }, () => ({
    y: 62 + r() * 34,
    s: 1 + r() * 2,
    d: 30 + r() * 40,
    dl: -r() * 40,
    o: 0.15 + r() * 0.25,
  }))
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {p.map((d, i) => (
        <span
          key={i}
          className="dust absolute left-0 rounded-full bg-slate-200"
          style={
            {
              top: `${d.y}%`,
              width: d.s,
              height: d.s,
              opacity: d.o,
              '--d': `${d.d}s`,
              '--dl': `${d.dl}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
