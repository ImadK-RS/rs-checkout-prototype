import { Info, MapPin, Store, Truck } from 'lucide-react'
import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { AddressLookup } from './AddressLookup'
import { CheckoutSection } from './CheckoutSection'
import { Header } from './Header'
import { OrderSummary } from './OrderSummary'
import { PaymentBrand } from './PaymentBrands'
import { PostcodeLookup } from './PostcodeLookup'
import { type PostcodeResult } from '../api/postcodes'
import { PAYMENT_METHODS, type PaymentMethodId } from '../data/payments'
import {
  SHIPPING_OPTIONS,
  formatMoney,
} from '../data/shipping'
import {
  findStoresNear,
  type StoreWithDistance,
} from '../data/stores'
import './Checkout.css'

type Section = 'details' | 'delivery' | 'billing' | 'payment'
type Fulfillment = 'delivery' | 'collect' | null
type GuestMode = boolean

type Person = {
  email: string
  firstName: string
  lastName: string
  phone: string
}

type AddressFields = {
  line1: string
  line2: string
  city: string
  postcode: string
}

const emptyAddress = (): AddressFields => ({
  line1: '',
  line2: '',
  city: '',
  postcode: '',
})

function addressLines(a: AddressFields): string {
  return [a.line1, a.line2, a.city, a.postcode].filter(Boolean).join(', ')
}

