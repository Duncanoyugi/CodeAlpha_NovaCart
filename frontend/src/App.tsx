import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { AppRoutes } from './routes/AppRoutes';
import { setupInterceptors } from './services';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';
import './styles/toast.css';

setupInterceptors();

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: '!bg-[var(--toast-bg)] !text-[var(--toast-text)] !border !border-[var(--toast-border)]',
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: 'var(--toast-success)',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: 'var(--toast-error)',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <AppRoutes />
          </NotificationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
