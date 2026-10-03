import { pickHistorical } from './historical'
import type { NasaEvent, NasaFeed, NasaKind } from './types'

const BASE = 'https://ccmc.gsfc.nasa.gov/DONKI-API/get'
const WINDOW_DAYS = 14
const TIMEOUT_MS = 6000

// The current DONKI host does not require a key. NASA_API_KEY (or DEMO_KEY for development)
// is still sent server-side so the call keeps working if a keyed gateway is used again.
const apiKey = () => process.env.NASA_API_KEY || 'DEMO_KEY'

const ymd = (d: Date) => d.toISOString().slice(0, 10)

async function fetchList(kind: NasaKind, start: Date, end: Date): Promise<Record<string, unknown>[]> {
  const url = `${BASE}/${kind}?startDate=${ymd(start)}&endDate=${ymd(end)}&api_key=${apiKey()}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: 900 },
  })
  if (!res.ok) throw new Error(`DONKI ${kind} responded ${res.status}`)
  const body: unknown = await res.json().catch(() => [])
  return Array.isArray(body) ? (body as Record<string, unknown>[]) : []
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')

function flareEvents(rows: Record<string, unknown>[]): NasaEvent[] {
  return rows
    .filter((r) => /^[MX]/.test(str(r.classType)))
    .map((r) => {
      const classType = str(r.classType)
      const region = r.activeRegionNum ? `Active region ${r.activeRegionNum}. ` : ''
      const loc = str(r.sourceLocation) ? `Source location ${str(r.sourceLocation)}.` : ''
      return {
        id: str(r.flrID),
        kind: 'FLR' as const,
        time: str(r.peakTime) || str(r.beginTime),
        title: `${classType} Solar Flare`,
        detail: `${region}${loc}`.trim() || 'Flare peak reported by DONKI.',
        link: str(r.link),
        classType,
      }
    })
}

function cmeEvents(rows: Record<string, unknown>[]): NasaEvent[] {
  return rows.map((r) => {
    const analyses = Array.isArray(r.cmeAnalyses) ? (r.cmeAnalyses as Record<string, unknown>[]) : []
    const speed = analyses.map((a) => Number(a.speed)).find((n) => Number.isFinite(n) && n > 0)
    return {
      id: str(r.activityID),
      kind: 'CME' as const,
      time: str(r.startTime),
      title: 'Coronal Mass Ejection',
      detail: speed
        ? `DONKI analysis reports a speed of about ${Math.round(speed).toLocaleString('en-US')} km/s.`
        : 'Observed by coronagraph instruments. No speed analysis yet.',
      link: str(r.link),
      speedKms: speed ? Math.round(speed) : undefined,
    }
  })
}

function sepEvents(rows: Record<string, unknown>[]): NasaEvent[] {
  return rows.map((r) => ({
    id: str(r.sepID),
    kind: 'SEP' as const,
    time: str(r.eventTime),
    title: 'Solar Energetic Particle Event',
    detail: 'Energetic particle increase detected by GOES instruments.',
    link: str(r.link),
  }))
}

function historicalFeed(reason: 'quiet' | 'unavailable', now: Date): NasaFeed {
  return {
    status: 'historical',
    reason,
    source: 'NASA DONKI',
    fetchedAt: now.toISOString(),
    windowDays: WINDOW_DAYS,
    event: pickHistorical(now),
  }
}

export async function getSpaceWeather(now = new Date()): Promise<NasaFeed> {
  const start = new Date(now.getTime() - WINDOW_DAYS * 86_400_000)
  try {
    const [flr, cme, sep] = await Promise.all([
      fetchList('FLR', start, now),
      fetchList('CME', start, now),
      fetchList('SEP', start, now),
    ])
    const events = [...flareEvents(flr), ...cmeEvents(cme), ...sepEvents(sep)]
      .filter((e) => e.id && Number.isFinite(Date.parse(e.time)))
      .sort((a, b) => Date.parse(b.time) - Date.parse(a.time))
    if (!events.length) return historicalFeed('quiet', now)
    return {
      status: 'live',
      source: 'NASA DONKI',
      fetchedAt: now.toISOString(),
      windowDays: WINDOW_DAYS,
      event: events[0],
    }
  } catch {
    return historicalFeed('unavailable', now)
  }
}

export { historicalFeed }
