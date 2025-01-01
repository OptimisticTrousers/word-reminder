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
    await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);
    await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    const response = await request(app)
      .delete("/api/sessions")
      .set("Accept", "application/json");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("logs out correctly if the user is not logged in", async () => {
    const response = await request(app)
      .delete("/api/sessions")
      .set("Accept", "application/json");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
});
