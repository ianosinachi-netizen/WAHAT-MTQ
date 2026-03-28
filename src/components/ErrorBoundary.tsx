import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const isTranslationError = this.state.error?.message?.includes('Translation error');
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-gray-100 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600">
              <AlertCircle size={40} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {isTranslationError ? 'Translation Error' : 'Something went wrong'}
            </h1>
            
            <p className="text-gray-500 mb-8 leading-relaxed">
              {isTranslationError 
                ? 'We encountered an issue while translating the content. Please try again later or switch to English.'
                : 'An unexpected error occurred. We have been notified and are working to fix it.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-teal-900 text-white py-4 rounded-2xl font-bold hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                <Home size={20} />
                Back to Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-gray-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
