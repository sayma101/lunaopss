import * as E from '../lib/game/engine'
import { EVENTS, SCIENCE_LIST } from '../lib/game/data'
import type { Difficulty, GameState } from '../lib/game/types'
import type { ModuleId } from '../lib/missions'

type Strategy = 'idle' | 'smart' | 'random'

function pickOrder(s: GameState, strat: Strategy) {
  const r = s.resources
  if (strat === 'idle') return 'maintenance' as const
  if (strat === 'random') {
    const ids = ['life-support', 'power-conservation', 'science-push', 'greenhouse-boost', 'maintenance', 'radiation-prep'] as const
    return ids[Math.floor(Math.random() * ids.length)]
  }
  if (r.power < 35) return 'power-conservation'
  if (r.oxygen < 45 || r.water < 40) return 'life-support'
  if (r.food < 40) return 'greenhouse-boost'
  if (r.radiationSafety < 45) return 'radiation-prep'
  if (r.science < 90) return 'science-push'
  return 'maintenance'
}

function play(difficulty: Difficulty, strat: Strategy, modules: ModuleId[]) {
  let s = E.createMission(difficulty)
  for (const m of modules) s = E.buyModule(s, m)
  const log: string[] = []
  let guard = 0
  while (s.missionStatus === 'active' && guard++ < 200) {
    s = E.acknowledgeReport(s)
    if (s.pendingEvent) {
      const def = EVENTS[s.pendingEvent.id]
      const ch =
        strat === 'smart'
          ? def.choices
              .filter((c) => !c.reserve || s.reserves > 0)
              .map((c) => ({ c, sum: Object.values(E.eventEffects(s, c)).reduce((a, b) => a + (b ?? 0), 0) - (c.reserve ? 6 : 0) }))
              .sort((a, b) => b.sum - a.sum)[0].c
          : def.choices.filter((c) => !c.reserve || s.reserves > 0)[0]
      s = E.resolveEvent(s, ch.id)
      if (s.missionStatus !== 'active') break
    }
    s = E.assignCrew(s, 'commander', 'coordination')
    s = E.assignCrew(s, 'engineer', strat === 'smart' && s.resources.power < 50 ? 'power-systems' : 'life-support-tuning')
    s = E.assignCrew(s, 'scientist', 'research')
    s = E.assignCrew(s, 'medic', 'crew-care')
    s = E.setOrder(s, pickOrder(s, strat))
    if (strat === 'smart') {
      const best = SCIENCE_LIST.filter((m) => !E.scienceBlocker(s, m.id) && s.resources.power - m.power > 45).sort((a, b) => b.reward / (b.power + b.water) - a.reward / (a.power + a.water))[0]
      if (best) s = E.planScience(s, best.id)
    }
    if (!E.canExecute(s).ok) throw new Error('cannot execute: ' + E.canExecute(s).reason)
    s = E.executeDay(s)
  }
  const sc = E.computeScore(s)
  return { status: s.missionStatus, day: s.stats.days, res: Object.fromEntries(Object.entries(s.resources).map(([k, v]) => [k, Math.round(v)])), score: sc.total, rank: sc.rank, events: s.stats.eventsFaced, reason: s.failureReason }
}

const BUILD: ModuleId[] = ['solar', 'water', 'greenhouse', 'medical'] // 90
const BUILD2: ModuleId[] = ['solar', 'water', 'shelter', 'lab'] // 90
for (const diff of ['Cadet', 'Explorer', 'Commander'] as Difficulty[]) {
  for (const [name, strat, mods] of [
    ['idle/no modules', 'idle', []],
    ['smart/' + BUILD.join('+'), 'smart', BUILD],
    ['smart/' + BUILD2.join('+'), 'smart', BUILD2],
  ] as [string, Strategy, ModuleId[]][]) {
    const runs = Array.from({ length: 40 }, () => play(diff, strat, mods))
    const wins = runs.filter((r) => r.status === 'success').length
    const avg = Math.round(runs.reduce((a, r) => a + r.score, 0) / runs.length)
    const avgDay = (runs.reduce((a, r) => a + r.day, 0) / runs.length).toFixed(1)
    const ev = (runs.reduce((a, r) => a + r.events, 0) / runs.length).toFixed(1)
    const reasons = [...new Set(runs.filter((r) => r.reason).map((r) => r.reason))].join(' / ')
    console.log(`${diff.padEnd(9)} ${name.padEnd(36)} win ${wins}/40  avgScore ${avg}  avgDays ${avgDay}  events ${ev}  ${reasons}`)
  }
}
console.log('sample', JSON.stringify(play('Explorer', 'smart', BUILD)))