export function Checkout() {
  const [active, setActive] = useState<Section>('details')
  const [completed, setCompleted] = useState<Partial<Record<Section, boolean>>>(
    {},
  )
  const [isGuest, setIsGuest] = useState<GuestMode>(false)

  const [person, setPerson] = useState<Person>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [emailError, setEmailError] = useState('')

  const [fulfillment, setFulfillment] = useState<Fulfillment>(null)
  const [deliveryAddress, setDeliveryAddress] = useState<AddressFields>(
    emptyAddress(),
  )
  const [useForBilling, setUseForBilling] = useState(true)
  const [shippingId, setShippingId] = useState('standard')
  const [billingAddress, setBillingAddress] = useState<AddressFields>(
    emptyAddress(),
  )
  const [billingPerson, setBillingPerson] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })

  const [storePostcode, setStorePostcode] = useState('')
  const [stores, setStores] = useState<StoreWithDistance[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [showAllStores, setShowAllStores] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('card')
  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  })
  const [placed, setPlaced] = useState(false)

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) ?? null,
    [stores, selectedStoreId],
  )

  const shipping = useMemo(
    () =>
      SHIPPING_OPTIONS.find((o) => o.id === shippingId) ?? SHIPPING_OPTIONS[0],
    [shippingId],
  )

  const deliveryCost =
    fulfillment === 'delivery' ? (shipping?.price ?? 0) : 0
  const subtotal = 199.99
  const total = subtotal + deliveryCost

  const visibleStores = showAllStores ? stores : stores.slice(0, 3)

  function markComplete(section: Section) {
    setCompleted((c) => ({ ...c, [section]: true }))
  }

  function openSection(section: Section) {
    setActive(section)
    setPlaced(false)
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  }

  function continueFromDetails(e: FormEvent) {
    e.preventDefault()
    if (!isValidEmail(person.email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    setEmailError('')
    setIsGuest(false)
    markComplete('details')
    openSection('delivery')
  }

  function continueAsGuest() {
    setPerson((p) => ({
      ...p,
      email: p.email || 'guest@checkout.local',
    }))
    setEmailError('')
    setIsGuest(true)
    markComplete('details')
    openSection('delivery')
  }

  function onStorePostcodeLookup(result: PostcodeResult) {
    setStorePostcode(result.postcode)
    const found = findStoresNear(result.latitude, result.longitude)
    setStores(found)
    setSelectedStoreId(found[0]?.id ?? null)
    setShowAllStores(false)
  }

  function continueFromDelivery(e: FormEvent) {
    e.preventDefault()
    if (!fulfillment) return

    if (fulfillment === 'collect') {
      if (!selectedStore || !person.firstName || !person.lastName) return
      markComplete('delivery')
      setCompleted((c) => ({ ...c, billing: false, payment: false }))
      openSection('billing')
      return
    }

    if (!deliveryAddress.line1 || !deliveryAddress.postcode) return
    markComplete('delivery')

    if (useForBilling) {
      setBillingAddress(deliveryAddress)
      setBillingPerson({
        firstName: person.firstName,
        lastName: person.lastName,
        phone: person.phone,
      })
      markComplete('billing')
      openSection('payment')
    } else {
      setCompleted((c) => ({ ...c, billing: false, payment: false }))
      openSection('billing')
    }
  }

  function continueFromBilling(e: FormEvent) {
    e.preventDefault()
    if (!billingAddress.line1 || !billingAddress.postcode) return
    markComplete('billing')
    openSection('payment')
  }

  function placeOrder(e: FormEvent) {
    e.preventDefault()
    if (paymentMethod === 'card') {
      if (!card.name || !card.number || !card.expiry || !card.cvv) return
    }
    markComplete('payment')
    setPlaced(true)
  }

  const deliverySummary =
    fulfillment === 'collect' && selectedStore ? (
      <>
        <p>
          {person.firstName} {person.lastName}
          <br />
          {person.phone}
        </p>
        <div className="summary-method-row">
          <div>
            <strong>Click & Collect</strong>
            <p>
              {selectedStore.name}, {selectedStore.address}
              <br />
              {selectedStore.phone}
            </p>
          </div>
          <span>£0.00</span>
        </div>
      </>
    ) : fulfillment === 'delivery' ? (
      <>
        <p>
          {person.firstName} {person.lastName}
          <br />
          {person.phone}
          <br />
          {addressLines(deliveryAddress)}
        </p>
        <div className="summary-method-row">
          <span>
            {shipping.name} — {shipping.eta}
          </span>
          <span>{formatMoney(shipping.price)}</span>
        </div>
      </>
    ) : null

  return (
    <div className="checkout-page">
      <Header />

      <div className="checkout-grid">
        <div className="checkout-main">
          {/* 1. Your details */}
          <CheckoutSection
            step={1}
            title="Your details"
            active={active === 'details'}
            completed={!!completed.details}
            onEdit={() => openSection('details')}
            summary={
              <p>
                {isGuest ? 'Guest checkout' : person.email}
                {isGuest && person.email !== 'guest@checkout.local' && (
                  <>
                    <br />
                    <span className="muted">{person.email}</span>
                  </>
                )}
              </p>
            }
          >
            <form className="section-body" onSubmit={continueFromDetails}>
              <div className="copy-block">
                <h3>Enter your email address</h3>
                <p>We&apos;ll use this to send your order confirmation</p>
              </div>

              <div className={`field ${emailError ? 'has-error' : ''}`}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={person.email}
                  onChange={(e) => {
                    setPerson((p) => ({ ...p, email: e.target.value }))
                    if (emailError) setEmailError('')
                  }}
                  aria-invalid={!!emailError}
                />
                {emailError && <p className="field-error">{emailError}</p>}
              </div>

              <button type="submit" className="btn-primary btn-full">
                Continue
              </button>

              <div className="or-separator" role="separator">
                <span>or</span>
              </div>

              <div className="copy-block">
                <h3>Guest checkout</h3>
                <p>You can checkout as a guest.</p>
              </div>

              <button
                type="button"
                className="btn-secondary btn-full"
                onClick={continueAsGuest}
              >
                Continue as guest
              </button>
            </form>
          </CheckoutSection>

          {/* 2. Delivery or collection */}
          <CheckoutSection
            step={2}
            title="Delivery or collection"
            active={active === 'delivery'}
            completed={!!completed.delivery}
            onEdit={() => openSection('delivery')}
            summary={deliverySummary}
          >
            <form className="section-body" onSubmit={continueFromDelivery}>
              <div className="fulfillment-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={fulfillment === 'delivery'}
                  className={`fulfillment-tab ${fulfillment === 'delivery' ? 'is-selected' : ''}`}
                  onClick={() => setFulfillment('delivery')}
                >
                  <Truck size={18} strokeWidth={2.25} aria-hidden />
                  Delivery
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={fulfillment === 'collect'}
                  className={`fulfillment-tab ${fulfillment === 'collect' ? 'is-selected' : ''}`}
                  onClick={() => setFulfillment('collect')}
                >
                  <Store size={18} strokeWidth={2.25} aria-hidden />
                  Click & Collect
                </button>
              </div>

              {fulfillment === 'delivery' && (
                <DeliveryForm
                  person={person}
                  setPerson={setPerson}
                  address={deliveryAddress}
                  setAddress={setDeliveryAddress}
                  useForBilling={useForBilling}
                  setUseForBilling={setUseForBilling}
                  shippingId={shippingId}
                  setShippingId={setShippingId}
                />
              )}

              {fulfillment === 'collect' && (
                <CollectForm
                  person={person}
                  setPerson={setPerson}
                  storePostcode={storePostcode}
                  setStorePostcode={(value) => {
                    setStorePostcode(value)
                    setStores([])
                    setSelectedStoreId(null)
                  }}
                  onStorePostcodeLookup={onStorePostcodeLookup}
                  stores={visibleStores}
                  allCount={stores.length}
                  selectedStoreId={selectedStoreId}
                  setSelectedStoreId={setSelectedStoreId}
                  showAllStores={showAllStores}
                  setShowAllStores={setShowAllStores}
                />
              )}
            </form>
          </CheckoutSection>

          {/* 3. Billing */}
          <CheckoutSection
            step={3}
            title="Billing"
            active={active === 'billing'}
            completed={!!completed.billing}
            onEdit={() => openSection('billing')}
            summary={
              <p>
                {billingPerson.firstName} {billingPerson.lastName}
                <br />
                {billingPerson.phone}
                <br />
                {addressLines(billingAddress)}
              </p>
            }
          >
            <form className="section-body" onSubmit={continueFromBilling}>
              <div className="copy-block">
                <h3>Billing address</h3>
                <p>
                  {fulfillment === 'collect'
                    ? 'Enter the address associated with your payment method.'
                    : 'Your billing address is different from delivery.'}
                </p>
              </div>

              <div className="row-2">
                <div className="field">
                  <label htmlFor="bill-first">First name</label>
                  <input
                    id="bill-first"
                    value={billingPerson.firstName}
                    onChange={(e) =>
                      setBillingPerson((p) => ({
                        ...p,
                        firstName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="bill-last">Last name</label>
                  <input
                    id="bill-last"
                    value={billingPerson.lastName}
                    onChange={(e) =>
                      setBillingPerson((p) => ({
                        ...p,
                        lastName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="bill-phone">Phone number</label>
                <input
                  id="bill-phone"
                  placeholder="+44 7123456789"
                  value={billingPerson.phone}
                  onChange={(e) =>
                    setBillingPerson((p) => ({ ...p, phone: e.target.value }))
                  }
                  required
                />
              </div>

              <AddressLookup
                idPrefix="bill"
                value={billingAddress}
                onChange={(next) =>
                  setBillingAddress((a) => ({ ...a, ...next }))
                }
              />

              <button type="submit" className="btn-primary">
                Continue to Payment
              </button>
            </form>
          </CheckoutSection>

          {/* 4. Payment */}
          <CheckoutSection
            step={4}
            title="Payment Method"
            active={active === 'payment'}
            completed={!!completed.payment}
            summary={
              placed ? (
                <p>Order placed via {paymentMethodLabel(paymentMethod)}</p>
              ) : null
            }
          >
            <form className="section-body payment-body" onSubmit={placeOrder}>
              {placed ? (
                <div className="success-banner">
                  <h3>Thanks — your order is confirmed</h3>
                  <p>
                    Confirmation sent to{' '}
                    <strong>
                      {isGuest && person.email === 'guest@checkout.local'
                        ? 'your guest session'
                        : person.email}
                    </strong>
                    . Demo only — nothing was charged.
                  </p>
                </div>
              ) : (
                <>
                  <div className="payment-list">
                    {PAYMENT_METHODS.map((method) => {
                      const selected = paymentMethod === method.id
                      return (
                        <div
                          key={method.id}
                          className={`payment-option ${selected ? 'is-selected' : ''}`}
                        >
                          <label className="payment-option-header">
                            <input
                              type="radio"
                              name="payment"
                              checked={selected}
                              onChange={() => setPaymentMethod(method.id)}
                            />
                            <span className="payment-label-block">
                              <span className="payment-label">
                                {method.label}
                              </span>
                              {method.subtitle && (
                                <span className="payment-subtitle">
                                  {method.subtitle}
                                </span>
                              )}
                            </span>
                            <PaymentBrand method={method.id} />
                          </label>

                          {selected && method.id === 'card' && (
                            <div className="card-fields">
                              <div className="field">
                                <label htmlFor="card-name">Name on card</label>
                                <input
                                  id="card-name"
                                  value={card.name}
                                  onChange={(e) =>
                                    setCard((c) => ({
                                      ...c,
                                      name: e.target.value,
                                    }))
                                  }
                                  required
                                />
                              </div>
                              <div className="field">
                                <label htmlFor="card-number">Card Number</label>
                                <input
                                  id="card-number"
                                  inputMode="numeric"
                                  value={card.number}
                                  onChange={(e) =>
                                    setCard((c) => ({
                                      ...c,
                                      number: e.target.value,
                                    }))
                                  }
                                  required
                                />
                              </div>
                              <div className="row-2">
                                <div className="field">
                                  <label htmlFor="card-expiry">
                                    Expiration
                                  </label>
                                  <input
                                    id="card-expiry"
                                    placeholder="MM/YY"
                                    value={card.expiry}
                                    onChange={(e) =>
                                      setCard((c) => ({
                                        ...c,
                                        expiry: e.target.value,
                                      }))
                                    }
                                    required
                                  />
                                </div>
                                <div className="field">
                                  <label htmlFor="card-cvv">CVV</label>
                                  <input
                                    id="card-cvv"
                                    inputMode="numeric"
                                    value={card.cvv}
                                    onChange={(e) =>
                                      setCard((c) => ({
                                        ...c,
                                        cvv: e.target.value,
                                      }))
                                    }
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <p className="terms">
                    By proceeding with your purchase, you agree to our{' '}
                    <a href="#terms">Terms and Conditions</a>.
                  </p>

                  <div className="pay-total">
                    Total to pay: <strong>{formatMoney(total)}</strong>
                  </div>

                  <button type="submit" className="btn-primary btn-full">
                    Place Order
                  </button>
                </>
              )}
            </form>
          </CheckoutSection>
        </div>

        <OrderSummary deliveryCost={deliveryCost} total={total} />
      </div>
    </div>
  )
}

function paymentMethodLabel(id: PaymentMethodId) {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id
}

function DeliveryForm({
  person,
  setPerson,
  address,
  setAddress,
  useForBilling,
  setUseForBilling,
  shippingId,
  setShippingId,
}: {
  person: Person
  setPerson: Dispatch<SetStateAction<Person>>
  address: AddressFields
  setAddress: Dispatch<SetStateAction<AddressFields>>
  useForBilling: boolean
  setUseForBilling: (v: boolean) => void
  shippingId: string
  setShippingId: (id: string) => void
}) {
  const addressReady = Boolean(address.line1 && address.postcode)
  const [shippingLoading, setShippingLoading] = useState(false)

  useEffect(() => {
    if (!addressReady) {
      setShippingLoading(false)
      return
    }
    setShippingLoading(true)
    const timer = window.setTimeout(() => setShippingLoading(false), 900)
    return () => window.clearTimeout(timer)
  }, [addressReady, address.line1, address.postcode])

  return (
    <div className="delivery-form">
      <div className="row-2">
        <div className="field">
          <label htmlFor="del-first">First name</label>
          <input
            id="del-first"
            value={person.firstName}
            onChange={(e) =>
              setPerson((p) => ({ ...p, firstName: e.target.value }))
            }
            required
          />
        </div>
        <div className="field">
          <label htmlFor="del-last">Last name</label>
          <input
            id="del-last"
            value={person.lastName}
            onChange={(e) =>
              setPerson((p) => ({ ...p, lastName: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="del-phone">Phone number</label>
        <input
          id="del-phone"
          placeholder="+44 7123456789"
          value={person.phone}
          onChange={(e) => setPerson((p) => ({ ...p, phone: e.target.value }))}
          required
        />
      </div>

      <AddressLookup
        idPrefix="del"
        value={address}
        onChange={(next) => setAddress((a) => ({ ...a, ...next }))}
      />

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={useForBilling}
          onChange={(e) => setUseForBilling(e.target.checked)}
        />
        <span>Use this address for billing</span>
      </label>

      {addressReady && shippingLoading && <ShippingSkeleton />}

      {addressReady && !shippingLoading && (
        <div className="shipping-box">
          {SHIPPING_OPTIONS.map((option) => {
            const selected = option.id === shippingId
            return (
              <label
                key={option.id}
                className={`shipping-option ${selected ? 'is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={selected}
                  onChange={() => setShippingId(option.id)}
                />
                <span className="shipping-copy">
                  <span className="shipping-name">{option.name}</span>
                  <span className="shipping-desc">{option.description}</span>
                  <span className="shipping-eta">{option.eta}</span>
                </span>
                <span className="shipping-price">
                  {formatMoney(option.price)}
                </span>
              </label>
            )
          })}

          <div className="info-callout compact">
            <Info size={18} strokeWidth={2} aria-hidden />
            <p>Dispatch time may vary on weekends and bank holidays.</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={!addressReady || shippingLoading}
      >
        {useForBilling ? 'Continue to Payment' : 'Continue to Billing'}
      </button>
    </div>
  )
}

function ShippingSkeleton() {
  return (
    <div className="shipping-skeleton" aria-busy="true" aria-label="Loading delivery options">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton-bone skeleton-radio" />
          <span className="skeleton-lines">
            <span className="skeleton-bone skeleton-line w60" />
            <span className="skeleton-bone skeleton-line w80" />
            <span className="skeleton-bone skeleton-line w40" />
          </span>
          <span className="skeleton-bone skeleton-price" />
        </div>
      ))}
    </div>
  )
}

function CollectForm({
  person,
  setPerson,
  storePostcode,
  setStorePostcode,
  onStorePostcodeLookup,
  stores,
  allCount,
  selectedStoreId,
  setSelectedStoreId,
  showAllStores,
  setShowAllStores,
}: {
  person: Person
  setPerson: Dispatch<SetStateAction<Person>>
  storePostcode: string
  setStorePostcode: (v: string) => void
  onStorePostcodeLookup: (result: PostcodeResult) => void
  stores: StoreWithDistance[]
  allCount: number
  selectedStoreId: string | null
  setSelectedStoreId: (id: string) => void
  showAllStores: boolean
  setShowAllStores: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <div className="collect-form">
      <div className="copy-block">
        <h3>Find your nearest store</h3>
        <p>
          Enter your details and postcode to find the closest Richer Sounds
          store.
        </p>
      </div>

      <div className="row-2">
        <div className="field">
          <label htmlFor="cc-first">First name</label>
          <input
            id="cc-first"
            value={person.firstName}
            onChange={(e) =>
              setPerson((p) => ({ ...p, firstName: e.target.value }))
            }
            required
          />
        </div>
        <div className="field">
          <label htmlFor="cc-last">Last name</label>
          <input
            id="cc-last"
            value={person.lastName}
            onChange={(e) =>
              setPerson((p) => ({ ...p, lastName: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="cc-phone">Phone number</label>
        <input
          id="cc-phone"
          placeholder="+44 7123456789"
          value={person.phone}
          onChange={(e) => setPerson((p) => ({ ...p, phone: e.target.value }))}
          required
        />
      </div>

      <PostcodeLookup
        id="cc-postcode"
        label="Postcode"
        value={storePostcode}
        onChange={setStorePostcode}
        onLookup={onStorePostcodeLookup}
        buttonLabel="Find stores"
        required
      />

      {stores.length > 0 && (
        <div className="store-list">
          <div className="store-list-intro">
            <p className="store-list-title">Select a store</p>
            <p className="store-list-sub">
              <strong>FREE</strong> Collection <strong>7 days a week</strong>{' '}
              from 50 stores nationwide.
            </p>
          </div>

          {stores.map((store) => {
            const selected = store.id === selectedStoreId
            return (
              <div
                key={store.id}
                className={`store-card ${selected ? 'is-selected' : ''}`}
              >
                {store.closest && (
                  <span className="closest-badge">Closest store</span>
                )}
                <MapPin
                  size={18}
                  strokeWidth={2.25}
                  className="store-pin"
                  color={selected ? '#3181e8' : '#323232'}
                  aria-hidden
                />
                <div className="store-info">
                  <p className="store-name">{store.name}</p>
                  <p>{store.address}</p>
                  <p>{store.phone}</p>
                  <p className={selected ? 'store-hours-selected' : ''}>
                    {store.hours}
                  </p>
                </div>
                <div className="store-meta">
                  <span className={selected ? 'miles-selected' : ''}>
                    {store.miles.toFixed(1)} Miles
                  </span>
                  <button
                    type="button"
                    className={`store-select ${selected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedStoreId(store.id)}
                  >
                    {selected ? 'Selected' : 'Select store'}
                  </button>
                </div>
              </div>
            )
          })}

          {allCount > 3 && (
            <button
              type="button"
              className="link-btn show-all"
              onClick={() => setShowAllStores((v) => !v)}
            >
              {showAllStores ? 'Show fewer stores' : 'Show all stores'}
            </button>
          )}

          <div className="info-callout">
            <Info size={18} strokeWidth={2} aria-hidden />
            <div>
              <p>
                Order by 17:30 and collect your items the next working day.
              </p>
              <p>
                Order after 17:30 and collect from two working days.
              </p>
              <p>
                Order before 17:30 Thursday and you can collect your purchase
                Saturday or Sunday, if preferred.
              </p>
              <p>
                When your items arrive at our store, we will let you know and
                book a collection time that&apos;s convenient for you.
              </p>
              <p className="info-note">
                *Excluding weekends and bank holidays.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={!selectedStoreId}
      >
        Continue to Billing
      </button>
    </div>
  )
}