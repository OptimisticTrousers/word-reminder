import express from "express";
import request from "supertest";

import { send_email } from "../controllers/emailController";
import { TokenQueries } from "../db/tokenQueries";
import { Email } from "../utils/email";
import { Scheduler } from "../utils/scheduler";

describe("send_email", () => {
  const app = express();
  app.use(express.json());
  app.post("/api/users/:userId/emails", send_email);

  const info = {
    message:
      "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
  };

  const token = {
    token: "token",
    expires_at: new Date(),
  };

  const mockSend = jest
    .spyOn(Email.prototype, "sendMail")
    .mockResolvedValue(info)
    .mockName("sendMail");

  const mockCreate = jest
    .spyOn(TokenQueries.prototype, "create")
    .mockResolvedValue(token)
    .mockName("create");

  const mockSendAfter = jest
    .spyOn(Scheduler.prototype, "sendAfter")
    .mockImplementation(jest.fn())
    .mockName("create");

  const mockWork = jest
    .spyOn(Scheduler.prototype, "work")
    .mockImplementation(jest.fn())
    .mockName("work");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 status code when the email is not provided", async () => {
    const userId = "1";

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send({
        email: undefined,
        template: "template",
        subject: "Hello ✔",
        text: "Hello world?",
        html: "<b>Hello world?</b>",
      });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'email' must be specified.",
          path: "email",
          type: "field",
          value: "",
        },
      ],
    });
  });

  it("returns 400 status code when the subject is not provided", async () => {
    const userId = "1";
    const body = {
      email: "bob@protonmail.com",
      template: "template",
      subject: undefined,
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    };

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'subject' must be specified.",
          path: "subject",
          type: "field",
          value: "",
        },
      ],
    });
  });

  it("returns 400 status code when the email is not a valid email", async () => {
    const userId = "1";
    const body = {
      email: "email",
      template: "template",
      subject: "Hello ✔",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    };

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'email' must be a valid email.",
          path: "email",
          type: "field",
          value: "email",
        },
      ],
    });
  });

  describe("template", () => {
    it("returns 400 status code when the template is not provided", async () => {
      const userId = "1";

      const response = await request(app)
        .post(`/api/users/${userId}/emails`)
        .set("Accept", "application/json")
        .send({
          email: "bob@protonmail.com",
          template: undefined,
          subject: "Hello ✔",
          text: "Hello world?",
          html: "<b>Hello world?</b>",
        });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'template' must be specified.",
            path: "template",
            type: "field",
            value: "",
          },
        ],
      });
    });

    it("calls the functions to send email with 'email-verification' template", async () => {
      const body = {
        email: "bob@protonmail.com",
        template: "email-verification",
        subject: "Verify Your Email",
      };
      const userId = "1";
      const queueName = `queue-${userId}`;

      const response = await request(app)
        .post(`/api/users/${userId}/emails`)
        .set("Accept", "application/json")
        .send({ ...body });

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ info });
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith();
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        html: expect.any(String),
        subject: body.subject,
        to: body.email,
      });
      expect(mockSendAfter).toHaveBeenCalledTimes(1);
      expect(mockSendAfter).toHaveBeenCalledWith(
        queueName,
        { token },
        expect.any(Date)
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(queueName, expect.any(Function));
    });

    it("calls the functions to send email with 'change-email-verification' template", async () => {
      const body = {
        email: "bob@protonmail.com",
        template: "change-email-verification",
        subject: "Change Email",
      };
      const userId = "1";
      const queueName = `queue-${userId}`;

      const response = await request(app)
        .post(`/api/users/${userId}/emails`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ info });
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith();
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        html: expect.any(String),
        subject: body.subject,
        to: body.email,
      });
      expect(mockSendAfter).toHaveBeenCalledTimes(1);
      expect(mockSendAfter).toHaveBeenCalledWith(
        queueName,
        { token },
        expect.any(Date)
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(queueName, expect.any(Function));
    });

    it("calls the functions to send email with 'change-password-verification' template", async () => {
      const body = {
        email: "bob@protonmail.com",
        template: "change-password-verification",
        subject: "Change Password",
      };
      const userId = "1";
      const queueName = `queue-${userId}`;

      const response = await request(app)
        .post(`/api/users/${userId}/emails`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ info });
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith();
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        html: expect.any(String),
        subject: body.subject,
        to: body.email,
      });
      expect(mockSendAfter).toHaveBeenCalledTimes(1);
      expect(mockSendAfter).toHaveBeenCalledWith(
        queueName,
        { token },
        expect.any(Date)
      );
      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith(queueName, expect.any(Function));
    });
  });
});
