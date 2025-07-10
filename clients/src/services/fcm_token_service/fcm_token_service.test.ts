import { service } from "../service";
import { fcmTokenService } from "./fcm_token_service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("fcmTokenService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "1";
  const token = { value: "adkdwnakj21n12j" };
  const status = 200;

  describe("createFCMToken", () => {
    it("creates or updates using the correct API endpoint with token body", async () => {
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return { json: { token }, status };
        });

      const response = await fcmTokenService.createFCMToken({
        userId,
        token,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/fcmTokens`,
        options: {
          body: JSON.stringify({ token: token.value }),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      });
      expect(response).toEqual({
        json: { token },
        status,
      });
    });
  });
});
