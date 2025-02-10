import { RefObject, useEffect } from "react";

export function useContextMenu({
  inputRef,
  submitButtonRef,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  submitButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  useEffect(() => {
    const id = "1";

    function callback() {
      chrome.contextMenus.create({
        id,
        title: "Add Word",
        contexts: ["page"],
        enabled: true,
        visible: true,
      });
    }

    chrome.runtime.onInstalled.addListener(callback);
    return () => {
      chrome.runtime.onInstalled.removeListener(callback);
      chrome.contextMenus.remove(id);
    };
  }, []);

  useEffect(() => {
    function callback(item: chrome.contextMenus.OnClickData) {
      if (inputRef.current === null || submitButtonRef.current === null) {
        return;
      }
      const selectionText = item.selectionText;
      if (!selectionText) {
        return;
      }
      chrome.action.openPopup();
      inputRef.current.value = selectionText;
      submitButtonRef.current.click();
    }

    chrome.contextMenus.onClicked.addListener(callback);

    return () => {
      chrome.contextMenus.onClicked.removeListener(callback);
    };
  }, [inputRef, submitButtonRef]);
}
