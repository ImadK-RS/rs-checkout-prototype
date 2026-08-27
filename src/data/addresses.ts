export type Address = {
  id: string
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
}

/** Curated demo properties for common postcodes. */
export const ADDRESSES: Address[] = [
  {
    id: 'hd1-1',
    line1: 'Flat 1, 12 Market Street',
    line2: 'Town Centre',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 3SJ',
  },
  {
    id: 'hd1-2',
    line1: 'Flat 2, 12 Market Street',
    line2: 'Town Centre',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 3SJ',
  },
  {
    id: 'hd1-3',
    line1: '20 Northfield Grove',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 3SJ',
  },
  {
    id: 'hd1-4',
    line1: '22 Northfield Grove',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 3SJ',
  },
  {
    id: 'hd1-5',
    line1: 'Unit 3, 4 Chapel Hill',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 3SJ',
  },
  {
    id: 'hd1-6',
    line1: 'Apartment 7, Lockwood House',
    line2: '8 Chapel Hill',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 3SJ',
  },
  {
    id: 'hd1-2rr-1',
    line1: '45 Queensgate',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 2RR',
  },
  {
    id: 'hd1-2rr-2',
    line1: 'Flat B, 47 Queensgate',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 2RR',
  },
  {
    id: 'hd1-1jf-1',
    line1: '8 St George\'s Square',
    city: 'Huddersfield',
    county: 'West Yorkshire',
    postcode: 'HD1 1JF',
  },
  {
    id: 'ls1-1',
    line1: '74 New Briggate',
    city: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 6NU',
  },
  {
    id: 'ls1-2',
    line1: 'Flat 4, 76 New Briggate',
    city: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 6NU',
  },
  {
    id: 'ls1-3',
    line1: 'Unit 1, 22 Albion Street',
    city: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 6AD',
  },
  {
    id: 'ls1-4',
    line1: '15 The Headrow',
    city: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 6PU',
  },
  {
    id: 'm25-1',
    line1: '415 Bury New Road',
    city: 'Prestwich',
    county: 'Greater Manchester',
    postcode: 'M25 1AA',
  },
  {
    id: 'm25-2',
    line1: 'Flat 1, 417 Bury New Road',
    city: 'Prestwich',
    county: 'Greater Manchester',
    postcode: 'M25 1AA',
  },
  {
    id: 'sk1-1',
    line1: '58 Lower Hillgate',
    city: 'Stockport',
    county: 'Greater Manchester',
    postcode: 'SK1 3AL',
  },
  {
    id: 'm3-1',
    line1: '3 Deansgate',
    city: 'Manchester',
    county: 'Greater Manchester',
    postcode: 'M3 1AZ',
  },
  {
    id: 'm3-2',
    line1: 'Apartment 12, 5 Deansgate',
    city: 'Manchester',
    county: 'Greater Manchester',
    postcode: 'M3 1AZ',
  },
  {
    id: 'm1-1',
    line1: '100 Oxford Street',
    city: 'Manchester',
    county: 'Greater Manchester',
    postcode: 'M1 5EJ',
  },
  {
    id: 'm2-1',
    line1: '27 King Street',
    city: 'Manchester',
    county: 'Greater Manchester',
    postcode: 'M2 6AG',
  },
  {
    id: 'b1-1',
    line1: '9 Victoria Square',
    city: 'Birmingham',
    county: 'West Midlands',
    postcode: 'B1 1BD',
  },
  {
    id: 'b2-1',
    line1: '41 Corporation Street',
    city: 'Birmingham',
    county: 'West Midlands',
    postcode: 'B2 4LP',
  },
  {
    id: 'w1-1',
    line1: '14 Piccadilly',
    city: 'London',
    postcode: 'W1J 0DN',
  },
  {
    id: 'nw1-1',
    line1: '221B Baker Street',
    city: 'London',
    postcode: 'NW1 6XE',
  },
]

