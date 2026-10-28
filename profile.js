// =============================================================
// profile.js — asks who is using Yoga Buddy: name, age and gender.
//
// Like an app's sign-up: one question per screen, with a progress
// bar at the top, then a short "Getting your buddy ready…" moment.
//
// It is only asked the first time. The answers are saved in this
// browser (localStorage), so they are still there after closing the
// app or turning the device off. Nothing leaves this device.
// =============================================================

const PROFILE_NAME = "yogaBuddyProfile";

// The details of the person using the app, or null if not asked yet
function getProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_NAME));
    return profile && profile.name ? profile : null;
  } catch (error) {
    return null;
  }
}

// Gives back true if the details were saved on the device
function saveProfile(profile) {
  let saved = false;
  try {
    localStorage.setItem(PROFILE_NAME, JSON.stringify(profile));
    saved = JSON.parse(localStorage.getItem(PROFILE_NAME)).name === profile.name;
  } catch (error) {
    // storage blocked (e.g. some private windows): only used on this page
  }
  // Ask the browser to keep this website's saved data, not clear it to save space
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(function () {});
  }
  window.yogaProfile = profile;
  return saved;
}

// The three questions. Each one shows its own screen.
const QUESTIONS = [
  {
    title: "What should I call you?",
    hint: "Your first name is perfect.",
    html: '<input id="profile-name" class="big-input" type="text" maxlength="30" autocomplete="off" placeholder="Your name">',
    answer: function () {
      return document.getElementById("profile-name").value.trim();
    }
  },
  {
    title: "How old are you?",
    hint: "So I can coach you the right way.",
    html: '<input id="profile-age" class="big-input" type="number" inputmode="numeric" min="4" max="110" placeholder="Age">',
    answer: function () {
      const age = Number(document.getElementById("profile-age").value);
      return age >= 4 && age <= 110 ? age : "";
    }
  },
  {
    title: "What's your gender?",
    hint: "Tap one.",
    html: `
      <div class="option-list">
        <label class="option"><input type="radio" name="gender" value="Male"><span>👦 Male</span></label>
        <label class="option"><input type="radio" name="gender" value="Female"><span>👧 Female</span></label>
        <label class="option"><input type="radio" name="gender" value="Other"><span>🙂 Other</span></label>
      </div>`,
    answer: function () {
      const chosen = document.querySelector("input[name=gender]:checked");
      return chosen ? chosen.value : "";
    }
  }
];

// Show the questions on top of the page. When they are answered, call done(profile).
function askProfile(done) {
  const box = document.createElement("div");
  box.className = "onboarding";
  document.body.appendChild(box);
  document.body.classList.add("no-scroll");

  const answers = [];
  let step = 0;

  function show() {
    const question = QUESTIONS[step];
    box.innerHTML = `
      <form class="onboarding-card" novalidate>
        <div class="onboarding-top">
          <button type="button" class="icon-button back" aria-label="Back" ${step === 0 ? "hidden" : ""}>‹</button>
          <div class="progress" aria-label="Question ${step + 1} of ${QUESTIONS.length}">
            ${QUESTIONS.map(function (q, i) { return '<span class="' + (i <= step ? "done" : "") + '"></span>'; }).join("")}
          </div>
          <span class="progress-count">${step + 1}/${QUESTIONS.length}</span>
        </div>
        <div class="onboarding-body">
          <span class="onboarding-buddy" aria-hidden="true">🧘</span>
          <h2>${question.title}</h2>
          <p>${question.hint}</p>
          ${question.html}
          <p class="onboarding-error" role="alert"></p>
        </div>
        <button class="button wide" type="submit">${step === QUESTIONS.length - 1 ? "Let's go" : "Continue"}</button>
      </form>
    `;

    // Put back an answer given before (after pressing Back)
    if (answers[step] !== undefined) {
      const input = box.querySelector("input.big-input");
      if (input) {
        input.value = answers[step];
      } else {
        const option = box.querySelector('input[value="' + answers[step] + '"]');
        if (option) {
          option.checked = true;
        }
      }
    }
    const input = box.querySelector("input.big-input");
    if (input) {
      input.focus();
    }

    box.querySelector(".back").addEventListener("click", function () {
      step--;
      show();
    });

    box.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();   // don't reload the page
      const answer = question.answer();
      if (answer === "") {
        box.querySelector(".onboarding-error").textContent =
          step === 1 ? "Please type an age from 4 to 110." : "Please answer to continue.";
        return;
      }
      answers[step] = answer;
      if (step < QUESTIONS.length - 1) {
        step++;
        show();
      } else {
        finish();
      }
    });
  }

  // "Getting your buddy ready, Asha…" for a moment, then the home screen
  function finish() {
    const profile = { name: answers[0], age: answers[1], gender: answers[2] };
    const saved = saveProfile(profile);
    box.innerHTML = `
      <div class="onboarding-ready">
        <div class="breathing-circle" aria-hidden="true"></div>
        <h2></h2>
        <p>Breathe in… and out.</p>
        <p class="saved-note"></p>
      </div>
    `;
    box.querySelector("h2").textContent = "Getting your buddy ready, " + profile.name + "…";
    // Say whether this browser will remember them next time
    box.querySelector(".saved-note").textContent = saved
      ? "✓ Saved on this device. You won't need to type it again."
      : "This browser can't save your details (is it a private window?), so it will ask again next time.";
    setTimeout(function () {
      box.classList.add("leaving");
      setTimeout(function () {
        box.remove();
        document.body.classList.remove("no-scroll");
        done(profile);
      }, 350);
    }, 2200);
  }

  show();
}

// When the page opens: ask, unless this person has already told us.
// (The home page asks after its intro screen instead: data-ask-later.)
window.yogaProfile = getProfile();
if (!window.yogaProfile && !document.body.hasAttribute("data-ask-later")) {
  askProfile(function () {
    document.dispatchEvent(new Event("profilechange"));
  });
}
