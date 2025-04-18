import express from "express";
import request from "supertest";

import { create_subscription } from "../controllers/subscription_controller";
import { subscriptionQueries } from "../db/subscription_queries";

const app = express();
app.use(express.json());
app.post("/api/users/:userId/subscriptions", create_subscription);

const userId = 1;
const subscription = {
  endpoint: "https://random-push-service.com/unique-id-1234/",
  keys: {
    p256dh:
      "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
    auth: "tBHItJI5svbpez7KI4CCXg==",
  },
};

const mockCreateSubscription = jest
  .spyOn(subscriptionQueries, "create")
  .mockImplementation(jest.fn());

describe("create_subscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns success message", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send(subscription);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { success: true } });
    expect(mockCreateSubscription).toHaveBeenCalledTimes(1);
    expect(mockCreateSubscription).toHaveBeenCalledWith({
      userId,
      subscription,
    });
  });

  it("returns 400 status code when the 'endpoint' key is not provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send({
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Endpoint must be specified.",
          path: "endpoint",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreateSubscription).not.toHaveBeenCalled();
  });

  it("returns 400 status code when the 'auth' key is not provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
        },
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Auth must be specified.",
          path: "keys.auth",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreateSubscription).not.toHaveBeenCalled();
  });

  it("returns 400 status code when the 'p256dh' key is not provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send({
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.keys.auth,
        },
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "P256dh must be specified.",
          path: "keys.p256dh",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreateSubscription).not.toHaveBeenCalled();
  });

  it("returns 400 status code when the 'endpoint' and 'auth' key are not provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send({
        keys: {
          p256dh: subscription.keys.p256dh,
        },
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Endpoint must be specified.",
          path: "endpoint",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Auth must be specified.",
          path: "keys.auth",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreateSubscription).not.toHaveBeenCalled();
  });

  it("returns 400 status code when the 'auth' and 'p256dh' keys are not provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send({
        endpoint: subscription.endpoint,
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Auth must be specified.",
          path: "keys.auth",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "P256dh must be specified.",
          path: "keys.p256dh",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreateSubscription).not.toHaveBeenCalled();
  });

  it("returns 400 status code when the 'p256dh' and 'endpoint' key are not provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send({
        keys: {
          auth: subscription.keys.auth,
        },
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Endpoint must be specified.",
          path: "endpoint",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "P256dh must be specified.",
          path: "keys.p256dh",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreateSubscription).not.toHaveBeenCalled();
  });

  it("returns 400 status code when the 'endpoint', 'p256dh', and 'auth' are not provided", async () => {
    const response = await request(app)
      .post(`/api/users/${userId}/subscriptions`)
      .set("Accept", "application/json")
      .send({});

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "Endpoint must be specified.",
          path: "endpoint",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "Auth must be specified.",
          path: "keys.auth",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "P256dh must be specified.",
          path: "keys.p256dh",
          type: "field",
          value: "",
        },
      ],
    });
    expect(mockCreateSubscription).not.toHaveBeenCalled();
  });
});
