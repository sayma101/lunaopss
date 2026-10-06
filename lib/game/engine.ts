import { BUILD_CREDITS, MODULES, type ModuleId } from '@/lib/missions'
import type { NasaScenarioState } from '@/lib/nasa/types'
import {
  CREW,
  DIFFICULTY,
  EVENTS,
  EVENT_LIST,
  INITIAL_RESOURCES,
  MISSION_LENGTH,
  ORDERS,
  RESOURCE_KEYS,
  RESOURCE_LABEL,
  SCIENCE,
} from './data'
import type {
  ActiveModifier,
  AssignmentId,
  CrewId,
  Difficulty,
  EventChoice,
  EventId,
  GameState,
  OrderId,
  ResourceKey,
  Resources,
  ScienceId,
  ScoreBreakdown,
  Status,
  TimelineKind,
} from './types'

export const STATE_VERSION = 1

const r1 = (n: number) => Math.round(n * 10) / 10
const clamp = (n: number) => r1(Math.max(0, Math.min(100, n)))
const clampScore = (n: number) => Math.max(0, Math.min(100, n))
export const shown = (n: number) => Math.round(n)

/* ---------- helpers ---------- */

function rand(seed: number): [number, number] {
  const t = (seed + 0x6d2b79f5) >>> 0
  let r = Math.imul(t ^ (t >>> 15), 1 | t)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, t]
}

function log(s: GameState, day: number, kind: TimelineKind, text: string) {
  s.timeline.push({ id: s.nextId++, day, kind, text })
  if (s.timeline.length > 80) s.timeline.splice(0, s.timeline.length - 80)
}

export function statusOf(key: ResourceKey, value: number): Status {
  if (key === 'science') return 'safe'
  if (value < 20) return 'critical'
  if (value < 40) return 'warning'
  return 'safe'
}

export function worstStatus(res: Resources): Status {
  let worst: Status = 'safe'
  for (const k of RESOURCE_KEYS) {
    const st = statusOf(k, res[k])
    if (st === 'critical') return 'critical'
    if (st === 'warning') worst = 'warning'
  }
  return worst
}

function logWarnings(s: GameState, day: number, prev: Resources, next: Resources) {
  const rank: Record<Status, number> = { safe: 0, warning: 1, critical: 2 }
  for (const k of RESOURCE_KEYS) {
    const a = statusOf(k, prev[k])
    const b = statusOf(k, next[k])
    if (rank[b] > rank[a]) {
      log(s, day, 'warning', `${RESOURCE_LABEL[k]} ${b.toUpperCase()} (${shown(next[k])})`)
    }
  }
}

function failureOf(res: Resources): string | null {
  if (shown(res.oxygen) <= 0) return 'Oxygen ran out.'
  if (shown(res.water) <= 0) return 'Water ran out.'
  if (shown(res.health) <= 0) return 'Crew health collapsed.'
  return null
}

function aggregate(mods: ActiveModifier[]) {
  const out = { oxygenUse: 1, waterUse: 1, foodUse: 1, powerUse: 1, powerProd: 1, foodProd: 1, science: 1 }
  for (const m of mods) {
    for (const k of Object.keys(out) as (keyof typeof out)[]) out[k] *= m[k] ?? 1
  }
  return out
}

/* ---------- creation ---------- */

export function createMission(
  difficulty: Difficulty,
  seed = Math.floor(Math.random() * 2147483647),
): GameState {
  const s: GameState = {
    version: STATE_VERSION,
    missionDay: 1,
    difficulty,
    buildCredits: BUILD_CREDITS,
    installedModules: [],
    resources: { ...INITIAL_RESOURCES },
    crewAssignments: { commander: null, engineer: null, scientist: null, medic: null },
    dailyOrder: null,
    plannedScience: null,
    activeScienceMission: null,
    eventHistory: [],
    pendingEvent: null,
    modifiers: [],
    reserves: DIFFICULTY[difficulty].reserves,
    missionStatus: 'active',
    failureReason: null,
    lastReport: null,
    lastEventDay: 1,
    timeline: [],
    stats: {
      days: 0,
      resourceSum: 0,
      healthSum: 0,
      powerSum: 0,
      powerOkDays: 0,
      criticalDays: 0,
      eventsFaced: 0,
      eventScores: [],
      scienceMissions: 0,
    },
    seed,
    nextId: 1,
  }
  log(s, 1, 'day', 'Day 1 started')
  return s
}

