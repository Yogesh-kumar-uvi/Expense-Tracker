// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Tags, PiggyBank, Target,
  Receipt, Bell, ChevronsLeft, ChevronsRight, LogOut, Wallet,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Only routes that actually exist and work — no placeholder destinations.
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/bills', label: 'Bills', icon: Receipt },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const initials = (user) =>
  `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

export default function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    [
      'group relative flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-text-secondary hover:bg-surface hover:text-text-primary',
    ].join(' ');

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border bg-card',
          'transition-[width,transform] duration-200 ease-premium',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary-600 text-white">
            <Wallet size={18} strokeWidth={2} />
          </div>
          {!collapsed && (
            <span className="truncate text-[15px] font-semibold text-text-primary">
              Expense Tracker
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClasses} onClick={onCloseMobile}>
              <Icon size={19} strokeWidth={2} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-control bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-elevated transition-opacity group-hover:opacity-100 lg:group-hover:block">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapsed}
          className="mx-3 mb-2 hidden items-center justify-center gap-2 rounded-control border border-border py-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-t border-border p-3">
          <NavLink to="/profile" className="flex min-w-0 flex-1 items-center gap-3" onClick={onCloseMobile}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                {initials(user)}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user ? `${user.firstName} ${user.lastName}` : 'Loading…'}
                </p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            )}
          </NavLink>
          <button
            onClick={logout}
            aria-label="Log out"
            className="shrink-0 rounded-control p-2 text-muted transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}