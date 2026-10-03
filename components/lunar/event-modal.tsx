'use client'

import { motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { RESOURCE_LABEL } from '@/lib/game/data'
import { EVENTS, RESOURCE_KEYS } from '@/lib/game/data'
import { eventEffects } from '@/lib/game/engine'
import { game } from '@/lib/game/store'
import type { GameState } from '@/lib/game/types'
import { WHY_THIS_MATTERS } from '@/lib/nasa/eclss'
import { DataBadge } from './nasa-badge'

export function EventModal({ state }: { state: GameState }) {
  const pe = state.pendingEvent
  if (!pe) return null
  const def = EVENTS[pe.id]
  const positive = def.id === 'discovery'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={def.title}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full max-w-lg border bg-[#080d16] p-5 ${positive ? 'border-cyan-300/50' : 'border-red-400/50'}`}
      >
        <p
          className={`font-display flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] ${
            positive ? 'text-cyan-200' : 'text-red-300'
          }`}
        >
          <TriangleAlert className="size-3.5" aria-hidden />
          {positive ? 'Discovery' : 'Emergency'} · Day {pe.day}
        </p>
        <h2 className="font-display mt-1 text-2xl font-semibold uppercase">{def.title}</h2>
        <p className="mt-2 text-sm text-slate-300">{def.blurb}</p>
        {def.id === 'solar-radiation' && (
          <div className="mt-3 border-l-2 border-amber-300/60 pl-3 text-xs text-slate-300">
            <DataBadge kind={state.nasa?.origin === 'live' ? 'real' : 'historical'} />
            <p className="mt-1">
              {state.nasa
                ? `Scenario based on NASA DONKI: ${state.nasa.event.title}. `
                : ''}
              {WHY_THIS_MATTERS['solar-radiation']}
            </p>
          </div>
        )}
        {def.id === 'water-leak' && (
          <div className="mt-3 border-l-2 border-cyan-300/60 pl-3 text-xs text-slate-300">
            <DataBadge kind="reference" />
            <p className="mt-1">{WHY_THIS_MATTERS['water-leak']}</p>
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {def.choices.map((c) => {
            const effects = eventEffects(state, c)
            const locked = !!c.reserve && state.reserves <= 0
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => game.resolve(c.id)}
                  className="w-full border border-white/15 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-amber-300/70 focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="font-display flex items-center justify-between text-xs uppercase tracking-[0.15em]">
                    {c.label}
                    {c.reserve && (
                      <span className="text-[10px] text-amber-300">
                        Reserve · {state.reserves} left
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">{c.detail}</span>
                  <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {RESOURCE_KEYS.map((k) => {
                      const v = effects[k]
                      if (!v) return null
                      return (
                        <span
                          key={k}
                          className={`font-display text-xs tabular-nums ${v > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                          {v > 0 ? `+${v}` : v} {RESOURCE_LABEL[k]}
                        </span>
                      )
                    })}
                    {c.modifier && (
                      <span className="font-display text-xs text-cyan-200">{c.modifier.label}</span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </motion.div>
    </motion.div>
  )
}
