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
    user: 'brightchibondo01@gmail.com',   // Your Gmail
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
    from: '"Codewave Unit" <brightchibondo01@gmail.com>',
    to: email,
    subject: '🔑 Codewave Unit Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif; line-height:1.6; color:#333;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="https://files.catbox.moe/eil6wi.jpg" alt="Profile" width="100" style="border-radius:50%;">
        </div>
        <h2 style="color:#4a90e2; text-align:center;">Hello ${name || email}!</h2>
        <p style="text-align:center;">Your <strong>Codewave Unit</strong> verification code is:</p>
        <div style="text-align:center; margin:20px 0;">
          <span style="display:inline-block; font-size:28px; font-weight:bold; background:#f0f0f0; padding:15px 25px; border-radius:10px; letter-spacing:3px;">${code}</span>
        </div>
        <p style="text-align:center;">Click the button below to copy the code:</p>
        <div style="text-align:center; margin:20px;">
          <a href="#" onclick="navigator.clipboard.writeText('${code}')" style="text-decoration:none; background:#4a90e2; color:#fff; padding:10px 25px; border-radius:8px; font-weight:bold;">Copy Code</a>
        </div>
        <p style="text-align:center; margin-top:30px;">✅ Visited: <a href="https://codewave-unit.zone.id" style="color:#4a90e2;">https://codewave-unit.zone.id</a></p>
        <hr style="margin:20px 0;">
        <p style="text-align:center; font-size:14px; color:#888;">
          Developed by Iconic Tech | Made with ⏰ for users
        </p>
        <p style="text-align:center; font-size:14px; color:#888;">
          Stay updated and follow our channel: <a href="https://whatsapp.com/channel/0029ValX2Js9RZAVtDgMYj0r" style="color:#4a90e2;">WhatsApp Channel</a>
        </p>
      </div>
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
    delete verificationCodes[email];
    res.json({ success: true, message: "Code verified!" });
  } else {
    res.status(400).json({ success: false, error: "Invalid verification code" });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`Codewave Unit backend running on port ${PORT}`));