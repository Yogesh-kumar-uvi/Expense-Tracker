// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, Receipt } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

const currency = (n) =>
  `₹${Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function KpiCard({ label, amount, icon: Icon, tone }) {
  const toneClasses = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    success: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
  }[tone];

  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-control ${toneClasses}`}>
          <Icon size={17} strokeWidth={2} />
        </span>
      </div>
      <p className="font-numeric mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-[28px]">
        {currency(amount)}
      </p>
    </div>
  );
}

function EmptyRow({ children }) {
  return <p className="py-6 text-center text-sm text-muted">{children}</p>;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-card border border-border bg-card p-5">
      <div className="h-4 w-24 rounded bg-surface" />
      <div className="mt-4 h-7 w-32 rounded bg-surface" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/dashboard');
        setSummary(data.data);
      } catch (e) {
        setError('Could not load your dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          Good to see you, {user?.firstName ?? '...'} 👋
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Here's your financial overview for this month.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-control border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-500/20 dark:bg-danger-500/10 dark:text-danger-400">
          {error}
        </div>
      )}

      {/* KPI cards — only fields the API actually returns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard label="Income (this month)" amount={summary?.incomeCurrent} icon={TrendingUp} tone="success" />
            <KpiCard label="Expenses (this month)" amount={summary?.expenseCurrent} icon={TrendingDown} tone="danger" />
            <KpiCard label="Net (this month)" amount={summary?.netCurrent} icon={Wallet} tone="primary" />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Budgets */}
        <section className="rounded-card border border-border bg-card p-5 shadow-subtle">
          <div className="mb-4 flex items-center gap-2">
            <PiggyBank size={17} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-text-primary">Budgets</h3>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 rounded bg-surface" />
              <div className="h-12 rounded bg-surface" />
            </div>
          ) : summary?.budgets?.length ? (
            <ul className="space-y-4">
              {summary.budgets.map((b) => {
                const pct = Math.min(Number(b.percentSpent) || 0, 100);
                const over = Number(b.percentSpent) >= 100;
                const near = !over && Number(b.percentSpent) >= 80;
                const barColor = over ? 'bg-danger-500' : near ? 'bg-warning-500' : 'bg-success-500';
                return (
                  <li key={b._id}>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-text-primary">
                        {b.categoryId?.name ?? 'Budget'}
                      </span>
                      <span className="font-numeric text-text-secondary">
                        {currency(b.spent)} / {currency(b.amount)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className={`h-full rounded-full ${barColor} transition-[width] duration-500 ease-premium`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyRow>No budgets yet. Create one to start tracking spending limits.</EmptyRow>
          )}
        </section>

        {/* Goals */}
        <section className="rounded-card border border-border bg-card p-5 shadow-subtle">
          <div className="mb-4 flex items-center gap-2">
            <Target size={17} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-text-primary">Goals</h3>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 rounded bg-surface" />
              <div className="h-12 rounded bg-surface" />
            </div>
          ) : summary?.goals?.length ? (
            <ul className="space-y-4">
              {summary.goals.map((g) => {
                const pct = Math.min(Number(g.progressPercent) || 0, 100);
                return (
                  <li key={g._id}>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-text-primary">{g.name}</span>
                      <span className="font-numeric text-text-secondary">
                        {currency(g.currentAmount)} / {currency(g.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-primary-600 transition-[width] duration-500 ease-premium"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyRow>No savings goals yet. Set one to start tracking progress.</EmptyRow>
          )}
        </section>
      </div>

      {/* Upcoming bills */}
      <section className="mt-6 rounded-card border border-border bg-card p-5 shadow-subtle">
        <div className="mb-4 flex items-center gap-2">
          <Receipt size={17} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-text-primary">Upcoming bills (next 7 days)</h3>
        </div>
        {loading ? (
          <div className="animate-pulse h-16 rounded bg-surface" />
        ) : summary?.upcomingBills?.length ? (
          <ul className="divide-y divide-border">
            {summary.upcomingBills.map((bill) => (
              <li key={bill._id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-text-primary">{bill.name}</span>
                <span className="flex items-center gap-4">
                  <span className="text-muted">
                    Due {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="font-numeric font-semibold text-text-primary">{currency(bill.amount)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyRow>No bills due in the next 7 days.</EmptyRow>
        )}
      </section>
    </div>
  );
}
