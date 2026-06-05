import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

import { MainLayout } from '../layouts/MainLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Layoutless pages
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Auth Pages
import {
  LoginPage,
  RegisterPage,
  VerifyOTPPage,
} from '../features/auth';

// Orders
import {
  OrdersPage,
  OrderDetailPage,
} from '../features/orders';

// Checkout
import {
  CheckoutPage,
  OrderSuccessPage,
  OrderCancelPage,
} from '../features/checkout';

import { WishlistPage } from '../features/wishlist/pages/WishlistPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';

import { ProductDetailsPage } from '../features/products/pages/ProductDetailsPage';
import { CategoryPage } from '../features/products/pages/CategoryPage';

// Admin pages
import { DashboardPage } from '../features/admin/pages/DashboardPage';
import { ProductsManagementPage } from '../features/admin/pages/ProductsManagementPage';
import { OrdersManagementPage } from '../features/admin/pages/OrdersManagementPage';
import { UsersManagementPage } from '../features/admin/pages/UsersManagementPage';

// Lazy-loaded pages
const ProductsPage = React.lazy(() =>
  import('../features/products/pages/ProductPage').then((module) => ({
    default: module.ProductsPage,
  }))
);

const CartPage = React.lazy(() =>
  import('../pages/CartPage').then((module) => ({
    default: module.CartPage,
  }))
);

export const AppRoutes: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <Routes>
        {/* Public Routes (single layout mount) */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.CONTACT} element={<ContactPage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route
            path={ROUTES.PRODUCT_DETAIL(':slug')}
            element={<ProductDetailsPage />}
          />
          <Route
            path={ROUTES.CATEGORY(':slug')}
            element={<CategoryPage />}
          />
          <Route path={ROUTES.CART} element={<CartPage />} />
        </Route>

        {/* Authentication Routes (no layout) */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOTPPage />} />

        {/* Protected Customer/Admin Routes (single layout mount) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']} />
          }
        >
          <Route element={<MainLayout />}>
            <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            <Route
              path={ROUTES.ORDER_SUCCESS}
              element={<OrderSuccessPage />}
            />
            <Route
              path={ROUTES.ORDER_CANCEL}
              element={<OrderCancelPage />}
            />
            <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
            <Route
              path={ROUTES.ORDER_DETAIL(':id')}
              element={<OrderDetailPage />}
            />
            <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>

          {/* Admin-only */}
          <Route element={<AdminRoute />}>
            <Route
              path={ROUTES.ADMIN_DASHBOARD}
              element={<DashboardPage />}
            />
            <Route
              path={ROUTES.ADMIN_PRODUCTS}
              element={<ProductsManagementPage />}
            />
            <Route
              path={ROUTES.ADMIN_ORDERS}
              element={<OrdersManagementPage />}
            />
            <Route
              path={ROUTES.ADMIN_USERS}
              element={<UsersManagementPage />}
            />
            <Route
              path={ROUTES.ADMIN_ANALYTICS}
              element={<DashboardPage />}
            />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  );
};

