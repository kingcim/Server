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
// Directly using your Gmail & App Password (not recommended for public repos)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'brightchibondo01@gmail.com', // your Gmail
    pass: 'fsnmrtzpjckizukb'            // your App Password (no spaces)
  }
});

// ================= SEND MESSAGE =================
app.post('/send-message', async (req, res) => {
  const { email, name } = req.body;

  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  const mailOptions = {
    from: 'brightchibondo01@gmail.com',
    to: email,
    subject: 'Welcome to Codewave Unit!',
    text: `
Hello ${name || email},

Thank you for joining Codewave Unit! 🚀

This service is developed by Iconic Tech.

✅ Stay updated and follow our channel:
https://whatsapp.com/channel/0029ValX2Js9RZAVtDgMYj0r

We will reply to you shortly. Enjoy our service!
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Message sent to ${email}`);
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`Codewave Unit backend running on port ${PORT}`));