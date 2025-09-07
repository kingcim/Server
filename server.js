// ================= CODEWAVE UNIT BACKEND =================
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "supersecureadminpass"; 

// ================= NODMAILER SETUP =================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "brightchibondo01@gmail.com",
        pass: "fsnmrtzpjckizukb"
    }
});

// ================= IN-MEMORY DATA =================
const verificationCodes = {}; 
const users = {};             

// ================= RANDOM LOGIN MESSAGES =================
const loginMessages = [
    "⚡ Secure login successful — Welcome to Codewave Unit (Powered by Iconic Tech).",
    "🚀 Authentication complete! You are now connected with Codewave Unit — Innovated by Iconic Tech.",
    "🔑 Verified successfully. Experience the future with Codewave Unit — Crafted by Iconic Tech.",
    "✅ Access granted! Enjoy a seamless experience with Codewave Unit — Dev by Iconic Tech.",
    "🌐 Login complete. Thank you for choosing Codewave Unit — Technology by Iconic Tech."
];

// ================= RANDOM LOGOUT MESSAGES =================
const logoutMessages = [
    "👋 You’ve logged out from Codewave Unit. We’ll miss you, but don’t worry — you can come back anytime.",
    "⚠️ You signed out successfully. Remember, Codewave Unit is always here when you’re ready again.",
    "🔒 Session ended! Feel free to login again whenever you want — and don’t forget to share Codewave Unit with your friends.",
    "🚪 You just logged out. We hope to see you soon! Spread the word — invite others to try Codewave Unit.",
    "💡 Logout complete. Anyway, you’re always welcome back. Share your link, empower others — Dev by Iconic Tech."
];

// ================= SEND VERIFICATION CODE =================
app.post("/send-code", async (req, res) => {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email required" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = code;

    const mailOptions = {
        from: '"Codewave Unit" <brightchibondo01@gmail.com>',
        to: email,
        subject: "🔐 Codewave Unit | Verification Code",
        html: `
        <div style="font-family:Segoe UI,Roboto,Arial,sans-serif; color:#1a1a1a; 
                    max-width:600px; margin:auto; border-radius:12px; 
                    border:1px solid #e5e5e5; background:#ffffff; padding:30px;">
            <div style="text-align:center;">
                <h2 style="margin:10px 0; font-weight:600; color:#0d6efd;">
                    Codewave Unit Verification
                </h2>
            </div>
            <p style="font-size:15px; text-align:center;">
                Hi <b>${name || email}</b>, use the code below to complete verification:
            </p>
            <div style="text-align:center; margin:20px 0;">
                <span style="font-size:30px; font-weight:bold; letter-spacing:3px; 
                             background:#f8f9fa; border:1px dashed #0d6efd; 
                             padding:12px 28px; border-radius:10px; display:inline-block;">
                    ${code}
                </span>
            </div>
            <p style="font-size:13px; text-align:center; color:#666;">
                Developed & Secured by <b>Iconic Tech</b>
            </p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📩 Verification code sent to ${email}: ${code}`);
        res.json({ success: true, message: "Verification code sent!" });
    } catch (err) {
        console.error("❌ Email sending error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= VERIFY CODE =================
app.post("/verify-code", async (req, res) => {
    const { email, code, name } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, error: "Email and code required" });

    if (verificationCodes[email] && verificationCodes[email] === code) {
        delete verificationCodes[email];
        users[email] = {
            email,
            name: name || email,
            verified: true,
            banned: false,
            lastLogin: new Date().toISOString()
        };

        const randomMsg = loginMessages[Math.floor(Math.random() * loginMessages.length)];

        // Send login confirmation email
        try {
            await transporter.sendMail({
                from: '"Codewave Unit" <brightchibondo01@gmail.com>',
                to: email,
                subject: "✅ Codewave Unit | Login Successful",
                html: `
                <div style="font-family:Segoe UI,Roboto,Arial,sans-serif; max-width:600px; margin:auto; padding:25px; background:#fff; border:1px solid #eaeaea; border-radius:10px;">
                    <h2 style="text-align:center; color:#198754;">${randomMsg}</h2>
                    <p style="text-align:center; font-size:14px; color:#444;">
                        Welcome back <b>${name || email}</b>,<br>
                        You have successfully logged into <b>Codewave Unit</b>.
                    </p>
                    <p style="text-align:center; font-size:13px; color:#666;">Dev by Iconic Tech</p>
                </div>
                `
            });
        } catch (err) {
            console.error("⚠️ Could not send login email:", err.message);
        }

        return res.json({ success: true, message: randomMsg });
    } else {
        return res.status(400).json({ success: false, error: "Invalid verification code" });
    }
});

// ================= LOGOUT =================
app.post("/logout", async (req, res) => {
    const { email } = req.body;
    if (!email || !users[email]) {
        return res.status(400).json({ success: false, error: "User not found" });
    }

    // Mark user as logged out
    users[email].verified = false;

    // Pick random logout message
    const randomLogoutMsg = logoutMessages[Math.floor(Math.random() * logoutMessages.length)];

    // Send logout email
    try {
        await transporter.sendMail({
            from: '"Codewave Unit" <brightchibondo01@gmail.com>',
            to: email,
            subject: "👋 Codewave Unit | You Logged Out",
            html: `
            <div style="font-family:Segoe UI,Roboto,Arial,sans-serif; max-width:600px; margin:auto; padding:25px; background:#fff; border:1px solid #eaeaea; border-radius:10px;">
                <h2 style="text-align:center; color:#dc3545;">${randomLogoutMsg}</h2>
                <p style="text-align:center; font-size:14px; color:#444;">
                    Anyway, you are free to login again next time.<br>
                    Don’t forget to <b>share your link</b> and invite others to experience Codewave Unit.
                </p>
                <p style="text-align:center; font-size:13px; color:#666;">Premium Service — Dev by Iconic Tech</p>
            </div>
            `
        });
        console.log(`📤 Logout confirmation sent to ${email}`);
    } catch (err) {
        console.error("⚠️ Could not send logout email:", err.message);
    }

    return res.json({ success: true, message: randomLogoutMsg });
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`🚀 Codewave Unit backend running on port ${PORT}`));