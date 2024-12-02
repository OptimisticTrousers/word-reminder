type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";

type Params = {
  [key: string]: unknown;
};

// TODO: Write tests for this Http Class
export class Http {
  private async request(
    url: string,
    params: Params,
    method: RequestMethods,
    options: RequestInit
  ): Promise<{ json: any; status: number }> {
    const queryString: string = Object.entries(params)
      .map((param) => {
        return `${param[0]}=${param[1]}`;
      })
      .join("&");

    const response: Response = await fetch(`${url}?${queryString}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const json: any = await response.json();

    return { json, status: response.status };
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
