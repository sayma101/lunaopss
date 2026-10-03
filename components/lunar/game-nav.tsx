import Link from 'next/link'

export function GameNav({ back, label }: { back: string; label?: string }) {
  const btn =
    'font-display inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/40 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-300'
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4 md:px-8">
      <div className="flex items-center gap-2">
        <Link href={back} className={btn}>
          <span aria-hidden>←</span> Back
        </Link>
        <Link href="/" className={btn}>
          <span aria-hidden>⌂</span> Home
        </Link>
      </div>
      {label && (
        <p className="font-display hidden text-[11px] uppercase tracking-[0.35em] text-slate-400 sm:block">
          {label}
        </p>
      )}
    </header>
  )
}
