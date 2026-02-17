import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  },
});

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail({ to, subject, text, html }: SendMailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.NODE_MAILER_EMAIL,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", info.response);
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}
