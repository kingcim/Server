// ================= CODEWAVE UNIT BACKEND FAKE =================
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Temporary in-memory storage for codes
let verificationCodes = {};

// ================= SEND VERIFICATION CODE =================
app.post('/send-code', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  console.log(`Fake sending code ${code} to ${email} (not real email)`);

  // Return success immediately (no Gmail needed)
  res.json({ success: true, message: `Code sent to ${email} (fake)` });
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
app.listen(PORT, () => console.log(`Fake Codewave backend running on port ${PORT}`));