export function isValidState(x: unknown): x is GameState {
  const s = x as GameState
  return (
    !!s &&
    s.version === STATE_VERSION &&
    typeof s.missionDay === 'number' &&
    !!s.resources &&
    Array.isArray(s.installedModules) &&
    !!s.crewAssignments &&
    !!s.stats &&
    Array.isArray(s.timeline)
  )
}

/* ---------- base builder ---------- */

const moduleCost = (id: ModuleId) => MODULES.find((m) => m.id === id)!.cost
export const canRefund = (s: GameState) => s.missionStatus === 'active' && s.stats.days === 0

export function canBuy(s: GameState, id: ModuleId) {
  return (
    s.missionStatus === 'active' && !s.installedModules.includes(id) && moduleCost(id) <= s.buildCredits
  )
}

export function buyModule(s: GameState, id: ModuleId): GameState {
  if (!canBuy(s, id)) return s
  const d = structuredClone(s)
  d.buildCredits -= moduleCost(id)
  d.installedModules.push(id)
  return d
}

export function sellModule(s: GameState, id: ModuleId): GameState {
  if (!canRefund(s) || !s.installedModules.includes(id)) return s
  const d = structuredClone(s)
  d.buildCredits = Math.min(BUILD_CREDITS, d.buildCredits + moduleCost(id))
  d.installedModules = d.installedModules.filter((m) => m !== id)
  return d
}

/* ---------- daily decisions ---------- */

const decisionsOpen = (s: GameState) =>
  s.missionStatus === 'active' && !s.pendingEvent && (!s.lastReport || s.lastReport.acknowledged)

export function assignCrew(s: GameState, crew: CrewId, assignment: AssignmentId): GameState {
  if (!decisionsOpen(s) || s.crewAssignments[crew] === assignment) return s
  const def = CREW.find((c) => c.id === crew)
  const opt = def?.options.find((o) => o.id === assignment)
  if (!def || !opt) return s
  const d = structuredClone(s)
  d.crewAssignments[crew] = assignment
  log(d, d.missionDay, 'crew', `${def.role}: ${opt.label}`)
  return d
}

export function setOrder(s: GameState, order: OrderId): GameState {
  if (!decisionsOpen(s) || s.dailyOrder === order) return s
  const d = structuredClone(s)
  d.dailyOrder = order
  log(d, d.missionDay, 'order', ORDERS[order].name)
  return d
}

export function scienceBlocker(s: GameState, id: ScienceId): string | null {
  const m = SCIENCE[id]
  if (s.activeScienceMission) return 'Another mission is in progress'
  if (s.resources.power < m.power) return `Needs ${m.power} power`
  if (s.resources.water < m.water) return `Needs ${m.water} water`
  return null
}

export function planScience(s: GameState, id: ScienceId | null): GameState {
  if (!decisionsOpen(s) || s.plannedScience === id) return s
  if (id && scienceBlocker(s, id)) return s
  const d = structuredClone(s)
  d.plannedScience = id
  return d
}

export function scienceMultiplier(s: GameState) {
  const order = s.dailyOrder ? ORDERS[s.dailyOrder].science : 1
  return (
    (s.installedModules.includes('lab') ? 1.25 : 1) *
    (s.crewAssignments.scientist === 'research' ? 1.1 : 1) *
    order
  )
}

