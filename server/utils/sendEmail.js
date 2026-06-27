const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isEmailConfigured = 
    process.env.EMAIL_USER && 
    process.env.EMAIL_USER !== 'tuition.demo.sender@gmail.com';

  if (!isEmailConfigured) {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text || options.html}`);
    console.log('------------------------');
    return { message: 'Mock email logged successfully' };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Tuition Platform Admin" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Nodemailer error: ${error.message}`);
    // Return a mock result so the request doesn't crash
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
