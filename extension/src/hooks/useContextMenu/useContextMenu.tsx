import { RefObject, useEffect } from "react";

export function useContextMenu({
  inputRef,
  submitButtonRef,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  submitButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  useEffect(() => {
    const id = "84";
    chrome.contextMenus.create({
      id,
      title: "Add Word",
      contexts: ["selection"],
      type: "normal",
      enabled: true,
      visible: true,
    });

    return () => {
      chrome.contextMenus.remove(id);
    };
  }, []);

  useEffect(() => {
    function callback(item: chrome.contextMenus.OnClickData) {
      const selectionText = item.selectionText;
      if (!selectionText) {
        return;
      }
      chrome.action.openPopup().then(() => {
        if (inputRef.current === null || submitButtonRef.current === null) {
          return;
        }
        inputRef.current.value = selectionText;
        submitButtonRef.current.click();
      });
    }

    chrome.contextMenus.onClicked.addListener(callback);

    return () => {
      chrome.contextMenus.onClicked.removeListener(callback);
    };
  }, [inputRef, submitButtonRef]);
}
