import React from 'react';

/**
 * Generic error boundary to catch rendering errors in child components.
 * Displays a fallback UI and logs the error to the console.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Algo salió mal.</h2>
          <p>Intenta recargar la página o contacta soporte si el problema persiste.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
