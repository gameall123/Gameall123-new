import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // ✅ Skip Error Boundary for certain non-critical errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStack = error?.stack?.toLowerCase() || '';
    
    // Don't trigger Error Boundary for common auth-related errors
    if (
      errorMessage.includes('non autenticato') ||
      errorMessage.includes('401') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('authentication') ||
      errorStack.includes('auth') ||
      errorStack.includes('login')
    ) {
      console.warn('🔐 Auth-related error caught but not showing Error Boundary:', error.message);
      return {
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      };
    }
    
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('🚨 Error Boundary triggered with ID:', errorId, error);
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    // ✅ Enhanced error logging for better debugging
    console.error('🚨 Error details:', {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
    
    this.setState({
      error,
      errorInfo,
    });

    // ✅ Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // ✅ Send error to logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // ✅ In a real app, you would send this to a service like Sentry
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      // ✅ Additional context for debugging
      props: this.props,
      state: this.state,
    };

    console.log('📊 Error report:', errorReport);
    
    // Example: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) })
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report: ${this.state.error?.message || 'Unknown Error'}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Component Stack:
${this.state.errorInfo?.componentStack || 'N/A'}
    `);
    
    // ✅ Open email client or bug reporting system
    window.open(`mailto:support@gameall.com?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      // ✅ Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-red-800 dark:text-red-200">
                Ops! Qualcosa è andato storto
              </CardTitle>
              <CardDescription>
                Si è verificato un errore inaspettato. Ti chiediamo scusa per l'inconveniente.
              </CardDescription>
              {this.state.errorId && (
                <p className="text-xs text-gray-500 mt-2">
                  ID Errore: {this.state.errorId}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                  <p className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    Error Details (Development Mode):
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 break-all mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                      <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Riprova
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={this.handleReload}
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Ricarica
                  </Button>
                  
                  <Button 
                    onClick={this.handleGoHome}
                    className="w-full"
                    variant="outline"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    onClick={this.handleReportBug}
                    className="w-full"
                    variant="ghost"
                    size="sm"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    Segnala Bug
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}