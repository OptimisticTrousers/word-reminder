import { http } from "common";

import { service } from "../service";
import { sessionService } from "./session_service";

vi.mock("common");

const { VITE_API_DOMAIN } = service;

describe("sessionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = {
    email: "bob@gmail.com",
    password: "password",
  };
  const status = 200;

  describe("loginUser", async () => {
    it("calls the functions at the correct API endpoint with body", async () => {
      const mockHttpPost = vi
        .spyOn(http, "post")
        .mockImplementation(async () => {
          return {
            json: { user },
            status,
          };
        })

      const response = await sessionService.loginUser(user);

      expect(mockHttpPost).toHaveBeenCalledTimes(1);
      expect(mockHttpPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/session`,
        options: { body: JSON.stringify(user) },
      });
      expect(response).toEqual({ json: { user }, status });
    });
  });

  describe("getCurrentUser", async () => {
    it("calls the functions at the correct API endpoint", async () => {
      const mockHttpGet = vi
        .spyOn(http, "get")
        .mockImplementation(async () => {
          return {
            json: { user },
            status,
          };
        })

      const response = await sessionService.getCurrentUser();

      expect(mockHttpGet).toHaveBeenCalledTimes(1);
      expect(mockHttpGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/session`,
        options: {
          credentials: "include",
        },
      });
      expect(response).toEqual({
        json: { user },
        status,
      });
    });
  });

  describe("logoutUser", async () => {
    it("calls the functions at the correct API endpoint", async () => {
      const mockHttpRemove = vi
        .spyOn(http, "remove")
        .mockImplementation(async () => {
          return {
            json: {},
            status: 200,
          };
        })

      const response = await sessionService.logoutUser();

      expect(mockHttpRemove).toHaveBeenCalledTimes(1);
      expect(mockHttpRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/session`,
        options: {
          credentials: "include",
        },
      });
      expect(response).toEqual({
        json: {},
        status,
      });
    });
  });
});
