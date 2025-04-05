import { render } from "@testing-library/react";

import { useUserId } from "./useUserId";

describe("useUserId", () => {
  const userId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sync storage", () => {
    it("sets user id", () => {
      function TestComponent() {
        useUserId(userId);

        return <div></div>;
      }

      const mockSyncSet = vi.spyOn(chrome.storage.sync, "set");

      render(<TestComponent />);

      expect(mockSyncSet).toHaveBeenCalledTimes(1);
      expect(mockSyncSet).toHaveBeenCalledWith({
        userId,
      });
    });
  });
});
