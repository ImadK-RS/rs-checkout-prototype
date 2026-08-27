import { Tag } from 'lucide-react'
import { formatMoney } from '../data/shipping'

type Props = {
  deliveryCost: number
  total: number
}

export function OrderSummary({ deliveryCost, total }: Props) {
  return (
    <aside className="order-summary">
      <div className="summary-header">
        <h2>Order summary</h2>
        <button type="button" className="link-btn link-red">
          Edit basket
        </button>
      </div>

      <div className="summary-item">
        <div className="product-thumb" aria-hidden />
        <p className="product-name">1x Polk Audio Signa S2 (Black)</p>
        <p className="product-price">£199.99</p>
      </div>

      <hr />

      <button type="button" className="promo-link">
        <Tag size={18} strokeWidth={2.25} aria-hidden />
        Add a promo code
      </button>

      <hr />

      <div className="price-rows">
        <div>
          <span>Subtotal:</span>
          <span>£199.99</span>
        </div>
        <div>
          <span>Delivery</span>
          <span>{formatMoney(deliveryCost)}</span>
        </div>
      </div>

      <hr />

      <div className="total-row">
        <span>Total:</span>
        <strong>{formatMoney(total)}</strong>
      </div>
    </aside>
  )
}
