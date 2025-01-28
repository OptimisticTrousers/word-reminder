import { Component, ErrorInfo, ReactNode } from "react";

import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props> {
  state = {
    hasError: false,
    errorMsg: "",
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    console.error(error);
    return { hasError: true, errorMsg: "" };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorMsg: error.message });
    console.error(error);
    console.error(errorInfo);
  }

  handleClick() {
    window.location.reload();
  }

  render() {
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
