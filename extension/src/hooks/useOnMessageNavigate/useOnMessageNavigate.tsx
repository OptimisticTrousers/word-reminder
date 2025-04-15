import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useOnMessageRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (message) {
      const resource = message.resource;
      const id = message.id;
      navigate(`/${resource}/${id}`);
    });
  }, [navigate]);
}
