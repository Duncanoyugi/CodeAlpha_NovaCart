// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register/',
    VERIFY_OTP: '/auth/verify-otp/',
    RESEND_OTP: '/auth/resend-otp/',
    // Used by authApi.resendWelcome
    RESEND_WELCOME: '/auth/resend-welcome/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    ME: '/auth/me/',
    REFRESH: '/auth/refresh/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
  },
  // Products
  PRODUCTS: {
    LIST: '/products/',
    DETAIL: (slug: string) => `/products/${slug}/`,
    CATEGORIES: '/products/categories/',
    FEATURED: '/products/featured/',
    BEST_SELLING: '/products/best-selling/',
    NEW_ARRIVALS: '/products/new-arrivals/',
  },
  // Cart
  CART: {
    GET: '/cart/',
    ADD: '/cart/add/',
    UPDATE: (id: string) => `/cart/item/${id}/`,
    REMOVE: (id: string) => `/cart/item/${id}/remove/`,
    CLEAR: '/cart/clear/',
    MERGE: '/cart/merge/',
  },
  // Orders
  ORDERS: {
    CHECKOUT: '/orders/checkout/',
    MY_ORDERS: '/orders/my-orders/',
    DETAIL: (id: string) => `/orders/${id}/`,
    CANCEL: (id: string) => `/orders/${id}/cancel/`,
  },
  // Reviews
  REVIEWS: {
    CREATE: '/reviews/create/',
    PRODUCT: (id: string) => `/reviews/product/${id}/`,
    STATISTICS: (id: string) => `/reviews/product/${id}/statistics/`,
    HELPFUL: (id: string) => `/reviews/${id}/helpful/`,
  },
  // Wishlist
  WISHLIST: {
    GET: '/wishlist/',
    ADD: '/wishlist/add/',
    REMOVE: (id: string) => `/wishlist/remove/${id}/`,
    CHECK: (id: string) => `/wishlist/check/${id}/`,
    CLEAR: '/wishlist/clear/',
  },
  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent/',
    CONFIRM: '/payments/confirm/',
    STATUS: (id: string) => `/payments/status/${id}/`,
    REFUND: '/payments/refund/',
  },
  // Admin
  ADMIN: {
    DASHBOARD: '/analytics/dashboard/',
    SALES_OVERVIEW: '/analytics/sales-overview/',
    TOP_PRODUCTS: '/analytics/top-products/',
    ORDERS: '/orders/admin/orders/',
    UPDATE_ORDER_STATUS: (id: string) => `/orders/admin/orders/${id}/status/`,
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  SESSION_KEY: 'session_key',
  THEME: 'theme',
} as const;

// App Routes
export const ROUTES = {
  // Public Routes
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CATEGORY: (slug: string) => `/category/${slug}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Customer Routes (Protected)
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order/success',
  ORDER_CANCEL: '/order/cancel',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  CHANGE_PASSWORD: '/change-password',
  ADDRESS_BOOK: '/address-book',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  
  // Error Routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
} as const;

// Product Sort Options
export const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-rating', label: 'Highest Rated' },
  { value: '-sold_count', label: 'Best Selling' },
] as const;

// Product Filters
export const FILTERS = {
  RATINGS: [
    { value: 4, label: '4 Stars & Up' },
    { value: 3, label: '3 Stars & Up' },
    { value: 2, label: '2 Stars & Up' },
    { value: 1, label: '1 Star & Up' },
  ],
  AVAILABILITY: [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ],
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  PROCESSING: { value: 'processing', label: 'Processing', color: 'bg-blue-500' },
  CONFIRMED: { value: 'confirmed', label: 'Confirmed', color: 'bg-indigo-500' },
  SHIPPED: { value: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
  DELIVERED: { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  REFUNDED: { value: 'refunded', label: 'Refunded', color: 'bg-gray-500' },
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  PAID: { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  FAILED: { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  REFUNDED: { value: 'refunded', label: 'Refunded', color: 'bg-gray-500' },
} as const;