/** Attach a NASA training scenario once, before the first day is executed. */
export function setNasaScenario(s: GameState, nasa: NasaScenarioState): GameState {
  if (s.missionStatus !== 'active' || s.stats.days > 0 || s.nasa) return s
  const d = structuredClone(s)
  d.nasa = nasa
  log(d, d.missionDay, 'day', `NASA scenario loaded: ${nasa.event.title}`)
  return d
}

export function acknowledgeReport(s: GameState): GameState {
  if (!s.lastReport || s.lastReport.acknowledged) return s
  const d = structuredClone(s)
  d.lastReport!.acknowledged = true
  return d
}

export function canExecute(s: GameState): { ok: boolean; reason: string } {
  if (s.missionStatus !== 'active') return { ok: false, reason: 'Mission ended' }
  if (s.lastReport && !s.lastReport.acknowledged) return { ok: false, reason: 'Review the day report' }
  if (s.pendingEvent) return { ok: false, reason: 'Resolve the active event' }
  const missing = Object.values(s.crewAssignments).filter((a) => !a).length
  if (missing) return { ok: false, reason: `Assign crew (${4 - missing}/4)` }
  if (!s.dailyOrder) return { ok: false, reason: 'Select a daily order' }
  return { ok: true, reason: 'Ready' }
}

export type NextStep = {
  kind: 'report' | 'event' | 'crew' | 'order' | 'ready' | 'ended'
  tab: 'crew' | 'orders' | 'science' | null
  label: string
}

export function nextStep(s: GameState): NextStep {
  if (s.missionStatus !== 'active') return { kind: 'ended', tab: null, label: 'Mission complete' }
  if (s.lastReport && !s.lastReport.acknowledged)
    return { kind: 'report', tab: null, label: 'Review the day report' }
  if (s.pendingEvent) return { kind: 'event', tab: null, label: 'Resolve the emergency' }
  const assigned = Object.values(s.crewAssignments).filter(Boolean).length
  if (assigned < 4) return { kind: 'crew', tab: 'crew', label: `Assign your crew (${assigned}/4)` }
  if (!s.dailyOrder) return { kind: 'order', tab: 'orders', label: 'Choose a daily order' }
  return { kind: 'ready', tab: 'science', label: 'Optional: plan science, then Execute Day' }
}

/* ---------- daily simulation ---------- */

