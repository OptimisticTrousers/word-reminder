import { useContext } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeContext } from "./Context";
import { ThemeProvider } from "./Provider";

describe("ThemeProvider component", () => {
  function TestComponent() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    function handleClick() {
      toggleTheme();
    }

    return <button onClick={handleClick}>{theme}</button>;
  }

  it("renders dark theme by default", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: "dark" });
    expect(button).toBeInTheDocument();
  });

  it("renders dark theme when theme is toggled twice", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const user = userEvent.setup();

    const button = screen.getByRole("button", { name: "dark" });
    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent("dark");
  });

  it("renders light theme when theme is toggled", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const user = userEvent.setup();

    const button = screen.getByRole("button", { name: "dark" });
    await user.click(button);

    expect(button).toHaveTextContent("light");
  });
});
