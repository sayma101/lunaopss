'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Leaf, Telescope } from 'lucide-react'
import { game, useGame } from '@/lib/game/store'
import type { Difficulty } from '@/lib/game/types'
import { PrimaryButton } from './action-button'
import { GameNav } from './game-nav'
import { LunarScene } from './lunar-scene'

const GOALS = [
  { name: 'Survive', icon: Heart, text: 'Keep all four astronauts alive for 30 days.' },
  { name: 'Sustain', icon: Leaf, text: 'Hold power, air, water and food in balance.' },
  { name: 'Discover', icon: Telescope, text: 'Run science to uncover the secrets of the pole.' },
]
const LEVELS: { name: Difficulty; text: string }[] = [
  { name: 'Cadet', text: 'Forgiving resources. Learn the ropes.' },
  { name: 'Explorer', text: 'Balanced risks and steady events.' },
  { name: 'Commander', text: 'Scarce supplies. Harsh surprises.' },
]

export function MissionSetup() {
  const router = useRouter()
  const { state, hydrated } = useGame()
  const [level, setLevel] = useState<Difficulty>('Explorer')
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <LunarScene className="opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#04070d] via-[#04070d]/85 to-transparent" />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <GameNav back="/" label="Mission Briefing" />

        <section className="flex flex-1 flex-col justify-center px-6 pb-12 md:px-16">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-[11px] uppercase tracking-[0.45em] text-cyan-200/80"
          >
            Mission 001 · Classified
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display mt-3 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-6xl"
          >
            Lunar South Pole Outpost
          </motion.h1>

          <dl className="mt-6 flex gap-10">
            {[
              ['4', 'Crew'],
              ['30', 'Mission Days'],
              ['1', 'Outpost'],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">{l}</dt>
                <dd className="font-display text-4xl font-semibold text-amber-300">{v}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
            {GOALS.map((g, i) => (
              <motion.li
                key={g.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="border-t border-white/20 pt-4"
              >
                <g.icon className="size-5 text-cyan-300" aria-hidden />
                <p className="font-display mt-3 text-sm uppercase tracking-[0.3em]">{g.name}</p>
                <p className="mt-1 text-sm text-slate-400">{g.text}</p>
              </motion.li>
            ))}
          </ul>

          <fieldset className="mt-10 max-w-3xl">
            <legend className="font-display text-[11px] uppercase tracking-[0.4em] text-slate-400">
              Difficulty
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {LEVELS.map((l) => {
                const on = level === l.name
                return (
                  <button
                    key={l.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setLevel(l.name)}
                    className={`relative border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                      on
                        ? 'border-amber-300 bg-amber-300/10'
                        : 'border-white/15 bg-black/30 hover:border-white/40'
                    }`}
                  >
                    <span className="font-display text-sm uppercase tracking-[0.25em]">{l.name}</span>
                    <span className="mt-1 block text-xs text-slate-400">{l.text}</span>
                    {on && <span className="absolute right-3 top-3 size-2 rounded-full bg-amber-300" />}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="mt-10">
            {hydrated && state && state.missionStatus === 'active' && (
              <p className="mb-3 text-xs text-amber-300/90">
                You have a mission in progress. Starting a new one replaces it.
              </p>
            )}
            <PrimaryButton
              onClick={() => {
                game.start(level)
                router.push('/mission/base')
              }}
            >
              Continue to Base Builder
            </PrimaryButton>
          </div>
        </section>
      </div>
    </main>
  )
}
