# Frontend System Audit Report

## 1. Frontend Overview

**Project type:** React + TypeScript SPA (Vite)

**UI approach:** Tailwind-like utility classes appear in JSX (`className="min-h-screen flex ..."`) alongside custom CSS variables in `src/styles/*`.

**Primary libraries (observed):**
- React Router v6 (`Routes`, `Route`, `Outlet`, `Navigate`)
- Redux Toolkit
  - RTK Query (`createApi`, `fetchBaseQuery`, `apiSlice.injectEndpoints`)
  - Async thunks in slices (e.g., `authSlice`, `cartSlice`)
- React Hook Form + Zod (`zodResolver`) for checkout forms
- Stripe React SDK (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- react-hot-toast for notifications

## 2. Application Architecture

### Entry points
- `frontend/src/main.tsx`
  - Renders `<App />`.
- `frontend/src/App.tsx`
  - Wraps the app with:
    - Redux `<Provider store={store}>`
    - React Router `<BrowserRouter>`
    - `ThemeProvider` and `NotificationProvider`
    - `react-hot-toast` `<Toaster />`
  - Calls `setupInterceptors()` for axios token refresh.
  - Renders `<AppRoutes />`.

### Routing (top-level)
- `frontend/src/routes/AppRoutes.tsx`
  - Routes are organized into sections by layout + guards.
  - Uses `React.Suspense` + `React.lazy` for some pages.

### Layouts
- `frontend/src/layouts/MainLayout.tsx` (Header + Footer + `<Outlet />`)
- `frontend/src/layouts/AuthLayout.tsx` (layout used for auth pages)
- `frontend/src/layouts/DashboardLayout.tsx` (dashboard sidebar/topbar layout)
- `frontend/src/layouts/AdminLayout.tsx` (admin area layout)

### State management
- `frontend/src/redux/store.ts`
  - Redux reducers:
    - `auth`, `products`, `cart`, `orders`, `wishlist`, `ui`
    - RTK Query reducer for `[apiSlice.reducerPath]`.
  - Middleware: default middleware (with `serializableCheck: false`) + RTK Query middleware.

- Slices:
  - `frontend/src/redux/slices/authSlice.ts` (auth async thunks + token persistence)
  - `frontend/src/redux/slices/cartSlice.ts` (cart async thunks; also uses axiosInstance)
  - `frontend/src/redux/slices/wishlistSlice.ts`
  - `frontend/src/redux/slices/uiSlice.ts`
  - `frontend/src/redux/slices/productSlice.ts`
  - `frontend/src/redux/slices/orderSlice.ts`

### API layer
Two competing patterns exist:
1. **RTK Query endpoints** (`frontend/src/features/*/api/*Api.ts`) injected into `apiSlice`.
2. **Axios services/thunks** using `axiosInstance` (`frontend/src/services/*`, plus async thunks in `authSlice` and `cartSlice`).

Key shared config:
- `frontend/src/redux/api/apiSlice.ts`
  - `fetchBaseQuery` with:
    - `baseUrl: VITE_API_URL || http://localhost:8000/api`
    - `credentials: 'include'`
    - `prepareHeaders` attaches `authorization: Bearer <access>` from `tokenService`.

- `frontend/src/services/axios.ts`
  - `axiosInstance` with `withCredentials: true`.

- `frontend/src/services/interceptors.ts`
  - Axios response interceptor:
    - On `401`, triggers refresh flow using `API_ENDPOINTS.AUTH.REFRESH`.
    - On refresh failure: `tokenService.removeTokens()` and `window.location.href = '/login'`.

- `frontend/src/services/tokenService.ts`
  - Persists tokens in `localStorage` (`access_token`, `refresh_token`).

### Utilities
- `frontend/src/utils/*` contains formatting helpers (`formatPrice`, `formatDate`, etc.), `slugify`, validation helpers (`isValidEmail`, `isValidPhone`), throttling/debouncing.

## 3. Implemented Features

Below are the major frontend modules found in `frontend/src/features/*` and route wiring.

### Authentication UI (Login/Register/OTP)
- **Status:** ✅ Mostly complete
- **Files involved (route + components + api):**
  - `frontend/src/routes/AppRoutes.tsx`
  - `frontend/src/features/auth/pages/LoginPage.tsx`
  - `frontend/src/features/auth/pages/RegisterPage.tsx`
  - `frontend/src/features/auth/pages/VerifyOTPPage.tsx`
  - `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
  - `frontend/src/features/auth/pages/ResetPasswordPage.tsx`
  - `frontend/src/features/auth/components/LoginForm.tsx`
  - `frontend/src/features/auth/components/RegisterForm.tsx`
  - `frontend/src/features/auth/components/ForgotPasswordForm.tsx`
  - `frontend/src/features/auth/api/authApi.ts` (RTK Query)
  - `frontend/src/redux/slices/authSlice.ts` (axios thunks)

- **User flow (login):**
  1. User opens `/login` (public route within `AuthLayout`).
  2. Submits login form.
  3. Token/user stored (RTK Query `onQueryStarted` sets tokens and `setUser`, and axios interceptor also exists for refresh).
  4. Protected routes become accessible through `ProtectedRoute`.

### Product browsing (catalog, details, categories)
- **Status:** ✅ Implemented
- **Files:**
  - `frontend/src/features/products/pages/ProductPage.tsx` (lazy-loaded)
  - `frontend/src/features/products/pages/ProductDetailsPage.tsx`
  - `frontend/src/features/products/pages/CategoryPage.tsx`
  - `frontend/src/features/products/components/ProductFilters.tsx`
  - `frontend/src/features/products/components/ProductSort.tsx`
  - `frontend/src/features/products/components/ProductBreadcrumb.tsx`
  - `frontend/src/features/products/api/productApi.ts` (RTK Query)
  - `frontend/src/features/products/hooks/useProducts.ts`
  - `frontend/src/features/products/hooks/useProductFilters.ts`
  - `frontend/src/features/products/hooks/useProductDetails.ts`

- **User flow:**
  - `/products` → catalog page (filters/sorting)
  - `/products/:slug` → product detail page
  - `/category/:slug` → category list

### Cart
- **Status:** ✅ Implemented (RTK Query + some legacy/alternate slice behavior)
- **Files:**
  - Route: `frontend/src/routes/AppRoutes.tsx` (`/cart` lazy-loaded)
  - `frontend/src/pages/CartPage.tsx`
  - Components:
    - `frontend/src/components/cart/*`
  - Feature:
    - `frontend/src/features/cart/api/cartApi.ts` (RTK Query)
    - `frontend/src/features/cart/hooks/useCart.ts`
    - `frontend/src/features/cart/components/*`
  - Redux thunk slice exists too:
    - `frontend/src/redux/slices/cartSlice.ts`

- **User flow:**
  1. User visits `/cart`.
  2. Cart data fetched.
  3. Add/update/remove items triggers invalidation or thunk refresh.

### Wishlist
- **Status:** ✅ Implemented
- **Files:**
  - `frontend/src/features/wishlist/pages/WishlistPage.tsx`
  - `frontend/src/features/wishlist/api/wishlistApi.ts`
  - `frontend/src/features/wishlist/hooks/useWishlist.ts`
  - Components: `frontend/src/features/wishlist/components/*`

- **User flow:**
  - `/wishlist` displays saved items.
  - Product pages can likely check/add to wishlist via `useCheckInWishlistQuery`.

### Orders (My Orders + Details)
- **Status:** ✅ Implemented
- **Files:**
  - Routes:
    - `/orders` → `frontend/src/features/orders/pages/OrdersPage.tsx`
    - `/orders/:id` → `frontend/src/features/orders/pages/OrderDetailPage.tsx`
  - API: `frontend/src/features/orders/api/orderApi.ts`
  - Hooks: `frontend/src/features/orders/hooks/useOrders.ts`
  - Components: `frontend/src/features/orders/components/*` and `frontend/src/components/order/*`

### Checkout + Payment (Stripe)
- **Status:** ✅ Partially implemented / “flow complete” but likely fragile edge cases
- **Files (core):**
  - Route: `frontend/src/routes/AppRoutes.tsx` → `/checkout`
  - `frontend/src/features/checkout/pages/CheckoutPage.tsx`
  - Components:
    - `frontend/src/features/checkout/components/ShippingForm.tsx`
    - `frontend/src/features/checkout/components/BillingForm.tsx`
    - `frontend/src/features/checkout/components/PaymentForm.tsx`
    - `frontend/src/features/checkout/components/CheckoutSteps.tsx`
    - `frontend/src/features/checkout/components/OrderReview.tsx`
    - `frontend/src/features/checkout/components/StripePaymentForm.tsx`
  - Schema + form validation:
    - `frontend/src/features/checkout/schemas/checkoutSchema.ts`
  - API:
    - `frontend/src/features/orders/api/orderApi.ts` (`createOrder`)
    - RTK query for checkout/payment is spread between `checkoutApi.ts` and `paymentApi.ts`
  - Hook: `frontend/src/features/checkout/hooks/useChekout.ts`

- **User flow (CheckoutPage):**
  1. If user not authenticated, redirects to `/login` with `state.from`.
  2. Step 0: Shipping form validated with Zod via `react-hook-form`.
  3. Step 1: Billing form validated.
  4. Step 2: Payment method step uses Stripe Elements and `StripePaymentForm`.
  5. On last step action, creates an order first, captures `order_id`, then advances.
  6. On payment success: navigates to `/order/success?order_id=...`.

### Reviews
- **Status:** ✅ Implemented (includes admin endpoints in API layer)
- **Files:**
  - `frontend/src/features/reviews/components/ReviewList.tsx`
  - `frontend/src/features/reviews/components/ReviewCard.tsx`
  - `frontend/src/features/reviews/components/ReviewForm.tsx`
  - API: `frontend/src/features/reviews/api/reviewApi.ts`
  - Schemas:
    - `frontend/src/features/reviews/schemas/reviewSchema.ts`
  - Hook: `frontend/src/features/reviews/hooks/useReview.ts`

### Profile
- **Status:** ✅ Implemented
- **Files:**
  - `frontend/src/features/auth/pages/ProfilePage.tsx` (notable: profile page exists both under auth pages and profile feature)
  - `frontend/src/features/profile/pages/*` (`EditProfilePage`, `ChangePasswordPage`, `AddressBookPage`)
  - `frontend/src/features/profile/components/*` (`AvatarUpload`, `AddressCard`, `ProfileForm`)
  - API: `frontend/src/features/profile/api/userApi.ts`

## 4. User Flows

### Route guard flow (`ProtectedRoute`)
- `frontend/src/routes/ProtectedRoute.tsx`
  - If `!state.auth.isAuthenticated` → redirects to `/login`.
  - If `allowedRoles` and `user.role` is not allowed → redirects to `/unauthorized`.

### Admin-only area
- `frontend/src/routes/AdminRoute.tsx` (not inspected fully here)
- `frontend/src/layouts/AdminLayout.tsx`
- Admin pages:
  - `/admin/dashboard`
  - `/admin/products`
  - `/admin/orders`
  - `/admin/users`
  - `/admin/analytics`

### Checkout flow
- Detailed above; uses multi-step state `currentStep` and validates partial fields per step.

## 5. User Roles & Frontend Permissions

Observed roles from code:
- `ProtectedRoute` allows `CUSTOMER`, `STAFF`, `ADMIN`.

Role-based access (from routing):

| Activity | User Role | Frontend Access | Implementation Status |
|---|---|---|---|
| Browse products/categories | Guest / Authenticated | Main public routes | ✅ implied (no guard) |
| Checkout, My Orders, Wishlist, Profile | CUSTOMER / STAFF / ADMIN | Protected routes inside `ProtectedRoute allowedRoles={['CUSTOMER','STAFF','ADMIN']}` | ✅ |
| Admin dashboard/products/orders/users/analytics | ADMIN | Nested `AdminRoute` + `AdminLayout` | ✅ (pages wired) |
| Unauthorized | Any authenticated non-matching role | `/unauthorized` | ✅ (redirect target exists) |

Note: exact role-to-permission mapping relies on `AdminRoute.tsx` and `user.role` shape.

## 6. Routing Analysis

### Routes table (from `AppRoutes.tsx`)

| Route | Purpose | Access Level | Status |
|---|---|---|---|
| `/` | Home | Public | ✅ |
| `/about` | About | Public | ✅ |
| `/contact` | Contact | Public | ✅ |
| `/products` | Products list (lazy) | Public | ✅ |
| `/products/:slug` | Product details | Public | ✅ |
| `/category/:slug` | Category page | Public | ✅ |
| `/cart` | Cart (lazy) | Protected (nested inside ProtectedRoute) | ✅ |
| `/login` | Auth | Public | ✅ |
| `/register` | Auth | Public | ✅ |
| `/verify-otp` | Auth | Public | ✅ |
| `/checkout` | Checkout | Protected | ✅ |
| `/order/success` | Post-payment success | Protected | ✅ |
| `/order/cancel` | Payment cancelled | Protected | ✅ |
| `/orders` | My orders | Protected | ✅ |
| `/orders/:id` | Order detail | Protected | ✅ |
| `/wishlist` | Wishlist | Protected | ✅ |
| `/profile` | Profile | Protected | ✅ |
| `/admin/dashboard` | Admin dashboard | Admin only | ✅ |
| `/admin/products` | Admin products | Admin only | ✅ |
| `/admin/orders` | Admin orders | Admin only | ✅ |
| `/admin/users` | Admin users | Admin only | ✅ |
| `/admin/analytics` | Admin analytics | Admin only | 🟡 (wired to `DashboardPage`—may be placeholder) |
| `*` | 404 | Public | ✅ |

### Observed concerns
- `ROUTES` contains many auth/profile routes (forgot/reset/edit address), but `AppRoutes.tsx` currently only mounts login/register/verify-otp under `AuthLayout`. That suggests missing route wiring for:
  - `/forgot-password`
  - `/reset-password`
  - `/profile/edit`
  - `/change-password`
  - `/address-book`
- There is potential duplication/ambiguity around ProfilePage implementation location.

## 7. Component Architecture

### Shared/common components
- `frontend/src/components/common/*`
  - `Button`, `Input`, `Modal`, `Loader`, `Pagination`, `Skeleton`, `EmptyState`, `ErrorBoundary`, `Breadcrumb`, `Tabs`, `Accordation`, `Rating`, `Badge`.

Quality observation:
- Presence of `Skeleton` and `ErrorBoundary` indicates planned UX states.

### Layout components
- `frontend/src/components/layout/*`: Header, Footer, Navbar, Sidebar, MobileMenu, SearchBar.

### Feature-specific components
- Products: product cards, grids, filters, sort, images.
- Cart: cart item list/totals/empty state.
- Orders: order cards/items/status/tracking.
- Reviews: review list/stats/form.
- Profile: avatar upload, forms, address cards.
- Admin: modals, tables, charts.

### Architecture quality
- Components are fairly granular (e.g., shipping/billing/payment are separate).
- Communication appears mostly through:
  - Redux + hooks (`useCart`, `useAuth`)
  - RTK Query hooks for data.

Potential refactor area:
- There are both `redux slices` thunks using `axiosInstance` and RTK Query hooks using `apiSlice`. This leads to inconsistent patterns.

## 8. State Management Review

### Global state
- Redux slices contain:
  - Auth state (`authSlice`) including async thunks and `tokenService` persistence.
  - Cart state (`cartSlice`) which refreshes via axios after mutations.
  - Other slices exist, plus RTK Query cache.

### Server state (RTK Query)
- Each feature defines RTK Query endpoints via `apiSlice.injectEndpoints`.
- Example: `productApi`, `cartApi`, `orderApi`, `reviewApi`, `wishlistApi`.

### Current state flow (example: auth)
- UI dispatches thunk or uses RTK Query mutation.
- Token stored in `localStorage`.
- `authSlice`/state updated via `setUser` or slice reducers.
- Protected routes re-render.

### Issues / inconsistencies
- Mixed usage of:
  - RTK Query (`authApi`, `cartApi`, etc.)
  - Axios-based thunks (`authSlice`, `cartSlice`)
- `apiSlice.ts` uses `fetchBaseQuery` with `prepareHeaders` to read token from `tokenService`, while axios interceptors also attempt token refresh.
  - This can produce duplicated refresh logic paths.

## 9. API Integration Review

### API client configuration
- RTK Query base URL in `apiSlice.ts`:
  - `VITE_API_URL` else `http://localhost:8000/api`
  - `credentials: 'include'` and attaches authorization header.

- Axios client configuration in `services/axios.ts`:
  - Similar `VITE_API_URL` base.
  - Adds token via request interceptor.

### Endpoint wiring (examples)
- Auth: `frontend/src/features/auth/api/authApi.ts`
  - RTK Query mutations for login/register/verifyOTP/resend.
  - `onQueryStarted` sets tokens and dispatches `setUser`.

- Products: `productApi.ts`
  - Query with dynamic filters via `URLSearchParams`.

- Cart: `cartApi.ts`
  - Queries/mutations invalidate `Cart` tag.

- Orders: `orderApi.ts`
  - `createOrder`, `getMyOrders`, `getOrderDetail`, `cancelOrder`.

- Reviews: `reviewApi.ts`
  - Product reviews and stats.
  - Admin review endpoints exist in API.

- Wishlist: `wishlistApi.ts`
  - Get/add/remove/clear/check.

- Payments: `paymentApi.ts`
  - Create payment intent, confirm, status, refund.

- Checkout API: `checkoutApi.ts` exists but checkout page code calls `useCreateOrderMutation` from orders API.

### Error handling / loading states
- Global axios interceptor shows `toast.error` for non-401 errors.
- Components often use RTK Query’s `isLoading`/mutation status.
- Some thunks call `toast.*` directly (e.g., `cartSlice`).

Potential missing pieces:
- Consistent, centralized error normalization for RTK Query (no dedicated `baseQuery` error mapping observed).

## 10. UI/UX Review

### Loading/empty/error states
- Common components exist:
  - `Skeleton`, `Loader`, `EmptyState`, `ErrorBoundary`.

- Checkout flow provides a step indicator and a “Processing Payment” animated state.

### Accessibility
- No explicit focus management or ARIA patterns observed from sampled files.
- No consistent form-level error announcement strategy confirmed.

### Responsiveness
- Layout uses flex + conditional `lg:*` classes (tailwind-like).

### Potential UX issues (inferred from code)
- In `CheckoutPage`, `window.scrollTo` is used on step transitions.
- The cart/checkout redirects can be abrupt without preserving users’ form state.

## 11. Security Review (Frontend only)

### Token storage
- `tokenService.ts` stores **access and refresh tokens in `localStorage`**.
  - Risk: XSS can exfiltrate tokens.
  - Mitigation (recommended): use httpOnly cookies for refresh/access, or at least prefer short-lived access tokens with refresh in httpOnly cookie.

### Client-side validation
- Checkout uses Zod validation via react-hook-form: ✅.
- Other forms likely exist but full coverage not confirmed.

### Protected routes
- `ProtectedRoute` checks `state.auth.isAuthenticated` and `user.role`.

### Environment variables
- Uses `import.meta.env.VITE_STRIPE_PUBLIC_KEY`, `VITE_API_URL`.
  - Vite exposes `VITE_*` to the client; ensure secrets are not present.

### XSS risks
- Toast messages use backend-provided strings. No sanitization layer observed.

## 12. Performance Review

### Rendering
- Uses RTK Query caching and lazy-loaded pages.

### Lazy loading
- `AppRoutes.tsx` lazily loads `ProductPage` and `CartPage`.

### Potential bottlenecks
- Large component composition in pages (not audited fully).
- Mixed RTK Query + Redux thunks can lead to duplicated network requests (e.g., cart refresh via thunk + RTK invalidations).

## 13. Completed Tasks

- Authentication pages and flows exist (login/register/verify OTP).
- Product browsing pages are wired.
- Cart, wishlist, orders pages are implemented.
- Multi-step checkout with Stripe is wired.
- Admin routes/pages are wired behind role guards.

## 14. Missing / Pending Tasks

1) **Route wiring coverage gaps**
- Task: Add missing route entries for auth/profile-related routes declared in `ROUTES`.
- Priority: High
- Category: Routing
- Affected Files:
  - `frontend/src/routes/AppRoutes.tsx`
  - (potentially) auth/profile feature pages mentioned in `ROUTES`
- Current Problem:
  - `ROUTES` includes `FORGOT_PASSWORD`, `RESET_PASSWORD`, `EDIT_PROFILE`, etc., but `AppRoutes.tsx` only mounts login/register/verify OTP.
- Recommended Solution:
  - Mount corresponding pages under `AuthLayout` and `ProtectedRoute` sections.
- Estimated Complexity: Medium

2) **Unify API/data flow (RTK Query vs axios thunks)**
- Task: Remove duplication by selecting a single approach for data fetching/mutations.
- Priority: High
- Category: State Management / API
- Affected Files:
  - `frontend/src/redux/slices/authSlice.ts`
  - `frontend/src/redux/slices/cartSlice.ts`
  - `frontend/src/features/*/api/*Api.ts`
- Current Problem:
  - Both RTK Query and axios-based thunks coexist for overlapping domains.
- Recommended Solution:
  - Prefer RTK Query for server state; reduce/retire axios thunks.
- Estimated Complexity: High

3) **Token storage hardening**
- Task: Migrate token storage away from `localStorage`.
- Priority: High
- Category: Security
- Affected Files:
  - `frontend/src/services/tokenService.ts`
  - `frontend/src/services/interceptors.ts`
  - `frontend/src/redux/api/apiSlice.ts`
- Current Problem:
  - Tokens in `localStorage` are vulnerable to XSS.
- Recommended Solution:
  - Use httpOnly cookies for refresh (and ideally access), and adjust auth header injection accordingly.
- Estimated Complexity: High

4) **Consistent error handling for RTK Query**
- Task: Standardize error messages/loading states across RTK Query endpoints.
- Priority: Medium
- Category: UX / Developer Experience
- Affected Files:
  - `frontend/src/redux/api/apiSlice.ts`
  - feature api files
- Current Problem:
  - axios interceptor handles some errors; RTK Query errors may not uniformly trigger toasts.
- Recommended Solution:
  - Add `baseQuery` error mapping and/or use RTK Query middleware or endpoint `onQueryStarted` consistently.
- Estimated Complexity: Medium

5) **Accessibility audit for forms and modals**
- Task: Ensure focus management, labels, and ARIA for interactive components.
- Priority: Medium
- Category: Accessibility
- Affected Files:
  - common components in `frontend/src/components/common/*`
  - checkout/auth/profile forms
- Current Problem:
  - Not confirmed; no explicit patterns observed.
- Recommended Solution:
  - Add focus trapping in `Modal`, ensure form errors are announced, add keyboard navigation checks.
- Estimated Complexity: Medium

## 15. Recommended Frontend Development Roadmap

1. **Fix routing gaps** for declared but unmounted pages (auth/profile).
2. **Decide and enforce one data-fetching strategy**:
   - migrate cart/auth to RTK Query entirely or consolidate into axios+thunks.
3. **Harden auth token handling**:
   - move refresh tokens to httpOnly cookies; minimize token exposure.
4. **Standardize API error/loading UX**:
   - central error formatting and consistent toast/display behavior.
5. **Accessibility improvements**:
   - modal focus management, form error announcements, keyboard-only flows.
6. **Performance cleanup**:
   - remove duplicate fetching caused by mixed invalidation + thunk refresh.

