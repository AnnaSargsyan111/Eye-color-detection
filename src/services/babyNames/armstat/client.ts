// Thin HTTP layer for ArmStatBank's JSON-stat2 API, with the same
// lightweight-state convention the rest of this app uses (localStorage,
// no new dependencies) instead of a query-library cache.

import { ArmStatDataError } from './types'
import type { JsonStat2Response } from './types'

const CACHE_KEY_PREFIX = 'aira.armstat.cache.'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h — ArmStatBank publishes yearly, not intraday.

const memoryCache = new Map<string, JsonStat2Response>()

function readLocalStorageCache(url: string): JsonStat2Response | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY_PREFIX + url)
    if (!raw) return null
    const { savedAt, data } = JSON.parse(raw) as { savedAt: number; data: JsonStat2Response }
    if (Date.now() - savedAt > CACHE_TTL_MS) return null
    return data
  } catch {
    return null // Unavailable/corrupt cache is not an error — just fetch fresh.
  }
}

function writeLocalStorageCache(url: string, data: JsonStat2Response) {
  try {
    window.localStorage.setItem(CACHE_KEY_PREFIX + url, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Storage full/unavailable (private browsing, etc.) — in-memory cache still applies this session.
  }
}

/**
 * Fetches one ArmStatBank table as JSON-stat2, real network call every time
 * the cache is cold/expired — never mock data, never a static bundled file.
 * Cached in memory for this session and in localStorage across sessions.
 */
export async function fetchArmStatDataset(url: string): Promise<JsonStat2Response> {
  const cached = memoryCache.get(url) ?? (typeof window !== 'undefined' ? readLocalStorageCache(url) : null)
  if (cached) return cached

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      // Deliberately "text/plain", not "application/json": ArmStatBank parses
      // the body as JSON regardless of the declared content type, but
      // "application/json" is a CORS-preflighted header — and ArmStatBank's
      // server returns 400 on the OPTIONS preflight itself (verified against
      // the live API), which would block every request. "text/plain" is a
      // CORS-simple header, so the browser sends the POST directly; the
      // actual response already carries Access-Control-Allow-Origin: *.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ query: [], response: { format: 'json-stat2' } }),
    })
  } catch (err) {
    throw new ArmStatDataError(`Network error fetching ArmStatBank dataset (${url}): ${(err as Error).message}`)
  }

  if (!response.ok) {
    throw new ArmStatDataError(`ArmStatBank request failed: ${response.status} ${response.statusText} (${url})`)
  }

  let data: JsonStat2Response
  try {
    data = (await response.json()) as JsonStat2Response
  } catch (err) {
    throw new ArmStatDataError(`ArmStatBank response was not valid JSON (${url}): ${(err as Error).message}`)
  }

  memoryCache.set(url, data)
  if (typeof window !== 'undefined') writeLocalStorageCache(url, data)
  return data
}
