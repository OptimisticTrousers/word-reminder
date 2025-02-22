import { http } from "common";

import { service } from "./service";

vi.mock("common");

describe("service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get", () => {
    it("returns resolved promise from fetch when status code is 200", async () => {
      const mockHttpGet = vi.spyOn(http, "get").mockImplementation(async () => {
        return {
          json: {},
          status: 200,
        };
      });

      const response = await service.get({ url: "https://example.com" });

      expect(mockHttpGet).toHaveBeenCalledTimes(1);
      expect(mockHttpGet).toHaveBeenCalledWith({ url: "https://example.com" });
      expect(response).toEqual({ json: {}, status: 200 });
    });

    it("returns resolved promise from fetch when status code is 401", async () => {
      const message = "User is unauthenticated.";
      const mockHttpGet = vi.spyOn(http, "get").mockImplementation(async () => {
        return {
          json: { message },
          status: 401,
        };
      });

      const response = await service.get({ url: "https://example.com" });

      expect(mockHttpGet).toHaveBeenCalledTimes(1);
      expect(mockHttpGet).toHaveBeenCalledWith({ url: "https://example.com" });
      expect(response).toEqual({ json: { message }, status: 401 });
    });

    it("returns rejected promise from fetch when the status is not 200", async () => {
      const mockHttpGet = vi.spyOn(http, "get").mockImplementation(async () => {
        return {
          json: { message: "error" },
          status: 400,
        };
      });

      const responsePromise = service.get({ url: "https://example.com" });

      expect(mockHttpGet).toHaveBeenCalledTimes(1);
      expect(mockHttpGet).toHaveBeenCalledWith({ url: "https://example.com" });
      await expect(responsePromise).rejects.toEqual({
        json: { message: "error" },
        status: 400,
      });
    });
  });

  describe("post", () => {
    it("returns resolved promise from fetch", async () => {
      const mockHttpPost = vi
        .spyOn(http, "post")
        .mockImplementation(async () => {
          return {
            json: {},
            status: 200,
          };
        });

      const response = await service.post({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });

      expect(mockHttpPost).toHaveBeenCalledTimes(1);
      expect(mockHttpPost).toHaveBeenCalledWith({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });
      expect(response).toEqual({ json: {}, status: 200 });
    });

    it("returns rejected promise from fetch when the status is not 200", async () => {
      const mockHttpPost = vi
        .spyOn(http, "post")
        .mockImplementation(async () => {
          return {
            json: { message: "error" },
            status: 400,
          };
        });

      const responsePromise = service.post({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });

      expect(mockHttpPost).toHaveBeenCalledTimes(1);
      expect(mockHttpPost).toHaveBeenCalledWith({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });
      await expect(responsePromise).rejects.toEqual({
        json: { message: "error" },
        status: 400,
      });
    });
  });

  describe("put", () => {
    it("returns resolved promise from fetch", async () => {
      const mockHttpPut = vi.spyOn(http, "put").mockImplementation(async () => {
        return {
          json: {},
          status: 200,
        };
      });

      const response = await service.put({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });

      expect(mockHttpPut).toHaveBeenCalledTimes(1);
      expect(mockHttpPut).toHaveBeenCalledWith({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });
      expect(response).toEqual({ json: {}, status: 200 });
    });

    it("returns rejected promise from fetch when the status is not 200", async () => {
      const mockHttpPut = vi.spyOn(http, "put").mockImplementation(async () => {
        return {
          json: { message: "error" },
          status: 400,
        };
      });

      const responsePromise = service.put({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });

      expect(mockHttpPut).toHaveBeenCalledTimes(1);
      expect(mockHttpPut).toHaveBeenCalledWith({
        url: "https://example.com",
        options: { body: JSON.stringify({}) },
      });
      await expect(responsePromise).rejects.toEqual({
        json: { message: "error" },
        status: 400,
      });
    });
  });

  describe("remove", () => {
    it("returns resolved promise from fetch", async () => {
      const mockHttpRemove = vi
        .spyOn(http, "remove")
        .mockImplementation(async () => {
          return {
            json: {},
            status: 200,
          };
        });

      const response = await service.remove({
        url: "https://example.com",
      });

      expect(mockHttpRemove).toHaveBeenCalledTimes(1);
      expect(mockHttpRemove).toHaveBeenCalledWith({
        url: "https://example.com",
      });
      expect(response).toEqual({ json: {}, status: 200 });
    });

    it("returns rejected promise from fetch when the status is not 200", async () => {
      const mockHttpRemove = vi
        .spyOn(http, "remove")
        .mockImplementation(async () => {
          return {
            json: { message: "error" },
            status: 400,
          };
        });

      const responsePromise = service.remove({
        url: "https://example.com",
      });

      expect(mockHttpRemove).toHaveBeenCalledTimes(1);
      expect(mockHttpRemove).toHaveBeenCalledWith({
        url: "https://example.com",
      });
      await expect(responsePromise).rejects.toEqual({
        json: { message: "error" },
        status: 400,
      });
    });
  });
});
