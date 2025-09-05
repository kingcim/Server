// ================= CODEWAVE UNIT FRONTEND JS =================

// ====== CONFIG ======
const backendURL = "http://localhost:3000"; // Change if hosted
const whatsappChannel = "https://whatsapp.com/channel/0029ValX2Js9RZAVtDgMYj0r";
const profileImage = "https://files.catbox.moe/h7fkki.jpg";
const hiddenVisitLink = "https://codewave-unit.zone.id";

// ====== USER DATA STORAGE ======
let currentUser = JSON.parse(localStorage.getItem("cwUser")) || null;

// ====== UTILITY FUNCTIONS ======
function randomGreeting() {
  const hour = new Date().getHours();
  if(hour < 12) return "Good Morning";
  if(hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function showNotification(title, message, copyText) {
  // Create container
  const notif = document.createElement("div");
  notif.className = "cw-notification";
  notif.innerHTML = `
    <div class="cw-notif-header"><strong>${title}</strong></div>
    <div class="cw-notif-body">${message}</div>
    ${copyText ? '<button class="cw-copy-btn">Copy</button>' : ''}
  `;
  document.body.appendChild(notif);

  // Copy button
  if(copyText){
    notif.querySelector(".cw-copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(copyText);
      alert("Copied to clipboard!");
    });
  }

  // Auto remove after 7s
  setTimeout(() => notif.remove(), 7000);
}

// ====== LOGIN & PROFILE ======
function renderProfile() {
  if(!currentUser) return;

  const profileContainer = document.getElementById("cw-profile");
  if(!profileContainer) return;

  profileContainer.innerHTML = `
    <img src="${profileImage}" class="cw-profile-img"/>
    <h3>${currentUser.name}</h3>
    <p>${randomGreeting()} ${currentUser.email}</p>
    <button id="cw-logout">Logout</button>
    <div class="cw-links">
      <a href="${whatsappChannel}" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" class="cw-whatsapp-logo"/>
        Follow Official Channel
      </a>
    </div>
    <small>Developed by ICONIC TECH. Made with ⏰ for you.</small>
  `;

  document.getElementById("cw-logout").addEventListener("click", () => {
    localStorage.removeItem("cwUser");
    showNotification("Logout", "You have successfully logged out!", null);
    currentUser = null;
    renderProfile();
  });
}

// ====== VERIFICATION ======
async function sendCode(email, name) {
  try {
    const res = await fetch(`${backendURL}/send-code`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({email, name})
    });
    const data = await res.json();
    if(data.success) showNotification("Code Sent", `Verification code sent to ${email}`, null);
    return data;
  } catch(e) { console.error(e); }
}

async function verifyCode(email, code, name) {
  try {
    const res = await fetch(`${backendURL}/verify-code`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email, code, name})
    });
    const data = await res.json();
    if(data.success){
      currentUser = {email, name: name||email};
      localStorage.setItem("cwUser", JSON.stringify(currentUser));
      renderProfile();
      showNotification("Welcome", `${randomGreeting()} ${currentUser.email}`, hiddenVisitLink);
    } else {
      showNotification("Error", data.error, null);
    }
  } catch(e){ console.error(e); }
}

// ====== ADMIN INTERACTIONS ======
async function sendAdminMessage(email, message, adminPass){
  try{
    const res = await fetch(`${backendURL}/admin/message`, {
      method:"POST",
      headers:{"Content-Type":"application/json","password":adminPass},
      body: JSON.stringify({email, message})
    });
    const data = await res.json();
    return data;
  } catch(e){ console.error(e); }
}

// ====== INITIALIZE ======
document.addEventListener("DOMContentLoaded", () => {
  renderProfile();

  // Show greeting if logged in
  if(currentUser){
    showNotification("Welcome Back", `${randomGreeting()} ${currentUser.email}`, hiddenVisitLink);
  }

  // Optional: repeat notification on restart every 30s
  setInterval(()=>{
    if(currentUser){
      showNotification("Reminder", `${randomGreeting()} ${currentUser.email}`, hiddenVisitLink);
    }
  }, 30000);
});

// ====== STYLES ======
const style = document.createElement("style");
style.innerHTML = `
  .cw-notification{
    position: fixed; top:20px; right:20px; background:#fff; color:#333;
    padding:15px 20px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.2);
    z-index:9999; width:300px; font-family:Arial,sans-serif; animation:fadein 0.5s;
  }
  .cw-notif-header{ font-size:16px; margin-bottom:5px; }
  .cw-notif-body{ font-size:14px; margin-bottom:10px; }
  .cw-copy-btn{
    background:#007BFF; color:#fff; border:none; padding:6px 12px;
    border-radius:6px; cursor:pointer; font-weight:bold;
  }
  .cw-profile-img{ width:80px; height:80px; border-radius:50%; margin-bottom:10px; }
  #cw-profile{ padding:20px; max-width:320px; background:#f5f5f5; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1); font-family:Arial,sans-serif;}
  .cw-whatsapp-logo{width:20px; vertical-align:middle; margin-right:6px;}
  .cw-links a{ display:flex; align-items:center; gap:5px; text-decoration:none; color:#25D366; font-weight:bold; margin-top:10px; }
  @keyframes fadein{ from{opacity:0; transform:translateY(-20px);} to{opacity:1; transform:translateY(0);} }
`;
document.head.appendChild(style);