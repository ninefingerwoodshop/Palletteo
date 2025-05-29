// components/ErrorBoundary.tsx
"use client";
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Admin Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // sendErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className="error-boundary">
    <div className="error-boundary__container">
      <h2>Something went wrong in the admin panel</h2>
      <details className="error-details">
        <summary>Error details</summary>
        <pre className="error-message">{error.message}</pre>
        <pre className="error-stack">{error.stack}</pre>
      </details>
      <div className="error-actions">
        <button onClick={resetError} className="btn-primary">
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

// Toast Notification System
interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<ToastNotification[]>(
    []
  );

  const addNotification = (
    message: string,
    type: ToastNotification["type"] = "info",
    duration = 5000
  ) => {
    const id = Date.now().toString();
    const notification: ToastNotification = { id, message, type, duration };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success: (message: string) => addNotification(message, "success"),
    error: (message: string) => addNotification(message, "error"),
    warning: (message: string) => addNotification(message, "warning"),
    info: (message: string) => addNotification(message, "info"),
  };
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <>
      {children}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification notification--${notification.type}`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="notification__content">
              <span className="notification__message">
                {notification.message}
              </span>
              <button
                className="notification__close"
                onClick={() => removeNotification(notification.id)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ErrorBoundary;
