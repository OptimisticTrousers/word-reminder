import nodemailer from "nodemailer";

import { variables } from "../config/variables";

const {
  PROTON_SMTP_USER,
  PROTON_SMTP_TOKEN,
  PROTON_SMTP_SERVER,
  PROTON_SMTP_PORT,
} = variables;

jest.mock("nodemailer");

const sendMailMock = jest.fn();
const createTransporterMock = nodemailer.createTransport as jest.Mock;
createTransporterMock.mockReturnValue({ sendMail: sendMailMock });

describe("email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to create a transport in the constructor", async () => {
    await jest.isolateModulesAsync(async () => {
      await import("../utils/email");
    });
    expect(createTransporterMock).toHaveBeenCalledTimes(1);
    expect(createTransporterMock).toHaveBeenCalledWith({
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
    const { email } = await import("../utils/email");
    const emailData = {
      userId: "1",
      to: "bob@protonmail.com",
      subject: "Hello there",
      html: "<p>Hello world!</p>",
    };
    await email.sendMail(emailData);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: PROTON_SMTP_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });
  });
});
