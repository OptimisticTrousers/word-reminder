import { AuthParams } from "common";
import { service } from "../service";

export const userService = (function (service) {
  const { post, put, remove, VITE_API_DOMAIN } = service;

  function signupUser(auth: AuthParams) {
    return post({
      url: `${VITE_API_DOMAIN}/users`,
      options: {
        body: JSON.stringify(auth),
      },
    });
  }

  function updateUser(body: {
    id: string;
    email: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }) {
    return put({
      url: `${VITE_API_DOMAIN}/users/${body.id}`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
      },
    });
  }

  function deleteUser(id: string) {
    return remove({ url: `${VITE_API_DOMAIN}/users/${id}` });
  }

  return { signupUser, updateUser, deleteUser };
})(service);
