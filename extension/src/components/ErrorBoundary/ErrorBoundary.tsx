import { Component, ReactNode } from "react";
import { Link } from "react-router-dom";

import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boundary">
          <div className="boundary__container">
            <img
              className="boundary__image"
              src="/images/word-reminder.png"
              alt=""
            />
            <h2 className="boundary__title">An error occurred.</h2>
            <p className="boundary__message">{this.state.error.message}</p>
            <Link to="/" className="boundary__link">
              Go back to the home page.
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
