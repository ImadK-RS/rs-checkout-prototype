import { CalendarDays, Mail, Package, Receipt } from 'lucide-react'
import { LottiePlayer, lottieUrl } from './LottiePlayer'
import { formatMoney } from '../data/shipping'
import './OrderConfirmation.css'

export type OrderConfirmationDetails = {
  orderNumber: string
  email: string
  estimatedDate: string
  productName: string
  productPrice: number
  deliveryCost: number
  total: number
  promoCode?: string
  promoDiscount?: number
  fulfillmentLabel: string
}

type Props = {
  details: OrderConfirmationDetails
  onContinueShopping?: () => void
}

export function OrderConfirmation({ details, onContinueShopping }: Props) {
  const discount = details.promoDiscount ?? 0

  return (
    <div className="order-confirmation page-enter">
      <div className="confirmation-card">
        <div className="confirmation-lottie">
          <LottiePlayer
            src={lottieUrl('success')}
            loop={false}
            className="confirmation-lottie-anim"
          />
        </div>

        <p className="confirmation-eyebrow">Payment successful</p>
        <h1>Thanks — your order is confirmed</h1>
        <p className="confirmation-lead">
          We&apos;ve sent a confirmation to{' '}
          <strong>{details.email}</strong>.
        </p>

        <div className="confirmation-meta">
          <div className="meta-item">
            <Receipt size={18} aria-hidden />
            <div>
              <span className="meta-label">Order number</span>
              <strong>{details.orderNumber}</strong>
            </div>
          </div>
          <div className="meta-item">
            <Mail size={18} aria-hidden />
            <div>
              <span className="meta-label">Email</span>
              <strong>{details.email}</strong>
            </div>
          </div>
          <div className="meta-item">
            <CalendarDays size={18} aria-hidden />
            <div>
              <span className="meta-label">Estimated</span>
              <strong>{details.estimatedDate}</strong>
            </div>
          </div>
          <div className="meta-item">
            <Package size={18} aria-hidden />
            <div>
              <span className="meta-label">Fulfilment</span>
              <strong>{details.fulfillmentLabel}</strong>
            </div>
          </div>
        </div>

        <div className="confirmation-summary">
          <h2>Order summary</h2>
          <div className="confirmation-item">
            <div className="product-thumb" aria-hidden />
            <p className="product-name">{details.productName}</p>
            <p className="product-price">{formatMoney(details.productPrice)}</p>
          </div>
          <div className="confirmation-rows">
            <div>
              <span>Subtotal</span>
              <span>{formatMoney(details.productPrice)}</span>
            </div>
            <div>
              <span>Delivery</span>
              <span>{formatMoney(details.deliveryCost)}</span>
            </div>
            {details.promoCode && (
              <div className="promo-applied">
                <span>Promo ({details.promoCode})</span>
                <span>−{formatMoney(discount)}</span>
              </div>
            )}
            <div className="confirmation-total">
              <span>Total paid</span>
              <strong>{formatMoney(details.total)}</strong>
            </div>
          </div>
        </div>

        {onContinueShopping && (
          <button
            type="button"
            className="btn-primary btn-full"
            onClick={onContinueShopping}
          >
            Continue shopping
          </button>
        )}
      </div>
    </div>
  )
}
