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
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  const mailOptions = {
    from: '"Codewave Unit" <brightchibondo01@gmail.com>',
    to: email,
    subject: '🔑 Codewave Unit Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif; line-height:1.6; color:#333;">
        <h2>Hello ${name || email}!</h2>
        <p>Your verification code is:</p>
        <div style="font-size:28px; font-weight:bold; background:#f0f0f0; padding:15px 25px; border-radius:10px;">${code}</div>
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
  const { email, code, name } = req.body;
  if (!email || !code) return res.status(400).json({ success: false, error: "Email and code required" });

  if (verificationCodes[email] && verificationCodes[email] === code) {
    delete verificationCodes[email];
    // Save or update user
    users[email] = { email, name: name || email, verified: true, banned: false, lastLogin: new Date().toISOString() };
    res.json({ success: true, message: "Code verified!" });
  } else {
    res.status(400).json({ success: false, error: "Invalid verification code" });
  }
});

// ================= ADMIN MIDDLEWARE =================
function checkAdmin(req, res, next){
  if(req.headers.password === ADMIN_PASSWORD) return next();
  res.status(403).json({ success:false, error:'Unauthorized' });
}

// ================= ADMIN ROUTES =================

// Get all users
app.get('/admin/users', checkAdmin, (req,res) => {
  res.json({ success:true, users: Object.values(users) });
});

// Send message
app.post('/admin/message', checkAdmin, (req,res)=>{
  const { email, message } = req.body;
  if(users[email]){
    console.log(`Message sent to ${email}: ${message}`);
    return res.json({ success:true });
  }
  res.status(404).json({ success:false, error:'User not found' });
});

// Send notice
app.post('/admin/notice', checkAdmin, (req,res)=>{
  const { email, notice } = req.body;
  if(users[email]){
    console.log(`Notice sent to ${email}: ${notice}`);
    return res.json({ success:true });
  }
  res.status(404).json({ success:false, error:'User not found' });
});

// Ban user
app.post('/admin/ban', checkAdmin, (req,res)=>{
  const { email } = req.body;
  if(users[email]){
    users[email].banned = true;
    return res.json({ success:true });
  }
  res.status(404).json({ success:false, error:'User not found' });
});

// Delete user
app.delete('/admin/delete', checkAdmin, (req,res)=>{
  const { email } = req.body;
  if(users[email]){
    delete users[email];
    return res.json({ success:true });
  }
  res.status(404).json({ success:false, error:'User not found' });
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`Codewave Unit backend running on port ${PORT}`));