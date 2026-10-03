import Link from 'next/link'

const base =
  'font-display group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300'

export function PrimaryButton({
  href,
  children,
  onClick,
  disabled,
}: {
  href?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  const cls = `${base} bg-amber-400 text-[#1a1004] shadow-[0_0_40px_-8px_rgba(251,191,36,0.6)] [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)] hover:bg-amber-300`
  return href ? (
    <Link href={href} className={cls}>
      {children}
      <span aria-hidden className="transition group-hover:translate-x-1">→</span>
    </Link>
  ) : (
    <button type="button" onClick={onClick} disabled={disabled} className={`${cls} disabled:opacity-40`}>
      {children}
    </button>
  )
}

export function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`${base} border border-slate-300/30 bg-black/30 text-slate-100 hover:border-cyan-300/70 hover:text-cyan-200`}
    >
      {children}
    </Link>
  )
}
