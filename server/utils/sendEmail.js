const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (text)
 * @param {string} options.html - Email HTML content (optional)
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  // Create a transporter based on environment
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || ''
    }
  });

  // Define email options
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@printmine.in',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent: %s', info.messageId);
  
  return info;
};

module.exports = sendEmail;
