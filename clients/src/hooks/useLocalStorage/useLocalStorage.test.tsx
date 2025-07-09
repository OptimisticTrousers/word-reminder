import { render, screen } from "@testing-library/react";

import { useLocalStorage } from "./useLocalStorage";
import userEvent from "@testing-library/user-event";

describe("useLocalStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockLocalStorage() {
    const store: { [key: string]: string } = {};

    function getItem(key: string) {
      return store[key] || null;
    }

    function setItem(key: string, value: string) {
      return (store[key] = value);
    }

    return {
      getItem,
      setItem,
    };
  }

  it("returns value already in local storage", () => {
    function TestComponent() {
      const [theme] = useLocalStorage("theme", "dark");

      return <button>{theme}</button>;
    }
    const mockLocalStorage = createMockLocalStorage();
    const mockGetItem = vi.spyOn(mockLocalStorage, "getItem");
    mockLocalStorage.setItem("theme", "\"light\"");
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    render(<TestComponent />);

    const theme = screen.getByRole("button", { name: "light" });
    expect(theme).toBeInTheDocument();
    expect(mockGetItem).toHaveBeenCalledTimes(1);
    expect(mockGetItem).toHaveBeenCalledWith("theme");
  });

  it("returns initial value when there is no value in local storage", () => {
    function TestComponent() {
      const [theme] = useLocalStorage("theme", "dark");

      return <button>{theme}</button>;
    }
    const mockLocalStorage = createMockLocalStorage();
    const mockGetItem = vi.spyOn(mockLocalStorage, "getItem");
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    render(<TestComponent />);

    const theme = screen.getByRole("button", { name: "dark" });
    expect(theme).toBeInTheDocument();
    expect(mockGetItem).toHaveBeenCalledTimes(1);
    expect(mockGetItem).toHaveBeenCalledWith("theme");
  });

  it("changes localStorage value when user changes value", async () => {
    function TestComponent() {
      const [theme, setValue] = useLocalStorage("theme", "dark");

      function handleClick() {
        setValue("light");
      }

      return <button onClick={handleClick}>{theme}</button>;
    }
    const mockLocalStorage = createMockLocalStorage();
    const mockSetItem = vi.spyOn(mockLocalStorage, "setItem");
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
    const user = userEvent.setup();
    render(<TestComponent />);

    const button = screen.getByRole("button");
    await user.click(button);

    const theme = await screen.findByText("light");
    expect(theme).toBeInTheDocument();
    expect(mockSetItem).toHaveBeenCalledTimes(2);
    expect(mockSetItem).toHaveBeenCalledWith("theme", "\"dark\"");
    expect(mockSetItem).toHaveBeenCalledWith("theme", "\"light\"");
  });
});
