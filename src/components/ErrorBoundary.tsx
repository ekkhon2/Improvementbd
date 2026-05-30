import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred. Please try again later.";
      let isPermissionError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes('permission-denied')) {
            errorMessage = "You don't have permission to access this data. Please ensure you are logged in with an authorized account.";
            isPermissionError = true;
          }
        }
      } catch (e) {
        // Not a JSON error message, use default
      }

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 rounded-full bg-red-50 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Oops! Something went wrong</h2>
          <p className="mb-8 max-w-md text-slate-600">
            {errorMessage}
          </p>
          <div className="flex gap-4">
            <Button onClick={this.handleReset} className="font-bold">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            {isPermissionError && (
              <Button variant="outline" onClick={() => window.location.href = '/admin'} className="font-bold">
                Go to Admin Login
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