export function executeDay(s: GameState): GameState {
  if (!canExecute(s).ok) return s
  const d = structuredClone(s)
  const day = d.missionDay
  const diff = DIFFICULTY[d.difficulty]
  const has = (m: ModuleId) => d.installedModules.includes(m)
  const crew = (c: CrewId, a: AssignmentId) => d.crewAssignments[c] === a
  const order = ORDERS[d.dailyOrder!]
  const mod = aggregate(d.modifiers)
  const before: Resources = { ...d.resources }
  const r: Resources = { ...d.resources }
  const notes: string[] = []
  const labMult = has('lab') ? 1.25 : 1

  /* science */
  const sciMult = labMult * (crew('scientist', 'research') ? 1.1 : 1) * order.science * mod.science
  const award = (id: ScienceId) => {
    const m = SCIENCE[id]
    const gain = m.reward * sciMult
    r.science += gain
    d.stats.scienceMissions += 1
    notes.push(`${m.name} complete: +${Math.round(gain)} science`)
    log(d, day, 'science', `${m.name} complete (+${Math.round(gain)} science)`)
  }
  if (d.activeScienceMission) {
    const am = d.activeScienceMission
    am.daysLeft -= 1
    if (am.daysLeft <= 0) {
      award(am.id)
      d.activeScienceMission = null
    } else {
      notes.push(`${SCIENCE[am.id].name} in progress`)
    }
  } else if (d.plannedScience) {
    const m = SCIENCE[d.plannedScience]
    if (r.power >= m.power && r.water >= m.water) {
      r.power -= m.power
      r.water -= m.water
      if (m.days <= 1) {
        award(m.id)
      } else {
        d.activeScienceMission = { id: m.id, daysLeft: m.days - 1 }
        notes.push(`${m.name} launched`)
        log(d, day, 'science', `${m.name} launched`)
      }
    } else {
      notes.push(`${m.name} aborted: not enough resources`)
    }
  }
  d.plannedScience = null

  /* consumption and production */
  const use = diff.use * (crew('commander', 'coordination') ? 0.95 : 1)
  const tuning = crew('engineer', 'life-support-tuning') ? 0.92 : 1
  r.oxygen -= 2.5 * use * mod.oxygenUse * tuning
  r.water -= 2.5 * use * mod.waterUse * tuning
  r.food -= 2.5 * use * mod.foodUse
  if (has('water')) r.water += 2.2
  if (has('greenhouse')) {
    r.food += 3.8 * mod.foodProd + (crew('scientist', 'greenhouse-tending') ? 1.5 : 0)
    r.water -= 1.2
  } else if (crew('scientist', 'greenhouse-tending')) {
    r.food += 0.8
  }

  /* daily order */
  for (const k of RESOURCE_KEYS) {
    const v = order.delta[k]
    if (v) r[k] += k === 'science' ? v * labMult : v
  }
  if (order.id === 'greenhouse-boost' && !has('greenhouse')) r.food -= 3

  /* power */
  const production =
    (10 + (has('solar') ? 9 : 0)) * (crew('engineer', 'power-systems') ? 1.08 : 1) * mod.powerProd
  const usage = (11 + (has('greenhouse') ? 3 : 0)) * use * mod.powerUse
  r.power += production - usage
  r.power = Math.max(0, Math.min(100, r.power))

  let shortage = 0
  let healthDelta = 0
  if (r.power < 20) {
    shortage = r.power < 1 ? 2.5 : r.power < 10 ? 1.6 : 1
    if (has('battery')) {
      r.power = Math.min(100, r.power + 4)
      shortage *= 0.5
      notes.push('Backup battery softened the power shortage')
    }
    r.oxygen -= 1.5 * shortage
    r.water -= 1 * shortage
    healthDelta -= 1 * shortage
    notes.push('Power shortage: life support throttled')
  }

  /* radiation */
  r.radiationSafety +=
    -1.2 + (has('shelter') ? 1.5 : 0) + (crew('medic', 'radiation-monitoring') ? 0.8 : 0)

  /* health */
  for (const k of RESOURCE_KEYS) r[k] = Math.max(0, Math.min(100, r[k]))
  let stressed = false
  for (const k of ['oxygen', 'water', 'food'] as const) {
    if (r[k] < 20) {
      stressed = true
      healthDelta -= 2 + (20 - r[k]) / 4 + (k === 'oxygen' ? 1 : 0)
      notes.push(`${RESOURCE_LABEL[k]} critically low: crew health declining`)
    }
  }
  if (r.radiationSafety < 30) {
    stressed = true
    healthDelta -= r.radiationSafety < 10 ? 4 : 2
    notes.push('Radiation exposure: crew health declining')
  }
  const care = (has('medical') ? 1.5 : 0) + (crew('medic', 'crew-care') ? 1.5 : 0)
  healthDelta += !stressed && shortage === 0 ? 1 + care : care * 0.5
  r.health += healthDelta

  for (const k of RESOURCE_KEYS) r[k] = clamp(r[k])
  d.resources = r

  /* stats */
  d.stats.days += 1
  d.stats.resourceSum += (r.oxygen + r.water + r.food + r.health + r.radiationSafety) / 5
  d.stats.healthSum += r.health
  d.stats.powerSum += r.power
  if (r.power >= 20) d.stats.powerOkDays += 1
  if (RESOURCE_KEYS.some((k) => k !== 'science' && r[k] < 20)) d.stats.criticalDays += 1
  logWarnings(d, day, before, r)

  d.modifiers = d.modifiers
    .map((m) => ({ ...m, daysLeft: m.daysLeft - 1 }))
    .filter((m) => m.daysLeft > 0)
  d.dailyOrder = null

  let eventId: EventId | null = null
  const failure = failureOf(r)
  if (failure) {
    d.missionStatus = 'failed'
    d.failureReason = failure
    log(d, day, 'warning', `MISSION FAILED: ${failure}`)
  } else if (day >= MISSION_LENGTH) {
    d.missionStatus = 'success'
    log(d, day, 'day', 'Day 30 complete. Mission success')
  } else {
    const [roll, s1] = rand(d.seed)
    d.seed = s1
    const since = day - d.lastEventDay
    const chance =
      diff.eventChance * order.eventRisk * (since <= 1 ? 0.25 : 1) + Math.max(0, since - 3) * 0.1
    if (day >= 2 && roll < chance) {
      const lastId = d.eventHistory[d.eventHistory.length - 1]?.eventId
      const pool = EVENT_LIST.filter(
        (e) =>
          day >= e.minDay && e.id !== lastId && (!e.requiresModule || has(e.requiresModule)),
      )
      if (pool.length) {
        const [roll2, s2] = rand(d.seed)
        d.seed = s2
        const weightOf = (e: (typeof pool)[number]) =>
          e.id === 'solar-radiation' ? e.weight * (d.nasa?.weightMult ?? 1) : e.weight
        const total = pool.reduce((a, e) => a + weightOf(e), 0)
        let pick = roll2 * total
        let chosen = pool[0]
        for (const e of pool) {
          pick -= weightOf(e)
          if (pick <= 0) {
            chosen = e
            break
          }
        }
        d.pendingEvent = {
          id: chosen.id,
          day,
          severity:
            diff.severity *
            order.severity *
            (chosen.id === 'solar-radiation' ? (d.nasa?.severityMult ?? 1) : 1),
          radiationShield: order.radiationShield,
        }
        d.eventHistory.push({ day, eventId: chosen.id, choiceId: null })
        d.stats.eventsFaced += 1
        d.lastEventDay = day
        eventId = chosen.id
        log(d, day, 'event', chosen.title)
      }
    }
    d.missionDay = day + 1
    log(d, day + 1, 'day', `Day ${day + 1} started`)
  }

  d.lastReport = { day, before, after: { ...d.resources }, notes, eventId, acknowledged: false }
  return d
}

