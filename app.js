// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config (DO NOT commit actual keys — use environment variables in production)
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  databaseURL: "REPLACE_WITH_YOUR_DATABASE_URL",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
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

// Check if a message is flagged
function isFlagged(message) {
  const lower = message.toLowerCase();
  return bannedWords.some(word => lower.includes(word));
}

// Submit anonymous message
window.submitMessage = async function () {
  const input = document.getElementById("ventInput");
  const message = input.value.trim();

  if (!message) return alert("Please type something before submitting.");
  if (isFlagged(message)) return alert("This message was flagged as potentially unsafe. Please revise it.");

  try {
    await push(ref(db, "vents"), {
      message: message,
      timestamp: Date.now()
    });

    alert("Your message has been submitted anonymously.");
    input.value = "";
    document.getElementById("ventBox").style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Something went wrong while saving your message.");
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

// Reset all visible sections
window.resetBoxes = function () {
  document.getElementById("ventBox").style.display = "none";
  document.getElementById("responseBox").style.display = "none";
  document.getElementById("lookupSection").style.display = "none";
  document.getElementById("home").style.display = "block";
};

// Show the reply lookup screen
window.showLookup = function () {
  resetBoxes();
  document.getElementById("lookupSection").style.display = "block";
  document.getElementById("home").style.display = "none";
};

// Return from lookup to home
window.exitToHome = function () {
  document.getElementById("lookupSection").style.display = "none";
  document.getElementById("home").style.display = "block";
};

// Look up replies to a given code
window.lookupReplies = async function () {
  const code = document.getElementById("lookupCode").value.trim();
  const output = document.getElementById("repliesOutput");
  output.innerHTML = "Searching...";

  try {
    const snapshot = await get(child(ref(db), "vents/" + code));
    const data = snapshot.val();

    if (!data) {
      output.innerHTML = "No vent found with that code.";
      return;
    }

    const replies = data.replies || {};
    if (Object.keys(replies).length === 0) {
      output.innerHTML = "No replies yet. Please check back later.";
    } else {
      output.innerHTML = "<h4>Replies:</h4>";
      for (let key in replies) {
        output.innerHTML += `<p>– ${replies[key].message}</p>`;
      }
    }
  } catch (err) {
    console.error(err);
    output.innerHTML = "An error occurred while looking up replies.";
  }
};
