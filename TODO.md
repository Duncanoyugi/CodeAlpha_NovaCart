# NovaCart Frontend Productionization - TODO

## Checkout + Payments
- [ ] Recreate/repair `frontend/src/features/checkout/api/checkoutApi.ts` RTK Query endpoints to match required backend list (`POST /orders/checkout/` etc.).
- [ ] Verify Stripe flow uses:
  - [ ] `POST /payments/create-intent/`
  - [ ] `POST /payments/confirm/`
  - [ ] `GET /payments/status/{id}/` if required

## Orders & Customer Flows
- [ ] Ensure cancel button/modal is shown only when order status is `pending`.
- [ ] Ensure order detail page properly gates sensitive actions.

## Auth & Interceptors
- [ ] Confirm Axios refresh queue logic matches spec exactly.
- [ ] Ensure refresh failure dispatches logout/reset and redirects to `/login`.

## Production Readiness
- [ ] Run `frontend` build + lint locally; fix any TS strict errors.
- [ ] Remove console logging or guard behind dev flag.
- [ ] Ensure all API errors are displayed consistently (toast + field errors).

