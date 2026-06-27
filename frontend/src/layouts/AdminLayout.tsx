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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../utils/constants';

const navItems = [
  { name: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
  { name: 'Products', href: ROUTES.ADMIN_PRODUCTS, icon: <Package className="w-[18px] h-[18px]" /> },
  { name: 'Orders', href: ROUTES.ADMIN_ORDERS, icon: <ShoppingBag className="w-[18px] h-[18px]" /> },
  { name: 'Customers', href: ROUTES.ADMIN_USERS, icon: <Users className="w-[18px] h-[18px]" /> },
  { name: 'Analytics', href: ROUTES.ADMIN_ANALYTICS, icon: <BarChart3 className="w-[18px] h-[18px]" /> },
];

export const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] shadow-[var(--shadow-md)]"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-[var(--color-text-primary)]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#0B1D17] transition-all duration-300 ease-out
          flex flex-col shadow-[var(--shadow-xl)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          ${sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[270px]'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-[rgba(242,169,59,0.12)]">
          {!sidebarCollapsed && (
            <div>
              <Link to={ROUTES.HOME} className="font-display text-lg font-bold text-[var(--color-text-inverse)] tracking-tight">
                Nova<span className="text-[var(--color-accent)]">Cart</span>
              </Link>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 font-ui font-medium truncate">
                {user?.full_name}
              </p>
            </div>
          )}
          {sidebarCollapsed && (
            <Link to={ROUTES.HOME} className="mx-auto font-display text-lg font-bold text-[var(--color-accent)]">
              NC
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text-inverse)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-[var(--radius-lg)] font-ui text-sm transition-all duration-200 group
                  ${isActive
                    ? 'text-[var(--color-accent)] bg-[rgba(242,169,59,0.1)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-inverse)] hover:bg-[rgba(255,255,255,0.04)]'
                  }
                  ${sidebarCollapsed ? 'lg:justify-center lg:px-3' : ''}
                `}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <span className={`shrink-0 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-inverse)]'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-[var(--color-accent)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[rgba(242,169,59,0.12)]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 rounded-[var(--radius-lg)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[rgba(231,76,60,0.08)] transition-all duration-200 font-ui text-sm font-medium
                ${sidebarCollapsed ? 'lg:justify-center lg:p-3' : 'w-full px-4 py-3'}
              `}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`
                hidden lg:flex items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-muted)] hover:text-[var(--color-text-inverse)] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200
                ${sidebarCollapsed ? 'w-full p-3' : 'w-10 h-10 ml-auto'}
              `}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <Menu className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`
        min-h-screen transition-all duration-300 ease-out
        lg:ml-[270px]
        ${sidebarCollapsed ? 'lg:ml-[76px]' : ''}
        overflow-x-auto
      `}>
        <div className="p-5 lg:p-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
