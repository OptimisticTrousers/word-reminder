// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- disable ESLint check for the next line
// @ts-nocheck -- this TS comment turns off TypeScript type checking for this file because we do not
// mock the entire Chrome API, but only the parts we need
global.chrome = {
  runtime: {
    onStartup: {
      addListener: vi.fn().mockImplementation((callback) => {
        callback();
      }),
    },
    onMessage: {
      addListener: vi.fn().mockImplementation((callback) => {
        callback();
      }),
    },
    sendMessage: vi.fn().mockResolvedValue(),
    getURL: vi.fn(),
  },
  contextMenus: {
    onClicked: {
      addListener: vi.fn().mockImplementation((callback) => {
        const item = { selectionText: "" };
        callback(item);
      }),
    },
    create: vi.fn(),
  },
  action: {
    openPopup: vi.fn().mockResolvedValue(),
  },
  tabs: {
    create: vi.fn(),
  },
  storage: {
    sync: {
      set: vi.fn().mockResolvedValue(),
      set: vi.fn().mockResolvedValue(),
      remove: vi.fn().mockResolvedValue(),
    },
  },
};
