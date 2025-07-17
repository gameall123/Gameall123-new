import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Admin Error Boundary:', {
      error: error.message,
      stack: error.stack,
      errorInfo,
      errorId: this.state.errorId
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                🚨 Errore Admin Panel
              </h2>
              <p className="text-gray-600 mb-4">
                Si è verificato un errore nel pannello admin.
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 mb-4">
                <strong>ID Errore:</strong> {this.state.errorId}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  🔄 Riprova
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  🏠 Torna alla Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
