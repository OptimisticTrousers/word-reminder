import { useEffect } from "react";

export function useUserId(userId: number) {
  useEffect(() => {
    chrome.storage.sync.set({ userId });
  }, [userId]);
}