const STREET_NAMES = [
  'High Street',
  'Church Road',
  'Station Road',
  'Park Avenue',
  'Victoria Street',
  'King Street',
  'Queen Street',
  'Mill Lane',
  'Chapel Street',
  'Northfield Grove',
]

function normalizePc(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Exact curated matches, then same-outcode matches. */
export function addressesForPostcode(postcode: string): Address[] {
  const compact = normalizePc(postcode)
  if (!compact) return []

  const exact = ADDRESSES.filter((a) => normalizePc(a.postcode) === compact)
  if (exact.length > 0) return exact

  const outcode = compact.slice(0, Math.max(compact.length - 3, 1))
  return ADDRESSES.filter((a) =>
    normalizePc(a.postcode).startsWith(outcode),
  ).slice(0, 8)
}

/**
 * Always returns a selectable list of property-level addresses for a
 * Postcodes.io-validated postcode (door / flat / unit).
 * Postcodes.io has no PAF data — curated + generated demo properties.
 */
export function buildAddressChoices(
  postcode: string,
  city: string,
  county?: string | null,
): Address[] {
  const areaCounty = county ?? undefined
  const choices: Address[] = addressesForPostcode(postcode).map((a) => ({
    ...a,
    postcode,
    city: a.city || city,
    county: a.county ?? areaCounty,
  }))

  if (choices.length >= 4) return choices

  const seed = hashString(normalizePc(postcode) || city)
  const street = STREET_NAMES[seed % STREET_NAMES.length]
  const street2 = STREET_NAMES[(seed + 3) % STREET_NAMES.length]
  const base = 2 + (seed % 40)

  const generated: Address[] = [
    {
      id: `${postcode}-flat-1`,
      line1: `Flat 1, ${base} ${street}`,
      city,
      county: areaCounty,
      postcode,
    },
    {
      id: `${postcode}-flat-2`,
      line1: `Flat 2, ${base} ${street}`,
      city,
      county: areaCounty,
      postcode,
    },
    {
      id: `${postcode}-house`,
      line1: `${base + 2} ${street}`,
      city,
      county: areaCounty,
      postcode,
    },
    {
      id: `${postcode}-house-b`,
      line1: `${base + 4} ${street}`,
      city,
      county: areaCounty,
      postcode,
    },
    {
      id: `${postcode}-unit`,
      line1: `Unit 3, ${base + 6} ${street2}`,
      city,
      county: areaCounty,
      postcode,
    },
    {
      id: `${postcode}-apt`,
      line1: `Apartment 12, ${street2} House`,
      line2: `${base + 8} ${street2}`,
      city,
      county: areaCounty,
      postcode,
    },
    {
      id: `${postcode}-ground`,
      line1: `Ground Floor, ${base + 10} ${street}`,
      city,
      county: areaCounty,
      postcode,
    },
    {
      id: `${postcode}-studio`,
      line1: `Studio 5, ${base + 12} ${street2}`,
      city,
      county: areaCounty,
      postcode,
    },
  ]

  const seen = new Set(choices.map((a) => a.line1.toLowerCase()))
  for (const item of generated) {
    if (!seen.has(item.line1.toLowerCase())) {
      choices.push(item)
      seen.add(item.line1.toLowerCase())
    }
    if (choices.length >= 8) break
  }

  return choices
}

export function searchAddresses(query: string, limit = 6): Address[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ')
  if (q.length < 2) return []

  return ADDRESSES.filter((a) => {
    const haystack = [a.line1, a.line2, a.city, a.county, a.postcode]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return (
      haystack.includes(q) ||
      normalizePc(a.postcode).includes(q.replace(/\s/g, '').toUpperCase())
    )
  }).slice(0, limit)
}

export function formatAddress(a: Address): string {
  return [a.line1, a.line2, a.city, a.county, a.postcode].filter(Boolean).join(', ')
}
