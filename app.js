// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDeHTQr0thvi-fBqIEZELFDI0VL70erlCE",
  authDomain: "quasicare.firebaseapp.com",
  databaseURL: "https://quasicare-default-rtdb.firebaseio.com",
  projectId: "quasicare",
  storageBucket: "quasicare.appspot.com",
  messagingSenderId: "197366070004",
  appId: "1:197366070004:web:2972eb9297102b6183bca1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Utility
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Submit a vent anonymously
window.submitVent = async function () {
  const input = document.getElementById("ventInput");
  const message = input.value.trim();

  if (!message) {
    alert("Please write something before submitting.");
    return;
  }

  const code = generateCode();
  await set(ref(db, `vents/${code}`), {
    message: message,
    reply: null,
    timestamp: Date.now()
  });

  document.getElementById("codeDisplay").innerText = `Your anonymous code: ${code}. Save this to check replies.`;
  input.value = "";
};

// Load recent vents for listeners to reply
function loadVents() {
  const container = document.getElementById("ventFeed");
  container.innerHTML = "Loading...";

  onValue(ref(db, 'vents'), (snapshot) => {
    container.innerHTML = '';
    const data = snapshot.val();
    if (!data) {
      container.innerHTML = "No vents available yet.";
      return;
    }

    Object.entries(data).forEach(([code, item]) => {
      const box = document.createElement("div");
      box.className = "vent-box";

      const hasReply = item.reply && item.reply.trim().length > 0;
      if (!hasReply) {
        const replyInput = document.createElement("textarea");
        replyInput.placeholder = "Type a kind reply...";

        const sendBtn = document.createElement("button");
        sendBtn.innerText = "Send";
        sendBtn.onclick = async () => {
          const reply = replyInput.value.trim();
          if (!reply) return alert("Please write a reply.");
          await set(ref(db, `vents/${code}/reply`), reply);
          alert("Reply submitted.");
        };

        box.innerHTML = `<strong>Code:</strong> ${code}<br><strong>Message:</strong> ${item.message}<br>`;
        box.appendChild(replyInput);
        box.appendChild(sendBtn);
      } else {
        box.innerHTML = `<strong>Code:</strong> ${code}<br><strong>Message:</strong> ${item.message}<br><strong>Already replied.</strong>`;
      }

      container.appendChild(box);
    });
  });
}

// Lookup replies by code
window.lookupReplies = async function () {
  const code = document.getElementById("lookupCode").value.trim().toUpperCase();
  const output = document.getElementById("repliesOutput");
  output.innerHTML = "Searching...";

  const snapshot = await get(ref(db, `vents/${code}`));
  if (!snapshot.exists()) {
    output.innerText = "No vent found with that code.";
    return;
  }

  const data = snapshot.val();
  if (data.reply && data.reply.trim().length > 0) {
    output.innerHTML = `<strong>Your Vent:</strong><br>${data.message}<br><br><strong>Reply:</strong><br>${data.reply}`;
  } else {
    output.innerHTML = "No replies yet. Please check back later.";
  }
};

// Auto-load vents when in Listen screen
const observer = new MutationObserver(() => {
  if (!document.getElementById("listenScreen").classList.contains("hidden")) {
    loadVents();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
