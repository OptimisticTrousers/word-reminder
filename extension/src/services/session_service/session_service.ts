import { AuthParams } from "common";
import { service } from "../service";

export const sessionService = (function (service) {
  const { get, post, remove, VITE_API_DOMAIN } = service;

  function getCurrentUser() {
    return get({
      url: `${VITE_API_DOMAIN}/session`,
      options: {
        credentials: "include",
      },
    });
  }

  function logoutUser() {
    return remove({
      url: `${VITE_API_DOMAIN}/session`,
      options: {
        credentials: "include",
      },
    });
  }

  function loginUser(auth: AuthParams) {
    return post({
      url: `${VITE_API_DOMAIN}/session`,
      options: {
        body: JSON.stringify(auth),
      },
    });
  }

  return { getCurrentUser, logoutUser, loginUser };
})(service);
