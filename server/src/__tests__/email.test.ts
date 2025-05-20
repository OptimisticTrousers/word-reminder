import { SESClient } from "@aws-sdk/client-ses";

import { variables } from "../config/variables";

const { WORD_REMINDER_EMAIL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
  variables;

const mockSend = jest.fn();
jest.mock("@aws-sdk/client-ses", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-ses");
  return {
    ...originalModule,
    SESClient: jest.fn().mockImplementation(() => {
      return {
        send: mockSend,
      };
    }),
  };
});

describe("email", () => {
  it("calls the functions to create a transport when initialized", async () => {
    await jest.isolateModulesAsync(async () => {
      await import("../utils/email");
    });

    expect(SESClient).toHaveBeenCalledTimes(1);
    expect(SESClient).toHaveBeenCalledWith({
      region: "us-east-1",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  });

  it("calls the functions to send an email", async () => {
    const emailData = {
      to: "bob@protonmail.com",
      subject: "Hello there",
      html: "<p>Hello world!</p>",
    };
    const sendEmailCommand = {
      Destination: {
        ToAddresses: [emailData.to],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: emailData.html,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: emailData.subject,
        },
      },
      Source: WORD_REMINDER_EMAIL,
    };

    const { email } = await import("../utils/email");
    await email.sendMail(emailData);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input).toMatchObject(sendEmailCommand);
  });
});
