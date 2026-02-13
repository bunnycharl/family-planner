"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
  onError?: (error: Error, errorInfo: { componentStack?: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Generic Error Boundary component for catching React errors
 *
 * @example
 * ```tsx
 * <ErrorBoundary featureName="Calendar">
 *   <CalendarView />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }): void {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[ErrorBoundary] ${this.props.featureName || "Component"} error:`, error);
      console.error("Component stack:", errorInfo.componentStack);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-[var(--c-gray)] p-8 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--c-coral)]/20">
            <svg
              className="h-8 w-8 text-[var(--c-coral)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-xl font-extrabold uppercase text-[var(--c-black)]">
            Что-то пошло не так
          </h3>

          <p className="mb-6 max-w-md text-sm text-[var(--c-black)]/60">
            {this.props.featureName
              ? `Произошла ошибка при загрузке модуля "${this.props.featureName}"`
              : "Произошла ошибка при отображении компонента"}
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mb-6 w-full max-w-2xl rounded-2xl bg-white p-4 text-left">
              <summary className="cursor-pointer text-sm font-bold uppercase text-[var(--c-black)]">
                Подробности ошибки (dev)
              </summary>
              <pre className="mt-3 overflow-x-auto text-xs text-[#666]">
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="cursor-pointer rounded-2xl bg-[var(--c-black)] px-6 py-3 text-sm font-extrabold uppercase text-white transition-all hover:bg-[var(--c-lavender)]"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight Error Boundary HOC for wrapping features
 *
 * @example
 * ```tsx
 * export default withErrorBoundary(CalendarPage, { featureName: 'Calendar' });
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    featureName?: string;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: { componentStack?: string }) => void;
  }
): React.ComponentType<P> {
  return function ComponentWithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...options}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
