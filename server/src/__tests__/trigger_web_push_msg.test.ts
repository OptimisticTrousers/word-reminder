import webpush from "web-push";
import { triggerWebPushMsg } from "../utils/trigger_web_push_msg";
import { subscriptionQueries } from "../db/subscription_queries";

describe("triggerWebPushMsg", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const subscription1 = {
    id: 1,
    userId: 1,
    endpoint: "https://random-push-service.com/unique-id-1234/",
    p256dh:
      "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
    auth: "tBHItJI5svbpez7KI4CCXg==",
  };
  const data = JSON.stringify({
    title: "Word Reminder",
    body: `Your active word reminder words: hello, clemency, dubious.`,
  });

  it("calls the functions to send a notification", async () => {
    const mockSendNotification = jest
      .spyOn(webpush, "sendNotification")
      .mockImplementation(jest.fn());
    const mockDeleteById = jest
      .spyOn(subscriptionQueries, "deleteById")
      .mockImplementation(jest.fn());

    await triggerWebPushMsg(
      {
        id: subscription1.id,
        endpoint: subscription1.endpoint,
        p256dh: subscription1.p256dh,
        auth: subscription1.auth,
        userId: subscription1.userId,
      },
      data,
      { TTL: 172800 } // 2 days
    );

    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    expect(mockSendNotification).toHaveBeenCalledWith(
      {
        endpoint: subscription1.endpoint,
        keys: { p256dh: subscription1.p256dh, auth: subscription1.auth },
      },
      data,
      { TTL: 172800 } // 2 days
    );
    expect(mockDeleteById).not.toHaveBeenCalled();
  });

  it("deletes the subscription when the subscription is no longer valid", async () => {
    const mockSendNotification = jest
      .spyOn(webpush, "sendNotification")
      .mockImplementation(() => {
        const error: Error = new Error("subscription error");
        (error as Error & { statusCode: number }).statusCode = 410;
        throw error;
      });
    const mockDeleteById = jest
      .spyOn(subscriptionQueries, "deleteById")
      .mockImplementation(jest.fn());

    await triggerWebPushMsg(
      {
        id: subscription1.id,
        endpoint: subscription1.endpoint,
        p256dh: subscription1.p256dh,
        auth: subscription1.auth,
        userId: subscription1.userId,
      },
      data,
      { TTL: 172800 } // 2 days
    );

    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    expect(mockSendNotification).toHaveBeenCalledWith(
      {
        endpoint: subscription1.endpoint,
        keys: { p256dh: subscription1.p256dh, auth: subscription1.auth },
      },
      data,
      { TTL: 172800 } // 2 days
    );
    expect(mockDeleteById).toHaveBeenCalledTimes(1);
    expect(mockDeleteById).toHaveBeenCalledWith(subscription1.id);
  });
});
