# NovaCart Frontend

This document explains the frontend architecture (React + Vite + TypeScript), the main user-facing flows, and how the code is organized.

## 1) Tech stack in this repo
- **Vite** dev/build tooling (`vite.config.ts`)
- **React** (pages/components)
- **TypeScript**
- **Redux Toolkit** (global state: `src/redux/*`)
- **Axios** HTTP client with interceptors (`src/services/axios.ts`, `src/services/interceptors.ts`)
- Auth uses **JWT** (access/refresh) (token logic in `src/services/tokenService.ts`)

## 2) High-level folder structure

### App shell / routing
- `src/App.tsx`
  - mounts the app and route tree
- `src/routes/`
  - `AppRoutes.tsx`: declares route set
  - `ProtectedRoute.tsx`, `AdminRoute.tsx`, `PublicRoute.tsx`
  - `index.ts`: route exports
- Layouts
  - `src/layouts/MainLayout.tsx`
  - `src/layouts/AuthLayout.tsx`
  - `src/layouts/DashboardLayout.tsx`
  - `src/layouts/AdminLayout.tsx`

### Pages (route targets)
- `src/pages/*` for top-level pages
- Feature pages under `src/features/*/pages/*`

### Feature modules (domain-based)
Each feature typically contains:
- `pages/` (UI entry)
- `components/` (reusable UI)
- `api/` (API wrappers)
- `hooks/` (data fetching & state)
- `schemas/` (request/response typing + validation shapes)

Examples:
- `src/features/auth/*`
- `src/features/products/*`
- `src/features/cart/*`
- `src/features/checkout/*`
- `src/features/orders/*`
- `src/features/reviews/*`
- `src/features/wishlist/*`
- `src/features/profile/*`
- `src/features/admin/*`
- `src/features/payments/*`

### Common UI
Reusable UI primitives and view helpers:
- `src/components/common/*` (Button, Modal, Loader, Pagination, Skeleton, Rating, etc.)

### Shared utilities
- `src/utils/*` (formatting, slugify, debounce/throttle, validation)
- `src/types/*` (TypeScript types shared across app)

## 3) Authentication & protected routes

### Auth state
- `src/redux/slices/authSlice.ts`
- `src/hooks/useAuth.ts` and `src/features/auth/hooks/useAuth.ts`
- Token helpers:
  - `src/services/tokenService.ts`
  - `src/services/authService.ts`

### Route gating
- `ProtectedRoute.tsx`: requires authenticated access token
- `AdminRoute.tsx`: requires admin privileges/role

**Expected roles (aligned with backend `users.User.role`):**
- CUSTOMER: standard shopper flows
- STAFF: staff-only inventory updates (where exposed)
- ADMIN: admin dashboard + admin actions

## 4) Product browsing flow

### User flow
1. Visit home/category/product detail pages
2. Use filters and sorting
3. View product details and related products
4. Add items to cart / wishlist

### Code areas
- Pages/components:
  - `src/features/products/pages/*`
  - `src/features/products/components/*` (filters, sorting, breadcrumb)
- Data fetching hooks:
  - `src/features/products/hooks/useProducts.ts`
  - `useProductFilters.ts`, `useProductDetails.ts`
- API wrapper:
  - `src/features/products/api/productApi.ts`

### UI state
Pagination and debouncing/throttling are handled in:
- `src/hooks/usePagination.ts`
- `src/hooks/useDebounce.ts`
- `src/utils/helpers.ts`

## 5) Cart flow (guest + authenticated)

### User flow
1. Add products to cart
2. Update quantity/remove items
3. Cart totals shown (subtotal/shipping/tax/total)
4. Checkout converts cart → order

### Code areas
- UI components:
  - `src/features/cart/pages/Cartpage.tsx`
  - `src/features/cart/components/*`
  - `src/components/cart/*`
- API:
  - `src/features/cart/api/cartApi.ts`
- Hooks:
  - `src/features/cart/hooks/useCart.ts`
  - Redux slice: `src/redux/slices/cartSlice.ts`

