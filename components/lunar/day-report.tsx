'use client'

import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { PrimaryButton } from './action-button'
import { RESOURCE_ROWS } from './resource-panel'
import { EVENTS } from '@/lib/game/data'
import { shown } from '@/lib/game/engine'
import { game } from '@/lib/game/store'
import type { DayReport } from '@/lib/game/types'

function CountUp({ from, to }: { from: number; to: number }) {
  const [v, setV] = useState(from)
  useEffect(() => {
    const controls = animate(from, to, { duration: 1, delay: 0.2, onUpdate: setV })
    return () => controls.stop()
  }, [from, to])
  return <>{Math.round(v)}</>
}

export function DayReportModal({ report, ended }: { report: DayReport; ended: boolean }) {
  const cta = ended ? 'View Results' : report.eventId ? 'Respond to Event' : 'Next Day'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Day ${report.day} report`}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md border border-white/15 bg-[#080d16] p-5"
      >
        <p className="font-display text-[11px] uppercase tracking-[0.4em] text-amber-300">Resource Results</p>
        <h2 className="font-display text-2xl font-semibold">Day {String(report.day).padStart(2, '0')} Report</h2>

        <ul className="mt-4 space-y-2.5">
          {RESOURCE_ROWS.map((r) => {
            const from = shown(report.before[r.key])
            const to = shown(report.after[r.key])
            const diff = to - from
            return (
              <li key={r.key} className="flex items-center justify-between">
                <span className="font-display flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  <r.icon className="size-3.5 text-slate-400" aria-hidden />
                  {r.name}
                </span>
                <span className="font-display flex items-baseline gap-2 tabular-nums">
                  <span className="text-slate-500">{from}</span>
                  <span aria-hidden className="text-slate-600">→</span>
                  <span className="text-lg">
                    <CountUp from={from} to={to} />
                  </span>
                  <span
                    className={`w-9 text-right text-xs ${
                      diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-500'
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>

        {report.notes.length > 0 && (
          <ul className="mt-4 space-y-1 border-t border-white/10 pt-3">
            {report.notes.map((n) => (
              <li key={n} className="text-xs text-slate-300">
                {n}
              </li>
            ))}
          </ul>
        )}
        {report.eventId && (
          <p className="mt-3 border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs text-red-200">
            Alert: {EVENTS[report.eventId].title}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <PrimaryButton onClick={game.ack}>{cta}</PrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  )
}
