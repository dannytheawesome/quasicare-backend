// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

window.submitVent = async function () {
  const input = document.getElementById("ventInput");
  const text = input.value.trim();
  if (!text) return alert("Please type something.");

  const code = generateCode();
  await set(ref(db, "vents/" + code), {
    message: text,
    reply: null,
    timestamp: Date.now()
  });

  document.getElementById("codeDisplay").innerHTML = `Your anonymous code: <strong>${code}</strong>. Save this to check for replies later.`;
  input.value = "";
};

window.loadVents = function () {
  const feed = document.getElementById("ventFeed");
  feed.innerHTML = "Loading...";

  onValue(ref(db, "vents"), (snapshot) => {
    feed.innerHTML = "";
    const data = snapshot.val();
    if (!data) return (feed.innerHTML = "No vents found.");

    Object.entries(data).forEach(([code, obj]) => {
      const div = document.createElement("div");
      div.className = "vent-box";
      div.innerHTML = `
        <strong>Vent:</strong> ${obj.message}<br><br>
        <textarea placeholder='Type your reply...' id='reply-${code}'></textarea><br>
        <button onclick='submitReply("${code}")'>Send Reply</button>
      `;
      feed.appendChild(div);
    });
  });
};

window.submitReply = function (code) {
  const textArea = document.getElementById("reply-" + code);
  const reply = textArea.value.trim();
  if (!reply) return alert("Please type your reply.");

  update(ref(db, "vents/" + code), {
    reply: reply
  }).then(() => {
    alert("Reply sent.");
    textArea.value = "";
  }).catch(() => alert("Failed to send reply."));
};

window.lookupReplies = function () {
  const code = document.getElementById("lookupCode").value.trim().toUpperCase();
  const output = document.getElementById("repliesOutput");
  if (!code) return alert("Enter your code.");

  const ventRef = ref(db, "vents/" + code);
  onValue(ventRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return (output.innerHTML = "No message found with that code.");

    output.innerHTML = `
      <div class='vent-box'>
        <strong>Your Message:</strong><br>${data.message}<br><br>
        <strong>Reply:</strong><br>${data.reply || "No reply yet. Please check back later."}
      </div>
    `;
  }, {
    onlyOnce: true
  });
};

// Auto-load vents when listener screen is shown
const observer = new MutationObserver(() => {
  const listenScreen = document.getElementById("listenScreen");
  if (!listenScreen.classList.contains("hidden")) {
    window.loadVents();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
