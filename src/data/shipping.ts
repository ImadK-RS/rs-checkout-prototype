export type ShippingOption = {
  id: string
  name: string
  description: string
  eta: string
  price: number
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery within 5 days',
    eta: 'Delivered by Thur, 2 Jul',
    price: 0,
  },
  {
    id: 'next-day',
    name: 'Next Working Day',
    description: 'Order before 5:30pm',
    eta: 'Delivered by Fri, 27 Jun',
    price: 6.95,
  },
  {
    id: 'nominated',
    name: 'Nominated Weekday',
    description: 'Pick a day that suits you',
    eta: 'Choose your preferred day',
    price: 6.95,
  },
  {
    id: 'saturday',
    name: 'Saturday Delivery',
    description: 'Get it delivered on Saturday',
    eta: 'Delivered by Sat, 28 Jun',
    price: 9.95,
  },
]

export function formatMoney(amount: number): string {
  return `£${amount.toFixed(2)}`
}
