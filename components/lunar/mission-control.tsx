'use client'

import { motion } from 'framer-motion'
import {
  Atom,
  Beaker,
  Calendar,
  Droplets,
  FlaskConical,
  HeartPulse,
  Leaf,
  Moon,
  Settings2,
  Users,
  Wind,
  ClipboardList,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { PrimaryButton } from './action-button'
import { GameNav } from './game-nav'
import { LunarScene } from './lunar-scene'

const RESOURCES: { name: string; value: number; unit: string; icon: LucideIcon; color: string }[] = [
  { name: 'Power', value: 82, unit: '%', icon: Zap, color: 'bg-amber-300' },
  { name: 'Oxygen', value: 96, unit: '%', icon: Wind, color: 'bg-cyan-300' },
  { name: 'Water', value: 74, unit: '%', icon: Droplets, color: 'bg-cyan-300' },
  { name: 'Food', value: 68, unit: '%', icon: Leaf, color: 'bg-amber-300' },
  { name: 'Health', value: 100, unit: '%', icon: HeartPulse, color: 'bg-cyan-300' },
  { name: 'Radiation', value: 12, unit: '%', icon: Atom, color: 'bg-amber-300' },
  { name: 'Science', value: 0, unit: '%', icon: FlaskConical, color: 'bg-cyan-300' },
]

const DOCK: { name: string; icon: LucideIcon }[] = [
  { name: 'Crew', icon: Users },
  { name: 'Orders', icon: ClipboardList },
  { name: 'Science', icon: Beaker },
  { name: 'Systems', icon: Settings2 },
  { name: 'Timeline', icon: Calendar },
  { name: 'Luna', icon: Moon },
]

export function MissionControl() {
  return (
    <main className="relative flex h-dvh min-h-[640px] flex-col overflow-hidden">
      <LunarScene variant="base" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <GameNav back="/mission/base" />

        {/* Top HUD */}
        <div className="mx-5 -mt-1 flex flex-wrap items-center gap-x-8 gap-y-2 border-y border-white/10 bg-black/45 px-4 py-2.5 md:mx-8">
          <Hud label="Day" value="01 / 30" accent />
          <Hud label="Crew" value="4 / 4" />
          <Hud label="Mission Status" value="Nominal" dot />
          <div className="ml-auto min-w-40">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Science Progress
            </p>
            <div className="mt-1.5 h-1.5 w-full bg-white/10">
              <div className="h-full w-[4%] bg-cyan-300" />
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 justify-end px-5 py-4 md:px-8">
          {/* Resources */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            aria-label="Resources"
            className="w-52 self-start border border-white/10 bg-black/50 p-3"
          >
            <ul className="space-y-3">
              {RESOURCES.map((r) => (
                <li key={r.name}>
                  <div className="flex items-center justify-between">
                    <span className="font-display flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                      <r.icon className="size-3.5 text-slate-400" aria-hidden />
                      {r.name}
                    </span>
                    <span className="font-display text-sm tabular-nums">
                      {r.value}
                      <span className="text-slate-500">{r.unit}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.value}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className={`h-full ${r.color}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>

        {/* Command dock */}
        <motion.nav
          aria-label="Command dock"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative flex items-end justify-between gap-3 border-t border-white/10 bg-gradient-to-t from-black/90 to-black/50 px-4 py-3 md:px-8"
        >
          <ul className="flex flex-wrap gap-1.5 sm:gap-2">
            {DOCK.map((d) => (
              <li key={d.name}>
                <button
                  type="button"
                  className="font-display flex w-16 flex-col items-center gap-1.5 border border-white/10 bg-white/[0.03] py-2.5 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-300 sm:w-20"
                >
                  <d.icon className="size-5" aria-hidden />
                  {d.name}
                </button>
              </li>
            ))}
          </ul>
          <PrimaryButton>Execute Day</PrimaryButton>
        </motion.nav>
      </div>
    </main>
  )
}

function Hud({ label, value, accent, dot }: { label: string; value: string; accent?: boolean; dot?: boolean }) {
  return (
    <div>
      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p
        className={`font-display flex items-center gap-2 text-lg font-semibold tabular-nums ${
          accent ? 'text-amber-300' : ''
        }`}
      >
        {dot && <span className="size-2 rounded-full bg-emerald-400" />}
        {value}
      </p>
    </div>
  )
}
