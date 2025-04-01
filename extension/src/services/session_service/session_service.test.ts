import { service } from "../service";
import { sessionService } from "./session_service";

vi.mock("../service");

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
    it("logs in using the correct API endpoint with user body", async () => {
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return {
            json: { user },
            status,
          };
        });

      const response = await sessionService.loginUser(user);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/sessions`,
        options: {
          body: JSON.stringify(user),
          headers: {
            "Content-Type": "application/json",
          },
        },
      });
      expect(response).toEqual({ json: { user }, status });
    });
  });

  describe("getCurrentUser", async () => {
    it("gets using the functions at the correct API endpoint", async () => {
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return {
          json: { user },
          status,
        };
      });

      const response = await sessionService.getCurrentUser();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/sessions`,
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
    it("logs out using the correct API endpoint", async () => {
      const mockRemove = vi
        .spyOn(service, "remove")
        .mockImplementation(async () => {
          return {
            json: {},
            status: 200,
          };
        });

      const response = await sessionService.logoutUser();

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/sessions`,
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
