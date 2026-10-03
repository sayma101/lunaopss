export const MODULES = [
  { id: 'solar', name: 'Solar Array', cost: 20, role: 'Generates power from sunlight', stat: 'POWER +' },
  { id: 'battery', name: 'Backup Battery', cost: 15, role: 'Stores energy for the lunar night', stat: 'POWER RESERVE' },
  { id: 'water', name: 'Water Recycler', cost: 20, role: 'Reclaims water from crew systems', stat: 'WATER +' },
  { id: 'greenhouse', name: 'Greenhouse', cost: 25, role: 'Grows food and refreshes oxygen', stat: 'FOOD / O2 +' },
  { id: 'shelter', name: 'Radiation Shelter', cost: 20, role: 'Protects crew during solar storms', stat: 'RADIATION −' },
  { id: 'lab', name: 'Science Lab', cost: 25, role: 'Unlocks research and discoveries', stat: 'SCIENCE +' },
  { id: 'medical', name: 'Medical Module', cost: 15, role: 'Keeps astronauts healthy', stat: 'HEALTH +' },
] as const

export type ModuleId = (typeof MODULES)[number]['id']
export const BUILD_CREDITS = 100
