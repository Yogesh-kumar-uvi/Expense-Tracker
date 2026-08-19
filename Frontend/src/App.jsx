// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import TransactionList from './pages/transactions/TransactionList';
import TransactionForm from './pages/transactions/TransactionForm';
import BudgetList from './pages/budgets/BudgetList';
import BudgetForm from './pages/budgets/BudgetForm';
import GoalList from './pages/goals/GoalList';
import GoalForm from './pages/goals/GoalForm';
import BillList from './pages/bills/BillList';
import BillForm from './pages/bills/BillForm';
import NotificationPage from './pages/notifications/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/resetpassword/:resettoken" element={<ResetPasswordPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout title="Dashboard">
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Categories */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout title="Categories">
                  <CategoryList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/new"
            element={
              <ProtectedRoute>
                <Layout title="New Category">
                  <CategoryForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/:id/edit"
            element={
              <ProtectedRoute>
                <Layout title="Edit Category">
                  <CategoryForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Transactions */}
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout title="Transactions">
                  <TransactionList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/new"
            element={
              <ProtectedRoute>
                <Layout title="New Transaction">
                  <TransactionForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id/edit"
            element={
              <ProtectedRoute>
                <Layout title="Edit Transaction">
                  <TransactionForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Budgets */}
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Layout title="Budgets">
                  <BudgetList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/new"
            element={
              <ProtectedRoute>
                <Layout title="New Budget">
                  <BudgetForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/:id/edit"
            element={
              <ProtectedRoute>
                <Layout title="Edit Budget">
                  <BudgetForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Goals */}
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Layout title="Goals">
                  <GoalList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/new"
            element={
              <ProtectedRoute>
                <Layout title="New Goal">
                  <GoalForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/:id/edit"
            element={
              <ProtectedRoute>
                <Layout title="Edit Goal">
                  <GoalForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Bills */}
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <Layout title="Bills">
                  <BillList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills/new"
            element={
              <ProtectedRoute>
                <Layout title="New Bill">
                  <BillForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills/:id/edit"
            element={
              <ProtectedRoute>
                <Layout title="Edit Bill">
                  <BillForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout title="Notifications">
                  <NotificationPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout title="Profile">
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;