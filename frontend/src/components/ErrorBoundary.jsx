import { Component } from "react";

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-app flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="font-display text-2xl text-[var(--color-parchment)]">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-[var(--color-parchment-muted)]">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[var(--color-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]"
          >
            Reload app
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
