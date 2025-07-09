import { render } from "@testing-library/react";

import { useInterval } from "./useInterval";

describe("useInterval", () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the callback function on an interval", () => {
    const delay = 50;
    function TestComponent() {
      useInterval(mockCallback, delay);

      return <div></div>;
    }

    vi.useFakeTimers();
    render(<TestComponent />);

    vi.advanceTimersByTime(delay);
    vi.advanceTimersByTime(delay);
    vi.advanceTimersByTime(delay);
    vi.advanceTimersByTime(delay);

    expect(mockCallback).toHaveBeenCalledTimes(4);
    expect(mockCallback).toHaveBeenCalledWith();
  });

  it("does not call the callback function when no delay is set", () => {
    function TestComponent() {
      useInterval(mockCallback, null);

      return <div></div>;
    }
    vi.useFakeTimers();
    render(<TestComponent />);

    vi.runAllTimers();

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
