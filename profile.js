import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
];

const avatarEl = document.getElementById("avatar");
const encouragementEl = document.getElementById("encouragement");
const verifiedEl = document.getElementById("verified");
const journalCountEl = document.getElementById("journalCount");
const helpedCountEl = document.getElementById("helpedCount");
const badgeCountEl = document.getElementById("badgeCount");
const feelingEl = document.getElementById("feeling");
const newJournalInput = document.getElementById("newJournalInput");
const submitJournalBtn = document.getElementById("submitJournalBtn");
const journalList = document.getElementById("journalList");
const tabContent = document.getElementById("tabContent");
const tabs = document.querySelectorAll(".tabs div");
const picker = document.getElementById("avatarPicker");

let currentTab = "journals";
let uid = null;

onAuthStateChanged(auth, async user => {
  if (!user) return location.href = "login.html";
  uid = user.uid;

  const snap = await get(ref(db, `users/${uid}`));
  const data = snap.exists() ? snap.val() : {};

  avatarEl.src = avatars[data.avatarIndex || 0];
  encouragementEl.textContent = "You are heard. You matter.";
  if (user.email === "sherneonbusy@gmail.com") verifiedEl.style.display = "block";

  journalCountEl.textContent = data.journals ? Object.keys(data.journals).length : 0;
  helpedCountEl.textContent = data.replies || 0;
  badgeCountEl.textContent = data.badges ? data.badges.length : 0;
  feelingEl.textContent = data.todayFeeling || "---";

  loadSection("journals");
});

submitJournalBtn.onclick = async () => {
  const text = newJournalInput.value.trim();
  if (!text || !uid) return;

  const journalRef = ref(db, `users/${uid}/journals/${Date.now()}`);
  await set(journalRef, { text });
  newJournalInput.value = "";
  loadSection("journals");
};

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".tabs .active").classList.remove("active");
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    loadSection(currentTab);
  });
});

async function loadSection(section) {
  const snap = await get(ref(db, `users/${uid}/${section}`));
  const data = snap.exists() ? Object.values(snap.val()) : [];
  tabContent.innerHTML = section === "journals"
    ? `
      <textarea id="newJournalInput" placeholder="Write your journal..."></textarea>
      <button id="submitJournalBtn">Submit</button>
      <div id="journalList">${data.map(d => `<div class="journal-entry">${d.text || d}</div>`).join("")}</div>
    `
    : data.length
      ? data.map(d => `<div class="journal-entry">${d.text || d}</div>`).join("")
      : `<div class="journal-entry">No ${section} yet.</div>`;

  if (section === "journals") {
    document.getElementById("submitJournalBtn").onclick = submitJournalBtn.onclick;
  }
}

avatarEl.onclick = () => picker.style.display = "flex";

document.querySelectorAll(".picker-container img").forEach(img => {
  img.addEventListener("click", async () => {
    const index = Number(img.dataset.index);
    avatarEl.src = avatars[index];
    picker.style.display = "none";
    if (uid) await update(ref(db, `users/${uid}`), { avatarIndex: index });
  });
});

picker.onclick = e => {
  if (e.target === picker) picker.style.display = "none";
};

window.logout = async () => {
  await signOut(auth);
  location.href = "login.html";
};
