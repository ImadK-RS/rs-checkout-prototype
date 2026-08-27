import { useEffect, useId, useState } from 'react'
import {
  lookupPostcode,
  placeNameFromResult,
  type PostcodeResult,
} from '../api/postcodes'
import { type Address, buildAddressChoices } from '../data/addresses'
import './PostcodeLookup.css'
import './AddressLookup.css'

export type AddressValue = {
  line1: string
  line2: string
  city: string
  postcode: string
}

type Props = {
  idPrefix: string
  value: AddressValue
  onChange: (next: Partial<AddressValue>) => void
  onResolved?: (result: PostcodeResult) => void
}

export function AddressLookup({
  idPrefix,
  value,
  onChange,
  onResolved,
}: Props) {
  const listId = useId()
  const [postcodeInput, setPostcodeInput] = useState(value.postcode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matches, setMatches] = useState<Address[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [manual, setManual] = useState(Boolean(value.line1))

  useEffect(() => {
    setPostcodeInput(value.postcode)
  }, [value.postcode])

  async function findAddress() {
    setError('')
    setLoading(true)
    try {
      const result = await lookupPostcode(postcodeInput)
      if (!result) {
        setError('Please enter a valid UK postcode')
        setMatches([])
        setShowPicker(false)
        return
      }

      const city = placeNameFromResult(result)
      const choices = buildAddressChoices(
        result.postcode,
        city,
        result.admin_county,
      )

      setPostcodeInput(result.postcode)
      setMatches(choices)
      setShowPicker(true)
      setManual(false)
      // Clear previous property selection until user picks one
      onChange({
        line1: '',
        line2: '',
        city,
        postcode: result.postcode,
      })
      onResolved?.(result)
    } catch {
      setError('Could not look up that postcode. Try again.')
      setMatches([])
      setShowPicker(false)
    } finally {
      setLoading(false)
    }
  }

  function pickAddress(address: Address) {
    onChange({
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      postcode: address.postcode,
    })
    setPostcodeInput(address.postcode)
    setShowPicker(false)
    setManual(true)
  }

  function enterManually() {
    setShowPicker(false)
    setManual(true)
  }

  return (
    <div className="address-lookup">
      <div className="postcode-lookup with-button">
        <label htmlFor={`${idPrefix}-postcode-search`}>Postcode</label>
        <div className="postcode-lookup-row">
          <div className="postcode-lookup-input-wrap">
            <input
              id={`${idPrefix}-postcode-search`}
              type="text"
              autoComplete="postal-code"
              placeholder="e.g. HD1 3SJ"
              value={postcodeInput}
              onChange={(e) => {
                setPostcodeInput(e.target.value.toUpperCase())
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void findAddress()
                }
              }}
            />
          </div>
          <button
            type="button"
            className="btn-primary find-stores"
            disabled={loading || !postcodeInput.trim()}
            onClick={() => void findAddress()}
          >
            {loading ? 'Searching…' : 'Find address'}
          </button>
        </div>
        {error && <p className="field-error">{error}</p>}
      </div>

      {showPicker && matches.length > 0 && (
        <div className="address-picker" id={listId}>
          <p className="address-picker-title">
            {matches.length} addresses found — select yours
          </p>
          <ul role="listbox">
            {matches.map((address) => (
              <li key={address.id} role="option">
                <button type="button" onClick={() => pickAddress(address)}>
                  <span className="suggestion-line">{address.line1}</span>
                  {address.line2 && (
                    <span className="suggestion-meta">{address.line2}</span>
                  )}
                  <span className="suggestion-meta">
                    {[address.city, address.postcode].join(', ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="link-btn enter-manual"
            onClick={enterManually}
          >
            Enter address manually
          </button>
        </div>
      )}

      {manual && (
        <>
          <div className="field">
            <label htmlFor={`${idPrefix}-line1`}>Address line 1</label>
            <input
              id={`${idPrefix}-line1`}
              value={value.line1}
              required
              placeholder="House number and street"
              onChange={(e) => onChange({ line1: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor={`${idPrefix}-line2`}>Address line 2 (optional)</label>
            <input
              id={`${idPrefix}-line2`}
              value={value.line2}
              onChange={(e) => onChange({ line2: e.target.value })}
            />
          </div>

          <div className="row-2">
            <div className="field">
              <label htmlFor={`${idPrefix}-city`}>City</label>
              <input
                id={`${idPrefix}-city`}
                value={value.city}
                required
                onChange={(e) => onChange({ city: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor={`${idPrefix}-postcode`}>Postcode</label>
              <input
                id={`${idPrefix}-postcode`}
                value={value.postcode}
                required
                onChange={(e) =>
                  onChange({ postcode: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>

          {!showPicker && value.postcode && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                if (matches.length > 0) setShowPicker(true)
                else void findAddress()
              }}
            >
              Choose a different address
            </button>
          )}
        </>
      )}
    </div>
  )
}