### Guest cart handling
Cart requests rely on backend’s `session_key` cookie/header logic.
Axios interceptors and token storage live in `src/services/*`.

## 6) Checkout + payments flow (Stripe)

### User flow
1. Enter shipping + billing info
2. Submit payment
3. Backend creates Stripe PaymentIntent and confirms payment
4. Show order success/cancel pages

### Code areas
- Checkout pages:
  - `src/features/checkout/pages/CheckoutPage.tsx`
  - `OrderSuccessPage.tsx`, `OrderCancelPage.tsx`
- Components:
  - `ShippingForm.tsx`, `BillingForm.tsx`
  - `PaymentForm.tsx`
  - `StripePaymentForm.tsx`
  - `CheckoutSteps.tsx`, `OrderReview.tsx`
- Payment api:
  - `src/features/payments/api/paymentApi.ts`
- Checkout api:
  - `src/features/checkout/api/checkoutApi.ts`
- Checkout hooks/schemas:
  - `src/features/checkout/hooks/useChekout.ts`
  - `src/features/checkout/schemas/checkoutSchema.ts`

### Integration responsibility split
- UI handles collecting user input and calling API
- Backend handles Stripe PaymentIntent/webhook and updates order statuses

## 7) Orders flow

### User flow
- View a list of orders
- View order details including tracking/status
- (Optionally) cancel eligible orders

### Code areas
- `src/features/orders/pages/OrdersPage.tsx`
- `src/features/orders/pages/OrderDetailPage.tsx`
- Components:
  - `OrderCard`, `OrderItems`, `OrderTracking`, etc.
- API + hook:
  - `src/features/orders/api/orderApi.ts`
  - `src/features/orders/hooks/useOrders.ts`

## 8) Wishlist flow

### User flow
- View wishlist items
- Add/remove products
- Check if a product exists in wishlist

### Code areas
- `src/features/wishlist/pages/WishlistPage.tsx`
- `src/features/wishlist/components/WishlistItem.tsx`
- `wishlistApi.ts`, `useWishlist.ts`
- Redux slice: `src/redux/slices/wishlistSlice.ts`

## 9) Reviews flow

### User flow
- Browse product review list + statistics
- Authenticated users submit reviews
- Users can update/delete their own reviews
- Users can vote helpfulness
- Admin approves/publishes reviews

### Code areas
- Public display:
  - `src/features/reviews/components/ReviewList.tsx`
  - `ReviewStats.tsx`
- Submission:
  - `src/features/reviews/pages/WriteReviewPage.tsx`
  - `ReviewForm.tsx`
- API/hook:
  - `src/features/reviews/api/reviewApi.ts`
  - `src/features/reviews/hooks/useReview.ts`
- Schemas:
  - `src/features/reviews/schemas/reviewSchema.ts`

## 10) Profile flow

### User flow
- View/edit profile fields
- Manage addresses
- Change password
- Upload avatar

### Code areas
- `src/features/profile/pages/*`
- `src/features/profile/components/*`
- API/hook:
  - `src/features/profile/api/userApi.ts`
  - `src/features/profile/hooks/useProfile.ts`

## 11) Admin dashboard flow

### Admin user flow
- Dashboard overview metrics
- Products management (CRUD)
- Orders management (status updates)
- Users management
- Analytics widgets

### Code areas
- Routes/layout:
  - `src/routes/AdminRoute.tsx`
  - `src/layouts/AdminLayout.tsx`
- Pages:
  - `src/features/admin/pages/*`
- Components:
  - tables/cards/modals in `src/features/admin/components/*`
- API:
  - `src/features/admin/api/adminApi.ts`

## 12) Error handling and UI feedback
- `src/components/common/ErrorBoundary.tsx`
- `src/services/errorHandler.ts`
- Notification context:
  - `src/context/NotificationContext.tsx`

## 13) Development notes
- API base URLs are expected to be configured by `.env*` files.
- Most business rules live in the backend; the frontend is responsible for:
  - collecting input
  - validating basic shapes (via schemas/types)
  - calling API endpoints
  - rendering response and handling loading/error states

