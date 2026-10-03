import type {
  AssignmentId,
  CrewId,
  Difficulty,
  EventDef,
  EventId,
  OrderId,
  ResourceKey,
  Resources,
  ScienceId,
} from './types'

export const MISSION_LENGTH = 30
export const RESOURCE_KEYS: ResourceKey[] = [
  'power',
  'oxygen',
  'water',
  'food',
  'health',
  'radiationSafety',
  'science',
]

export const INITIAL_RESOURCES: Resources = {
  power: 85,
  oxygen: 90,
  water: 85,
  food: 85,
  health: 100,
  radiationSafety: 90,
  science: 0,
}

export const RESOURCE_LABEL: Record<ResourceKey, string> = {
  power: 'Power',
  oxygen: 'Oxygen',
  water: 'Water',
  food: 'Food',
  health: 'Health',
  radiationSafety: 'Radiation Safety',
  science: 'Science',
}

export const DIFFICULTY: Record<
  Difficulty,
  { use: number; eventChance: number; severity: number; reserves: number }
> = {
  Cadet: { use: 0.75, eventChance: 0.2, severity: 0.7, reserves: 3 },
  Explorer: { use: 1, eventChance: 0.3, severity: 1, reserves: 2 },
  Commander: { use: 1.3, eventChance: 0.4, severity: 1.3, reserves: 1 },
}

export const CREW: {
  id: CrewId
  name: string
  role: string
  options: { id: AssignmentId; label: string; effect: string }[]
}[] = [
  {
    id: 'commander',
    name: 'Reyes',
    role: 'Commander',
    options: [
      { id: 'coordination', label: 'Coordination', effect: '-5% all consumption' },
      { id: 'drills', label: 'Emergency Drills', effect: '-15% event damage' },
    ],
  },
  {
    id: 'engineer',
    name: 'Okafor',
    role: 'Engineer',
    options: [
      { id: 'power-systems', label: 'Power Systems', effect: '+8% power output' },
      { id: 'life-support-tuning', label: 'Life Support Tuning', effect: '-8% oxygen and water use' },
    ],
  },
  {
    id: 'scientist',
    name: 'Lindqvist',
    role: 'Scientist',
    options: [
      { id: 'research', label: 'Research', effect: '+10% science rewards' },
      { id: 'greenhouse-tending', label: 'Greenhouse Tending', effect: '+1.5 food per day' },
    ],
  },
  {
    id: 'medic',
    name: 'Tanaka',
    role: 'Medical Officer',
    options: [
      { id: 'crew-care', label: 'Crew Care', effect: '+1.5 health recovery' },
      { id: 'radiation-monitoring', label: 'Radiation Monitoring', effect: '-20% radiation damage' },
    ],
  },
]

export interface OrderDef {
  id: OrderId
  name: string
  plus: string
  minus: string
  delta: Partial<Resources>
  science: number
  eventRisk: number
  severity: number
  radiationShield: number
}

export const ORDERS: Record<OrderId, OrderDef> = {
  'life-support': {
    id: 'life-support',
    name: 'Life Support Priority',
    plus: '+2.5 oxygen, +1.5 water',
    minus: '-4 power',
    delta: { oxygen: 2.5, water: 1.5, power: -4 },
    science: 1,
    eventRisk: 1,
    severity: 1,
    radiationShield: 1,
  },
  'power-conservation': {
    id: 'power-conservation',
    name: 'Power Conservation',
    plus: '+6 power',
    minus: '-40% science rewards',
    delta: { power: 6 },
    science: 0.6,
    eventRisk: 1,
    severity: 1,
    radiationShield: 1,
  },
  'science-push': {
    id: 'science-push',
    name: 'Science Push',
    plus: '+3 science, +10% rewards',
    minus: '-5 power, -2 water',
    delta: { science: 3, power: -5, water: -2 },
    science: 1.1,
    eventRisk: 1,
    severity: 1,
    radiationShield: 1,
  },
  'greenhouse-boost': {
    id: 'greenhouse-boost',
    name: 'Greenhouse Boost',
    plus: '+5 food (+2 without greenhouse)',
    minus: '-4 power, -3 water',
    delta: { food: 5, power: -4, water: -3 },
    science: 1,
    eventRisk: 1,
    severity: 1,
    radiationShield: 1,
  },
  maintenance: {
    id: 'maintenance',
    name: 'System Maintenance',
    plus: 'Half event chance, -15% damage',
    minus: '-3 power',
    delta: { power: -3 },
    science: 1,
    eventRisk: 0.5,
    severity: 0.85,
    radiationShield: 1,
  },
  'radiation-prep': {
    id: 'radiation-prep',
    name: 'Radiation Preparation',
    plus: '+6 radiation safety, -40% storm damage',
    minus: '-30% science rewards',
    delta: { radiationSafety: 6 },
    science: 0.7,
    eventRisk: 1,
    severity: 1,
    radiationShield: 0.6,
  },
}
export const ORDER_LIST = Object.values(ORDERS)

