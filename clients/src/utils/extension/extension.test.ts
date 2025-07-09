import { extension } from "./extension";

describe("chrome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const originalChrome = globalThis.chrome;
  afterEach(() => {
    globalThis.chrome = originalChrome;
  });

  describe("when the application is in a non-web environment", () => {
    describe("runtime", () => {
      it("calls the sendMessage function", async () => {
        const mockSendMessage = vi
          .spyOn(window.chrome.runtime, "sendMessage")
          .mockImplementation(vi.fn());
        window.chrome = undefined as never;
        const key = "userId";

        await extension.storage.sync.remove(key);

        expect(mockSendMessage).not.toHaveBeenCalled();
      });

      describe("onMessage", () => {
        it("calls the addListener function", async () => {
          const mockOnMessageAddListener = vi
            .spyOn(window.chrome.runtime.onMessage, "addListener")
            .mockImplementation(vi.fn());
          window.chrome = undefined as never;
          const key = "userId";

          await extension.storage.sync.remove(key);

          expect(mockOnMessageAddListener).not.toHaveBeenCalled();
        });
      });
    });

    describe("storage", () => {
      it("calls the functions to remove a key", async () => {
        const mockSyncRemove = vi
          .spyOn(window.chrome.storage.sync, "remove")
          .mockImplementation(vi.fn());
        window.chrome = {} as never;
        const key = "userId";

        await extension.storage.sync.remove(key);

        expect(mockSyncRemove).not.toHaveBeenCalled();
      });

      it("calls the functions to set a key", async () => {
        const mockSyncRemove = vi
          .spyOn(window.chrome.storage.sync, "set")
          .mockImplementation(vi.fn());
        window.chrome = {} as never;
        const keys = { userId: "userId" };

        await extension.storage.sync.set(keys);

        expect(mockSyncRemove).not.toHaveBeenCalled();
      });
    });
  });

  describe("when the application is in a web environment", () => {
    describe("runtime", () => {
      it("calls the sendMessage function", async () => {
        const mockSendMessage = vi
          .spyOn(window.chrome.runtime, "sendMessage")
          .mockImplementation(vi.fn());
        const callback = vi.fn();

        await extension.runtime.sendMessage(callback);

        expect(mockSendMessage).toHaveBeenCalledTimes(1);
        expect(mockSendMessage).toHaveBeenCalledWith(callback);
      });

      describe("onMessage", () => {
        it("calls the addListener function", async () => {
          const mockOnMessageAddListener = vi
            .spyOn(window.chrome.runtime.onMessage, "addListener")
            .mockImplementation(vi.fn());
          const callback = vi.fn();

          await extension.runtime.onMessage.addListener(callback);

          expect(mockOnMessageAddListener).toHaveBeenCalledTimes(1);
          expect(mockOnMessageAddListener).toHaveBeenCalledWith(callback);
        });
      });
    });

    describe("storage", () => {
      it("calls the functions to remove a key", async () => {
        // window.chrome is already mocked for all tests
        const mockSyncRemove = vi
          .spyOn(window.chrome.storage.sync, "remove")
          .mockImplementation(vi.fn());
        const key = "userId";

        await extension.storage.sync.remove(key);

        expect(mockSyncRemove).toHaveBeenCalledTimes(1);
        expect(mockSyncRemove).toHaveBeenCalledWith(key);
      });

      it("calls the functions to set a key", async () => {
        // window.chrome is already mocked for all tests
        const mockSyncRemove = vi
          .spyOn(window.chrome.storage.sync, "set")
          .mockImplementation(vi.fn());
        const keys = { userId: "userId" };

        await extension.storage.sync.set(keys);

        expect(mockSyncRemove).toHaveBeenCalledTimes(1);
        expect(mockSyncRemove).toHaveBeenCalledWith(keys);
      });
    });
  });
});
