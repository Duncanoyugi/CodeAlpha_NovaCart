# NovaCart Backend

This document explains how the backend is structured and what concepts/flows are implemented.

> Tech stack (in this repo)
> - Django 6 + Django REST Framework
> - JWT auth via `rest_framework_simplejwt`
> - Stripe payments + webhook handling
> - Email sending (OTP verification + welcome + order confirmations)

## 1) High-level architecture

The backend is organized by **feature apps** under `backend/`.

Each feature typically follows this flow:
1. **URLs** (`feature/urls/__init__.py`)
2. **HTTP handlers / API views** (`feature/views/__init__.py`) using DRF `@api_view`
3. **Serializers** (`feature/serializers/__init__.py`) for request validation and response shaping
4. **Business logic / services** (`feature/services/*.py`) for non-trivial operations
5. **Models** (`feature/models/base.py`) for persisted data

Most endpoints return JSON shaped like:
```json
{ "success": true|false, "data": ..., "message": ... }
```

## 2) Project-level configuration & routing

### `backend/config/settings/base.py`
Key settings:
- `AUTH_USER_MODEL = 'users.User'`
- DRF auth:
  - `DEFAULT_AUTHENTICATION_CLASSES = JWTAuthentication`
  - `DEFAULT_PERMISSION_CLASSES = IsAuthenticatedOrReadOnly`
- Pagination default: `PageNumberPagination` with `PAGE_SIZE = 20`
- JWT lifetimes configured via env vars: `JWT_ACCESS_TOKEN_LIFETIME`, `JWT_REFRESH_TOKEN_LIFETIME`

### `backend/config/urls.py`
API is routed under `/api/`:
- `/api/auth/` → `authentication.urls`
- `/api/products/` → `products.urls`
- `/api/cart/` → `cart.urls`
- `/api/orders/` → `orders.urls`
- `/api/payments/` → `payments.urls`

Additionally:
- `/admin/`
- `/health/` JSON health check (also checks DB connectivity)

## 3) Authentication & user lifecycle

### User model: `backend/users/models/base.py`
`User` is a custom Django user model:
- `role` choices: `CUSTOMER`, `STAFF`, `ADMIN`, `VENDOR`
- Verification:
  - `is_active`, `is_verified`
  - OTP fields: `otp_code`, `otp_created_at`, `otp_attempts`
- Address fields stored directly on user:
  - `address_line1/2`, `city`, `state`, `postal_code`, `country`
- Password reset fields exist on the model: `reset_token`, `reset_token_expiry`

### Authentication flows: `backend/authentication/views/__init__.py`
Endpoints (all under `/api/auth/`):
- `POST /register/` (AllowAny)
- `POST /verify-otp/` (AllowAny)
- `POST /resend-otp/` (AllowAny)
- `POST /login/` (AllowAny)
- `POST /logout/` (IsAuthenticated)
- `GET /me/` (IsAuthenticated)
- `POST /refresh/` (refresh token via `CustomTokenRefreshView`)
- `POST /resend-welcome/` (IsAuthenticated)

### How register/OTP works
1. **Register**: `register()` validates via `RegisterSerializer`, creates user, then sends OTP email.
2. **Verify OTP**: `verify_otp()` sets:
   - `is_active = True`
   - `is_verified = True`
   - clears OTP fields (`otp_code = None`, resets `otp_attempts`)
   - sends welcome email
   - returns JWT `access` + `refresh`

Email delivery is delegated to:
- `backend/authentication/services/auth_service.py`
  - renders `backend/mail/templates/otp_verification.html`
  - renders `backend/mail/templates/welcome.html`

### Login and token generation
`login()`:
- on success: records login history and returns JWT tokens
- login history is written by `AuthService.record_login_history(...)`

JWT claims include:
- `email`
- `role`

### Login auditing models
OTP verifications and login attempts are persisted by models in:
- `backend/authentication/models/base.py`
  - `OTPVerification`
  - `LoginHistory`

## 4) Authorization model (roles & permissions)

DRF uses a mix of:
- `AllowAny`
- `IsAuthenticated`
- `IsAdminUser`

Additionally, some endpoints perform explicit role checks.

### Roles in the system
- **CUSTOMER**
  - Can browse products/categories
  - Can manage own cart
  - Can checkout, view own orders
  - Can manage wishlist
  - Can create/update/delete own reviews

- **STAFF**
  - Used in product inventory updates (`update_inventory` requires `ADMIN` or `STAFF`)

- **ADMIN**
  - Can manage products (CRUD) and categories (CRUD)
  - Can view and manage orders (list all, update status)
  - Can manage reviews (approve/reject/respond to admin actions)
  - Can manage payments (refund endpoint)
  - Can access analytics dashboard endpoints

