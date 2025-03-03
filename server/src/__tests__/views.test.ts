import express from "express";
import request from "supertest";
import path from "path";

import {
  change_email,
  change_password,
  failed_verification,
  forgot_password,
  index,
} from "../controllers/views_controller";

describe("views", () => {
  const userId = "1";

  describe("change_email", () => {
    it("calls the functions to render 'change_email' template", async () => {
      const app = express();
      // view engine setup
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/change-email/:userId", change_email);

      const response = await request(app)
        .get(`/change-email/${userId}`)
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe("change_password", () => {
    it("calls the functions to render 'change_password' template", async () => {
      const app = express();
      // view engine setup
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/change-password/:userId", change_password);

      const response = await request(app)
        .get(`/change-password/${userId}`)
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe("failed_verification", () => {
    it("calls the functions to render 'failed_verification' template", async () => {
      const app = express();
      // view engine setup
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/failed-verification", failed_verification);

      const response = await request(app)
        .get("/failed-verification")
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe("forgot_password", () => {
    it("calls the functions to render 'forgot_password' template", async () => {
      const app = express();
      // view engine setup
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/forgot-password/:userId", forgot_password);

      const response = await request(app)
        .get(`/forgot-password/${userId}`)
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe("index", () => {
    it("calls the functions to render 'change_email' template", async () => {
      const app = express();
      // view engine setup
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/index", index);

      const response = await request(app)
        .get("/index")
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });
});
