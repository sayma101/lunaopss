export type DataKind = 'real' | 'historical' | 'reference' | 'simulation'

const STYLE: Record<DataKind, { label: string; cls: string }> = {
  real: { label: 'REAL NASA DATA', cls: 'border-emerald-400/60 text-emerald-300' },
  historical: { label: 'NASA HISTORICAL DATA', cls: 'border-amber-300/60 text-amber-200' },
  reference: { label: 'NASA-REFERENCE SIMULATION', cls: 'border-cyan-300/60 text-cyan-200' },
  simulation: { label: 'GAME SIMULATION', cls: 'border-slate-400/50 text-slate-300' },
}

export function DataBadge({ kind }: { kind: DataKind }) {
  const s = STYLE[kind]
  return (
    <span
      className={`font-display inline-block border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] ${s.cls}`}
    >
      {s.label}
    </span>
  )
}