- **VENDOR**
  - Present in the user model but not directly reflected in endpoint permissions in the code inspected.

> Important: the backend currently uses `IsAdminUser` for “admin endpoints”.
> Whether a user is recognized as “admin” depends on Django’s staff/superuser flags (and how `is_staff` / `is_superuser` are set in user creation / admin).

## 5) Products catalog

### Data model: `backend/products/models/base.py`
- `Category`
  - supports hierarchy with `parent` FK
  - has `slug`, `is_active`, `order`
- `Product`
  - pricing fields: `price`, `compare_price`, `discount_percentage`
  - availability fields: `stock_quantity`, `is_available`, plus promo flags
  - rating/search fields: `rating`, `num_reviews`, `views_count`, `sold_count`
  - computed property: `final_price`
- `ProductVariant`
  - variant-level price/stock and attributes (JSON)

### Product endpoints: `backend/products/views/__init__.py`
Public (AllowAny):
- `GET /categories/`
- `GET /categories/tree/`
- `GET /categories/<slug>/`
- `GET /` (list products with filtering + pagination)
- `GET /featured/`
- `GET /best-selling/`
- `GET /new-arrivals/`
- `GET /<slug>/` product detail

Admin (IsAdminUser):
- `POST /admin/categories/`
- `PUT/PATCH /admin/categories/<id>/`
- `DELETE /admin/categories/<id>/`
- `POST /admin/products/`
- `PUT/PATCH /admin/products/<id>/`
- `DELETE /admin/products/<id>/`
- `POST /admin/products/<id>/inventory/` (ADMIN or STAFF)

### Product business logic: `backend/products/services/product_service.py`
- `get_filtered_products(query_params)`
  - filters: search terms, category/category_slug, price range, discount on sale, featured, best sellers, new arrivals, minimum rating
  - sorting by a safe allowlist
  - pagination via Django `Paginator`
- `increment_view_count(product)`
- `update_rating(product)`
  - recomputes rating + num_reviews based on **approved** reviews

### Serializers: `backend/products/serialzers/__init__.py`
- `CategorySerializer`
- `ProductListSerializer`
- `ProductDetailSerializer`
- `ProductCreateUpdateSerializer`
  - creates/updates product variants

## 6) Cart (guest + authenticated)

### Data model: `backend/cart/models/base.py`
- `Cart`
  - `user` optional (OneToOne)
  - `session_key` used for guest carts
  - computed totals:
    - `subtotal` (sum item.subtotal)
    - `shipping_cost` (free over $50)
    - `tax_amount` (10%)
    - `total_amount`
- `CartItem`
  - unique (cart, product, variant)
  - stores `price_at_add`
  - computed properties:
    - subtotal
    - current_price (variant price or product final_price)
    - savings

### Cart endpoints: `backend/cart/views/__init__.py`
All under `/api/cart/`:
- `GET /` → returns cart summary (guest uses `session_key` cookie/header)
- `POST /add/` → add item to cart (guest or authenticated)
- `PUT|PATCH /item/<item_id>/` → update quantity (0 removes the item)
- `DELETE /item/<item_id>/remove/` → remove item
- `DELETE /clear/` → clear cart
- `POST /merge/` → merge guest cart into user cart after login

### Cart business logic: `backend/cart/services/cart_service.py`
Key operations:
- `get_or_create_cart(user=None, session_key=None)`
  - creates either user cart or guest cart
  - merges guest cart into user cart if both exist
- `add_to_cart(cart, product_id, quantity, variant_id)`
  - validates stock
  - chooses variant price if a variant is provided
  - uses `get_or_create` for idempotent adds
- `update_cart_item(cart_item_id, quantity)`
  - deletes if quantity <= 0
  - validates stock
- `merge_carts(session_key, user_cart)`
  - merges guest items into user cart by (product, variant)
  - deletes guest cart at the end
- `get_cart_summary(cart)`
  - returns totals and cart item list

### Cart validation/serialization: `backend/cart/serializers/__init__.py`
- `AddToCartSerializer`
  - validates product exists, is available, and has sufficient stock
- `UpdateCartItemSerializer`
  - validates quantity and (when possible) stock availability
- `CartItemSerializer` includes computed fields (subtotal/current_price/savings)
- `CartSerializer` wraps item list + totals

## 7) Orders (checkout + tracking + admin status)

