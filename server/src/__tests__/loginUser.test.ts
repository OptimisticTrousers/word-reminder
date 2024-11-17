import request from "supertest";

import { app } from "../app";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("login_user", () => {
  it("returns 401 status code when no user is found", async () => {
    const user = {
      username: "username",
      password: "password",
    };

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body.user).toBeNull();
  });

  it("returns 401 status code when the password is incorrect", async () => {
    const user = {
      username: "username",
      password: "password",
    };
    await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send({ username: user.username, password: undefined });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body.user).toBeUndefined();
  });

  it("returns user object after successful login", async () => {
    const user = {
      username: "username",
      password: "password",
    };
    await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    const response = await request(app).post("/api/sessions").send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe(user.username);
    expect(response.body.user.password).toBeUndefined();
  });
});
