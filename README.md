# Checkout | richersounds

Frontend-only checkout demo built from the full [Figma Checkout board](https://www.figma.com/design/lvQ4agOGNLjJKjyE2uD7bs/Checkout?node-id=4001-2) (Steps 1–14).

## Run

```bash
npm install
npm run dev
```

## Flow

1. **Your details** — email continue, or guest checkout
2. **Delivery or collection**
   - **Delivery** — address autocomplete, “Use this address for billing”, shipping options
   - **Click & Collect** — postcode store finder
3. **Billing** — shown when billing differs (or after Click & Collect); skipped when “Use this address for billing” is checked
4. **Payment** — card / PayPal / Apple Pay / Clearpay / Klarna, then Place Order

## Postcode lookup

Uses the free [Postcodes.io](https://api.postcodes.io/) API for:
- UK postcode autocomplete
- Validation / lookup
- Filling city from admin area data
- Ranking Click & Collect stores by distance from the looked-up postcode
