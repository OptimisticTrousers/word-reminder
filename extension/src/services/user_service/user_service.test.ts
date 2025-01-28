import { http } from "common";

import { service } from "../service";
import { userService } from "./user_service";

vi.mock("common");

const { VITE_API_DOMAIN } = service;

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "1";
  const user = {
    email: "bob@gmail.com",
    password: "password",
  };
  const status = 200;

  describe("signupUser", () => {
    it("calls the functions at the correct API endpoint with body", async () => {
      const mockHttpPost = vi
        .spyOn(http, "post")
        .mockImplementation(async () => {
          return { json: { user }, status };
        })

      const response = await userService.signupUser(user);

      expect(mockHttpPost).toHaveBeenCalledTimes(1);
      expect(mockHttpPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users`,
        options: { body: JSON.stringify(user) },
      });
      expect(response).toEqual({
        json: { user },
        status,
      });
    });
  });

  describe("updateUser", () => {
    it("calls the functions at the correct API endpoint with body", async () => {
      const mockHttpPut = vi
        .spyOn(http, "put")
        .mockImplementation(async () => {
          return { json: { user }, status };
        })

      const response = await userService.updateUser(userId, user);

      expect(mockHttpPut).toHaveBeenCalledTimes(1);
      expect(mockHttpPut).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}`,
        options: { body: JSON.stringify(user), credentials: "include" },
      });
      expect(response).toEqual({
        json: { user },
        status,
      });
    });
  });

  describe("deleteUser", () => {
    it("calls the functions at the correct API endpoint", async () => {
      const mockHttpRemove = vi
        .spyOn(http, "remove")
        .mockImplementation(async () => {
          return { json: {}, status };
        })

      const response = await userService.deleteUser(userId);

      expect(mockHttpRemove).toHaveBeenCalledTimes(1);
      expect(mockHttpRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}`,
      });
      expect(response).toEqual({
        json: {},
        status,
      });
    });
  });
});
