type Params = {
  [key: string]: unknown;
};

type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";

export const http = (function () {
  const request = async (
    url: string,
    params: Params,
    options: RequestInit,
    method: RequestMethods
  ): Promise<{ json: any; status: number }> => {
    const queryString: string = Object.entries(params)
      .map((param) => {
        return `${param[0]}=${param[1]}`;
      })
      .join("&");
    const input = new URL(`${url}${queryString && `?${queryString}`}`);

    const response: Response = await fetch(input, {
      method,
      ...options,
    });

    const json: any = await response.json();

    return { json, status: response.status };
  };

  const get = ({
    url,
    params = {},
    options = {},
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "GET");
  };

  const post = ({
    url,
    params = {},
    options = {},
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "POST");
  };

  const put = ({
    url,
    params = {},
    options = {},
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "PUT");
  };

  const remove = ({
    url,
    params = {},
    options = {},
  }: {
    url: string;
    params?: Params;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "DELETE");
  };

  return { get, post, put, remove };
})();
