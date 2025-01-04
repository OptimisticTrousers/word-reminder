import request from "supertest";

import { app } from "../app";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("current_user", () => {
  it("returns user when the user is logged in", async () => {
    const user = {
      email: "email@protonmail.com",
      password: "password",
    };
    const registerResponse = await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);
    const loginResponse = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    const cookie = loginResponse.headers["set-cookie"];

    const response = await request(app)
      .get("/api/sessions")
      .set("Cookie", cookie)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        email: user.email,
        confirmed: false,
        id: registerResponse.body.user.id,
        created_at: registerResponse.body.user.created_at,
        updated_at: registerResponse.body.user.updated_at,
      },
    });
  });
});
