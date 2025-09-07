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
        pass: 'fsnmrtzpjckizukb'            // Gmail app password
    }
});

// ================= IN-MEMORY DATA =================
const verificationCodes = {}; 
const users = {};             

// Random professional login messages
const loginMessages = [
    "🎉 Thank you for logging in with Codewave Unit — powered by Iconic Tech.",
    "🚀 Welcome back! Your journey with Codewave Unit begins now. — Dev by Iconic Tech.",
    "🔐 Login successful! Enjoy our secure services developed by Iconic Tech.",
    "✅ Verified and logged in! Thank you for trusting Codewave Unit — Iconic Tech innovation.",
    "🌟 Hello! Thanks for logging in. Stay tuned for updates — Crafted by Iconic Tech."
];

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
        <div style="font-family:Arial,sans-serif; color:#333; max-width:600px; margin:auto; 
                    border:1px solid #e0e0e0; border-radius:10px; padding:20px; background:#fafafa;">
            <div style="text-align:center; margin-bottom:20px;">
                <img src="https://files.catbox.moe/zpfvou.jpg" alt="Profile" 
                     style="width:100px; height:100px; border-radius:50%; object-fit:cover;"/>
            </div>
            <h2 style="text-align:center;">Hello ${name || email}!</h2>
            <p style="text-align:center; font-size:16px;">Your verification code is:</p>
            <div style="text-align:center; margin:20px 0;">
                <span style="font-size:28px; font-weight:bold; background:#f0f0f0; 
                             padding:15px 25px; border-radius:10px; display:inline-block;">
                    ${code}
                </span>
            </div>
            <p style="text-align:center; font-size:14px; color:#555;">
                Copy the above code and paste it into the app.
            </p>
            <p style="text-align:center; font-size:14px; color:#555;">
                Hey, follow our channel for more information. Thanks!
            </p>
            <p style="text-align:center; font-size:14px; color:#555;">
                Made for you by <b>Iconic Tech</b> ⏰
            </p>
            <div style="text-align:center; margin-top:20px;">
                <a href="https://whatsapp.com/channel/0029ValX2Js9RZAVtDgMYj0r" style="text-decoration:none;">
                    <img src="https://files.catbox.moe/zpfvou.jpg" alt="WhatsApp" 
                         style="width:30px; height:30px; margin:0 5px;">
                </a>
            </div>
            <div style="text-align:center; font-size:12px; color:#888; margin-top:15px;">
                <a href="https://codewave-unit.zone.id" style="color:#888; text-decoration:none;">Website</a> | 
                <a href="https://codewave-unit.zone.id" style="color:#888; text-decoration:none;">APIs</a>
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
app.post('/verify-code', (req, res) => {
    const { email, code, name } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, error: "Email and code required" });

    if (verificationCodes[email] && verificationCodes[email] === code) {
        delete verificationCodes[email];
        users[email] = { email, name: name || email, verified: true, banned: false, lastLogin: new Date().toISOString() };

        const randomMsg = loginMessages[Math.floor(Math.random() * loginMessages.length)];
        console.log(`User ${email} logged in. Message: ${randomMsg}`);

        res.json({ success: true, message: randomMsg });
    } else {
        res.status(400).json({ success: false, error: "Invalid verification code" });
    }
});

// ================= ADMIN MIDDLEWARE =================
function checkAdmin(req, res, next) {
    if (req.headers.password === ADMIN_PASSWORD) return next();
    res.status(403).json({ success: false, error: 'Unauthorized' });
}

// ================= ADMIN ROUTES =================
app.get('/admin/users', checkAdmin, (req, res) => {
    res.json({ success: true, users: Object.values(users) });
});

app.post('/admin/message', checkAdmin, (req, res) => {
    const { email, message } = req.body;
    if (users[email]) {
        console.log(`Message sent to ${email}: ${message}`);
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

app.post('/admin/notice', checkAdmin, (req, res) => {
    const { email, notice } = req.body;
    if (users[email]) {
        console.log(`Notice sent to ${email}: ${notice}`);
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

app.post('/admin/ban', checkAdmin, (req, res) => {
    const { email } = req.body;
    if (users[email]) {
        users[email].banned = true;
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

app.delete('/admin/delete', checkAdmin, (req, res) => {
    const { email } = req.body;
    if (users[email]) {
        delete users[email];
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: 'User not found' });
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`Codewave Unit backend running on port ${PORT}`));