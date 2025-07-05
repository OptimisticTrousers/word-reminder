import { Template } from "common";
import express from "express";
import path from "path";
import request from "supertest";

import {
  about,
  change_email,
  change_password,
  confirm_account,
  failed_verification,
  index,
  privacy,
} from "../controllers/views_controller";

const userId = 1;
const token = "token";

describe("views", () => {
  describe(`${Template.CONFIRM_ACCOUNT}`, () => {
    it(`calls the functions to render '${Template.CONFIRM_ACCOUNT}' page`, async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get(`/confirmAccount/:userId&:token`, confirm_account);

      const response = await request(app)
        .get(`/confirmAccount/${userId}&${token}`)
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe(`${Template.CHANGE_PASSWORD}`, () => {
    it(`calls the functions to render '${Template.CHANGE_PASSWORD}' page`, async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get(`/changePassword/:userId&:token`, change_password);

      const response = await request(app)
        .get(`/changePassword/${userId}&${token}`)
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe(`${Template.CHANGE_EMAIL}`, () => {
    it(`calls the functions to render '${Template.CHANGE_EMAIL}' page`, async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get(`/changeEmail/:userId&:token`, change_email);

      const response = await request(app)
        .get(`/changeEmail/${userId}&${token}`)
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe("failed_verification", () => {
    it("calls the functions to render 'failed_verification' page", async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/failedVerification", failed_verification);

      const response = await request(app)
        .get("/failedVerification")
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe("pages", () => {
    it("calls the functions to render home page", async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/", index);

      const response = await request(app).get("/").set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });

    it("calls the functions to render about page", async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.use("/about", about);

      const response = await request(app)
        .get("/about")
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });

    it("calls the functions to render privacy page", async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.use("/", privacy);

      const response = await request(app)
        .get("/privacy")
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });
});
