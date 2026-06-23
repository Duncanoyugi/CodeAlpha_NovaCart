import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in boundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-[var(--color-bg)] rounded-[var(--radius-2xl)] m-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-center w-16 h-16 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md mb-8 leading-relaxed">
            An unexpected error occurred in this section of the application. Please try reloading the page or contact support if the issue persists.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </Button>
            <Button variant="primary" onClick={this.handleReload}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
