import { createTransport } from "nodemailer";

import { variables } from "../config/variables";

const {
  PROTON_SMTP_USER,
  PROTON_SMTP_TOKEN,
  PROTON_SMTP_SERVER,
  PROTON_SMTP_PORT,
} = variables;

export const email = (function () {
  const transporter = createTransport({
    host: PROTON_SMTP_SERVER,
    port: Number(PROTON_SMTP_PORT),
    secure: false,
    auth: {
      user: PROTON_SMTP_USER,
      pass: PROTON_SMTP_TOKEN,
    },
  });

  const sendMail = async ({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) => {
    const info = await transporter.sendMail({
      from: PROTON_SMTP_USER,
      to,
      subject,
      html,
    });

    return info;
  };

  return { sendMail };
})();
