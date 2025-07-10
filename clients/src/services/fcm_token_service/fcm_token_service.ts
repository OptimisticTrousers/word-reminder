import { Token } from "@capacitor/push-notifications";
import { service } from "../service";

export const fcmTokenService = (function (service) {
  const { post, VITE_API_DOMAIN } = service;

  function createFCMToken({
    token,
    userId,
  }: {
    token: Token;
    userId: string;
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/fcmTokens`,
      options: {
        body: JSON.stringify({ token: token.value }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    });
  }

  return { createFCMToken };
})(service);
