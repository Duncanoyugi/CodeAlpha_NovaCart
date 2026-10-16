# NovaCart

Kenya-focused e-commerce platform. **Django REST API** (`backend/`) + **React/TypeScript SPA** (`frontend/`).
Prices are in **KES** end to end; customers pay with **M-Pesa (STK Push)** or **card (Stripe)**.

## What a real customer can do
Browse & search → filter/sort → product page with reviews → add to cart (guest carts persist and merge on login)
→ register with email OTP → checkout (delivery details, coupon) → pay with M-Pesa or card → track the order →
cancel (until paid) or retry payment → manage profile, addresses and wishlist.
Admins/staff manage orders (state machine), products, stock, customers and see analytics.

## Run locally
```bash
# API
cd backend && python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in values; leave DATABASE_URL empty to use SQLite
python manage.py migrate
python manage.py seed_playhouse_catalog
python manage.py createsuperuser   # then set role=ADMIN in /admin/ (or the Customers page)
python manage.py runserver

# Web
cd frontend && npm ci && cp .env.example .env.development && npm run dev
```
Tests: `cd backend && DJANGO_SETTINGS_MODULE=config.settings.testing python manage.py test tests`

## Deploy (Render + Vercel)
* `render.yaml` provisions the API (gunicorn, `/health/` check) and a cron job running
  `python manage.py expire_unpaid_orders` every 10 min (frees stock held by unpaid orders).
* Set the variables from `backend/.env.example` (`DJANGO_ENV=production`, strong `SECRET_KEY`, `ALLOWED_HOSTS`,
  `CORS_ALLOWED_ORIGINS`, `DATABASE_URL`, Resend, Stripe, Daraja).
* **Stripe webhook:** `https://<api>/api/payments/webhook/stripe/` (events: `payment_intent.succeeded`,
  `payment_intent.payment_failed`, `charge.refunded`) → copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
* **M-Pesa callback:** set `MPESA_CALLBACK_URL=https://<api>/api/payments/mpesa/callback/` and a random
  `MPESA_CALLBACK_TOKEN` (the API appends `?token=…`; callbacks without it are rejected). Switch
  `MPESA_ENVIRONMENT=production` with live Daraja credentials when going live.
* Frontend: set `VITE_API_URL=https://<api>/api` on Vercel (SPA rewrite already in `vercel.json`).

## Business rules enforced by the API
* One money module (`cart/pricing.py`): whole-shilling rounding, VAT-inclusive prices (16%), flat KES 300
  delivery, free over KES 5,000. Cart, order, Stripe and M-Pesa always agree on the amount.
* Checkout locks rows and reserves stock atomically; unpaid orders expire after `ORDER_PAYMENT_WINDOW_MINUTES`.
* Payment webhooks are idempotent; amounts are verified; late payments on cancelled orders are flagged for refund.
* Order state machine: pending → processing (on payment) → confirmed/shipped → delivered; cancel releases stock.
* Roles use `User.role` (ADMIN / STAFF / CUSTOMER) everywhere.
