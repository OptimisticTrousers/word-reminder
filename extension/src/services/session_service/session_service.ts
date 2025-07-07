import { service } from "../service";

export const sessionService = (function (service) {
  const { get, post, remove, VITE_API_DOMAIN } = service;

  function getCurrentUser() {
    return get({
      url: `${VITE_API_DOMAIN}/sessions`,
      options: {
        credentials: "include",
      },
    });
  }

  function logoutUser() {
    return remove({
      url: `${VITE_API_DOMAIN}/sessions`,
      options: {
        credentials: "include",
      },
    });
  }

  function loginUser(body: { email: string; password: string }) {
    return post({
      url: `${VITE_API_DOMAIN}/sessions`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    });
  }

  return { getCurrentUser, logoutUser, loginUser };
})(service);
