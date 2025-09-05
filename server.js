// ================= CODEWAVE UNIT BACKEND =================
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000; // Render provides PORT automatically

// Temporary in-memory storage for verification codes
let verificationCodes = {};

// ================= NODMAILER SETUP =================
// Use Gmail App Password, not your Gmail password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // set in Render dashboard
    pass: process.env.GMAIL_PASS  // Gmail App Password
  }
});

// ================= SEND VERIFICATION CODE =================
app.post('/send-code', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Codewave Unit Verification Code',
    text: `Your Codewave Unit verification code is: ${code}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    console.log(`Sent code ${code} to ${email}`);
    res.json({ success: true });
  });
});

// ================= VERIFY CODE =================
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (verificationCodes[email] && verificationCodes[email] === code) {
    delete verificationCodes[email]; // remove after success
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Invalid code" });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`Codewave backend running on port ${PORT}`));