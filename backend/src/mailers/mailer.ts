import nodemailer from "nodemailer";
import Env from "../config/env.config";
import { resend } from "../config/resend.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender = `Expense Hub <${Env.RESEND_MAILER_SENDER}>`;

export const sendEmailOrig = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) => {
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  });
};

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: Env.GMAIL_USER,
      pass: Env.GMAIL_PASS,
    },
    // Additional security and reliability settings
    secure: true,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    html,
    text,

    // Important headers to improve deliverability
    headers: {
      "X-Priority": "3", // Normal priority (1=High, 3=Normal, 5=Low)
      "X-MSMail-Priority": "Normal",
      Importance: "Normal",
      "X-Mailer": "Family Social Site v1.0",
      "Reply-To": Env.GMAIL_USER,
      "Return-Path": Env.GMAIL_USER,
      "List-Unsubscribe": `<mailto:${Env.GMAIL_USER}?subject=Unsubscribe>`,
      "Message-ID": `<${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}@expensehub.com>`,
    },

    // Set encoding
    encoding: "utf8",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
