import { Tag } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { formatMoney } from '../data/shipping'

type Props = {
  deliveryCost: number
  total: number
  promoCode: string
  promoDiscount: number
  onApplyPromo: (code: string) => { ok: boolean; message: string }
}

export function OrderSummary({
  deliveryCost,
  total,
  promoCode,
  promoDiscount,
  onApplyPromo,
}: Props) {
  const [expanded, setExpanded] = useState(Boolean(promoCode))
  const [draft, setDraft] = useState(promoCode)
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(Boolean(promoCode))

  function submitPromo(e: FormEvent) {
    e.preventDefault()
    const result = onApplyPromo(draft.trim())
    setOk(result.ok)
    setMessage(result.message)
  }

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

      {!expanded ? (
        <button
          type="button"
          className="promo-link"
          onClick={() => setExpanded(true)}
        >
          <Tag size={18} strokeWidth={2.25} aria-hidden />
          Add a promo code
        </button>
      ) : (
        <form className="promo-expand field" onSubmit={submitPromo}>
          <label htmlFor="promo-code">Promo code</label>
          <div className="promo-row">
            <input
              id="promo-code"
              value={draft}
              autoFocus
              placeholder="e.g. RICHER10"
              onChange={(e) => {
                setDraft(e.target.value.toUpperCase())
                setMessage('')
              }}
            />
            <button type="submit" className="btn-primary promo-apply">
              Apply
            </button>
          </div>
          {message && (
            <p className={`promo-message ${ok ? 'is-ok' : 'is-error'}`}>
              {message}
            </p>
          )}
          {promoCode && promoDiscount > 0 && (
            <p className="promo-applied-line">
              {promoCode} — saving {formatMoney(promoDiscount)}
            </p>
          )}
        </form>
      )}

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
        {promoDiscount > 0 && (
          <div className="promo-discount-row">
            <span>Promo</span>
            <span>−{formatMoney(promoDiscount)}</span>
          </div>
        )}
      </div>

      <hr />

      <div className="total-row">
        <span>Total:</span>
        <strong>{formatMoney(total)}</strong>
      </div>
    </aside>
  )
}
