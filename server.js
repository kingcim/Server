// ================= CODEWAVE UNIT BACKEND =================
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "supersecureadminpass"; // admin password

// ================= NODMAILER SETUP =================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'brightchibondo01@gmail.com', // Your Gmail
    pass: 'fsnmrtzpjckizukb'           // Gmail app password
  }
});

// ================= IN-MEMORY DATA =================
const verificationCodes = {}; // { email: code }
const users = {};             // { email: { email, name, verified, banned, lastLogin } }

// ================= SEND VERIFICATION CODE =================
app.post('/send-code', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email required" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = { code, timestamp: Date.now() };

  const mailOptions = {
    from: '"Codewave Unit" <brightchibondo01@gmail.com>',
    to: email,
    subject: '🔑 Your Codewave Unit Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif; color:#333; max-width:600px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; padding:20px; background:#fafafa;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="https://files.catbox.moe/zpfvou.jpg" alt="Profile" style="width:90px; height:90px; border-radius:50%; object-fit:cover;"/>
        </div>
        <h2 style="text-align:center;">Hello ${name || email} 👋</h2>
        <p style="text-align:center; font-size:16px;">Here’s your verification code:</p>
        <div style="text-align:center; margin:20px 0;">
          <span style="font-size:28px; font-weight:bold; background:#f8f9fa; padding:15px 25px; border:1px dashed #007bff; border-radius:8px; display:inline-block;">${code}</span>
        </div>
        <p style="text-align:center; font-size:14px; color:#666;">Copy the code above and paste it into the app to verify your login.</p>
        <hr style="margin:25px 0; border:none; border-top:1px solid #ddd;">
        <p style="text-align:center; font-size:14px; color:#555;">
          💡 Follow our channel for updates & services.  
          <br>Thanks for using <b>Codewave Unit</b>, proudly <b>Developed by Iconic Tech</b>.
        </p>
        <div style="text-align:center; margin-top:15px;">
          <a href="https://whatsapp.com/channel/0029ValX2Js9RZAVtDgMYj0r" style="text-decoration:none;">
            <img src="https://files.catbox.moe/zpfvou.jpg" alt="WhatsApp" style="width:30px; height:30px;">
          </a>
        </div>
        <div style="text-align:center; font-size:12px; color:#888; margin-top:20px;">
          <a href="https://codewave-unit.zone.id" style="color:#888; text-decoration:none;">🌐 Visit Website</a>
        </div>
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
app.post('/verify-code', async (req, res) => {
  const { email, code, name } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, error: "Email and code required" });
  }

  const verificationData = verificationCodes[email];

  // If no request was made → ignore
  if (!verificationData) {
    return res.status(400).json({ success: false, error: "No verification request found" });
  }

  // Expired?
  if (Date.now() - verificationData.timestamp > 5 * 60 * 1000) {
    delete verificationCodes[email];
    return res.status(400).json({ success: false, error: "Verification code expired" });
  }

  // Valid code
  if (verificationData.code === code) {
    delete verificationCodes[email];
    users[email] = { email, name: name || email, verified: true, banned: false, lastLogin: new Date().toISOString() };

    // 🎉 Professional login success message
    const messages = [
      `✅ Thanks ${name || email}! You’ve successfully logged in. Welcome to Codewave Unit – Developed by Iconic Tech.`,
      `🚀 Hello ${name || email}, login successful! Thanks for trusting Codewave Unit. Powered by Iconic Tech.`,
      `🌟 Welcome back ${name || email}! Your account is now active. Codewave Unit – Crafted by Iconic Tech.`
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    const mailOptions = {
      from: '"Codewave Unit" <brightchibondo01@gmail.com>',
      to: email,
      subject: '🎉 Login Successful - Codewave Unit',
      html: `
        <div style="font-family:Arial,sans-serif; background:#f9f9f9; padding:20px; border-radius:10px; max-width:600px; margin:auto; border:1px solid #e0e0e0;">
          <h2 style="color:#007bff; text-align:center;">Login Successful 🎊</h2>
          <p style="font-size:16px; color:#333; text-align:center;">${randomMsg}</p>
          <div style="text-align:center; margin-top:20px;">
            <a href="https://codewave-unit.zone.id" style="background:#007bff; color:#fff; padding:10px 20px; border-radius:5px; text-decoration:none;">Visit Dashboard</a>
          </div>
          <p style="text-align:center; font-size:12px; color:#888; margin-top:20px;">
            Developed by <b>Iconic Tech</b> ⏰
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Code verified! Login notification sent." });
  } else {
    return res.status(400).json({ success: false, error: "Invalid verification code" });
  }
});