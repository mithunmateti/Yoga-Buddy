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
// A day counts when you practised for your daily goal (progress.js). A ⭐ day
// is one where you held all 5 poses. Until a goal is chosen, the card asks
// for one, with the recommended goal marked.
let pickingGoal = false;   // the "Change" button opened the goal choices

function goalPicker() {
  const recommended = recommendedMinutes();
  const value = chosenGoal() || recommended;
  const markAt = (recommended - GOAL_MIN) / (GOAL_MAX - GOAL_MIN);   // 0 to 1 along the bar
  return `
    <div class="goal-picker">
      <p class="goal-title">🎯 ${chosenGoal() ? "Change your daily goal" : "Choose your daily goal"}</p>
      <p class="goal-hint">Practise this long each day to keep your streak. ⭐ We recommend <b>${goalText(recommended)}</b>. ${recommendedReason()}</p>
      <p class="goal-value" id="goal-value">${goalText(value)}</p>
      <div class="goal-slider-wrap">
        <input id="goal-slider" class="goal-slider" type="range" min="${GOAL_MIN}" max="${GOAL_MAX}" step="${GOAL_STEP}" value="${value}" aria-label="Daily goal in minutes">
        <span class="goal-mark" style="left: calc(15px + (100% - 30px) * ${markAt})" title="Recommended">⭐</span>
      </div>
      <div class="goal-scale"><span>${GOAL_MIN} min</span><span>45 min</span><span>1 h 30</span></div>
      <div class="goal-actions">
        <button type="button" class="button small-button secondary-button goal-use-best">⭐ Use ${goalText(recommended)}</button>
        <button type="button" class="button small-button goal-save">Set goal</button>
      </div>
    </div>`;
}

function showStreak() {
  const progress = loadProgress();
  const STREAK_MINUTES = dailyGoal();
  const askGoal = !chosenGoal() || pickingGoal;
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
    ${askGoal ? goalPicker() : `<p class="goal-line">🎯 Daily goal: <b>${goalText(STREAK_MINUTES)}</b> <button type="button" class="goal-change">Change</button></p>`}
    <ol class="week">${days}</ol>
    <p class="streak-note">⭐ ${allFiveDays} day${allFiveDays === 1 ? "" : "s"} with all 5 basic asanas this week</p>
  `;
}

// Tapping a goal saves it; "Change" opens the choices again
document.getElementById("streak").addEventListener("click", function (event) {
  if (event.target.closest(".goal-save")) {
    setDailyGoal(Number(document.getElementById("goal-slider").value));
    pickingGoal = false;
    showStreak();
  } else if (event.target.closest(".goal-use-best")) {
    document.getElementById("goal-slider").value = recommendedMinutes();
    document.getElementById("goal-value").textContent = goalText(recommendedMinutes());
  } else if (event.target.closest(".goal-change")) {
    pickingGoal = true;
    showStreak();
  }
});
// Moving the slider shows the time above it
document.getElementById("streak").addEventListener("input", function (event) {
  if (event.target.id === "goal-slider") {
    document.getElementById("goal-value").textContent = goalText(Number(event.target.value));
  }
});
// The recommendation depends on the age, which may be asked after the page opens
document.addEventListener("profilechange", showStreak);
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

// ----- The sidebar: big (icons and names) or small (just the icons) -----
// Only on a laptop or a sideways iPad (on a phone the tabs are a row).
// The choice is remembered on this device (a head script in index.html
// puts it back before the page is drawn, so the page doesn't jump).
const SIDE_BAR_NAME = "yogaBuddySideBar";
const sideBarToggle = document.getElementById("side-bar-toggle");

function showSideBarSize() {
  const small = document.documentElement.classList.contains("side-bar-small");
  sideBarToggle.setAttribute("aria-expanded", small ? "false" : "true");
  sideBarToggle.setAttribute("aria-label", small ? "Make the menu big" : "Make the menu small");
  sideBarToggle.title = small ? "Show the menu" : "Hide the menu";
  sideBarToggle.querySelector(".side-bar-arrow").textContent = small ? "»" : "«";
  // When it is small, hovering an icon shows the tab's name
  for (const name of TABS) {
    const button = tabButtons[name];
    button.title = small ? button.querySelector(".tab-long").textContent : "";
  }
}

sideBarToggle.addEventListener("click", function () {
  const small = document.documentElement.classList.toggle("side-bar-small");
  try {
    localStorage.setItem(SIDE_BAR_NAME, small ? "small" : "big");
  } catch (error) {
    // storage blocked: it just isn't remembered
  }
  showSideBarSize();
});
showSideBarSize();

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

