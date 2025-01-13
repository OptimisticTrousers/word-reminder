type Params = {
  [key: string]: unknown;
};

type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";

export const http = (function () {
  const request = async (
    url: string,
    params: Params,
    method: RequestMethods,
    options: RequestInit
  ): Promise<{ json: any; status: number }> => {
    const queryString: string = Object.entries(params)
      .map((param) => {
        return `${param[0]}=${param[1]}`;
      })
      .join("&");

    const input = new URL(`${url}${queryString && `?${queryString}`}`);

    const response: Response = await fetch(input, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const json: any = await response.json();

    return { json, status: response.status };
  };

  const get = async (
    url: string,
    params: Params = {},
    options: RequestInit = {}
  ) => {
    return request(url, params, "GET", options);
  };

  const post = async (
    url: string,
    params: Params = {},
    options: RequestInit = {}
  ) => {
    return request(url, params, "POST", options);
  };

  const put = async (
    url: string,
    params: Params = {},
    options: RequestInit = {}
  ) => {
    return request(url, params, "PUT", options);
  };

  const remove = async (
    url: string,
    params: Params = {},
    options: RequestInit = {}
  ) => {
    return request(url, params, "DELETE", options);
  };

  return { get, post, put, remove };
})();
