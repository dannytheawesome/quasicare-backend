// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your Firebase config
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

// Save vent message
window.submitMessage = async function () {
  const input = document.getElementById("ventInput");
  const message = input.value.trim();

  if (!message) {
    alert("Please type something before submitting.");
    return;
  }

  try {
    await push(ref(db, 'vents'), {
      message: message,
      timestamp: Date.now()
    });

    alert("Your message has been submitted anonymously.");
    input.value = "";
    document.getElementById("ventBox").style.display = "none";
  } catch (err) {
    alert("Something went wrong saving your message.");
    console.error(err);
  }
};

// Show latest vent in Listen mode
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

// Reset UI
window.resetBoxes = function () {
  document.getElementById("ventBox").style.display = "none";
  document.getElementById("responseBox").style.display = "none";
};