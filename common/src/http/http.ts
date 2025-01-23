type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";

export const http = (function () {
  const request = async (
    url: string,
    params: URLSearchParams,
    options: RequestInit,
    method: RequestMethods
  ): Promise<{ json: any; status: number }> => {
    const input = new URL(`${url}${params && `?${params.toString()}`}`);

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

  const get = ({
    url,
    params = new URLSearchParams(),
    options = {},
  }: {
    url: string;
    params?: URLSearchParams;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "GET");
  };

  const post = ({
    url,
    params = new URLSearchParams(),
    options = {},
  }: {
    url: string;
    params?: URLSearchParams;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "POST");
  };

  const put = ({
    url,
    params = new URLSearchParams(),
    options = {},
  }: {
    url: string;
    params?: URLSearchParams;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "PUT");
  };

  const remove = ({
    url,
    params = new URLSearchParams(),
    options = {},
  }: {
    url: string;
    params?: URLSearchParams;
    options?: RequestInit;
  }) => {
    return request(url, params, options, "DELETE");
  };

  return { get, post, put, remove };
})();
