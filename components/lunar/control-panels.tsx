'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { MODULES } from '@/lib/missions'
import { CREW, ORDER_LIST, SCIENCE, SCIENCE_LIST } from '@/lib/game/data'
import { lunaAdvice, scienceBlocker, scienceMultiplier } from '@/lib/game/engine'
import { game } from '@/lib/game/store'
import type { GameState, TimelineKind } from '@/lib/game/types'
import type { NasaFeed } from '@/lib/nasa/types'
import { NasaPanel } from './nasa-panel'

export type PanelId = 'crew' | 'orders' | 'science' | 'systems' | 'timeline' | 'luna' | 'nasa'

const TITLES: Record<PanelId, string> = {
  nasa: 'NASA Data Center',
  crew: 'Crew Assignments',
  orders: 'Daily Order',
  science: 'Science Missions',
  systems: 'Systems',
  timeline: 'Mission Timeline',
  luna: 'Luna Advisor',
}

export function ControlPanel({
  id,
  state,
  feed,
  onClose,
}: {
  id: PanelId
  state: GameState
  feed: NasaFeed | null
  onClose: () => void
}) {
  return (
    <section
      aria-label={TITLES[id]}
      className="absolute bottom-4 left-5 z-20 max-h-[calc(100%-2rem)] w-[calc(100%-2.5rem)] overflow-y-auto border border-white/15 bg-[#060a12]/95 p-4 backdrop-blur md:left-8 md:w-[min(560px,calc(100%-17rem))]"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-200">{TITLES[id]}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="border border-white/15 p-1.5 text-slate-300 hover:border-cyan-300/60 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {id === 'crew' && <CrewPanel state={state} />}
      {id === 'orders' && <OrdersPanel state={state} />}
      {id === 'science' && <SciencePanel state={state} />}
      {id === 'systems' && <SystemsPanel state={state} />}
      {id === 'timeline' && <TimelinePanel state={state} />}
      {id === 'luna' && <LunaPanel state={state} />}
      {id === 'nasa' && <NasaPanel state={state} feed={feed} />}
    </section>
  )
}

const choiceBase =
  'border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40'

function CrewPanel({ state }: { state: GameState }) {
  return (
    <ul className="space-y-3">
      {CREW.map((c) => (
        <li key={c.id}>
          <p className="font-display text-[11px] uppercase tracking-[0.25em] text-slate-400">
            {c.role} <span className="text-slate-600">· {c.name}</span>
          </p>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {c.options.map((o) => {
              const on = state.crewAssignments[c.id] === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => game.assign(c.id, o.id)}
                  className={`${choiceBase} ${
                    on ? 'border-cyan-300/80 bg-cyan-300/10' : 'border-white/15 bg-white/[0.03] hover:border-white/40'
                  }`}
                >
                  <span className="font-display block text-xs uppercase tracking-[0.15em]">{o.label}</span>
                  <span className="block text-xs text-cyan-200/80">{o.effect}</span>
                </button>
              )
            })}
          </div>
        </li>
      ))}
    </ul>
  )
}

