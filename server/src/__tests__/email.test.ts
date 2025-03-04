import nodemailer from "nodemailer";

import { variables } from "../config/variables";

const {
  PROTON_SMTP_USER,
  PROTON_SMTP_TOKEN,
  PROTON_SMTP_SERVER,
  PROTON_SMTP_PORT,
} = variables;

jest.mock("nodemailer");

const mockNodemailer = jest.mocked(nodemailer);

describe("email", () => {
  it("calls the functions to create a transport when initialized", async () => {
    const mockCreateTransporter = jest.spyOn(mockNodemailer, "createTransport");

    await jest.isolateModulesAsync(async () => {
      await import("../utils/email");
    });

    expect(mockCreateTransporter).toHaveBeenCalledTimes(1);
    expect(mockCreateTransporter).toHaveBeenCalledWith({
      host: PROTON_SMTP_SERVER,
      port: Number(PROTON_SMTP_PORT),
      secure: false, // It actually uses STARTTLS, there are no shared keys
      auth: {
        user: PROTON_SMTP_USER,
        pass: PROTON_SMTP_TOKEN,
      },
    });
  });

  it("calls the functions to send an email", async () => {
    const mockSendMail = jest.fn();
    jest
      .spyOn(mockNodemailer, "createTransport")
      .mockReturnValue({ sendMail: mockSendMail });
    const { email } = await import("../utils/email");

    const emailData = {
      userId: "1",
      to: "bob@protonmail.com",
      subject: "Hello there",
      html: "<p>Hello world!</p>",
    };
    await email.sendMail(emailData);

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith({
      from: PROTON_SMTP_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });
  });
});
