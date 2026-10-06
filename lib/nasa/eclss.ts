export interface EclssSystem {
  id: string
  name: string
  nasa: string
  game: string
}

export const ECLSS_SYSTEMS: EclssSystem[] = [
  {
    id: 'wrs',
    name: 'Water Recovery System',
    nasa: 'Recovers drinking water from cabin humidity and urine. NASA documents roughly 90% recovery as the reference capability.',
    game: 'The Water Recycler module returns +2.2 water per day against a baseline crew use of 2.5, about 88% of a baseline day.',
  },
  {
    id: 'ars',
    name: 'Air Revitalization System',
    nasa: 'Removes carbon dioxide and trace contaminants so cabin air stays breathable.',
    game: 'Represented by the Oxygen meter and the Oxygen Recycler Failure emergency.',
  },
  {
    id: 'ogs',
    name: 'Oxygen Generation System',
    nasa: 'Splits water into oxygen and hydrogen with electrolysis to supply breathing oxygen.',
    game: 'Represented by oxygen use each day. A power shortage throttles life support and drains oxygen faster.',
  },
]

export const WHY_THIS_MATTERS: Record<string, string> = {
  'water-leak':
    'NASA life-support systems recycle water because carrying replacement water for long missions is extremely resource-intensive.',
  'oxygen-failure':
    'Spacecraft cannot open a window. Air systems must clean and renew cabin air continuously, so a failure becomes urgent fast.',
  'solar-radiation':
    'Away from Earth\u2019s protective magnetic field, crews depend on shelter and monitoring when solar particle events occur.',
}
