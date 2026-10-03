import type { ModuleId } from '@/lib/missions'
import type { NasaScenarioState } from '@/lib/nasa/types'

export type Difficulty = 'Cadet' | 'Explorer' | 'Commander'

export type ResourceKey =
  | 'power'
  | 'oxygen'
  | 'water'
  | 'food'
  | 'health'
  | 'radiationSafety'
  | 'science'
export type Resources = Record<ResourceKey, number>

export type CrewId = 'commander' | 'engineer' | 'scientist' | 'medic'
export type AssignmentId =
  | 'coordination'
  | 'drills'
  | 'power-systems'
  | 'life-support-tuning'
  | 'research'
  | 'greenhouse-tending'
  | 'crew-care'
  | 'radiation-monitoring'

export type OrderId =
  | 'life-support'
  | 'power-conservation'
  | 'science-push'
  | 'greenhouse-boost'
  | 'maintenance'
  | 'radiation-prep'

export type ScienceId = 'samples' | 'soil' | 'plants' | 'telescope' | 'rover'

export type EventId =
  | 'solar-radiation'
  | 'oxygen-failure'
  | 'water-leak'
  | 'battery-malfunction'
  | 'greenhouse-failure'
  | 'comms-failure'
  | 'illness'
  | 'low-solar'
  | 'discovery'

export type TimelineKind = 'day' | 'crew' | 'order' | 'science' | 'event' | 'choice' | 'warning'
export type Status = 'safe' | 'warning' | 'critical'

export interface TimelineEntry {
  id: number
  day: number
  kind: TimelineKind
  text: string
}

/** Multipliers default to 1. Applied for `daysLeft` more daily simulations. */
export interface ActiveModifier {
  id: string
  label: string
  daysLeft: number
  oxygenUse?: number
  waterUse?: number
  foodUse?: number
  powerUse?: number
  powerProd?: number
  foodProd?: number
  science?: number
}

export interface PendingEvent {
  id: EventId
  day: number
  severity: number
  radiationShield: number
}

export interface DayReport {
  day: number
  before: Resources
  after: Resources
  notes: string[]
  eventId: EventId | null
  acknowledged: boolean
}

export interface MissionStats {
  days: number
  resourceSum: number
  healthSum: number
  powerSum: number
  powerOkDays: number
  criticalDays: number
  eventsFaced: number
  eventScores: number[]
  scienceMissions: number
}

export type MissionStatus = 'active' | 'success' | 'failed'

export interface GameState {
  version: 1
  missionDay: number
  difficulty: Difficulty
  buildCredits: number
  installedModules: ModuleId[]
  resources: Resources
  crewAssignments: Record<CrewId, AssignmentId | null>
  dailyOrder: OrderId | null
  plannedScience: ScienceId | null
  activeScienceMission: { id: ScienceId; daysLeft: number } | null
  eventHistory: { day: number; eventId: EventId; choiceId: string | null }[]
  pendingEvent: PendingEvent | null
  modifiers: ActiveModifier[]
  reserves: number
  missionStatus: MissionStatus
  failureReason: string | null
  lastReport: DayReport | null
  lastEventDay: number
  timeline: TimelineEntry[]
  stats: MissionStats
  seed: number
  nextId: number
  /** Optional training scenario derived from NASA DONKI data. Absent in older saves. */
  nasa?: NasaScenarioState | null
}

export interface EventChoice {
  id: string
  label: string
  detail: string
  effects: Partial<Resources>
  reserve?: boolean
  modifier?: Omit<ActiveModifier, 'id' | 'label'> & { label: string }
}

export interface EventMitigation {
  module?: ModuleId
  assignment?: AssignmentId
  mult: number
  keys: ResourceKey[]
}

export interface EventDef {
  id: EventId
  title: string
  blurb: string
  weight: number
  minDay: number
  radiation?: boolean
  requiresModule?: ModuleId
  mitigations?: EventMitigation[]
  choices: EventChoice[]
}

export interface ScoreBreakdown {
  crewSurvival: number
  resourceEfficiency: number
  energyManagement: number
  emergencyResponse: number
  scienceProgress: number
  total: number
  rank: string
}
