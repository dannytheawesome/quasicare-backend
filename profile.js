import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const config = {
  apiKey: "AIzaSyDeHTQr0thvi-fBqIEZELFDI0VL70erlCE",
  authDomain: "quasicare.firebaseapp.com",
  databaseURL: "https://quasicare-default-rtdb.firebaseio.com",
  projectId: "quasicare",
  storageBucket: "quasicare.appspot.com",
  messagingSenderId: "197366070004",
  appId: "1:197366070004:web:2972eb9297102b6183bca1"
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getDatabase(app);

const avatars = [
  "birdavatar.png",
  "catavatar.png",
  "elephantavatar.png",
  "foxavatar.png",
  "monkeyavatar.png"
].map(name => `https://dannytheawesome.github.io/quasicare-backend/${name}`);

const avatarEl = document.getElementById("avatar");
const encouragementEl = document.getElementById("encouragement");
const verifiedEl = document.getElementById("verified");
const journalCountEl = document.getElementById("journalCount");
const helpedCountEl = document.getElementById("helpedCount");
const badgeCountEl = document.getElementById("badgeCount");
const feelingEl = document.getElementById("feeling");

const tabContent = document.getElementById("tabContent");
const tabs = document.querySelectorAll(".tabs div");
const journalInput = document.getElementById("newJournalInput");
const submitJournalBtn = document.getElementById("submitJournalBtn");
const journalList = document.getElementById("journalList");

onAuthStateChanged(auth, async user => {
  if (!user) return location.href = "login.html";
  const uid = user.uid;
  const userRef = ref(db, `users/${uid}`);
  const snap = await get(userRef);
  const data = snap.exists() ? snap.val() : {};

  // Verified badge logic
  if (user.email === "sherneonbusy@gmail.com") {
    verifiedEl.style.display = "block";
  }

  encouragementEl.textContent = "You are heard. You matter.";
  journalCountEl.textContent = data.journals ? Object.keys(data.journals).length : 0;
  helpedCountEl.textContent = data.replies || 0;
  badgeCountEl.textContent = data.badges ? data.badges.length : 0;
  feelingEl.textContent = data.todayFeeling || "—";
  avatarEl.src = avatars[data.avatarIndex || 0];

  loadSection(uid, "journals");
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".tabs .active").classList.remove("active");
    tab.classList.add("active");
    const section = tab.dataset.tab;
    const user = auth.currentUser;
    if (user) loadSection(user.uid, section);
  });
});

async function loadSection(uid, section) {
  const snap = await get(child(ref(db), `users/${uid}/${section}`));
  const data = snap.exists() ? Object.values(snap.val()) : [];
  journalList.innerHTML = data.length
    ? data.map(entry => `<div class="journal-entry">${entry.text || entry}</div>`).join("")
    : `<div class="journal-entry" style="color:#777;">No ${section} yet.</div>`;
}

submitJournalBtn.addEventListener("click", async () => {
  const text = journalInput.value.trim();
  const user = auth.currentUser;
  if (!text || !user) return;

  const entryRef = ref(db, `users/${user.uid}/journals/${Date.now()}`);
  await set(entryRef, { text });

  journalInput.value = "";
  loadSection(user.uid, "journals");
});

window.logout = async () => {
  await signOut(auth);
  location.href = "login.html";
};