/* ---------- events ---------- */

export function eventEffects(s: GameState, choice: EventChoice): Partial<Resources> {
  const pe = s.pendingEvent
  if (!pe) return {}
  const def = EVENTS[pe.id]
  const out: Partial<Resources> = {}
  for (const key of RESOURCE_KEYS) {
    let v = choice.effects[key]
    if (v === undefined) continue
    if (v < 0) {
      v *= pe.severity
      if (def.radiation && (key === 'radiationSafety' || key === 'health')) v *= pe.radiationShield
      for (const m of def.mitigations ?? []) {
        if (!m.keys.includes(key)) continue
        const active =
          (m.module && s.installedModules.includes(m.module)) ||
          (m.assignment && Object.values(s.crewAssignments).includes(m.assignment))
        if (active) v *= m.mult
      }
    } else if (key === 'science' && s.installedModules.includes('lab')) {
      v *= 1.25
    }
    const rounded = Math.round(v)
    if (rounded !== 0) out[key] = rounded
  }
  return out
}

export function resolveEvent(s: GameState, choiceId: string): GameState {
  const pe = s.pendingEvent
  if (!pe || s.missionStatus !== 'active') return s
  if (s.lastReport && !s.lastReport.acknowledged) return s
  const choice = EVENTS[pe.id].choices.find((c) => c.id === choiceId)
  if (!choice || (choice.reserve && s.reserves <= 0)) return s

  const d = structuredClone(s)
  const effects = eventEffects(s, choice)
  const prev = { ...d.resources }
  let sum = 0
  for (const k of RESOURCE_KEYS) {
    const v = effects[k]
    if (v) {
      d.resources[k] = clamp(d.resources[k] + v)
      sum += v
    }
  }
  if (choice.reserve) d.reserves -= 1
  if (choice.modifier) {
    d.modifiers.push({ ...choice.modifier, id: `${pe.id}-${pe.day}` })
  }
  d.stats.eventScores.push(clampScore(70 + 2.2 * sum - (choice.reserve ? 8 : 0)))
  const hist = d.eventHistory[d.eventHistory.length - 1]
  if (hist) hist.choiceId = choice.id
  d.pendingEvent = null
  log(d, pe.day, 'choice', `${EVENTS[pe.id].title}: ${choice.label}`)
  logWarnings(d, pe.day, prev, d.resources)

  const failure = failureOf(d.resources)
  if (failure) {
    d.missionStatus = 'failed'
    d.failureReason = failure
    log(d, pe.day, 'warning', `MISSION FAILED: ${failure}`)
    if (d.lastReport) d.lastReport.acknowledged = false
  }
  return d
}