### Data model: `backend/orders/models/base.py`
- `Order`
  - lifecycle statuses:
    - `pending`, `processing`, `confirmed`, `shipped`, `delivered`, `cancelled`, `refunded`
  - `payment_status`: `pending`, `paid`, `failed`, `refunded`
  - stored totals: subtotal/discount/shipping/tax/total
  - stores shipping and billing details
  - stores Stripe payment identifiers:
    - `payment_intent_id`, `payment_details`
  - timestamps + tracking (tracking_number, carrier, estimated_delivery)
- `OrderItem`
  - snapshots product fields at purchase time
  - stores variant info (name + JSON attributes)

### Checkout flow: `backend/orders/views/__init__.py`
- `POST /checkout/` (IsAuthenticated)
  1. loads/creates user cart
  2. validates request via `CheckoutSerializer`
  3. calls `OrderService.create_order_from_cart(...)`
  4. sends order confirmation email (best-effort)
  5. returns `order_id`, `order_number`, total, status

### Order business logic: `backend/orders/services/order_service.py`
- `create_order_from_cart(user, cart, checkout_data)`
  - atomic transaction
  - calculates totals from `cart`
  - creates `Order` and `OrderItem` rows
  - decrements product stock and updates `sold_count`
  - sets `is_available = False` when stock reaches 0
  - clears the cart
- `send_order_confirmation_email(order)`
  - uses template `backend/mail/templates/emails/order_confirmation.html`
- `update_order_status(order, status, ...)`
  - updates timestamps (`processed_at`, `shipped_at`, `delivered_at`, `cancelled_at`)
  - sends a status update email via `OrderService.send_status_update_email(order)`
- `cancel_order(order, reason=None)`
  - enforces `order.can_cancel`
  - restores stock
  - sets order status to `CANCELLED`

### User order endpoints
- `GET /my-orders/`
- `GET /<order_id>/`
- `POST /<order_id>/cancel/`

### Admin endpoints
- `GET /admin/orders/` (list, filter by status/payment_status)
- `PUT /admin/orders/<order_id>/status/`
- `GET /admin/statistics/` (dashboard summary)

## 8) Payments (Stripe)

### Data model: `backend/payments/models/base.py`
- `Payment`
  - 1:1 with `Order` (`order = OneToOneField`)
  - payment status + payment method
  - Stripe identifiers:
    - `stripe_payment_intent_id`
    - `stripe_charge_id`
    - `stripe_refund_id`, `stripe_customer_id`
  - refunds fields
- `PaymentAttempt`
  - debugging/audit trail for attempts tied to a `Payment`

### Stripe integration
- Stripe API wrapper: `backend/payments/services/stripe_service.py`
  - `create_payment_intent(amount, currency, metadata, customer_id)`
  - `retrieve_payment_intent(payment_intent_id)`
  - `confirm_payment_intent(payment_intent_id, ...)`
  - `refund_payment(payment_intent_id, amount, reason)`
  - customer creation helper exists

### Payment business logic: `backend/payments/services/payment_service.py`
- `process_payment(order_id, payment_method='stripe')`
  - creates a `Payment` record tied to the order
  - creates Stripe PaymentIntent
  - creates `PaymentAttempt` records
  - returns `requires_action` and `client_secret` for frontend confirmation
- `confirm_payment(payment_intent_id)`
  - fetches PaymentIntent from Stripe
  - updates `Payment.payment_status`
  - updates corresponding `Order.payment_status` and sets `Order.status = PROCESSING`
- `refund_payment(payment_id, amount, reason)`
  - only refunds successful payments
  - updates payment status to `REFUNDED` / `PARTIALLY_REFUNDED`
  - updates order status to `Order.Status.REFUNDED`

### Payments endpoints: `backend/payments/views/__init__.py`
All under `/api/payments/`:
- `POST /create-intent/` (IsAuthenticated)
- `POST /confirm/` (IsAuthenticated)
- `POST /refund/` (IsAdminUser)
- `POST /status/<payment_intent_id>/` (IsAuthenticated)

#### Stripe webhook
- `POST /webhook/stripe/` (csrf_exempt, no auth)
- Verifies `HTTP_STRIPE_SIGNATURE` using `settings.STRIPE_WEBHOOK_SECRET`
- Handles:
  - `payment_intent.succeeded` → calls `PaymentService.confirm_payment(payment_intent['id'])`
  - `payment_intent.payment_failed` → logs
  - `charge.refunded` → logs

## 9) Reviews

### Data model: `backend/reviews/models/base.py`
- `Review`
  - one review per (product, user)
  - stores rating, title, comment, images, video_url
  - verification: `is_verified_purchase`
  - approval: `is_approved`
  - helpful votes counters
  - admin response fields
  - custom logic: on save, auto-detects verified purchase by checking `OrderItem` and `Order.payment_status/status`
