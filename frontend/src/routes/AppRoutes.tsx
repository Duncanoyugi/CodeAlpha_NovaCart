import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { FullPageLoader } from '../components/ui';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';







// Layoutless pages
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const named = <T extends Record<string, React.ComponentType<any>>>(loader: () => Promise<T>, key: keyof T) =>
  React.lazy(() => loader().then((m) => ({ default: m[key] as React.ComponentType<any> })));

// Auth
const LoginPage = named(() => import('../features/auth/pages/LoginPage'), 'LoginPage');
const RegisterPage = named(() => import('../features/auth/pages/RegisterPage'), 'RegisterPage');
const VerifyOTPPage = named(() => import('../features/auth/pages/VerifyOTPPage'), 'VerifyOTPPage');
const ForgotPasswordPage = named(() => import('../features/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = named(() => import('../features/auth/pages/ResetPasswordPage'), 'ResetPasswordPage');

// Customer area
const OrdersPage = named(() => import('../features/orders/pages/OrdersPage'), 'OrdersPage');
const OrderDetailPage = named(() => import('../features/orders/pages/OrderDetailPage'), 'OrderDetailPage');
const CheckoutPage = named(() => import('../features/checkout/pages/CheckoutPage'), 'CheckoutPage');
const OrderSuccessPage = named(() => import('../features/checkout/pages/OrderSuccessPage'), 'OrderSuccessPage');
const OrderCancelPage = named(() => import('../features/checkout/pages/OrderCancelPage'), 'OrderCancelPage');
const WishlistPage = named(() => import('../features/wishlist/pages/WishlistPage'), 'WishlistPage');
const ProfilePage = named(() => import('../features/profile/pages/ProfilePage'), 'ProfilePage');
const EditProfilePage = named(() => import('../features/profile/pages/EditProfilePage'), 'EditProfilePage');
const ChangePasswordPage = named(() => import('../features/profile/pages/ChangePasswordPage'), 'ChangePasswordPage');
const AddressBookPage = named(() => import('../features/profile/pages/AddressBookPage'), 'AddressBookPage');

// Catalogue
const ProductDetailsPage = named(() => import('../features/products/pages/ProductDetailsPage'), 'ProductDetailsPage');
const CategoryPage = named(() => import('../features/products/pages/CategoryPage'), 'CategoryPage');
const ProductsPage = named(() => import('../features/products/pages/ProductPage'), 'ProductsPage');
const CartPage = named(() => import('../pages/CartPage'), 'CartPage');

// Admin
const DashboardPage = named(() => import('../features/admin/pages/DashboardPage'), 'DashboardPage');
const ProductsManagementPage = named(() => import('../features/admin/pages/ProductsManagementPage'), 'ProductsManagementPage');
const OrdersManagementPage = named(() => import('../features/admin/pages/OrdersManagementPage'), 'OrdersManagementPage');
const UsersManagementPage = named(() => import('../features/admin/pages/UsersManagementPage'), 'UsersManagementPage');

export const AppRoutes: React.FC = () => {
  return (
    <React.Suspense
      fallback={<FullPageLoader />}
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

        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.VERIFY_OTP} element={<VerifyOTPPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={`${ROUTES.RESET_PASSWORD}/:token`} element={<ResetPasswordPage />} />
        </Route>

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
            <Route path={ROUTES.EDIT_PROFILE} element={<EditProfilePage />} />
            <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
            <Route path={ROUTES.ADDRESS_BOOK} element={<AddressBookPage />} />
          </Route>

          {/* Admin-only */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
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
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<NotFoundPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  );
};
