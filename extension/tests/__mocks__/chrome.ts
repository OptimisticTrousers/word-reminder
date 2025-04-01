// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- disable ESLint check for the next line
// @ts-nocheck -- this TS comment turns off TypeScript type checking for this file because we do not
// mock the entire Chrome API, but only the parts we need
global.chrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn().mockImplementation((callback) => {
        callback();
      }),
      removeListener: vi.fn().mockImplementation((callback) => {
        callback();
      }),
    },
    getURL: vi.fn(),
  },
  contextMenus: {
    onClicked: {
      addListener: vi.fn().mockImplementation((callback) => {
        const item = { selectionText: "" };
        callback(item);
      }),
      removeListener: vi.fn().mockImplementation((callback) => {
        const item = { selectionText: "" };
        callback(item);
      }),
    },
    remove: vi.fn(),
    create: vi.fn(),
  },
  action: {
    openPopup: vi.fn(),
  },
  tabs: {
    create: vi.fn(),
  },
};