function OrdersPanel({ state }: { state: GameState }) {
  return (
    <>
      <p className="mb-3 text-xs text-slate-400">Choose one order for today. It resets after each day.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ORDER_LIST.map((o) => {
          const on = state.dailyOrder === o.id
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => game.order(o.id)}
              className={`${choiceBase} ${
                on ? 'border-amber-300 bg-amber-300/10' : 'border-white/15 bg-white/[0.03] hover:border-white/40'
              }`}
            >
              <span className="font-display block text-xs uppercase tracking-[0.15em]">{o.name}</span>
              <span className="mt-1 block text-xs text-cyan-200/90">+ {o.plus}</span>
              <span className="block text-xs text-red-300/90">− {o.minus}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function SciencePanel({ state }: { state: GameState }) {
  const active = state.activeScienceMission
  const mult = scienceMultiplier(state)
  return (
    <>
      <p className="mb-3 text-xs text-slate-400" aria-live="polite">
        {active
          ? `In progress: ${SCIENCE[active.id].name} (${active.daysLeft} day left). It completes on the next Execute Day.`
          : 'Optional. A mission starts when you Execute Day, and resources are spent then.'}
      </p>
      <ul className="space-y-2">
        {SCIENCE_LIST.map((m) => {
          const planned = state.plannedScience === m.id
          const blocker = scienceBlocker(state, m.id)
          const reward = Math.round(m.reward * mult)
          return (
            <li
              key={m.id}
              className={`flex items-center justify-between gap-3 border px-3 py-2 ${
                planned ? 'border-cyan-300/80 bg-cyan-300/10' : 'border-white/15 bg-white/[0.03]'
              }`}
            >
              <div>
                <p className="font-display text-xs uppercase tracking-[0.15em]">{m.name}</p>
                <p className="text-xs text-slate-400">
                  Cost {m.power} power{m.water ? `, ${m.water} water` : ''} · +{reward} science · {m.days}{' '}
                  {m.days === 1 ? 'day' : 'days'}
                </p>
                {blocker && !planned && <p className="text-xs text-red-300">{blocker}</p>}
              </div>
              <button
                type="button"
                disabled={!planned && !!blocker}
                onClick={() => game.science(planned ? null : m.id)}
                className="font-display shrink-0 border border-white/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:border-cyan-300/70 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {planned ? 'Cancel' : 'Plan'}
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function SystemsPanel({ state }: { state: GameState }) {
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-300">
        <span>
          Credits <b className="font-display text-amber-300">{state.buildCredits}</b>
        </span>
        <span>
          Emergency reserves <b className="font-display text-amber-300">{state.reserves}</b>
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {MODULES.map((m) => {
          const on = state.installedModules.includes(m.id)
          return (
            <li
              key={m.id}
              className={`border px-3 py-2 ${on ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 opacity-60'}`}
            >
              <p className="font-display text-xs uppercase tracking-[0.15em]">
                {m.name} <span className="text-slate-400">{on ? '· online' : `· ${m.cost} CR`}</span>
              </p>
              <p className="text-xs text-slate-400">{m.role}</p>
            </li>
          )
        })}
      </ul>
      {state.modifiers.length > 0 && (
        <p className="mt-3 text-xs text-amber-300">
          Active: {state.modifiers.map((m) => `${m.label} (${m.daysLeft}d)`).join(', ')}
        </p>
      )}
      <Link
        href="/mission/base"
        className="font-display mt-3 inline-block text-[11px] uppercase tracking-[0.2em] text-cyan-200 underline-offset-4 hover:underline"
      >
        Open Base Builder
      </Link>
    </>
  )
}

const KIND_COLOR: Record<TimelineKind, string> = {
  day: 'text-slate-400',
  crew: 'text-cyan-200',
  order: 'text-amber-300',
  science: 'text-emerald-300',
  event: 'text-red-300',
  choice: 'text-red-200',
  warning: 'text-red-400',
}

function TimelinePanel({ state }: { state: GameState }) {
  const items = [...state.timeline].reverse().slice(0, 30)
  return (
    <ol className="space-y-1">
      {items.map((t) => (
        <li key={t.id} className="flex gap-3 text-xs">
          <span className="font-display w-9 shrink-0 tabular-nums text-slate-500">
            D{String(t.day).padStart(2, '0')}
          </span>
          <span className={`font-display w-14 shrink-0 uppercase tracking-[0.1em] ${KIND_COLOR[t.kind]}`}>
            {t.kind}
          </span>
          <span className="text-slate-300">{t.text}</span>
        </li>
      ))}
    </ol>
  )
}

function LunaPanel({ state }: { state: GameState }) {
  return (
    <ul className="space-y-2">
      {lunaAdvice(state).map((tip) => (
        <li key={tip} className="border-l-2 border-cyan-300/60 pl-3 text-sm text-slate-200">
          {tip}
        </li>
      ))}
    </ul>
  )
}
