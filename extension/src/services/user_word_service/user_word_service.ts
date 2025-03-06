import { service, Params } from "../service";

export const userWordService = (function (service) {
  const { get, post, remove, VITE_API_DOMAIN } = service;

  function getUserWordList({
    userId,
    params,
  }: {
    userId: string;
    params: Params;
  }) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/words`,
      params,
      options: { credentials: "include" },
    });
  }

  function getUserWord({
    userId,
    userWordId,
  }: {
    userId: string;
    userWordId: string;
  }) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/words/${userWordId}`,
      options: { credentials: "include" },
    });
  }

  function createUserWord({
    userId,
    formData,
  }: {
    userId: string;
    formData: FormData;
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/words`,
      options: {
        body: formData,
        credentials: "include",
      },
    });
  }

  function deleteUserWord({
    userId,
    userWordId,
  }: {
    userId: string;
    userWordId: string;
  }) {
    return remove({
      url: `${VITE_API_DOMAIN}/users/${userId}/userWords/${userWordId}`,
      options: { credentials: "include" },
    });
  }

  return { getUserWordList, getUserWord, createUserWord, deleteUserWord };
})(service);
