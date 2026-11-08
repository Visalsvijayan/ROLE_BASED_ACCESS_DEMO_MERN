import { Component } from "react";

/**
 * Catches a crash while rendering anything below it and shows a friendly
 * message instead of a blank white page. (Only class components can do this.)
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Production apps send this to a service such as Sentry.
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container">
        <div className="card" role="alert" style={{ textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            An unexpected error happened. Reloading the page usually fixes it.
          </p>
          <p style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </p>
        </div>
      </div>
    );
  }
}
