// =============================================================
// home.js — builds the Home screen.
// It goes through the POSES list (from poses.js) and makes one
// card for each pose. Clicking a card opens that pose's guide.
// =============================================================

// "Hi, Asha! Not you?" at the top, so the next person can enter their own details
function showHello() {
  const hello = document.getElementById("hello");
  hello.textContent = "";
  if (!window.yogaProfile) {
    return;
  }
  hello.append("Hi, " + window.yogaProfile.name + "! ");
  const notYou = document.createElement("button");
  notYou.className = "link-button";
  notYou.textContent = "Not you?";
  notYou.addEventListener("click", function () {
    askProfile(showHello);
  });
  hello.append(notYou);
}
showHello();
document.addEventListener("profilechange", showHello);

// The start page: shown once each time the app is opened (coming back
// from a pose doesn't show it again). Start → the name form → the poses.
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

if (seenStart()) {
  askIfNeeded();
} else {
  startPage.hidden = false;
  document.getElementById("begin-button").addEventListener("click", function () {
    try {
      sessionStorage.setItem(START_NAME, "yes");
    } catch (error) {
      // storage blocked: the start page shows again next time
    }
    startPage.hidden = true;
    window.scrollTo(0, 0);
    askIfNeeded();
  });
}

// The empty box in index.html where the cards will go
const grid = document.getElementById("pose-grid");

for (const pose of POSES) {
  // Each card is a link, e.g. guide.html?pose=tadasana
  const card = document.createElement("a");
  card.className = "pose-card";
  card.href = "guide.html?pose=" + pose.id;

  // What goes inside the card: picture, Sanskrit name, English name in brackets.
  // If the picture is missing, the image removes itself and
  // "Picture coming soon" shows instead.
  card.innerHTML = `
    <div class="pose-picture">
      <span class="picture-missing">Picture coming soon</span>
      <img src="${pose.image}" alt="${pose.sanskrit} pose" onerror="this.remove()">
    </div>
    <h3>${pose.sanskrit}</h3>
    <p>(${pose.english})</p>
  `;

  // A flow (Surya Namaskar) gets a small label: how many poses it has
  if (pose.positions) {
    card.innerHTML += `<p class="flow-badge">☀️ ${pose.positions.length} poses in a flow</p>`;
  }

  // Put the finished card on the page
  grid.appendChild(card);
}
