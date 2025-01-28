import { http } from "common";

import { service } from "../service";
import { subscriptionService } from "./subscription_service";

vi.mock("common");

const { VITE_API_DOMAIN } = service;

describe("subscriptionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const subscription = {
    endpoint: "https://random-push-service.com/unique-id-1234/",
    keys: {
      p256dh:
        "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
      auth: "tBHItJI5svbpez7KI4CCXg==",
    },
  };
  const status = 200;

  describe("createSubscription", () => {
    it("calls the functions at the correct API endpoint with body", async () => {
      const mockHttpPost = vi
        .spyOn(http, "post")
        .mockImplementation(async () => {
          return { json: { subscription }, status };
        });

      const response = await subscriptionService.createSubscription(
        subscription
      );

      expect(mockHttpPost).toHaveBeenCalledTimes(1);
      expect(mockHttpPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/subscriptions`,
        options: { body: JSON.stringify(subscription), credentials: "include" },
      });
      expect(response).toEqual({
        json: { subscription },
        status,
      });
    });
  });
});
