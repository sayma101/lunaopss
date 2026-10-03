'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Battery,
  Droplets,
  FlaskConical,
  HeartPulse,
  Leaf,
  ShieldAlert,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { BUILD_CREDITS, MODULES, type ModuleId } from '@/lib/missions'
import { PrimaryButton } from './action-button'
import { GameNav } from './game-nav'
import { LunarScene } from './lunar-scene'

const ICONS: Record<ModuleId, LucideIcon> = {
  solar: Sun,
  battery: Battery,
  water: Droplets,
  greenhouse: Leaf,
  shelter: ShieldAlert,
  lab: FlaskConical,
  medical: HeartPulse,
}

export function BaseBuilder() {
  const [built, setBuilt] = useState<ModuleId[]>([])
  const [warn, setWarn] = useState<ModuleId | null>(null)
  const spent = MODULES.filter((m) => built.includes(m.id)).reduce((s, m) => s + m.cost, 0)
  const left = BUILD_CREDITS - spent

  function toggle(id: ModuleId, cost: number) {
    if (built.includes(id)) return setBuilt(built.filter((b) => b !== id))
    if (cost > left) {
      setWarn(id)
      return void setTimeout(() => setWarn(null), 1200)
    }
    setBuilt([...built, id])
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <LunarScene variant="base" className="opacity-80" />
      <div className="relative z-10 flex flex-1 flex-col">
        <GameNav back="/mission/setup" label="Base Builder" />

        <div className="flex flex-wrap items-end justify-between gap-4 px-5 md:px-10">
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-cyan-200/80">
              Deploy your outpost
            </p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Build the Base</h1>
          </div>
          <div className="text-right">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Build Credits
            </p>
            <p className="font-display text-4xl font-semibold tabular-nums text-amber-300">
              {left}
              <span className="text-lg text-slate-500"> / {BUILD_CREDITS}</span>
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <section aria-label="Modules" className="relative px-3 pb-3 md:px-8">
          <div className="absolute inset-x-0 bottom-0 top-8 bg-gradient-to-t from-[#04070d] via-[#04070d]/90 to-transparent" />
          <ul className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {MODULES.map((m, i) => {
              const Icon = ICONS[m.id]
              const on = built.includes(m.id)
              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  <motion.button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(m.id, m.cost)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={warn === m.id ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
                    className={`group relative flex h-full w-full flex-col items-center overflow-hidden border px-3 pb-4 pt-5 text-center transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                      on
                        ? 'border-cyan-300/80 bg-cyan-300/10'
                        : 'border-white/15 bg-[#080d16]/80 hover:border-white/40'
                    }`}
                  >
                    <div
                      className={`relative flex size-14 items-center justify-center rounded-full border border-dashed transition ${
                        on ? 'border-cyan-300 bg-cyan-300/15 text-cyan-200' : 'border-white/30 text-slate-400'
                      }`}
                    >
                      <Icon className="size-6" aria-hidden />
                      <AnimatePresence>
                        {on && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.9 }}
                            className="absolute inset-0 rounded-full border border-cyan-300"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <span className="font-display mt-3 text-[13px] font-semibold uppercase leading-tight tracking-[0.15em]">
                      {m.name}
                    </span>
                    <span className="mt-1 text-[11px] leading-snug text-slate-400">{m.role}</span>
                    <span
                      className={`font-display mt-3 text-xs tracking-[0.2em] ${
                        on ? 'text-cyan-200' : warn === m.id ? 'text-red-400' : 'text-amber-300'
                      }`}
                    >
                      {on ? 'BUILT' : `${m.cost} CR`}
                    </span>
                  </motion.button>
                </motion.li>
              )
            })}
          </ul>

          <div className="relative mt-4 flex items-center justify-between">
            <p className="font-display text-xs uppercase tracking-[0.25em] text-slate-400" aria-live="polite">
              {built.length} / {MODULES.length} modules deployed
            </p>
            <PrimaryButton href="/mission/control">Launch Mission</PrimaryButton>
          </div>
        </section>
      </div>
    </main>
  )
}
