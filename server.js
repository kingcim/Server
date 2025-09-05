// ================= CODEWAVE UNIT MESSAGE BACKEND =================
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ================= NODMAILER SETUP =================
// Gmail App Password required
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail
    pass: process.env.GMAIL_PASS  // Gmail App Password
  }
});

// ================= SEND MESSAGE =================
app.post('/send-message', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Codewave Unit Message',
    text: `Hey ${email},\n\nThis service is developed by Iconic Tech. We will reply to you shortly. Enjoy our service!`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Message sent to ${email}`);
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`Codewave Unit backend running on port ${PORT}`));