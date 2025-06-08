// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// Save vent message and call moderation
window.submitMessage = async function () {
  const input = document.getElementById("ventInput");
  const message = input.value.trim();

  if (!message) {
    alert("Please type something before submitting.");
    return;
  }

  try {
    // Step 1: Moderate the message via your backend
    const response = await fetch("https://quasicare-backend.onrender.com/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const result = await response.json();

    if (result.flagged) {
      alert("This message was flagged as potentially unsafe. Please revise it.");
      return;
    }

    // Step 2: Save to Firebase if not flagged
    await push(ref(db, 'vents'), {
      message: message,
      timestamp: Date.now()
    });

    alert("Your message has been submitted anonymously.");
    input.value = "";
    document.getElementById("ventBox").style.display = "none";
  } catch (err) {
    alert("Something went wrong.");
    console.error(err);
  }
};

// Show latest message
window.showListen = function () {
  resetBoxes();
  document.getElementById("responseBox").style.display = "block";

  const display = document.getElementById("ventDisplay");
  display.innerHTML = "<em>Loading latest messages...</em>";

  const messagesRef = ref(db, 'vents');
  onChildAdded(messagesRef, (data) => {
    const post = data.val().message;
    display.innerHTML = `<strong>Anonymous Post:</strong><br>"${post}"`;
  });
};

// UI reset
window.resetBoxes = function () {
  document.getElementById("ventBox").style.display = "none";
  document.getElementById("responseBox").style.display = "none";
};