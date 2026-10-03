export const MODULES = [
  { id: 'solar', name: 'Solar Array', cost: 20, role: '+9 power every day', stat: 'POWER +' },
  { id: 'battery', name: 'Backup Battery', cost: 25, role: 'Softens blackouts, draws reserve power', stat: 'POWER RESERVE' },
  { id: 'water', name: 'Water Recycler', cost: 20, role: 'Recovers 2 water every day', stat: 'WATER +' },
  { id: 'greenhouse', name: 'Greenhouse', cost: 30, role: 'Grows food. Uses power and water', stat: 'FOOD +' },
  { id: 'shelter', name: 'Radiation Shelter', cost: 25, role: 'Halves radiation event damage', stat: 'RADIATION −' },
  { id: 'lab', name: 'Science Lab', cost: 25, role: '+25% science mission rewards', stat: 'SCIENCE +' },
  { id: 'medical', name: 'Medical Module', cost: 20, role: 'Faster health recovery', stat: 'HEALTH +' },
] as const

export type ModuleId = (typeof MODULES)[number]['id']
export const BUILD_CREDITS = 100
