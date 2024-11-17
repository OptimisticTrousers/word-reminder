type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";

type Params = {
  [key: string]: unknown;
};

export class Http {
  private async request(
    url: string,
    params: Params,
    method: RequestMethods,
    options: RequestInit
  ) {
    const queryString = Object.entries(params)
      .map((param) => {
        return `${param[0]}=${param[1]}`;
      })
      .join("&");

    const response = await fetch(`${url}?${queryString}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const json = await response.json();

    return { status: response.status, json };
  }

  async get(url: string, params: Params = {}, options: RequestInit = {}) {
    return this.request(url, params, "GET", options);
  }

  async post(url: string, params: Params = {}, options: RequestInit = {}) {
    return this.request(url, params, "POST", options);
  }

  async put(url: string, params: Params = {}, options: RequestInit = {}) {
    return this.request(url, params, "PUT", options);
  }

  async remove(url: string, params: Params = {}, options: RequestInit = {}) {
    return this.request(url, params, "DELETE", options);
  }
}
