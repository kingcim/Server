// ================= CODEWAVE UNIT MESSAGE BACKEND WITH VERIFICATION =================
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ================= NODMAILER SETUP =================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'brightchibondo01@gmail.com',   // Your Gmail for authentication
    pass: 'fsnmrtzpjckizukb'              // Gmail app password
  }
});

// ================= IN-MEMORY CODE STORAGE =================
const verificationCodes = {}; // { email: code }

// ================= SEND VERIFICATION CODE =================
app.post('/send-code', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  const mailOptions = {
    from: '"Codewave Unit" <brightchibondo01@gmail.com>', // Display name
    to: email,
    subject: 'Codewave Unit Verification Code',
    text: `
Hello ${name || email},

Your Codewave Unit verification code is: ${code}

This service is developed by Iconic Tech.

✅ Stay updated and follow our channel:
https://whatsapp.com/channel/0029ValX2Js9RZAVtDgMYj0r

Use this code to verify your account and access the service.
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}: ${code}`);
    res.json({ success: true, message: "Verification code sent!" });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= VERIFY CODE =================
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ success: false, error: "Email and code required" });

  if (verificationCodes[email] && verificationCodes[email] === code) {
    delete verificationCodes[email]; // remove code after successful verification
    res.json({ success: true, message: "Code verified!" });
  } else {
    res.status(400).json({ success: false, error: "Invalid verification code" });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`Codewave Unit backend running on port ${PORT}`));