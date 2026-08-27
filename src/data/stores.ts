import { milesBetween } from '../api/postcodes'

export type Store = {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  latitude: number
  longitude: number
}

export type StoreWithDistance = Store & {
  miles: number
  closest?: boolean
}

export const STORES: Store[] = [
  {
    id: 'leeds',
    name: 'Leeds',
    address: '74 New Briggate, Leeds, LS1 6NU',
    phone: '0333 900 0025',
    hours: 'Open today until 6:00pm',
    latitude: 53.79999,
    longitude: -1.540665,
  },
  {
    id: 'prestwich',
    name: 'Prestwich',
    address: '415 Bury New Road, Prestwich, M25 1AA',
    phone: '0333 900 0042',
    hours: 'Open today until 6:00pm',
    latitude: 53.531139,
    longitude: -2.283867,
  },
  {
    id: 'stockport',
    name: 'Stockport',
    address: '58 Lower Hillgate Stockport, SK1 3AL',
    phone: '0333 900 0022',
    hours: 'Open today until 6:00pm',
    latitude: 53.40862,
    longitude: -2.155487,
  },
  {
    id: 'manchester',
    name: 'Manchester',
    address: '3 Deansgate, Manchester, M3 1AZ',
    phone: '0333 900 0031',
    hours: 'Open today until 6:00pm',
    latitude: 53.483945,
    longitude: -2.245078,
  },
  {
    id: 'bradford',
    name: 'Bradford',
    address: '12 Darley Street, Bradford, BD1 3HH',
    phone: '0333 900 0018',
    hours: 'Open today until 6:00pm',
    latitude: 53.795087,
    longitude: -1.753522,
  },
]

export function findStoresNear(
  latitude: number,
  longitude: number,
): StoreWithDistance[] {
  const ranked = STORES.map((store) => ({
    ...store,
    miles: milesBetween(latitude, longitude, store.latitude, store.longitude),
  })).sort((a, b) => a.miles - b.miles)

  return ranked.map((store, index) => ({
    ...store,
    closest: index === 0,
  }))
}
