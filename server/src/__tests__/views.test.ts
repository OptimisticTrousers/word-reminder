import { Template } from "common";
import express from "express";
import path from "path";
import request from "supertest";

import {
  change_email,
  change_password,
  confirm_account,
  failed_verification,
  forgot_password,
  index,
} from "../controllers/views_controller";

const userId = 1;
const token = "token";

describe("views", () => {
  describe(`${Template.CONFIRM_ACCOUNT}`, () => {
    it(`calls the functions to render '${Template.CONFIRM_ACCOUNT}' template`, async () => {
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
    it(`calls the functions to render '${Template.CHANGE_PASSWORD}' template`, async () => {
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
    it(`calls the functions to render '${Template.CHANGE_EMAIL}' template`, async () => {
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
    it("calls the functions to render 'failed_verification' template", async () => {
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

  describe(`${Template.FORGOT_PASSWORD}`, () => {
    it(`calls the functions to render '${Template.FORGOT_PASSWORD}' template`, async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get(`/forgotPassword/:userId&:token`, forgot_password);

      const response = await request(app)
        .get(`/forgotPassword/${userId}&${token}`)
        .set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });

  describe("index", () => {
    it("calls the functions to render home page", async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.get("/", index);

      const response = await request(app).get("/").set("Accept", "text/html");

      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
    });
  });
});
