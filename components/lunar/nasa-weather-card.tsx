'use client'

import { formatObserved } from '@/lib/nasa/scenario'
import type { NasaFeed } from '@/lib/nasa/types'
import { DataBadge } from './nasa-badge'

export function NasaWeatherCard({
  feed,
  loading,
  onOpen,
}: {
  feed: NasaFeed | null
  loading: boolean
  onOpen: () => void
}) {
  const offline = feed?.reason === 'unavailable'
  const dot = loading ? 'bg-slate-400' : offline ? 'bg-amber-300' : 'bg-emerald-400'
  const status = loading ? 'Connecting…' : offline ? 'NASA DATA OFFLINE' : 'Connected'
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open NASA data center"
      className="absolute left-5 top-[4.25rem] z-10 w-60 border border-white/15 bg-black/65 px-3 py-2 text-left backdrop-blur transition hover:border-cyan-300/60 focus-visible:outline-2 focus-visible:outline-cyan-300 md:left-8"
    >
      <span className="font-display flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-slate-400">
        NASA Space Weather
        <span className="flex items-center gap-1.5 tracking-[0.1em]">
          <span className={`size-1.5 rounded-full ${dot}`} />
          <span className={offline ? 'text-amber-300' : 'text-slate-300'}>{status}</span>
        </span>
      </span>
      {feed ? (
        <>
          <span className="mt-1.5 block">
            <DataBadge kind={feed.status === 'live' ? 'real' : 'historical'} />
          </span>
          <span className="font-display mt-1 block text-sm font-semibold text-slate-100">
            {feed.event.title}
          </span>
          <span className="block text-[11px] text-slate-400">
            Observed {formatObserved(feed.event.time)}
          </span>
          {offline && (
            <span className="mt-1 block text-[11px] text-amber-300">Using Historical Training Dataset</span>
          )}
          <span className="font-display mt-1 block text-[9px] uppercase tracking-[0.2em] text-slate-500">
            Source: NASA DONKI
          </span>
        </>
      ) : (
        <span className="mt-2 block text-[11px] text-slate-500">Checking NASA DONKI…</span>
      )}
    </button>
  )
}
