const BASE = 'https://api.postcodes.io'

export type PostcodeResult = {
  postcode: string
  latitude: number
  longitude: number
  admin_district: string | null
  parish: string | null
  admin_county: string | null
  region: string | null
  country: string
  outcode: string
  incode: string
}

type ApiResponse<T> = {
  status: number
  result: T
  error?: string
}

function normalizePostcode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, ' ')
}

export async function autocompletePostcode(
  partial: string,
  limit = 8,
): Promise<string[]> {
  const q = normalizePostcode(partial).replace(/\s/g, '')
  if (q.length < 2) return []

  const res = await fetch(
    `${BASE}/postcodes/${encodeURIComponent(q)}/autocomplete?limit=${limit}`,
  )
  if (!res.ok) return []
  const data = (await res.json()) as ApiResponse<string[] | null>
  return data.result ?? []
}

export async function lookupPostcode(
  postcode: string,
): Promise<PostcodeResult | null> {
  const pc = normalizePostcode(postcode)
  if (!pc) return null

  const res = await fetch(`${BASE}/postcodes/${encodeURIComponent(pc)}`)
  const data = (await res.json()) as ApiResponse<PostcodeResult | null>
  if (!res.ok || !data.result) return null
  return data.result
}

export async function validatePostcode(postcode: string): Promise<boolean> {
  const pc = normalizePostcode(postcode)
  if (!pc) return false

  const res = await fetch(`${BASE}/postcodes/${encodeURIComponent(pc)}/validate`)
  if (!res.ok) return false
  const data = (await res.json()) as ApiResponse<boolean>
  return Boolean(data.result)
}

/** Prefer a human-friendly place name from the postcode result. */
export function placeNameFromResult(result: PostcodeResult): string {
  const parish = result.parish?.replace(/, unparished area$/i, '').trim()
  if (parish && parish.toLowerCase() !== 'unparished area') return parish
  return result.admin_district ?? result.region ?? ''
}

export function milesBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
