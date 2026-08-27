export type PaymentMethodId =
  | 'card'
  | 'paypal'
  | 'paypal-later'
  | 'apple-pay'
  | 'clearpay'
  | 'klarna'

export type PaymentMethod = {
  id: PaymentMethodId
  label: string
  subtitle?: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card', label: 'Pay by card' },
  { id: 'paypal', label: 'PayPal' },
  {
    id: 'paypal-later',
    label: 'Pay Later',
    subtitle: 'Pay in 3 interest-free payments of £66.34',
  },
  { id: 'apple-pay', label: 'Apple Pay' },
  { id: 'clearpay', label: 'Clearpay' },
  { id: 'klarna', label: 'Klarna. Pay Later' },
]
