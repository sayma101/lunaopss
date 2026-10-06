'use client'

import { ECLSS_SYSTEMS, WHY_THIS_MATTERS } from '@/lib/nasa/eclss'
import { KIND_LABEL, formatObserved } from '@/lib/nasa/scenario'
import type { GameState } from '@/lib/game/types'
import type { NasaFeed } from '@/lib/nasa/types'
import { DataBadge } from './nasa-badge'

const SIMULATED = [
  'Power, oxygen, water, food, health and science meters',
  'Radiation Safety index (a game score, not a measured dose)',
  'Crew, orders, base modules and all event outcomes',
  'Daily event timing, drawn from a seeded random roll',
  'Scoring and ranks',
]

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
      <h3 className="font-display text-xs uppercase tracking-[0.25em] text-slate-100">{title}</h3>
      <p className="font-display mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">{sub}</p>
      {children}
    </section>
  )
}

export function NasaPanel({ state, feed }: { state: GameState; feed: NasaFeed | null }) {
  const offline = feed?.reason === 'unavailable'
  const quiet = feed?.reason === 'quiet'
  const nasa = state.nasa
  return (
    <div className="space-y-4">
      <Section title="Space Weather" sub="NASA DONKI">
        {!feed ? (
          <p className="text-xs text-slate-400">Checking NASA DONKI…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <DataBadge kind={feed.status === 'live' ? 'real' : 'historical'} />
              {offline && <span className="font-display text-[11px] text-amber-300">NASA DATA OFFLINE</span>}
            </div>
            {offline && <p className="mt-1 text-xs text-amber-300">Using Historical Training Dataset</p>}
            {quiet && (
              <p className="mt-1 text-xs text-slate-400">
                No significant flare, CME or SEP in the last {feed.windowDays} days. Showing a historical event.
              </p>
            )}
            <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-y-1 text-xs">
              <dt className="text-slate-500">Event</dt>
              <dd className="text-slate-100">{feed.event.title}</dd>
              <dt className="text-slate-500">Type</dt>
              <dd className="text-slate-300">
                {KIND_LABEL[feed.event.kind]} ({feed.event.kind})
              </dd>
              <dt className="text-slate-500">Observed</dt>
              <dd className="text-slate-300">{formatObserved(feed.event.time)}</dd>
              <dt className="text-slate-500">Details</dt>
              <dd className="text-slate-300">{feed.event.detail}</dd>
              <dt className="text-slate-500">Source</dt>
              <dd className="text-slate-300">
                NASA DONKI
                {feed.event.link && (
                  <>
                    {' · '}
                    <a
                      href={feed.event.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-200 underline-offset-4 hover:underline"
                    >
                      view record
                    </a>
                  </>
                )}
              </dd>
            </dl>
          </>
        )}
        <div className="mt-3 border-l-2 border-amber-300/60 pl-3 text-xs text-slate-300">
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-amber-300">
            How this shapes your mission
          </p>
          {nasa ? (
            <p className="mt-1">
              This mission uses <b>{nasa.event.title}</b> as a training scenario. Solar Radiation Alerts are
              about {Math.round((nasa.weightMult - 1) * 100)}% more likely and about{' '}
              {Math.round((nasa.severityMult - 1) * 100)}% stronger. DONKI does not report radiation dose for a
              lunar crew, so this is a scenario, not a prediction.
            </p>
          ) : (
            <p className="mt-1">
              A scenario is attached to a mission before Day 1 is executed. Missions already underway keep their
              original settings.
            </p>
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">{WHY_THIS_MATTERS['solar-radiation']}</p>
      </Section>

      <Section title="Life Support" sub="NASA ECLSS">
        <DataBadge kind="reference" />
        <ul className="mt-2 space-y-2">
          {ECLSS_SYSTEMS.map((s) => (
            <li key={s.id} className="text-xs">
              <p className="font-display uppercase tracking-[0.12em] text-slate-100">{s.name}</p>
              <p className="text-slate-400">NASA: {s.nasa}</p>
              <p className="text-cyan-200/90">LunaOps: {s.game}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-l-2 border-cyan-300/60 pl-3 text-xs text-slate-300">
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-cyan-200">Why this matters</p>
          <p className="mt-1">{WHY_THIS_MATTERS['water-leak']}</p>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          An educational model inspired by NASA ECLSS. LunaOps is not an engineering simulator.
        </p>
      </Section>

      <Section title="Game Simulation" sub="What LunaOps invents">
        <DataBadge kind="simulation" />
        <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
          {SIMULATED.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
