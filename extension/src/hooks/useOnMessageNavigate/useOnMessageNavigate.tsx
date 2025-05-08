import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useOnMessageRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    chrome.runtime.onMessage.addListener(async function (message, sender) {
      if (sender.url === `chrome-extension://${sender.id}/service-worker.js`) {
        const resource = message.resource;
        const id = message.id;
        await navigate(`/${resource}/${id}`);
      }
    });
  }, [navigate]);
}
