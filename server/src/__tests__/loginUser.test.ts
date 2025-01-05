import request from "supertest";

import { app } from "../app";
// Import db setup and teardown functionality
import "../db/testPopulatedb";

describe("login_user", () => {
  it("returns 401 status code when the email is incorrect", async () => {
    const user = {
      email: "email@protonmail.com",
      password: "password",
    };

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send({ email: "wrongemail@protonmail.com", password: user.password });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      user: null,
      message: "Incorrect email.",
    });
  });

  it("returns 401 status code when the password is incorrect", async () => {
    const user = {
      email: "email@protonmail.com",
      password: "password",
    };
    await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    const response = await request(app)
      .post("/api/sessions")
      .set("Accept", "application/json")
      .send({ email: user.email, password: "wrong password" });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      user: null,
      message: "Incorrect password.",
    });
  });

  it("returns user object after successful login", async () => {
    const user = {
      email: "email@protonmail.com",
      password: "password",
    };
    await request(app)
      .post("/api/users")
      .set("Accept", "application/json")
      .send(user);

    const response = await request(app).post("/api/sessions").send(user);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: 1,
        confirmed: false,
        email: user.email,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    });
    expect(new Date(response.body.user.created_at).toString()).not.toBe(
      "Invalid Date"
    );
    expect(new Date(response.body.user.updated_at).toString()).not.toBe(
      "Invalid Date"
    );
  });
});
