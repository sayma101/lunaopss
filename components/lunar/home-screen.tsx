'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GhostButton, PrimaryButton } from './action-button'
import { LunarScene } from './lunar-scene'

const HOW = [
  ['01', 'Build', 'Spend 100 credits placing modules at your outpost.'],
  ['02', 'Command', 'Give daily orders to four astronauts.'],
  ['03', 'Balance', 'Keep power, oxygen, water and food above zero.'],
  ['04', 'Survive', 'Reach day 30 with everyone alive.'],
]

export function HomeScreen() {
  const [help, setHelp] = useState(false)
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <LunarScene />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-start px-6 pt-[10vh] text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-display text-[11px] uppercase tracking-[0.5em] text-cyan-200/80"
        >
          NASA Space Apps Challenge 2026
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.18em' }}
          transition={{ delay: 0.4, duration: 1.4, ease: 'easeOut' }}
          className="font-display mt-4 bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-6xl font-bold text-transparent sm:text-8xl md:text-9xl"
        >
          LUNAOPS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="font-display mt-2 text-xs uppercase tracking-[0.45em] text-slate-300 sm:text-sm"
        >
          Junior Astronaut Mission Trainer
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.9 }}
          className="mt-8 max-w-xl"
        >
          <h2 className="font-display text-2xl font-semibold leading-tight text-amber-300 sm:text-3xl">
            COMMAND THE MOON.
            <br />
            KEEP THEM ALIVE.
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-300 sm:text-base">
            Build a lunar outpost, lead four astronauts, balance critical resources, and survive a
            30-day Moon mission.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.9 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <PrimaryButton href="/mission/setup">New Mission</PrimaryButton>
          <button
            type="button"
            onClick={() => setHelp(true)}
            className="font-display border border-slate-300/30 bg-black/30 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-100 transition hover:border-cyan-300/70 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            How to Play
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {help && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            onClick={() => setHelp(false)}
            role="dialog"
            aria-modal="true"
            aria-label="How to play"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl border border-white/15 bg-[#080d16] p-6 sm:p-8"
            >
              <p className="font-display text-[11px] uppercase tracking-[0.4em] text-amber-300">Flight Manual</p>
              <h3 className="font-display mt-1 text-2xl font-semibold">How to Play</h3>
              <ol className="mt-6 grid gap-5 sm:grid-cols-2">
                {HOW.map(([n, t, d]) => (
                  <li key={n} className="flex gap-4">
                    <span className="font-display text-2xl text-cyan-300/70">{n}</span>
                    <div>
                      <p className="font-display text-sm uppercase tracking-[0.2em]">{t}</p>
                      <p className="mt-1 text-sm text-slate-400">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex justify-end">
                <GhostButton href="/mission/setup">Start Mission</GhostButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
