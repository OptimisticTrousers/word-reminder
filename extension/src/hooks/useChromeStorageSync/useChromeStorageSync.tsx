/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, useEffect, useState } from "react";

export function useChromeStorageSync(
  key: string,
  initialValue: string
): [any, Dispatch<any>] {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    chrome.storage.sync.get([key]).then((result) => {
      if (result.key) {
        setValue(result.key);
      } else {
        chrome.storage.sync.set({ [key]: value });
      }
    });
  }, [key, value, initialValue]);

  return [value, setValue];
}
