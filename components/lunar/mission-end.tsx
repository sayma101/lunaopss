'use client'

import { motion } from 'framer-motion'
import { GhostButton, PrimaryButton } from './action-button'
import { computeScore } from '@/lib/game/engine'
import type { GameState } from '@/lib/game/types'

const ROWS = [
  ['Crew Survival', 'crewSurvival', '30%'],
  ['Resource Efficiency', 'resourceEfficiency', '20%'],
  ['Energy Management', 'energyManagement', '15%'],
  ['Emergency Response', 'emergencyResponse', '15%'],
  ['Science Progress', 'scienceProgress', '20%'],
] as const

export function MissionEnd({ state }: { state: GameState }) {
  const score = computeScore(state)
  const success = state.missionStatus === 'success'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Mission result"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full max-w-lg border bg-[#080d16] p-6 ${success ? 'border-amber-300/50' : 'border-red-400/50'}`}
      >
        <p
          className={`font-display text-[11px] uppercase tracking-[0.45em] ${
            success ? 'text-amber-300' : 'text-red-300'
          }`}
        >
          {success ? 'Mission Success' : 'Mission Failed'}
        </p>
        <h2 className="font-display mt-1 text-3xl font-bold uppercase">
          {success ? 'Crew Returned Safe' : 'Mission Lost'}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {success
            ? 'All four astronauts survived 30 days at the lunar south pole.'
            : `${state.failureReason ?? ''} The crew did not survive past day ${state.stats.days}.`}
        </p>

        <div className="mt-5 flex items-end justify-between border-y border-white/10 py-4">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">Final Score</p>
            <p className="font-display text-6xl font-bold tabular-nums text-amber-300">{score.total}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">Rank</p>
            <p className="font-display text-xl font-semibold uppercase text-cyan-200">{score.rank}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5">
          {ROWS.map(([label, key, weight]) => (
            <li key={key}>
              <div className="flex justify-between text-xs">
                <span className="font-display uppercase tracking-[0.15em] text-slate-300">
                  {label} <span className="text-slate-600">{weight}</span>
                </span>
                <span className="font-display tabular-nums">{score[key]}</span>
              </div>
              <div className="mt-1 h-1 bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score[key]}%` }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  className="h-full bg-cyan-300"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <GhostButton href="/">Home</GhostButton>
          <PrimaryButton href="/mission/setup">New Mission</PrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  )
}
