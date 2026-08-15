// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';

const COLLAPSE_KEY = 'sidebar-collapsed';

const Layout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === '1'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={[
          'flex min-h-screen flex-col transition-[margin] duration-200 ease-premium',
          collapsed ? 'lg:ml-[76px]' : 'lg:ml-64',
        ].join(' ')}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-bg/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-control p-2 text-text-secondary hover:bg-surface lg:hidden"
            >
              <Menu size={20} />
            </button>
            {title && (
              <h1 className="text-[15px] font-semibold text-text-primary sm:text-base">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="rounded-control p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              <Bell size={18} />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
