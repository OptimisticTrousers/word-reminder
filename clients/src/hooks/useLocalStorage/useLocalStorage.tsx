import { useState, useEffect, Dispatch, SetStateAction } from "react";

export function useLocalStorage(
  key: string,
  initialValue: string
): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(key);
    if (jsonValue != null) return JSON.parse(jsonValue);
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
