import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../utils/constants';

const navItems = [
  { name: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Products', href: ROUTES.ADMIN_PRODUCTS, icon: <Package className="w-5 h-5" /> },
  { name: 'Orders', href: ROUTES.ADMIN_ORDERS, icon: <ShoppingBag className="w-5 h-5" /> },
  { name: 'Customers', href: ROUTES.ADMIN_USERS, icon: <Users className="w-5 h-5" /> },
  { name: 'Analytics', href: ROUTES.ADMIN_ANALYTICS, icon: <BarChart3 className="w-5 h-5" /> },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] shadow-[var(--shadow-md)]"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-[var(--color-text-primary)]" />
      </button>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-bg-inverse)] transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgba(240,235,224,0.08)]">
          <div>
            <Link to={ROUTES.HOME} className="font-display text-lg font-bold text-[var(--color-text-inverse)]">
              Nova<span className="text-[var(--color-gold-400)]">Cart</span>
            </Link>
            <p className="text-[11px] text-[rgba(240,235,224,0.5)] mt-1 font-ui">{user?.full_name}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[rgba(240,235,224,0.6)] hover:text-[var(--color-text-inverse)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] font-ui text-sm transition-all duration-200
                  ${isActive
                    ? 'text-[var(--color-gold-400)] bg-[rgba(212,165,116,0.08)] border-l-2 border-[var(--color-gold-400)]'
                    : 'text-[rgba(240,235,224,0.6)] hover:text-[var(--color-text-inverse)] hover:bg-[rgba(255,255,255,0.04)]'
                  }
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(240,235,224,0.08)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-md)] text-[rgba(240,235,224,0.6)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-all duration-200 font-ui text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
