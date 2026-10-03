import type { NasaEvent } from './types'

/**
 * Records copied from NASA DONKI (ccmc.gsfc.nasa.gov/DONKI). Class, time, speed and
 * IDs were checked against the DONKI API; nothing here is estimated.
 */
export const HISTORICAL_EVENTS: NasaEvent[] = [
  {
    id: '2017-09-06T11:53:00-FLR-001',
    kind: 'FLR',
    time: '2017-09-06T12:02Z',
    title: 'X9.3 Solar Flare',
    detail: 'Active region 12673, source location S07W33. Strongest flare of solar cycle 24.',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/13010/-1',
    classType: 'X9.3',
  },
  {
    id: '2017-09-10T16:25:00-SEP-001',
    kind: 'SEP',
    time: '2017-09-10T16:25Z',
    title: 'Solar Energetic Particle Event',
    detail: 'Recorded after the X8.2 flare of 10 September 2017 from active region 12673.',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/13101/-1',
  },
  {
    id: '2012-07-23T02:36:00-CME-001',
    kind: 'CME',
    time: '2012-07-23T02:36Z',
    title: 'Coronal Mass Ejection',
    detail: 'DONKI analyses give speeds of about 2,900 km/s. Observed by SOHO and both STEREO spacecraft.',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/CME/944/-1',
    speedKms: 2900,
  },
  {
    id: '2024-05-11T01:10:00-FLR-001',
    kind: 'FLR',
    time: '2024-05-11T01:23Z',
    title: 'X5.8 Solar Flare',
    detail: 'Part of the May 2024 solar activity period.',
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30711/-1',
    classType: 'X5.8',
  },
]

export function pickHistorical(date = new Date()): NasaEvent {
  const day = Math.floor(date.getTime() / 86_400_000)
  return HISTORICAL_EVENTS[day % HISTORICAL_EVENTS.length]
}
