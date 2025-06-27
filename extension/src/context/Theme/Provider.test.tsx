import { useContext } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Theme, ThemeContext } from "./Context";
import { ThemeProvider } from "./Provider";

describe("ThemeProvider component", () => {
  function TestComponent() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    function handleClick() {
      toggleTheme();
    }

    return (
      <div>
        <div>Theme: {theme}</div>
        <button onClick={handleClick} role="switch">
          Toggle Theme
        </button>
      </div>
    );
  }

  it("renders dark theme by default", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const theme = screen.getByText(`Theme: ${Theme.Dark}`);
    const container = screen.getByTestId("container");
    expect(theme).toBeInTheDocument();
    expect(container.getAttribute("class")).toContain(
      `container--${Theme.Dark}`
    );
  });

  it("renders dark theme when theme is toggled twice", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const user = userEvent.setup();

    const button = screen.getByRole("switch", { name: "Toggle Theme" });
    await user.click(button);
    await user.click(button);

    const theme = screen.getByText(`Theme: ${Theme.Dark}`);
    const container = screen.getByTestId("container");
    expect(theme).toBeInTheDocument();
    expect(container.getAttribute("class")).toContain(
      `container--${Theme.Dark}`
    );
  });

  it("renders light theme when theme is toggled", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const user = userEvent.setup();

    const button = screen.getByRole("switch", { name: "Toggle Theme" });
    await user.click(button);

    const theme = screen.getByText(`Theme: ${Theme.Light}`);
    const container = screen.getByTestId("container");
    expect(theme).toBeInTheDocument();
    expect(container.getAttribute("class")).toContain(
      `container--${Theme.Light}`
    );
  });
});
