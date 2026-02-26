'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackTitle?: string; fallbackDescription?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally swallow to render graceful fallback UI.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[460px] w-full items-center justify-center rounded-2xl border bg-slate-50 p-6">
          <div className="max-w-md rounded-2xl border bg-white p-5 text-center shadow-soft">
            <AlertTriangle className="mx-auto h-6 w-6 text-amber-600" />
            <h2 className="mt-2 text-base font-semibold text-slate-900">{this.props.fallbackTitle ?? 'Map temporarily unavailable'}</h2>
            <p className="mt-1 text-sm text-slate-600">{this.props.fallbackDescription ?? 'The dashboard is still available. Please refresh or try again in a moment.'}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
