'use client'

import { useSyncExternalStore } from 'react'
import type { ModuleId } from '@/lib/missions'
import * as E from './engine'
import type { AssignmentId, CrewId, Difficulty, GameState, OrderId, ScienceId } from './types'

const KEY = 'lunaops.mission.v1'

let current: GameState | null = null
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (E.isValidState(parsed)) current = parsed
    }
  } catch {
    current = null
  }
}

function getSnapshot() {
  load()
  return current
}

function commit(next: GameState | null) {
  current = next
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next))
    else window.localStorage.removeItem(KEY)
  } catch {
    // storage unavailable: keep playing in memory
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function update(fn: (s: GameState) => GameState) {
  const s = getSnapshot()
  if (!s) return
  const next = fn(s)
  if (next !== s) commit(next)
}

export const game = {
  start: (d: Difficulty) => commit(E.createMission(d)),
  clear: () => commit(null),
  buy: (id: ModuleId) => update((s) => E.buyModule(s, id)),
  sell: (id: ModuleId) => update((s) => E.sellModule(s, id)),
  assign: (c: CrewId, a: AssignmentId) => update((s) => E.assignCrew(s, c, a)),
  order: (o: OrderId) => update((s) => E.setOrder(s, o)),
  science: (id: ScienceId | null) => update((s) => E.planScience(s, id)),
  execute: () => update(E.executeDay),
  ack: () => update(E.acknowledgeReport),
  resolve: (choiceId: string) => update((s) => E.resolveEvent(s, choiceId)),
}

const noopSubscribe = () => () => {}

export function useGame() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => null)
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  return { state, hydrated }
}
