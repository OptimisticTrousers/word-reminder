import { service, Params } from "../service";

export const wordService = (function (service) {
  const { get, post, remove, VITE_API_DOMAIN } = service;

  function getWordList(userId: string | undefined, params: Params) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/words`,
      params,
      options: { credentials: "include" },
    });
  }

  function createWord({
    userId,
    formData,
  }: {
    userId: string | undefined;
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
    wordId,
  }: {
    userId: string;
    wordId: string;
  }) {
    return remove({
      url: `${VITE_API_DOMAIN}/users/${userId}/${wordId}`,
      options: { credentials: "include" },
    });
  }

  return { getWordList, createWord, deleteUserWord };
})(service);