- `ReviewHelpful`
  - tracks per-user vote (helpful/not helpful) for a review

### Review services: `backend/reviews/services/review_service.py`
- `get_product_reviews(product_id, request_data)`
  - only returns `is_approved=True`
  - supports filters (rating, verified_only)
  - sorts and paginates
- `get_review_statistics(product_id)`
  - aggregates average rating, distribution by stars, verified purchase count, reviews with images
- `mark_helpful(review_id, user, is_helpful)`
  - ensures each user votes at most once, supports changing/removing votes
  - updates counter fields
- `AdminReviewService`
  - pending review list
  - approve: sets `is_approved=True` and updates product rating
  - reject: deletes review
  - respond: stores admin response text

### Review endpoints: `backend/reviews/views/__init__.py`
Public (AllowAny):
- `GET /product/<product_id>/`
- `GET /product/<product_id>/statistics/`

Authenticated (IsAuthenticated):
- `POST /create/` (submit review; requires admin approval to become visible)
- `PUT|PATCH /<review_id>/update/` (edit within allowed time window)
- `DELETE /<review_id>/delete/` (delete own review)
- `POST /<review_id>/helpful/` (vote helpful/not helpful)

Admin (IsAdminUser):
- `GET /admin/pending/`
- `GET /admin/all/` (filters + pagination)
- `POST /admin/<review_id>/action/` with action = approve|reject|respond

## 10) Wishlist

### Data model: `backend/wishlist/models/base.py`
- `Wishlist` is a OneToOne per user.
- `WishlistItem` is unique by (wishlist, product).

### Wishlist service: `backend/wishlist/services/wishlist_service.py`
- `get_or_create_wishlist(user)`
- `add_to_wishlist(user, product_id)`
- `remove_from_wishlist(user, product_id)`
- `clear_wishlist(user)`
- `is_in_wishlist(user, product_id)`

### Wishlist endpoints: `backend/wishlist/views/__init__.py`
All IsAuthenticated:
- `GET /` get wishlist
- `POST /add/` add item
- `DELETE /remove/<product_id>/` remove item
- `DELETE /clear/` clear wishlist
- `GET /check/<product_id>/` check presence

## 11) Analytics (admin dashboard)

### Data model: `backend/analytics/models/base.py`
- `PageView`
  - captures: user/session, page_url, referrer, IP/user_agent, device type, browser/os, geo fields

### Analytics service: `backend/analytics/services/analytics_service.py`
Produces dashboard metrics from orders/products/users/reviews:
- revenue and growth comparisons
- sales overview by day
- top products (annotated aggregation)
- category sales
- recent orders
- revenue chart by week/month/year (implemented as day buckets in code)
- customer insights
- inventory status

### Analytics endpoints: `backend/analytics/views/__init__.py`
All IsAdminUser:
- `GET /dashboard/`
- `GET /sales-overview/?days=...`
- `GET /top-products/?limit=...&days=...`
- `GET /category-sales/?days=...`
- `GET /recent-orders/?limit=...`
- `GET /revenue-chart/?period=month|week|year`
- `GET /customer-insights/`
- `GET /inventory-status/`

## 12) Expected users & role-based access summary

### Guest (not authenticated)
- `AllowAny` product/category browsing
- Cart is supported via `session_key` cookie/header

### Customer (authenticated, role=CUSTOMER)
- Cart:
  - add/update/remove items
  - merge guest cart after login
- Checkout:
  - create an order from cart
- Orders:
  - view own orders
  - cancel orders when `order.can_cancel` is True
- Wishlist:
  - add/remove/check/clear wishlist items
- Reviews:
  - submit reviews (pending admin approval)
  - update/delete own reviews
  - vote helpfulness
- Payments:
  - create payment intent
  - confirm payment
  - query payment status

### Staff (role=STAFF)
- Same as Customer for most features
- Can update product inventory (`POST /admin/products/<id>/inventory/` requires ADMIN or STAFF)

### Admin (role=ADMIN)
- Products:
  - full CRUD for products and categories
  - inventory updates
- Orders:
  - list all orders
  - update order status and shipping tracking
  - view order statistics
- Reviews:
  - approve/reject pending reviews
  - respond to reviews
  - view all reviews
- Payments:
  - refunds
- Analytics:
  - access admin analytics dashboard endpoints

## 13) Notes / assumptions from the code
- Admin permissions rely on `IsAdminUser` plus Django staff/superuser setup; the repository uses role fields heavily, but DRF’s `IsAdminUser` checks Django permissions.
- Coupon discounts are partially referenced in the order service but not fully implemented in the inspected code paths.


