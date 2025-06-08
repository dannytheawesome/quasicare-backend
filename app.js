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

// Local moderation keyword list
const bannedWords = [
  "kill", "suicide", "die", "murder", "bomb", "shoot",
  "stab", "rape", "torture", "abuse", "hate", "terrorist",
  "harm myself", "end my life", "cut myself", "school shooting",
  "threaten", "destroy", "violence", "blow up", "gun"
];

// Function to check if a message contains flagged content
function isFlagged(message) {
  const lower = message.toLowerCase();
  return bannedWords.some(word => lower.includes(word));
}

// Submit anonymous message
window.submitMessage = async function () {
  const input = document.getElementById("ventInput");
  const message = input.value.trim();

  if (!message) {
    alert("Please type something before submitting.");
    return;
  }

  // Check for unsafe language locally
  if (isFlagged(message)) {
    alert("This message was flagged as potentially unsafe. Please revise it.");
    return;
  }

  try {
    // Save safe message to Firebase
    await push(ref(db, "vents"), {
      message: message,
      timestamp: Date.now()
    });

    alert("Your message has been submitted anonymously.");
    input.value = "";
    document.getElementById("ventBox").style.display = "none";
  } catch (err) {
    alert("Something went wrong while saving your message.");
    console.error(err);
  }
};

// Show latest anonymous message
window.showListen = function () {
  resetBoxes();
  document.getElementById("responseBox").style.display = "block";

  const display = document.getElementById("ventDisplay");
  display.innerHTML = "<em>Loading latest messages...</em>";

  const messagesRef = ref(db, "vents");
  onChildAdded(messagesRef, (data) => {
    const post = data.val().message;
    display.innerHTML = `<strong>Anonymous Post:</strong><br>"${post}"`;
  });
};

// Reset both sections
window.resetBoxes = function () {
  document.getElementById("ventBox").style.display = "none";
  document.getElementById("responseBox").style.display = "none";
};
