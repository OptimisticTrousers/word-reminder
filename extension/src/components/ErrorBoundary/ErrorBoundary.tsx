import React, { ReactNode, ErrorInfo } from "react";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMsg: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error(error);
    return { hasError: true, errorMsg: "" };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorMsg: error.message });
    console.error(error);
    console.error(errorInfo);
  }

  handleClick = () => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="boundary">
          <div className="boundary__container">
            <h1 className="boundary__title">An error occurred</h1>
            <button className="boundary__button" onClick={this.handleClick}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
