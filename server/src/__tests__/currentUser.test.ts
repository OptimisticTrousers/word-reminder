import request from "supertest";

import { app } from "../app";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("current_user", () => {
  it("returns 401 status code when the user is not logged in", async () => {
    const response = await request(app).get("/api/sessions");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.user).toBeUndefined();
  });

  it("returns user when the user is logged in", async () => {
    const user = {
      username: "username",
      password: "password",
    };
    await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);
    await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    const response = await request(app)
      .get("/api/sessions")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.user).toBeUndefined();
  });
});
