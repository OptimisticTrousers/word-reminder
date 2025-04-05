import { render, screen } from "@testing-library/react";

import { useChromeStorageSync } from "./useChromeStorageSync";
import userEvent from "@testing-library/user-event";

describe("useChromeStorageSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const key = "userId";
  const value = "1";

  it("returns value already in chrome storage", async () => {
    function TestComponent() {
      const [userId] = useChromeStorageSync(key, value);

      return <button>{userId}</button>;
    }
    const mockStorageSyncGet = vi
      .spyOn(chrome.storage.sync, "get")
      .mockImplementation(async () => {
        return { key: "2" };
      });
    const mockStorageSyncSet = vi.spyOn(chrome.storage.sync, "set");

    render(<TestComponent />);

    const button = await screen.findByRole("button", { name: value });
    expect(button).toBeInTheDocument();
    expect(mockStorageSyncGet).toHaveBeenCalledTimes(2);
    expect(mockStorageSyncGet).toHaveBeenNthCalledWith(1, [key]);
    expect(mockStorageSyncGet).toHaveBeenNthCalledWith(2, [key]);
    expect(mockStorageSyncSet).not.toHaveBeenCalled();
  });

  it("sets initial value when there is no value in chrome storage", async () => {
    function TestComponent() {
      const [userId] = useChromeStorageSync(key, value);

      return <button>{userId}</button>;
    }
    const mockStorageSyncGet = vi
      .spyOn(chrome.storage.sync, "get")
      .mockImplementation(async () => {
        return { key: undefined };
      });
    const mockStorageSyncSet = vi.spyOn(chrome.storage.sync, "set");

    render(<TestComponent />);

    const button = await screen.findByRole("button", { name: value });
    expect(button).toBeInTheDocument();
    expect(mockStorageSyncGet).toHaveBeenCalledTimes(1);
    expect(mockStorageSyncGet).toHaveBeenCalledWith([key]);
    expect(mockStorageSyncSet).toHaveBeenCalledTimes(1);
    expect(mockStorageSyncSet).toHaveBeenCalledWith({ [key]: value });
  });

  it("changes chrome storage value when user changes value", async () => {
    function TestComponent() {
      const [userId, setUserId] = useChromeStorageSync(key, value);

      function handleClick() {
        setUserId("2");
      }

      return <button onClick={handleClick}>{userId}</button>;
    }
    const mockStorageSyncGet = vi
      .spyOn(chrome.storage.sync, "get")
      .mockImplementation(async () => {
        return { key: undefined };
      });
    const mockStorageSyncSet = vi.spyOn(chrome.storage.sync, "set");
    const user = userEvent.setup();
    render(<TestComponent />);

    const button = await screen.findByRole("button");
    await user.click(button);

    expect(button).toBeInTheDocument();
    expect(mockStorageSyncSet).toHaveBeenCalledTimes(2);
    expect(mockStorageSyncSet).toHaveBeenCalledWith({ [key]: value });
    expect(mockStorageSyncSet).toHaveBeenCalledWith({ [key]: "2" });
    expect(mockStorageSyncGet).toHaveBeenCalledTimes(2);
    expect(mockStorageSyncGet).toHaveBeenNthCalledWith(1, [key]);
    expect(mockStorageSyncGet).toHaveBeenNthCalledWith(2, [key]);
  });
});
