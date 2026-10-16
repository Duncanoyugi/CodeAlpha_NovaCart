import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { AppRoutes } from './routes/AppRoutes';
import { setupInterceptors } from './services';
import { setSessionExpiredHandler } from './services/interceptors';
import { sessionService } from './services/session';
import { tokenService } from './services/tokenService';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { clearAuth, getCurrentUser } from './redux/slices/authSlice';
import { clearCartState, fetchCart } from './redux/slices/cartSlice';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { apiSlice } from './redux/api/apiSlice';
import toast from 'react-hot-toast';

setupInterceptors();
setSessionExpiredHandler(() => {
  store.dispatch(clearAuth());
  store.dispatch(apiSlice.util.resetApiState());
  toast.error('Your session expired. Please log in again.', { id: 'session-expired' });
});

/** Restores the session after a reload and keeps the cart in sync with who is shopping. */
const SessionBootstrap: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const wasAuthenticated = React.useRef(false);

  React.useEffect(() => {
    if (tokenService.isAuthenticated()) dispatch(getCurrentUser());
    else dispatch(fetchCart());
  }, [dispatch]);

  React.useEffect(() => {
    if (isAuthenticated) {
      // First authenticated cart call also merges any guest cart (server reads X-Session-Key).
      dispatch(fetchCart()).finally(() => sessionService.clear());
      wasAuthenticated.current = true;
    } else if (wasAuthenticated.current) {
      // Just logged out: drop the previous user's cart from view and start a fresh guest cart.
      wasAuthenticated.current = false;
      dispatch(clearCartState());
      dispatch(apiSlice.util.resetApiState());
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <SessionBootstrap />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '14px', background: '#141916', color: '#fff', fontSize: '14px', fontWeight: 500, padding: '12px 16px' },
              success: { iconTheme: { primary: '#34d399', secondary: '#141916' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#141916' }, duration: 4500 },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
