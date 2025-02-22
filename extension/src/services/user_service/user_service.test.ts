import { service } from "../service";
import { userService } from "./user_service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "1";
  const user = {
    email: "bob@gmail.com",
    newPassword: "password",
    newPasswordConfirmation: "password",
  };
  const status = 200;

  describe("signupUser", () => {
    it("signs up using the correct API endpoint with user body", async () => {
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return { json: { user }, status };
        });

      const response = await userService.signupUser({
        email: user.email,
        password: user.newPassword,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
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
    it("updates using the correct API endpoint with user body", async () => {
      const mockPut = vi.spyOn(service, "put").mockImplementation(async () => {
        return { json: { user }, status };
      });

      const body = { id: userId, ...user };
      const response = await userService.updateUser(body);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}`,
        options: { body: JSON.stringify(body), credentials: "include" },
      });
      expect(response).toEqual({
        json: { user },
        status,
      });
    });
  });

  describe("deleteUser", () => {
    it("deletes using the correct API endpoint", async () => {
      const mockRemove = vi
        .spyOn(service, "remove")
        .mockImplementation(async () => {
          return { json: {}, status };
        });

      const response = await userService.deleteUser(userId);

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}`,
      });
      expect(response).toEqual({
        json: {},
        status,
      });
    });
  });
});
