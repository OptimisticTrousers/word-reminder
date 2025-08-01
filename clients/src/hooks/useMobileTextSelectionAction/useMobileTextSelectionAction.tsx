import { useEffect } from "react";
import {
  Capacitor,
  PluginListenerHandle,
  registerPlugin,
} from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { userWordService } from "../../services/user_word_service";
import { useNotificationError } from "../useNotificationError";
import { ErrorResponse } from "../../types";

interface ActionData {
  textSelection: string;
}

interface TextSelectionActionPlugin {
  addListener(
    eventName: "textSelectionAction",
    listenerFunc: (info: ActionData) => void
  ): Promise<PluginListenerHandle>;
  getSelectionText: () => Promise<{ selectionText: string }>;
}

export function useMobileTextSelectionAction(userId: string) {
  const navigate = useNavigate();
  const { showNotificationError } = useNotificationError();

  useEffect(() => {
    (async () => {
      if (Capacitor.getPlatform() === "web") {
        return;
      }
      const TextSelectionAction = registerPlugin<TextSelectionActionPlugin>(
        "TextSelectionAction"
      );
      const { selectionText } = await TextSelectionAction.getSelectionText();
      if (selectionText) {
        const formData = new FormData();
        formData.append("word", selectionText);
        try {
          const response = await userWordService.createUserWord({
            userId,
            formData,
          });
          await navigate(`/userWords/${response.json.userWord.id}`);
        } catch (error: unknown) {
          showNotificationError(error as ErrorResponse);
        }
      }
    })();
  }, [navigate, userId, showNotificationError]);
}
