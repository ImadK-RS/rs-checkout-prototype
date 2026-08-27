export type CardFields = {
  name: string
  number: string
  expiry: string
  cvv: string
}

export type CardErrors = Partial<Record<keyof CardFields, string>>

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Luhn check for card numbers. */
export function isValidCardNumber(value: string): boolean {
  const digits = digitsOnly(value)
  if (digits.length < 13 || digits.length > 19) return false

  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function isValidExpiry(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = Number(match[2]) + 2000
  if (month < 1 || month > 12) return false

  const now = new Date()
  const exp = new Date(year, month, 0, 23, 59, 59)
  return exp >= now
}

export function isValidCvv(value: string): boolean {
  return /^\d{3,4}$/.test(digitsOnly(value))
}

export function validateCard(card: CardFields): CardErrors {
  const errors: CardErrors = {}
  if (!card.name.trim() || card.name.trim().length < 2) {
    errors.name = 'Enter the name on the card'
  }
  if (!isValidCardNumber(card.number)) {
    errors.number = 'Enter a valid card number'
  }
  if (!isValidExpiry(card.expiry)) {
    errors.expiry = 'Enter a valid expiry (MM/YY)'
  }
  if (!isValidCvv(card.cvv)) {
    errors.cvv = 'Enter a valid CVV'
  }
  return errors
}

export function createOrderNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `RS-${n}`
}

export function estimatedDeliveryLabel(
  fulfillment: 'delivery' | 'collect' | null,
  shippingEta?: string,
): string {
  if (fulfillment === 'collect') {
    return 'Ready for collection from next working day'
  }
  return shippingEta ?? 'Delivered within 5 days'
}
