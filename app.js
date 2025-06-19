// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDeHTQr0thvi-fBqIEZELFDI0VL70erlCE",
  authDomain: "quasicare.firebaseapp.com",
  databaseURL: "https://quasicare-default-rtdb.firebaseio.com",
  projectId: "quasicare",
  storageBucket: "quasicare.appspot.com",
  messagingSenderId: "197366070004",
  appId: "1:197366070004:web:2972eb9297102b6183bca1",
  measurementId: "G-B4YZ476BVN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Banned keyword list
const bannedWords = [
  "kill", "suicide", "die", "murder", "bomb", "shoot",
  "stab", "rape", "torture", "abuse", "hate", "terrorist",
  "harm myself", "end my life", "cut myself", "school shooting",
  "threaten", "destroy", "violence", "blow up", "gun"
];

// Check message for dangerous words
function isFlagged(message) {
  const lower = message.toLowerCase();
  return bannedWords.some(word => lower.includes(word));
}

// Submit anonymous message (Talk Page)
window.submitMessage = async function () {
  const input = document.getElementById("ventInput");
  const message = input.value.trim();

  if (!message) {
    alert("Please type something before submitting.");
    return;
  }

  if (isFlagged(message)) {
    alert("This message contains language that may be unsafe. Please revise it.");
    return;
  }

  try {
    await push(ref(db, "vents"), {
      message: message,
      reply: null,
      timestamp: Date.now()
    });

    alert("Message submitted anonymously. You will receive a code shortly.");
    input.value = "";
  } catch (err) {
    alert("Failed to submit your message.");
    console.error(err);
  }
};

// Show latest anonymous message (Listen Page)
window.showListen = function () {
  const display = document.getElementById("ventDisplay");
  display.innerHTML = "<em>Loading messages...</em>";

  const messagesRef = ref(db, "vents");
  onChildAdded(messagesRef, (data) => {
    const post = data.val().message;
    display.innerHTML = `<strong>Anonymous Post:</strong><br>"${post}"`;
  });
};

// Optional: add support points when replying
window.incrementPoints = async function () {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const userId = user.uid;
    const userPointsRef = ref(db, `users/${userId}/points`);

    const snap = await get(userPointsRef);
    const current = snap.exists() ? snap.val() : 0;
    await set(userPointsRef, current + 1);
  });
};
