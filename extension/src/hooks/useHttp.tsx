type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";

const useHttp = () => {
  const request = async (
    url: string,
    method: HttpMethods,
    options: RequestInit,
    body?: unknown
  ) => {
    const response = await fetch(url, {
      method,
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      body: JSON.stringify(body),
    });

    const json = await response.json();

    return json;
  };

  const get = async (url: string, options: RequestInit = {}) => {
    return request(url, "GET", options);
  };

  const post = async (
    url: string,
    body: unknown,
    options: RequestInit = {}
  ) => {
    return request(url, "POST", options, body);
  };

  const put = async (url: string, body: unknown, options: RequestInit = {}) => {
    return request(url, "PUT", options, body);
  };

  const remove = async (url: string, options: RequestInit = {}) => {
    return request(url, "DELETE", options);
  };

  return { get, post, put, remove };
};

export default useHttp;
