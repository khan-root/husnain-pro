const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS // Use App Password for Gmail
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    });
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Email sending failed: ' + error.message);
  }
};

module.exports = {
  sendEmail
}; 