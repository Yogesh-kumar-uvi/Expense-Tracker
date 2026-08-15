// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface the real error in the browser console instead of a silent blank screen
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600 dark:bg-danger-500/10">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Something went wrong</h1>
            <p className="mt-1 max-w-sm text-sm text-text-secondary">
              This page hit an unexpected error. Reloading usually fixes it — if not, check the
              browser console (F12) for the exact error to report it.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-control bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
