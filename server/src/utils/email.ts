import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

import { variables } from "../config/variables";

const { WORD_REMINDER_EMAIL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
  variables;

export const email = (function () {
  // Set the AWS Region.
  const REGION = "us-east-1";
  // Create SES service object.
  const sesClient = new SESClient({
    region: REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  function createSendEmailCommand({
    toAddress,
    fromAddress,
    html,
    subject,
  }: {
    toAddress: string;
    fromAddress: string;
    html: string;
    subject: string;
  }) {
    return new SendEmailCommand({
      Destination: {
        ToAddresses: [toAddress],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromAddress,
    });
  }

  const sendMail = async ({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) => {
    const sendEmailCommand = createSendEmailCommand({
      toAddress: to,
      fromAddress: WORD_REMINDER_EMAIL,
      subject,
      html,
    });

    const sendEmailCommandOutput = await sesClient.send(sendEmailCommand);

    return sendEmailCommandOutput;
  };

  return { sendMail };
})();
