'use client'

import { motion } from 'framer-motion'
import {
  Atom,
  Droplets,
  FlaskConical,
  HeartPulse,
  Leaf,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { shown, statusOf } from '@/lib/game/engine'
import type { ResourceKey, Resources, Status } from '@/lib/game/types'

export const RESOURCE_ROWS: { key: ResourceKey; name: string; icon: LucideIcon }[] = [
  { key: 'power', name: 'Power', icon: Zap },
  { key: 'oxygen', name: 'Oxygen', icon: Wind },
  { key: 'water', name: 'Water', icon: Droplets },
  { key: 'food', name: 'Food', icon: Leaf },
  { key: 'health', name: 'Health', icon: HeartPulse },
  { key: 'radiationSafety', name: 'Radiation', icon: Atom },
  { key: 'science', name: 'Science', icon: FlaskConical },
]

export const STATUS_BAR: Record<Status, string> = {
  safe: 'bg-cyan-300',
  warning: 'bg-amber-300',
  critical: 'bg-red-400',
}
const STATUS_TEXT: Record<Status, string> = {
  safe: 'text-slate-500',
  warning: 'text-amber-300',
  critical: 'text-red-400',
}

export function ResourcePanel({ resources }: { resources: Resources }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      aria-label="Resources"
      className="relative z-10 w-52 self-start border border-white/10 bg-black/50 p-3"
    >
      <ul className="space-y-3">
        {RESOURCE_ROWS.map((r) => {
          const value = resources[r.key]
          const status = statusOf(r.key, value)
          return (
            <li key={r.key}>
              <div className="flex items-center justify-between">
                <span className="font-display flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  <r.icon className="size-3.5 text-slate-400" aria-hidden />
                  {r.name}
                </span>
                <span className="font-display text-sm tabular-nums">
                  {status !== 'safe' && (
                    <span className={`mr-1.5 text-[9px] tracking-[0.15em] ${STATUS_TEXT[status]}`}>
                      {status === 'critical' ? 'CRIT' : 'WARN'}
                    </span>
                  )}
                  {shown(value)}
                  <span className="text-slate-500">%</span>
                </span>
              </div>
              <div
                className="mt-1 h-1 bg-white/10"
                role="progressbar"
                aria-label={r.name}
                aria-valuenow={shown(value)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full ${STATUS_BAR[status]}`}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </motion.aside>
  )
}
