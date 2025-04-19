/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, useEffect, useState } from "react";

export function useChromeStorageSync(
  key: string,
  initialValue: string
): [any, Dispatch<any>] {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    chrome.storage.sync.get([key]).then((result) => {
      let resultValue = result.key;
      if (!resultValue) {
        chrome.storage.sync.set({ [key]: value });
        resultValue = value;
      }
      setValue(resultValue);
    });
  }, [key, value, initialValue]);

  return [value, setValue];
}
