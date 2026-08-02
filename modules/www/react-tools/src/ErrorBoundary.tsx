import { Component, ReactElement, ReactNode } from 'react';

type EBProps = { children: ReactNode; error?: ReactElement | string };
type EBState = { hasError: boolean };
export class ErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  override componentDidCatch(error: unknown, errorInfo: unknown) {
    // You can also log the error to an error reporting service
    console.error(error);
    console.error(errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.error || <h4>Something went wrong</h4>;
    }

    return this.props.children;
  }
}
