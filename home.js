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
    <p class="streak-note">⭐ ${allFiveDays} day${allFiveDays === 1 ? "" : "s"} with all 5 basic asanas this week</p>
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

// ----- Which tab a pose is on -----
// The tabs sort the poses by the position of your body, like the chapters
// of the book Yoga Anatomy (Kaminoff). Each pose says its "group" in the
// pose files: "standing", "sitting", "kneeling", "supine" (lying on your
// back), "prone" (lying on your tummy) or "armsupport" (on your hands).
// The 5 Basic Asanas (basic: true) are on the "basic" tab too, and every
// flow (Surya Namaskar and the flows in flows.js) is on "flows".
function isOnTab(pose, name) {
  if (pose.positions) {
    return name === "flows";
  }
  if (name === "basic") {
    return !!pose.basic;
  }
  return pose.group === name;
}

// ----- Today's pose: a different Basic Asana each day -----
const day = Math.floor(Date.now() / 86400000);   // days since 1970
const singlePoses = POSES.filter(function (pose) { return isOnTab(pose, "basic"); });
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
// One card for every pose, in the tab(s) it belongs to (see isOnTab).
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

  // A flow gets a small label: how many poses it has
  if (pose.positions) {
    card.querySelector(".chips").innerHTML += `<span class="chip">${pose.icon || "☀️"} ${pose.positions.length} poses</span>`;
  }
  return card;
}

const TABS = ["basic", "standing", "sitting", "kneeling", "supine", "prone", "armsupport", "flows"];

// In book order: poses with a bookPage first (by page), then the rest as
// they are in the pose files
function bookOrder(list) {
  return list.map(function (pose, i) { return { pose: pose, i: i }; }).sort(function (a, b) {
    const pa = a.pose.bookPage || Infinity;
    const pb = b.pose.bookPage || Infinity;
    return pa !== pb ? pa - pb : a.i - b.i;
  }).map(function (item) { return item.pose; });
}

const inTab = {};
for (const name of TABS) {
  inTab[name] = POSES.filter(function (pose) { return isOnTab(pose, name); });
  if (name !== "basic" && name !== "flows") {
    inTab[name] = bookOrder(inTab[name]);
  }
  const grid = document.getElementById("grid-" + name);
  for (const pose of inTab[name]) {
    grid.appendChild(makePoseCard(pose));
  }
  // "6 poses" or "4 flows" under the tab's name
  const count = inTab[name].length;
  document.getElementById("tab-" + name + "-count").textContent =
    count + (name === "flows" ? (count === 1 ? " flow" : " flows") : (count === 1 ? " pose" : " poses"));
}


// ----- The tabs: Basic Asanas | Standing | Sitting | Strength | Flows -----
// The chosen tab is kept in the web address (e.g. #sitting). So when you
// refresh, or come back from a pose with the Back button, you are still on
// the same tab. (replaceState changes the address without adding a history
// step or jumping the page.)
const tabButtons = {};
const tabPanels = {};
for (const name of TABS) {
  tabButtons[name] = document.getElementById("tab-" + name);
  tabPanels[name] = document.getElementById("panel-" + name);
}

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
  let name = location.hash.replace("#", "");
  // Old addresses of tabs that have moved
  if (name === "surya") {
    name = "flows";
  } else if (name === "strength") {
    name = "armsupport";
  }
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
  // On a phone the tabs are a row you can swipe: show the chosen one
  // (only sideways, so the page itself doesn't jump)
  if (!wideScreen.matches) {
    const row = tabButtons[name].parentElement;
    const button = tabButtons[name];
    if (button.offsetLeft < row.scrollLeft || button.offsetLeft + button.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = button.offsetLeft - 16;
    }
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

