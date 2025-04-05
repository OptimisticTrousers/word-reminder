import { useEffect } from "react";
import { userWordService } from "../../services/user_word_service";
import { useChromeStorageSync } from "../useChromeStorageSync";
import { useNavigate } from "react-router-dom";

export function useContextMenu(initialValue: string) {
  const [userId] = useChromeStorageSync("userId", initialValue);
  const navigate = useNavigate();

  useEffect(() => {
    const id = "84";
    function callback() {
      chrome.contextMenus.create({
        id,
        title: "Add Word",
        contexts: ["selection"],
        type: "normal",
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
    async function callback(info: chrome.contextMenus.OnClickData) {
      const selectionText = info.selectionText;
      if (!selectionText) {
        return;
      }
      const formData = new FormData();
      formData.append("word", String(selectionText));
      await chrome.action.openPopup();
      const response = await userWordService.createUserWord({
        userId,
        formData,
      });
      navigate(`/userWords/${response.json.userWord.id}`);
    }

    chrome.contextMenus.onClicked.addListener(callback);

    return () => {
      chrome.contextMenus.onClicked.removeListener(callback);
    };
  }, [navigate, userId]);
}
