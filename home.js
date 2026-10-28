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
