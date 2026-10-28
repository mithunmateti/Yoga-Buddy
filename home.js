// =============================================================
// home.js — builds the Home screen.
// "Welcome, Asha", one big "Today's pose" card, then a card for
// each pose in the POSES list (from poses.js). Clicking a card
// opens that pose's guide.
// =============================================================

// "Good evening" and "Welcome, Asha" at the top, and Asha's initial in the corner
function showHello() {
  const hour = new Date().getHours();
  document.getElementById("greet-time").textContent =
    hour < 12 ? "Good morning ☀️" : hour < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";

  const name = window.yogaProfile ? window.yogaProfile.name : "";
  document.getElementById("hello").textContent = name ? "Welcome, " + name : "Welcome";
  document.getElementById("avatar").textContent = name ? name[0].toUpperCase() : "🙂";
}
showHello();
document.addEventListener("profilechange", showHello);

// The little labels on a card, e.g. "Easy · Balance · Front view"
function chipsFor(pose) {
  const chips = [pose.level, pose.focus, pose.view === "side" ? "Side view" : "Front view"];
  return chips.filter(Boolean).map(function (chip) {
    return `<span class="chip">${chip}</span>`;
  }).join("");
}

// ----- Today's pose: a different pose each day -----
const day = Math.floor(Date.now() / 86400000);   // days since 1970
const today = POSES[day % POSES.length];
const hero = document.getElementById("hero");
hero.href = "guide.html?pose=" + today.id;
hero.style.setProperty("--tint", today.tint || "var(--primary-soft)");
hero.innerHTML = `
  <div class="hero-text">
    <span class="hero-kicker">Today · 30 second hold</span>
    <h3>${today.sanskrit}</h3>
    <p>${today.english} pose</p>
    <div class="chips">${chipsFor(today)}</div>
    <span class="button hero-button">Start ▸</span>
  </div>
  <img class="hero-photo" src="${today.image}" alt="${today.sanskrit} pose" onerror="this.remove()">
`;

// ----- All the poses -----
const grid = document.getElementById("pose-grid");

for (const pose of POSES) {
  // Each card is a link, e.g. guide.html?pose=tadasana
  const card = document.createElement("a");
  card.className = "pose-card";
  card.href = "guide.html?pose=" + pose.id;
  card.style.setProperty("--tint", pose.tint || "var(--primary-soft)");

  // What goes inside the card: picture, Sanskrit name, English name and labels.
  // If the picture is missing, the image removes itself and
  // "Picture coming soon" shows instead.
  card.innerHTML = `
    <div class="pose-picture">
      <span class="picture-missing">Picture coming soon</span>
      <img src="${pose.image}" alt="${pose.sanskrit} pose" onerror="this.remove()">
    </div>
    <div class="pose-card-text">
      <h3>${pose.sanskrit}</h3>
      <p>${pose.english}</p>
      <div class="chips">${chipsFor(pose)}</div>
    </div>
  `;

  // A flow (Surya Namaskar) gets a small label: how many poses it has
  if (pose.positions) {
    card.querySelector(".chips").innerHTML += `<span class="chip">☀️ ${pose.positions.length} poses</span>`;
  }

  // Put the finished card on the page
  grid.appendChild(card);
}


// ----- The opening animation -----
// When it has finished (or after 4 seconds, just in case), take it away.
const splash = document.getElementById("splash");
function removeSplash() {
  splash.remove();
}
splash.addEventListener("animationend", function (event) {
  if (event.target === splash) {
    removeSplash();
  }
});
setTimeout(function () {
  if (splash.isConnected) {
    removeSplash();
  }
}, 4000);


// ----- The intro screen -----
// Only for someone new: Get started → the questions → the home screen.
// Someone who has answered before goes straight to the home screen.
const START_NAME = "yogaBuddyStarted";
const startPage = document.getElementById("start-page");

function seenStart() {
  try {
    return sessionStorage.getItem(START_NAME) === "yes";
  } catch (error) {
    return false;
  }
}

function askIfNeeded() {
  if (!window.yogaProfile) {
    askProfile(showHello);
  }
}

if (seenStart() || window.yogaProfile) {
  askIfNeeded();
} else {
  startPage.hidden = false;
  document.body.classList.add("no-scroll");
  document.getElementById("begin-button").addEventListener("click", function () {
    try {
      sessionStorage.setItem(START_NAME, "yes");
    } catch (error) {
      // storage blocked: the intro shows again next time
    }
    startPage.classList.add("leaving");   // fades away (style.css)
    setTimeout(function () {
      startPage.hidden = true;
      if (!document.querySelector(".onboarding")) {   // the questions still need it
        document.body.classList.remove("no-scroll");
      }
      window.scrollTo(0, 0);
    }, 350);
    askIfNeeded();
  });
}
