import { useEffect, useId, useRef, useState } from 'react'
import {
  autocompletePostcode,
  lookupPostcode,
  type PostcodeResult,
} from '../api/postcodes'
import { LottiePlayer, lottieUrl } from './LottiePlayer'
import './PostcodeLookup.css'

type Props = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  onLookup: (result: PostcodeResult) => void
  buttonLabel?: string
  placeholder?: string
  required?: boolean
  /** When false, renders input only (no Find button) — still supports autocomplete + Enter to lookup. */
  showButton?: boolean
}

export function PostcodeLookup({
  id,
  label = 'Postcode',
  value,
  onChange,
  onLookup,
  buttonLabel = 'Find',
  placeholder = 'e.g. HD1 3SJ',
  required,
  showButton = true,
}: Props) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [highlight, setHighlight] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) {
      setSuggestions([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const results = await autocompletePostcode(q)
        if (!cancelled) {
          setSuggestions(results)
          setHighlight(0)
        }
      } catch {
        if (!cancelled) setSuggestions([])
      }
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [value])

  async function runLookup(postcode = value) {
    setError('')
    setLoading(true)
    setOpen(false)
    const started = Date.now()
    try {
      const result = await lookupPostcode(postcode)
      const wait = Math.max(0, 650 - (Date.now() - started))
      if (wait) await new Promise((r) => setTimeout(r, wait))
      if (!result) {
        setError('Please enter a valid UK postcode')
        return
      }
      onChange(result.postcode)
      onLookup(result)
    } catch {
      setError('Could not look up that postcode. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function pickSuggestion(pc: string) {
    onChange(pc)
    setOpen(false)
    void runLookup(pc)
  }

  return (
    <div
      className={`postcode-lookup ${showButton ? 'with-button' : ''}`}
      ref={rootRef}
    >
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="postcode-lookup-row">
        <div className="postcode-lookup-input-wrap">
          <input
            id={inputId}
            type="text"
            autoComplete="postal-code"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={`${inputId}-list`}
            aria-autocomplete="list"
            placeholder={placeholder}
            value={value}
            required={required}
            aria-invalid={!!error}
            onChange={(e) => {
              onChange(e.target.value.toUpperCase())
              setError('')
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              if (showButton) return
              window.setTimeout(() => {
                if (!rootRef.current?.contains(document.activeElement) && value.trim().length >= 5) {
                  void runLookup()
                }
              }, 150)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' && suggestions.length) {
                e.preventDefault()
                setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
              } else if (e.key === 'ArrowUp' && suggestions.length) {
                e.preventDefault()
                setHighlight((h) => Math.max(h - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                if (open && suggestions.length > 0) {
                  pickSuggestion(suggestions[highlight])
                } else {
                  void runLookup()
                }
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
          />
          {open && suggestions.length > 0 && (
            <ul
              id={`${inputId}-list`}
              className="postcode-suggestions"
              role="listbox"
            >
              {suggestions.map((pc, i) => (
                <li key={pc} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    className={i === highlight ? 'is-active' : undefined}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => pickSuggestion(pc)}
                  >
                    {pc}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {showButton && (
          <button
            type="button"
            className="btn-primary find-stores"
            disabled={loading || !value.trim()}
            onClick={() => void runLookup()}
          >
            {loading ? 'Looking up…' : buttonLabel}
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
      {loading && showButton && (
        <div className="search-lottie-panel compact" aria-busy="true">
          <LottiePlayer src={lottieUrl('search')} className="search-lottie" />
          <p>Finding stores near you…</p>
        </div>
      )}
    </div>
  )
}
