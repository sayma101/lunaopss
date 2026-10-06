'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Beaker,
  Calendar,
  ClipboardList,
  Moon,
  Satellite,
  Settings2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { canExecute, nextStep, shown, worstStatus } from '@/lib/game/engine'
import { MISSION_LENGTH } from '@/lib/game/data'
import { game, useGame } from '@/lib/game/store'
import { PrimaryButton } from './action-button'
import { ControlPanel, type PanelId } from './control-panels'
import { DayReportModal } from './day-report'
import { EventModal } from './event-modal'
import { GameNav } from './game-nav'
import { LunarScene } from './lunar-scene'
import { MissionEnd } from './mission-end'
import { ResourcePanel } from './resource-panel'
import { NasaWeatherCard } from './nasa-weather-card'
import { useNasaFeed } from './use-nasa'
import { scenarioFromFeed } from '@/lib/nasa/scenario'

const DOCK: { id: PanelId; name: string; icon: LucideIcon }[] = [
  { id: 'crew', name: 'Crew', icon: Users },
  { id: 'orders', name: 'Orders', icon: ClipboardList },
  { id: 'science', name: 'Science', icon: Beaker },
  { id: 'systems', name: 'Systems', icon: Settings2 },
  { id: 'timeline', name: 'Timeline', icon: Calendar },
  { id: 'luna', name: 'Luna', icon: Moon },
  { id: 'nasa', name: 'NASA', icon: Satellite },
]

export function MissionControl() {
  const { state, hydrated } = useGame()
  const router = useRouter()
  const [panel, setPanel] = useState<PanelId | null>(null)
  const { feed, loading: nasaLoading } = useNasaFeed()
  const needsScenario = !!state && state.missionStatus === 'active' && state.stats.days === 0 && !state.nasa

  useEffect(() => {
    if (needsScenario && feed) game.setNasa(scenarioFromFeed(feed))
  }, [needsScenario, feed])

  useEffect(() => {
    if (hydrated && !state) router.replace('/mission/setup')
  }, [hydrated, state, router])

  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  if (!state) {
    return (
      <main className="relative h-dvh overflow-hidden">
        <LunarScene variant="base" />
      </main>
    )
  }

  const can = canExecute(state)
  const step = nextStep(state)
  const status = worstStatus(state.resources)
  const ended = state.missionStatus !== 'active'
  const report = state.lastReport
  const reportOpen = !!report && !report.acknowledged
  const eventOpen = !reportOpen && !!state.pendingEvent && !ended
  const endOpen = !reportOpen && ended
  const day = Math.min(state.missionDay, MISSION_LENGTH)

  const statusLabel = ended
    ? state.missionStatus === 'success'
      ? 'Complete'
      : 'Failed'
    : status === 'safe'
      ? 'Nominal'
      : status === 'warning'
        ? 'Warning'
        : 'Critical'
  const statusDot = ended
    ? state.missionStatus === 'success'
      ? 'bg-emerald-400'
      : 'bg-red-500'
    : status === 'safe'
      ? 'bg-emerald-400'
      : status === 'warning'
        ? 'bg-amber-300'
        : 'bg-red-500'

  function execute() {
    setPanel(null)
    game.execute()
  }

  return (
    <main className="relative flex h-dvh min-h-[640px] flex-col overflow-hidden">
      <LunarScene variant="base" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <GameNav back="/mission/base" />

        {/* Top HUD */}
        <div className="mx-5 -mt-1 flex flex-wrap items-center gap-x-8 gap-y-2 border-y border-white/10 bg-black/45 px-4 py-2.5 md:mx-8">
          <Hud label="Day" value={`${String(day).padStart(2, '0')} / ${MISSION_LENGTH}`} accent />
          <Hud label="Crew" value={`${state.resources.health > 0 ? 4 : 0} / 4`} />
          <Hud label="Mission Status" value={statusLabel} dotClass={statusDot} />
          <Hud label="Credits" value={String(state.buildCredits)} />
          <div className="ml-auto min-w-40">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Science Progress
            </p>
            <div className="mt-1.5 h-1.5 w-full bg-white/10">
              <motion.div
                animate={{ width: `${state.resources.science}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-cyan-300"
              />
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 justify-end px-5 py-4 md:px-8">
          {!panel && !ended && (
            <motion.button
              key={step.label}
              type="button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => step.tab && setPanel(step.tab)}
              className="font-display absolute left-5 top-4 flex items-center gap-3 border border-amber-300/60 bg-black/70 px-4 py-2.5 text-left text-xs uppercase tracking-[0.2em] text-amber-200 focus-visible:outline-2 focus-visible:outline-cyan-300 md:left-8"
            >
              <span className="relative flex size-2">
                <span className="pulse-ring absolute inset-0 rounded-full bg-amber-300" />
                <span className="relative size-2 rounded-full bg-amber-300" />
              </span>
              Next: {step.label}
            </motion.button>
          )}

          <ResourcePanel resources={state.resources} />
          {!panel && !ended && <NasaWeatherCard feed={feed} loading={nasaLoading} onOpen={() => setPanel('nasa')} />}
          {panel && <ControlPanel id={panel} state={state} feed={feed} onClose={() => setPanel(null)} />}
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
            {DOCK.map((d) => {
              const open = panel === d.id
              const attention = !ended && step.tab === d.id && step.kind !== 'ready'
              return (
                <li key={d.id} className="relative">
                  <button
                    type="button"
                    aria-pressed={open}
                    onClick={() => setPanel(open ? null : d.id)}
                    className={`font-display flex w-16 flex-col items-center gap-1.5 border py-2.5 text-[10px] uppercase tracking-[0.18em] transition hover:border-cyan-300/60 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-300 sm:w-20 ${
                      open
                        ? 'border-cyan-300/70 bg-cyan-300/10 text-cyan-200'
                        : 'border-white/10 bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    <d.icon className="size-5" aria-hidden />
                    {d.name}
                  </button>
                  {attention && (
                    <span className="pointer-events-none absolute -right-1 -top-1 size-2.5 rounded-full bg-amber-300" />
                  )}
                </li>
              )
            })}
          </ul>
          <div className="flex flex-col items-end gap-1">
            <p className="font-display text-[10px] uppercase tracking-[0.2em] text-amber-300" aria-live="polite">
              {can.ok ? '' : can.reason}
            </p>
            <PrimaryButton onClick={execute} disabled={!can.ok}>
              Execute Day
            </PrimaryButton>
          </div>
        </motion.nav>
      </div>

      {reportOpen && report && <DayReportModal key={report.day} report={report} ended={ended} />}
      {eventOpen && <EventModal state={state} />}
      {endOpen && <MissionEnd state={state} />}
      <span className="sr-only" aria-live="polite">
        Day {day}, resources: power {shown(state.resources.power)}, oxygen {shown(state.resources.oxygen)}
      </span>
    </main>
  )
}

function Hud({
  label,
  value,
  accent,
  dotClass,
}: {
  label: string
  value: string
  accent?: boolean
  dotClass?: string
}) {
  return (
    <div>
      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p
        className={`font-display flex items-center gap-2 text-lg font-semibold tabular-nums ${
          accent ? 'text-amber-300' : ''
        }`}
      >
        {dotClass && <span className={`size-2 rounded-full ${dotClass}`} />}
        {value}
      </p>
    </div>
  )
}
