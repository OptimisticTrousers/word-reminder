import { service, Params } from "../service";

export const userWordService = (function (service) {
  const { get, post, put, remove, VITE_API_DOMAIN } = service;

  function getUserWordList({
    userId,
    params,
  }: {
    userId: string;
    params: Params;
  }) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/userWords`,
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
      url: `${VITE_API_DOMAIN}/users/${userId}/userWords/${userWordId}`,
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
      url: `${VITE_API_DOMAIN}/users/${userId}/userWords`,
      options: {
        body: formData,
        credentials: "include",
      },
    });
  }

  function updateUserWord({
    userId,
    userWordId,
    body,
  }: {
    userId: string;
    userWordId: string;
    body: {
      learned: boolean;
    };
  }) {
    return put({
      url: `${VITE_API_DOMAIN}/users/${userId}/userWords/${userWordId}`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
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

  return {
    getUserWordList,
    getUserWord,
    createUserWord,
    updateUserWord,
    deleteUserWord,
  };
})(service);