/* ---------- score ---------- */

export function rankFor(total: number) {
  if (total >= 85) return 'Mission Commander'
  if (total >= 70) return 'Lunar Engineer'
  if (total >= 50) return 'Mission Specialist'
  return 'Junior Cadet'
}

export function computeScore(s: GameState): ScoreBreakdown {
  const st = s.stats
  const days = Math.max(1, st.days)
  const success = s.missionStatus === 'success'
  const survived = Math.min(1, st.days / MISSION_LENGTH)

  const crewSurvival = success
    ? clampScore(0.7 * s.resources.health + 0.3 * (st.healthSum / days))
    : survived * 40
  const resourceEfficiency = clampScore(st.resourceSum / days - st.criticalDays * 1.5)
  const energyManagement = clampScore(0.6 * ((st.powerOkDays / days) * 100) + 0.4 * (st.powerSum / days))
  const emergencyResponse = st.eventScores.length
    ? st.eventScores.reduce((a, b) => a + b, 0) / st.eventScores.length
    : 85
  const scienceProgress = clampScore(s.resources.science)

  let total =
    crewSurvival * 0.3 +
    resourceEfficiency * 0.2 +
    energyManagement * 0.15 +
    emergencyResponse * 0.15 +
    scienceProgress * 0.2
  if (!success) total *= survived
  total = Math.round(clampScore(total))

  return {
    crewSurvival: Math.round(crewSurvival),
    resourceEfficiency: Math.round(resourceEfficiency),
    energyManagement: Math.round(energyManagement),
    emergencyResponse: Math.round(emergencyResponse),
    scienceProgress: Math.round(scienceProgress),
    total,
    rank: rankFor(total),
  }
}

/* ---------- Luna advice ---------- */

export function lunaAdvice(s: GameState): string[] {
  const out: string[] = []
  const r = s.resources
  if (r.power < 40) out.push('Power is low. Try Power Conservation, and skip costly science for a day.')
  if (r.oxygen < 40) out.push('Oxygen is dropping. Life Support Priority or Life Support Tuning will help.')
  if (r.water < 40) out.push('Water is running short. A Water Recycler or Life Support Priority helps.')
  if (r.food < 40) out.push('Food is low. Use Greenhouse Boost, or assign the Scientist to Greenhouse Tending.')
  if (r.radiationSafety < 40) out.push('Radiation safety is low. Try Radiation Preparation or Radiation Monitoring.')
  if (r.health < 60) out.push('Crew health is slipping. Assign Crew Care and keep air, water and food above 20.')
  if (!s.installedModules.includes('solar')) out.push('No Solar Array yet. Without one, power only just breaks even.')
  if (!out.length) {
    out.push('All systems look steady. A good day to push science.')
    out.push('Different daily orders suit different problems. Rotate them as needs change.')
  }
  out.push(`Emergency reserves left: ${s.reserves}. Save them for real crises.`)
  return out.slice(0, 4)
}
