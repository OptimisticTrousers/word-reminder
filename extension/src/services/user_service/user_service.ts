import { service } from "../service";

export const userService = (function (service) {
  const { post, remove, VITE_API_DOMAIN } = service;

  function signupUser(body: { email: string; password: string }) {
    return post({
      url: `${VITE_API_DOMAIN}/users`,
      options: {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      },
    });
  }

  function deleteUser({ userId }: { userId: string }) {
    return remove({ url: `${VITE_API_DOMAIN}/users/${userId}` });
  }

  return { signupUser, deleteUser };
})(service);
