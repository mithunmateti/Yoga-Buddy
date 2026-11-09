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

// ----- Your week: the streak, today's minutes, and Monday to Sunday -----
// A day counts when you practised for 10 minutes (progress.js). A ⭐ day is
// one where you held all 5 poses.
function showStreak() {
  const progress = loadProgress();
  const streak = currentStreak(progress);
  const minutesToday = Math.floor(((progress[dayKey()] || {}).seconds || 0) / 60);
  const week = thisWeek(progress);
  const allFiveDays = week.filter(function (day) { return day.allFive; }).length;

  const days = week.map(function (day) {
    const classes = ["week-day"];
    if (day.practised) classes.push("done");
    if (day.allFive) classes.push("all-five");
    if (day.isToday) classes.push("today");
    if (day.isFuture) classes.push("future");
    const mark = day.allFive ? "⭐" : day.practised ? "✓" : "";
    return `<li class="${classes.join(" ")}"><span class="week-dot">${mark}</span>${day.letter}</li>`;
  }).join("");

  document.getElementById("streak").innerHTML = `
    <div class="streak-top">
      <div class="streak-count">
        <span class="streak-flame" aria-hidden="true">🔥</span>
        <div>
          <p class="streak-number">${streak}</p>
          <p class="streak-label">day${streak === 1 ? "" : "s"} in a row</p>
        </div>
      </div>
      <div class="streak-today">
        <p class="streak-label">Today</p>
        <p class="streak-minutes"><b>${Math.min(minutesToday, STREAK_MINUTES)}</b> / ${STREAK_MINUTES} min</p>
        <div class="streak-bar"><span style="width: ${Math.min(100, minutesToday / STREAK_MINUTES * 100)}%"></span></div>
      </div>
    </div>
    <ol class="week">${days}</ol>
    <p class="streak-note">⭐ ${allFiveDays} day${allFiveDays === 1 ? "" : "s"} with all 5 asanas this week</p>
  `;
}
showStreak();
// Coming back to this page (e.g. with the Back button) shows the newest numbers
window.addEventListener("pageshow", showStreak);

// The little labels on a card, e.g. "Easy · Balance · Front view"
function chipsFor(pose) {
  const chips = [pose.level, pose.focus, pose.view === "side" ? "Side view" : "Front view"];
  return chips.filter(Boolean).map(function (chip) {
    return `<span class="chip">${chip}</span>`;
  }).join("");
}

// ----- Today's pose: a different pose each day -----
const day = Math.floor(Date.now() / 86400000);   // days since 1970
const singlePoses = POSES.filter(function (pose) { return !pose.positions; });   // a flow has no hold time
const today = singlePoses[day % singlePoses.length];
const hero = document.getElementById("hero");
hero.href = "guide.html?pose=" + today.id;
hero.style.setProperty("--tint", today.tint || "var(--primary-soft)");
hero.innerHTML = `
  <div class="hero-text">
    <span id="hero-kicker" class="hero-kicker"></span>
    <h3>${today.sanskrit}</h3>
    <p>${today.english} pose</p>
    <div class="chips">${chipsFor(today)}</div>
    <span class="button hero-button">Start ▸</span>
  </div>
  <img class="hero-photo" src="${today.image}" alt="${today.sanskrit} pose" onerror="this.remove()">
`;

// Today's hold time depends on the age, so it changes after the questions
function showTodayHold() {
  document.getElementById("hero-kicker").textContent = "Today · " + holdFor(today.id) + " second hold";
}
showTodayHold();
window.addEventListener("pageshow", showTodayHold);   // it may have changed on the guide

// ----- The pose cards -----
// One card for every pose in poses.js. The single poses go in the "Basic
// Asanas" tab, the flows (Surya Namaskar) in the "Surya Namaskar" tab.
function makePoseCard(pose) {
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
  return card;
}

const grid = document.getElementById("pose-grid");
const flowGrid = document.getElementById("flow-grid");
const flows = POSES.filter(function (pose) { return pose.positions; });

for (const pose of singlePoses) {
  grid.appendChild(makePoseCard(pose));
}
for (const pose of flows) {
  flowGrid.appendChild(makePoseCard(pose));
}


// ----- The tabs: Basic Asanas | Surya Namaskar -----
// The chosen tab is kept in the web address (#basic or #surya). So when you
// refresh, or come back from a pose with the Back button, you are still on
// the same tab. (replaceState changes the address without adding a history
// step or jumping the page.)
const TABS = ["basic", "surya"];
const tabButtons = {};
const tabPanels = {};
for (const name of TABS) {
  tabButtons[name] = document.getElementById("tab-" + name);
  tabPanels[name] = document.getElementById("panel-" + name);
}

document.getElementById("tab-basic-count").textContent = singlePoses.length + " poses";
document.getElementById("tab-surya-count").textContent =
  flows.length === 1 ? flows[0].positions.length + " positions" : flows.length + " flows";

// A screen reader says "vertical" or "horizontal" to match the layout (style.css)
const wideScreen = window.matchMedia("(min-width: 820px)");
function setTabOrientation() {
  document.querySelector(".side-tabs").setAttribute("aria-orientation", wideScreen.matches ? "vertical" : "horizontal");
}
setTabOrientation();
if (wideScreen.addEventListener) {
  wideScreen.addEventListener("change", setTabOrientation);
}

function tabFromAddress() {
  const name = location.hash.replace("#", "");
  return TABS.includes(name) ? name : "basic";
}

function showTab(name, focusIt) {
  for (const other of TABS) {
    const on = other === name;
    tabPanels[other].hidden = !on;
    tabButtons[other].setAttribute("aria-selected", on ? "true" : "false");
    tabButtons[other].tabIndex = on ? 0 : -1;   // one tab stop; arrow keys move between them
  }
  if (focusIt) {
    tabButtons[name].focus();
  }
}

for (const name of TABS) {
  tabButtons[name].addEventListener("click", function () {
    showTab(name, false);
    history.replaceState(null, "", location.pathname + location.search + "#" + name);
  });
}

// Arrow keys move between the tabs (Home and End jump to the first and last)
document.querySelector(".side-tabs").addEventListener("keydown", function (event) {
  const now = TABS.indexOf(tabFromAddress());
  let next = now;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    next = (now + 1) % TABS.length;
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    next = (now + TABS.length - 1) % TABS.length;
  } else if (event.key === "Home") {
    next = 0;
  } else if (event.key === "End") {
    next = TABS.length - 1;
  } else {
    return;
  }
  event.preventDefault();
  history.replaceState(null, "", location.pathname + location.search + "#" + TABS[next]);
  showTab(TABS[next], true);
});

window.addEventListener("hashchange", function () {
  showTab(tabFromAddress(), false);
});
showTab(tabFromAddress(), false);


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
    askProfile(function () {
      showHello();
      showTodayHold();
    });
  }
}

// Remember the app is open, so coming back from Settings or a pose
// shows the home screen, not the start page, again
function markStarted() {
  try {
    sessionStorage.setItem(START_NAME, "yes");
  } catch (error) {
    // storage blocked: the animation plays again next time
  }
}

if (seenStart() || window.yogaProfile) {
  markStarted();
  askIfNeeded();
} else {
  startPage.hidden = false;
  document.body.classList.add("no-scroll");
  document.getElementById("begin-button").addEventListener("click", function () {
    markStarted();
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

