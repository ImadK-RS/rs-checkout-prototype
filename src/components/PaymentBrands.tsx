import {
  FaApplePay,
  FaCcAmex,
  FaCcMastercard,
  FaCcVisa,
  FaPaypal,
} from 'react-icons/fa'
import { SiKlarna } from 'react-icons/si'
import type { PaymentMethodId } from '../data/payments'

export function CardBrandIcons() {
  return (
    <span className="brand-icons" aria-hidden>
      <FaCcVisa title="Visa" />
      <FaCcAmex title="American Express" />
      <FaCcMastercard title="Mastercard" />
      <span className="maestro-badge">Maestro</span>
    </span>
  )
}

export function PaymentBrand({ method }: { method: PaymentMethodId }) {
  switch (method) {
    case 'card':
      return <CardBrandIcons />
    case 'paypal':
    case 'paypal-later':
      return (
        <span className="brand-icons paypal" aria-hidden>
          <FaPaypal />
        </span>
      )
    case 'apple-pay':
      return (
        <span className="brand-icons apple" aria-hidden>
          <FaApplePay />
        </span>
      )
    case 'clearpay':
      return (
        <span className="brand-icons clearpay" aria-hidden>
          Clearpay
        </span>
      )
    case 'klarna':
      return (
        <span className="brand-icons klarna" aria-hidden>
          <SiKlarna />
        </span>
      )
    default:
      return null
  }
}
