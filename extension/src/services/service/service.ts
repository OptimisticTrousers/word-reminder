import { http } from "common";

export interface AuthParams {
  email: string;
  password: string;
}

export interface Params {
  [key: string]: string;
}

export const service = (function (http) {
  const VITE_API_DOMAIN = import.meta.env.VITE_API_DOMAIN;
  const { get, post, put, remove } = http;

  async function rejectedGet({
    url,
    params,
    options,
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) {
    const response = await get({ url, params, options });
    if (response.status !== 200) {
      return Promise.reject(response);
    }
    return response;
  }

  async function rejectedPost({
    url,
    params,
    options,
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) {
    const response = await post({ url, params, options });
    if (response.status !== 200) {
      return Promise.reject(response);
    }
    return response;
  }

  async function rejectedPut({
    url,
    params,
    options,
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) {
    const response = await put({ url, params, options });
    if (response.status !== 200) {
      return Promise.reject(response);
    }
    return response;
  }

  async function rejectedRemove({
    url,
    params,
    options,
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) {
    const response = await remove({ url, params, options });
    if (response.status !== 200) {
      return Promise.reject(response);
    }
    return response;
  }

  return {
    get: rejectedGet,
    post: rejectedPost,
    put: rejectedPut,
    remove: rejectedRemove,
    VITE_API_DOMAIN,
  };
})(http);
