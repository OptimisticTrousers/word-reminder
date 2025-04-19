import { service } from "../service";
import { subscriptionService } from "./subscription_service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("subscriptionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "1";
  const subscription = {
    endpoint: "https://random-push-service.com/unique-id-1234/",
    expirationTime: null,
    options: {
      applicationServerKey: new ArrayBuffer(8),
      userVisibleOnly: true,
    },
    getKey: vi.fn(),
    toJSON: vi.fn(),
    unsubscribe: vi.fn(),
  };
  const status = 200;

  describe("createSubscription", () => {
    it("creates using the correct API endpoint with subscription body", async () => {
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return { json: { subscription }, status };
        });

      const response = await subscriptionService.createSubscription({
        userId,
        subscription,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/subscriptions`,
        options: {
          body: JSON.stringify(subscription),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      });
      expect(response).toEqual({
        json: { subscription },
        status,
      });
    });
  });
});
