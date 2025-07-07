/* eslint-disable @typescript-eslint/no-explicit-any */
export const extension = (function () {
  const hasExtension = () => {
    return window.chrome && window.chrome.storage && window.chrome.runtime;
  };

  const runtime = {
    sendMessage: async (message: unknown): Promise<void> => {
      if (hasExtension()) {
        window.chrome.runtime.sendMessage(message);
      }
      return;
    },
    onMessage: {
      addListener: async (
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => void
      ): Promise<void> => {
        if (hasExtension()) {
          window.chrome.runtime.onMessage.addListener(callback);
        }
        return;
      },
    },
  };

  const storage = {
    sync: {
      remove: async (key: string): Promise<void> => {
        if (hasExtension()) {
          window.chrome.storage.sync.remove(key);
        }
        return;
      },
      set: async (items: { [key: string]: unknown }): Promise<void> => {
        if (hasExtension()) {
          window.chrome.storage.sync.set(items);
        }
        return;
      },
    },
  };

  return { storage, runtime };
})();
