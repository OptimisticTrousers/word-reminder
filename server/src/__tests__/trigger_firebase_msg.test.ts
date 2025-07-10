import { triggerFirebaseMsg } from "../utils/trigger_firebase_msg";
import { fcmTokenQueries } from "../db/fcm_token_queries";
import * as firebaseMessaging from "firebase-admin/messaging";

describe("triggerFirebaseMsg", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const userId = 1;
  const fcmToken1 = {
    token: "toke1",
    user_id: userId,
  };
  const fcmToken2 = {
    token: "token2",
    user_id: userId,
  };
  const fcmTokens = [fcmToken1, fcmToken2];
  const title = "Word Reminder";
  const body = `Your active word reminder words: hello, clemency, dubious.`;
  const message = {
    notification: {
      title,
      body,
    },
  };

  it("calls the functions to send a notification", async () => {
    const mockGetByUserId = jest
      .spyOn(fcmTokenQueries, "getByUserId")
      .mockResolvedValue(fcmTokens);
    const mockSend = jest.fn();
    const mockMessaging = {
      send: mockSend,
    } as unknown as firebaseMessaging.Messaging;
    const mockGetMessaging = jest
      .spyOn(firebaseMessaging, "getMessaging")
      .mockReturnValue(mockMessaging);

    await triggerFirebaseMsg({ userId, body, title });

    expect(mockGetByUserId).toHaveBeenCalledTimes(1);
    expect(mockGetByUserId).toHaveBeenCalledWith(userId);
    expect(mockGetMessaging).toHaveBeenCalledTimes(1);
    expect(mockGetMessaging).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenCalledWith({
      ...message,
      token: fcmToken1.token,
    });
    expect(mockSend).toHaveBeenCalledWith({
      ...message,
      token: fcmToken2.token,
    });
  });

  it("does not calls the functions to send a notification when the user does not have an fcm token ", async () => {
    const mockGetByUserId = jest
      .spyOn(fcmTokenQueries, "getByUserId")
      .mockResolvedValue([]);
    const mockSend = jest.fn();
    const mockMessaging = {
      send: mockSend,
    } as unknown as firebaseMessaging.Messaging;
    const mockGetMessaging = jest
      .spyOn(firebaseMessaging, "getMessaging")
      .mockReturnValue(mockMessaging);

    await triggerFirebaseMsg({ userId, body, title });

    expect(mockGetByUserId).toHaveBeenCalledTimes(1);
    expect(mockGetByUserId).toHaveBeenCalledWith(userId);
    expect(mockGetMessaging).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });
});
