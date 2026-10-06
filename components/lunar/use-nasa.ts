'use client'

import useSWR from 'swr'
import { pickHistorical } from '@/lib/nasa/historical'
import type { NasaFeed } from '@/lib/nasa/types'

async function fetcher(url: string): Promise<NasaFeed> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`NASA route responded ${res.status}`)
  return res.json()
}

const offlineFeed = (): NasaFeed => ({
  status: 'historical',
  reason: 'unavailable',
  source: 'NASA DONKI',
  fetchedAt: new Date().toISOString(),
  windowDays: 14,
  event: pickHistorical(),
})

/** Never throws and never blocks the game: a failed request resolves to the bundled historical set. */
export function useNasaFeed() {
  const params = typeof window === 'undefined' ? '' : window.location.search
  const simulate = params.includes('nasa=offline') ? '?simulate=offline' : ''
  const { data, error, isLoading } = useSWR(`/api/nasa/space-weather${simulate}`, fetcher, {
    refreshInterval: 30 * 60_000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
  const feed: NasaFeed | null = data ?? (error ? offlineFeed() : null)
  return { feed, loading: isLoading && !feed }
}
