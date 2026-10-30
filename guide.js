// =============================================================
// guide.js — fills in the Pose guide screen.
// The web address says which pose to show, for example:
//   guide.html?pose=tadasana
// =============================================================

// 1. Read the pose name from the web address (the part after "?pose=")
const params = new URLSearchParams(window.location.search);
const poseId = params.get("pose");

// 2. Look through the POSES list (from poses.js) for the pose with that id
const pose = POSES.find(function (p) {
  return p.id === poseId;
});

if (!pose) {
  // 3a. No pose with that name: show a friendly message instead
  document.getElementById("guide").innerHTML = `
    <p>Sorry, we could not find that pose.</p>
    <a class="button" href="index.html">Back to all poses</a>
  `;
} else {
  // 3b. Found it: fill in each part of the page

  // Tab title, e.g. "Tadasana – Yoga Buddy"
  document.title = pose.sanskrit + " – Yoga Buddy";

  // Names
  document.getElementById("pose-name").textContent = pose.sanskrit;
  document.getElementById("pose-english").textContent = pose.english + " pose";

  // The little labels, e.g. "Easy · Balance"
  const chips = [pose.level, pose.focus].filter(Boolean);
  document.getElementById("pose-chips").innerHTML = chips.map(function (chip) {
    return '<span class="chip">' + chip + "</span>";
  }).join("");

  // Picture, on the pose's own soft colour
  document.getElementById("guide-picture").style.setProperty("--tint", pose.tint || "var(--primary-soft)");
  const image = document.getElementById("pose-image");
  image.src = pose.image;
  image.alt = pose.sanskrit + " pose";

  // Steps: add one numbered list item for each step.
  // A flow (Surya Namaskar) lists its positions instead (see below).
  const stepList = document.getElementById("pose-steps");
  if (pose.positions) {
    showPositions(pose, stepList);
  } else {
    for (const step of pose.steps) {
      const item = document.createElement("li");
      item.textContent = step.text;
      stepList.appendChild(item);
    }
  }

  // Extra safety advice for this pose, if poses.js has some
  if (pose.safety) {
    document.getElementById("safety-extra").textContent = pose.safety;
  }

  // Which way to face the camera
  const badge = document.getElementById("view-badge");
  const viewText = document.getElementById("view-text");
  if (pose.view === "side") {
    badge.textContent = "Side view";
    viewText.textContent = "Turn sideways to the camera.";
  } else {
    badge.textContent = "Front view";
    viewText.textContent = "Face the camera.";
  }
  if (pose.view === "side") {
    document.getElementById("pose-chips").innerHTML += '<span class="chip">Side view</span>';
  }
  // Where to put the camera (a pose can have its own advice in poses.js)
  viewText.textContent += " " + (pose.camera || "Place it about 2 metres away so your whole body fits on screen.");

  // "Start with camera" button opens the practice screen for this pose
  document.getElementById("start-button").href = "practice.html?pose=" + pose.id;

  // A single pose has a hold time to choose. A flow has rounds instead.
  if (!pose.positions) {
    showHoldChoice(pose);
  }
}


// ----- How long to hold: the bar and the Recommended button -----
function showHoldChoice(pose) {
  const range = document.getElementById("hold-range");
  const recommendedButton = document.getElementById("hold-recommended");
  const caution = document.getElementById("hold-caution");

  document.getElementById("hold-card").hidden = false;
  range.min = HOLD_MIN;
  range.max = HOLD_MAX;
  range.step = HOLD_STEP;

  // Show a time everywhere it appears on this page
  function showTime(seconds) {
    const recommended = recommendedHold(pose.id);
    const age = holdAge();
    range.value = seconds;
    range.style.setProperty("--fill", (seconds - HOLD_MIN) / (HOLD_MAX - HOLD_MIN) * 100 + "%");
    document.getElementById("hold-seconds").textContent = seconds;
    document.getElementById("hold-note").textContent =
      "Then hold the pose for " + seconds + " seconds. Yoga Buddy's voice will guide you. 🔊";
    document.getElementById("start-button").href = "practice.html?pose=" + pose.id + "&hold=" + seconds;

    const isRecommended = seconds === recommended;
    const forWhom = window.yogaProfile && window.yogaProfile.age ? " for age " + age : "";
    recommendedButton.classList.toggle("chosen", isRecommended);
    recommendedButton.textContent = (isRecommended ? "✓ Recommended" : "⭐ Use recommended") +
      forWhom + ": " + recommended + " s";
    // Children and older people get a gentle note above the recommended time
    caution.hidden = !(seconds > recommended && (age < 18 || age >= 60));
  }

  range.addEventListener("input", function () {
    const seconds = Number(range.value);
    saveHold(pose.id, seconds);
    showTime(seconds);
  });

  recommendedButton.addEventListener("click", function () {
    clearHold(pose.id);
    showTime(recommendedHold(pose.id));
  });

  showTime(holdFor(pose.id));
  // The questions may still be showing: use the age once it is known
  document.addEventListener("profilechange", function () {
    showTime(holdFor(pose.id));
  });
}


// ----- A flow like Surya Namaskar: its positions, in order -----
// Each position gets a stick figure (figure.js), its name, when to
// breathe in or out, what to do, and how it looks from every side.
function showPositions(pose, list) {
  document.getElementById("steps-title").textContent =
    "The " + pose.positions.length + " poses, in order";
  document.getElementById("hold-note").textContent = pose.roundNote;

  const BREATH = {
    in: "🌬️ Breathe in",
    out: "🌬️ Breathe out",
    hold: "🌬️ Hold your breath out",
    normal: "🌬️ Breathe normally"
  };

  for (const position of pose.positions) {
    const item = document.createElement("li");
    item.className = "position";
    item.innerHTML = `
      <div class="position-figure">${figureSVG(position.figure)}</div>
      <div class="position-text">
        <h3>${position.sanskrit} <span>(${position.english})</span></h3>
        <p class="breath">${BREATH[position.breath]}</p>
        <p>${forGuide(position.say)}</p>
        <details>
          <summary>See it from every side</summary>
          <ul class="views">
            <li><b>Front:</b> ${position.views.front}</li>
            <li><b>Back:</b> ${position.views.back}</li>
            <li><b>Left side:</b> ${position.views.left}</li>
            <li><b>Right side:</b> ${position.views.right}</li>
            <li><b>From above:</b> ${position.views.top}</li>
          </ul>
        </details>
      </div>
    `;
    list.appendChild(item);
  }
}

// The guide shows the first half round: "{leg}" is the right leg there
// (the coach says "left" the second time round)
function forGuide(text) {
  return text.split("{leg}").join("right").split("{other leg}").join("left");
}
