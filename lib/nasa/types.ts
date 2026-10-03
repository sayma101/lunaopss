export type NasaKind = 'FLR' | 'CME' | 'SEP'

export interface NasaEvent {
  id: string
  kind: NasaKind
  /** ISO timestamp of the observation (flare peak, CME start, SEP event time) */
  time: string
  title: string
  /** Only facts reported by DONKI; never estimated */
  detail: string
  link: string
  classType?: string
  speedKms?: number
}

/**
 * live: observed within the recent window, fetched from DONKI
 * historical: bundled verified DONKI records. `reason` says why they are shown.
 */
export interface NasaFeed {
  status: 'live' | 'historical'
  reason?: 'quiet' | 'unavailable'
  source: 'NASA DONKI'
  fetchedAt: string
  windowDays: number
  event: NasaEvent
}

/** Stored in the saved mission so a scenario stays stable across reloads. */
export interface NasaScenarioState {
  origin: 'live' | 'historical'
  offline: boolean
  event: NasaEvent
  severityMult: number
  weightMult: number
}
