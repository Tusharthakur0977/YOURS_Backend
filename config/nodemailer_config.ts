import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE, // Use the Gmail SMTP server
  auth: {
    user: process.env.SMTP_SENDER_MAIL, // Your Gmail username
    pass: process.env.SMTP_SENDER_MAIL_PASS, // Your Gmail password
  },
});

export const sendEmail = async (
  sendTo: string,
  emailSubject: string,
  emailText: string
) => {
  // Define the email message
  const mailOptions = {
    from: process.env.SMTP_SENDER_MAIL, // Your Gmail address
    to: sendTo, //
    subject: emailSubject, // The email subject line
    text: '', // Leave the text field empty as we're using HTML format
    html: emailText, // The email body in HTML format
  };

  // Send the email and return a Promise that resolves to the sent email object
  const emailSent = await transporter.sendMail(mailOptions);

  return emailSent;
};
