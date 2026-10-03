import { getSpaceWeather, historicalFeed } from '@/lib/nasa/donki'

export async function GET(request: Request) {
  // Development-only switch used to test the offline fallback.
  const simulateOffline =
    process.env.NODE_ENV !== 'production' &&
    new URL(request.url).searchParams.get('simulate') === 'offline'

  const feed = simulateOffline ? historicalFeed('unavailable', new Date()) : await getSpaceWeather()
  return Response.json(feed, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' },
  })
}