export interface ScienceDef {
  id: ScienceId
  name: string
  power: number
  water: number
  reward: number
  days: number
}

export const SCIENCE: Record<ScienceId, ScienceDef> = {
  samples: { id: 'samples', name: 'Collect Lunar Samples', power: 8, water: 0, reward: 10, days: 1 },
  soil: { id: 'soil', name: 'Analyze Lunar Soil', power: 12, water: 0, reward: 14, days: 1 },
  plants: { id: 'plants', name: 'Plant Growth Experiment', power: 10, water: 6, reward: 16, days: 2 },
  telescope: { id: 'telescope', name: 'Telescope Observation', power: 6, water: 0, reward: 9, days: 1 },
  rover: { id: 'rover', name: 'Deploy Mini Rover', power: 15, water: 0, reward: 20, days: 2 },
}
export const SCIENCE_LIST = Object.values(SCIENCE)

export const EVENTS: Record<EventId, EventDef> = {
  'solar-radiation': {
    id: 'solar-radiation',
    title: 'Solar Radiation Alert',
    blurb: 'A solar particle storm is sweeping the pole. Radiation readings are climbing fast.',
    weight: 1.2,
    minDay: 3,
    radiation: true,
    mitigations: [
      { module: 'shelter', mult: 0.5, keys: ['radiationSafety', 'health'] },
      { assignment: 'radiation-monitoring', mult: 0.8, keys: ['radiationSafety', 'health'] },
    ],
    choices: [
      {
        id: 'shelter',
        label: 'Shelter in Place',
        detail: 'Crew retreat to the core. Outside work stops.',
        effects: { radiationSafety: -8, health: -2, science: -4 },
      },
      {
        id: 'continue',
        label: 'Continue Operations',
        detail: 'Keep working through the storm for extra data.',
        effects: { radiationSafety: -24, health: -10, science: 5 },
      },
      {
        id: 'shield',
        label: 'Emergency Shielding',
        detail: 'Spend an emergency reserve on deployable shielding.',
        effects: { power: -10, radiationSafety: -4 },
        reserve: true,
      },
    ],
  },
  'oxygen-failure': {
    id: 'oxygen-failure',
    title: 'Oxygen Recycler Failure',
    blurb: 'The main oxygen recycler has tripped offline. Cabin oxygen is dropping.',
    weight: 1,
    minDay: 4,
    choices: [
      {
        id: 'repair',
        label: 'Emergency Repair',
        detail: 'Divert power to bring the recycler back quickly.',
        effects: { power: -10, oxygen: -4 },
      },
      {
        id: 'reduce',
        label: 'Reduce Habitat Activity',
        detail: 'Cut activity to slow oxygen use for 3 days.',
        effects: { science: -8, oxygen: -8 },
        modifier: { label: 'Reduced habitat activity', daysLeft: 3, oxygenUse: 0.7 },
      },
      {
        id: 'reserve',
        label: 'Use Emergency Reserve',
        detail: 'Open the emergency oxygen tanks.',
        effects: { oxygen: 15 },
        reserve: true,
      },
    ],
  },
  'water-leak': {
    id: 'water-leak',
    title: 'Water Leak',
    blurb: 'A coolant line has ruptured and water is draining from the tanks.',
    weight: 1,
    minDay: 3,
    mitigations: [{ module: 'water', mult: 0.7, keys: ['water'] }],
    choices: [
      {
        id: 'patch',
        label: 'Patch the Leak',
        detail: 'Crew seal the line using spare power tools.',
        effects: { power: -6, water: -5 },
      },
      {
        id: 'isolate',
        label: 'Isolate the Section',
        detail: 'Seal the area. Slower, but cuts water use for 3 days.',
        effects: { water: -10, science: -5 },
        modifier: { label: 'Water rationing', daysLeft: 3, waterUse: 0.85 },
      },
      {
        id: 'reserve',
        label: 'Use Emergency Water',
        detail: 'Release the emergency water reserve.',
        effects: { water: 15 },
        reserve: true,
      },
    ],
  },
  'battery-malfunction': {
    id: 'battery-malfunction',
    title: 'Battery Malfunction',
    blurb: 'A battery bank is overheating and dumping stored energy.',
    weight: 1,
    minDay: 5,
    mitigations: [{ module: 'battery', mult: 0.6, keys: ['power'] }],
    choices: [
      {
        id: 'replace',
        label: 'Replace Cells',
        detail: 'Swap the damaged cells, costing time and power.',
        effects: { power: -14, science: -2 },
      },
      {
        id: 'throttle',
        label: 'Throttle Systems',
        detail: 'Run on a reduced load for 3 days.',
        effects: { power: -5, science: -6 },
        modifier: { label: 'Reduced power load', daysLeft: 3, powerUse: 0.85 },
      },
      {
        id: 'reserve',
        label: 'Fuel Cell Backup',
        detail: 'Switch to the emergency fuel cell.',
        effects: { power: 15 },
        reserve: true,
      },
    ],
  },
  'greenhouse-failure': {
    id: 'greenhouse-failure',
    title: 'Greenhouse Failure',
    blurb: 'Grow lights are failing and the crops are wilting.',
    weight: 1,
    minDay: 5,
    requiresModule: 'greenhouse',
    choices: [
      {
        id: 'repair',
        label: 'Emergency Repair',
        detail: 'Restore lighting and irrigation immediately.',
        effects: { power: -8, water: -5, food: -3 },
      },
      {
        id: 'rations',
        label: 'Rely on Stored Rations',
        detail: 'Let the crops recover slowly. Food output is halved for 3 days.',
        effects: { food: -10 },
        modifier: { label: 'Crops recovering', daysLeft: 3, foodProd: 0.5 },
      },
      {
        id: 'reserve',
        label: 'Use Emergency Rations',
        detail: 'Open the emergency food stores.',
        effects: { food: 15 },
        reserve: true,
      },
    ],
  },
  'comms-failure': {
    id: 'comms-failure',
    title: 'Communication Failure',
    blurb: 'The Earth link has gone silent. Mission Control cannot hear you.',
    weight: 0.9,
    minDay: 4,
    choices: [
      {
        id: 'antenna',
        label: 'Manual Antenna Repair',
        detail: 'Send a crew member outside to realign the dish.',
        effects: { power: -6, health: -3 },
      },
      {
        id: 'wait',
        label: 'Wait for Reconnect',
        detail: 'Work offline. Research stalls without Earth data.',
        effects: { science: -8 },
      },
      {
        id: 'relay',
        label: 'Reroute via Rover Relay',
        detail: 'Use a rover as a temporary relay.',
        effects: { power: -3, science: -4 },
      },
    ],
  },
  illness: {
    id: 'illness',
    title: 'Crew Illness',
    blurb: 'An astronaut has come down with a fever. The crew is worried.',
    weight: 1,
    minDay: 3,
    mitigations: [
      { module: 'medical', mult: 0.5, keys: ['health'] },
      { assignment: 'crew-care', mult: 0.8, keys: ['health'] },
    ],
    choices: [
      {
        id: 'treat',
        label: 'Medical Treatment',
        detail: 'Full treatment uses water and food stores.',
        effects: { health: -4, water: -3, food: -2 },
      },
      {
        id: 'quarantine',
        label: 'Rest and Quarantine',
        detail: 'Isolate the patient. Work slows down.',
        effects: { health: -9, science: -6 },
      },
      {
        id: 'supplies',
        label: 'Emergency Medical Supplies',
        detail: 'Use the emergency medical kit.',
        effects: { health: 4 },
        reserve: true,
      },
    ],
  },
  'low-solar': {
    id: 'low-solar',
    title: 'Low Solar Energy',
    blurb: 'Long shadows are cutting sunlight to the panels.',
    weight: 1,
    minDay: 3,
    mitigations: [{ module: 'battery', mult: 0.7, keys: ['power'] }],
    choices: [
      {
        id: 'reduce',
        label: 'Reduce Power Use',
        detail: 'Dim non-essential systems for 3 days.',
        effects: { power: -4, science: -5 },
        modifier: { label: 'Reduced power load', daysLeft: 3, powerUse: 0.85 },
      },
      {
        id: 'divert',
        label: 'Run Full Systems',
        detail: 'Keep everything on and eat into the battery.',
        effects: { power: -16 },
      },
      {
        id: 'reserve',
        label: 'Fuel Cell Backup',
        detail: 'Switch to the emergency fuel cell.',
        effects: { power: 15 },
        reserve: true,
      },
    ],
  },
  discovery: {
    id: 'discovery',
    title: 'Scientific Discovery',
    blurb: 'Instruments have picked up a promising signal in the regolith.',
    weight: 0.8,
    minDay: 2,
    choices: [
      {
        id: 'full',
        label: 'Full Analysis',
        detail: 'Commit lab time and power for the biggest payoff.',
        effects: { science: 14, power: -8, water: -2 },
      },
      {
        id: 'quick',
        label: 'Quick Survey',
        detail: 'A light-touch scan with little cost.',
        effects: { science: 6, power: -2 },
      },
      {
        id: 'share',
        label: 'Share with Earth',
        detail: 'The crew are thrilled to share the news.',
        effects: { science: 8, health: 4 },
      },
    ],
  },
}
export const EVENT_LIST = Object.values(EVENTS)
