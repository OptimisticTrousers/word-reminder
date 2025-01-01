import request from "supertest";

import { app } from "../app";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("logout_user", () => {
  it("logs out correctly", async () => {
    const user = {
      email: "email@protonmail.com",
      password: "password",
    };
    // Simulate register
    await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);
    const loginResponse = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    const cookie = loginResponse.headers["set-cookie"];

    const response = await request(app)
      .delete("/api/sessions")
      .set("Cookie", cookie)
      .set("Accept", "application/json");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
});
