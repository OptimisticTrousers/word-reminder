import request from "supertest";
import express from "express";
import { webPush } from "../middleware/web_push";
import webpush from "web-push";
import { variables } from "../config/variables";

const { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, WEBPUSH_EMAIL } = variables;

describe("webPush", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSetVapidDetails = jest
    .spyOn(webpush, "setVapidDetails")
    .mockImplementation(jest.fn());

  const message = "Success!";
  const app = express();
  app.use(express.json());
  app.use(webPush);
  app.get("/", (req, res) => {
    res.json({ message });
  });

  it("calls the functions to set vapid details", async () => {
    const response = await request(app)
      .get("/")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
    expect(mockSetVapidDetails).toHaveBeenCalledTimes(1);
    expect(mockSetVapidDetails).toHaveBeenCalledWith(
      WEBPUSH_EMAIL,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  });
});
