import type { NasaEvent, NasaFeed, NasaScenarioState } from './types'

/**
 * Turns a DONKI observation into a training scenario: it nudges how likely and how
 * severe the game's Solar Radiation Alert is. It is NOT a dose prediction.
 */
export function scenarioFor(event: NasaEvent): { severityMult: number; weightMult: number } {
  if (event.kind === 'SEP') return { severityMult: 1.25, weightMult: 2 }
  if (event.kind === 'CME') {
    return (event.speedKms ?? 0) >= 1000
      ? { severityMult: 1.2, weightMult: 1.6 }
      : { severityMult: 1.1, weightMult: 1.3 }
  }
  const letter = event.classType?.[0]
  const magnitude = Number(event.classType?.slice(1)) || 1
  if (letter === 'X') return { severityMult: magnitude >= 5 ? 1.3 : 1.2, weightMult: 1.8 }
  if (letter === 'M') return { severityMult: 1.1, weightMult: 1.4 }
  return { severityMult: 1, weightMult: 1.15 }
}

export function scenarioFromFeed(feed: NasaFeed): NasaScenarioState {
  return {
    origin: feed.status,
    offline: feed.reason === 'unavailable',
    event: feed.event,
    ...scenarioFor(feed.event),
  }
}

export function formatObserved(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

export const KIND_LABEL = {
  FLR: 'Solar Flare',
  CME: 'Coronal Mass Ejection',
  SEP: 'Solar Energetic Particle',
} as const

export function dataLabel(feed: Pick<NasaFeed, 'status'>) {
  return feed.status === 'live' ? 'REAL NASA DATA' : 'NASA HISTORICAL DATA'
}
