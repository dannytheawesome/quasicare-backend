import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, push, set, child, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
  "avatars/animal1.png",
  "avatars/animal2.png",
  "avatars/animal3.png",
  "avatars/animal4.png",
  "avatars/animal5.png"
];

const avatarEl = document.getElementById("avatar");
const encouragementEl = document.getElementById("encouragement");
const verifiedEl = document.getElementById("verified");
const journalCountEl = document.getElementById("journalCount");
const helpedEl = document.getElementById("helpedCount");
const badgeEl = document.getElementById("badgeCount");
const feelingEl = document.getElementById("feeling");

const tabs = document.querySelectorAll(".tabs div");
const content = document.getElementById("tabContent");
const journalInput = document.getElementById("newJournalInput");
const journalList = document.getElementById("journalList");
const submitBtn = document.getElementById("submitJournalBtn");

function renderSection(items) {
  journalList.innerHTML = "";
  if (!items || items.length === 0) {
    journalList.innerHTML = `<div style="color:#888;text-align:center;margin-top:10px;">No journals yet.</div>`;
    return;
  }
  items.forEach(entry => {
    const div = document.createElement("div");
    div.className = "journal-entry";
    div.textContent = entry.text || entry;
    journalList.appendChild(div);
  });
}

async function loadJournals(uid) {
  const snap = await get(child(ref(db), `users/${uid}/journals`));
  renderSection(snap.exists() ? Object.values(snap.val()) : []);
}

onAuthStateChanged(auth, async user => {
  if (!user) return location.href = "login.html";

  const uid = user.uid;
  const snap = await get(ref(db, `users/${uid}`));
  const data = snap.exists() ? snap.val() : {};

  // Avatar and encouragement
  avatarEl.src = avatars[data.avatarIndex || 0];
  if (user.email === "sherneonbusy@gmail.com") {
    verifiedEl.style.display = "block";
  }

  encouragementEl.textContent = data.encouragement || "You are heard. You matter.";
  journalCountEl.textContent = data.journals ? Object.keys(data.journals).length : 0;
  helpedEl.textContent = data.replies || 0;
  badgeEl.textContent = data.badges ? data.badges.length : 0;
  feelingEl.textContent = data.todayFeeling || "—";

  loadJournals(uid);
});

submitBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const text = journalInput.value.trim();
  if (!text) return;

  const uid = user.uid;
  const newRef = push(ref(db, `users/${uid}/journals`));
  await set(newRef, { text });

  journalInput.value = "";
  loadJournals(uid);
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".tabs .active").classList.remove("active");
    tab.classList.add("active");

    const section = tab.dataset.tab;
    onAuthStateChanged(auth, async user => {
      if (!user) return;
      const snap = await get(child(ref(db), `users/${user.uid}/${section}`));
      const data = snap.exists() ? Object.values(snap.val()) : [];
      journalList.innerHTML = section === "journals"
        ? ""
        : `<div style="color:#888;text-align:center;margin-top:10px;">No ${section} yet.</div>`;
      if (section === "journals") renderSection(data);
    });
  });
});

window.logout = async () => {
  await signOut(auth);
  location.href = "login.html";
};
