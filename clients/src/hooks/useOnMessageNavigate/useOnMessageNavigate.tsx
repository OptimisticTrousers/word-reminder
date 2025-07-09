import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extension } from "../../utils/extension";

export function useOnMessageRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    extension.runtime.onMessage.addListener(async function (message, sender) {
      if (sender.url === `chrome-extension://${sender.id}/service-worker.js`) {
        const resource = message.resource;
        const id = message.id;
        await navigate(`/${resource}/${id}`);
      }
    });
  }, [navigate]);
}
