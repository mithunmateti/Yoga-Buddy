// =============================================================
// settings-page.js — the Settings page (settings.html).
//
// Change your details, the voice, how long to hold each pose,
// reset your streak, or switch to someone else.
// =============================================================

import { sayFresh, unlockSound, chooseVoice } from "./voice.js";

chooseVoice("");   // the same voice as the practice screen
let settings = loadSettings();

// ----- The card at the top: "A", "Asha", "Age 12 · Female" -----
function showProfile() {
  const profile = window.yogaProfile;
  if (!profile) {
    return;   // the questions are showing (profile.js)
  }
  document.getElementById("settings-avatar").textContent = profile.name[0].toUpperCase();
  document.getElementById("settings-name").textContent = profile.name;
  document.getElementById("settings-details").textContent =
    [profile.age ? "Age " + profile.age : "", profile.gender].filter(Boolean).join(" · ");

  document.getElementById("edit-name").value = profile.name;
  document.getElementById("edit-age").value = profile.age || "";
  const gender = document.querySelector('input[name=edit-gender][value="' + profile.gender + '"]');
  if (gender) {
    gender.checked = true;
  }
}
showProfile();
document.addEventListener("profilechange", showProfile);

// ----- 1. Your details -----
const detailsMessage = document.getElementById("details-message");
document.getElementById("details-form").addEventListener("submit", function (event) {
  event.preventDefault();   // don't reload the page
  const name = document.getElementById("edit-name").value.trim();
  const age = Number(document.getElementById("edit-age").value);
  const gender = document.querySelector("input[name=edit-gender]:checked");
  detailsMessage.classList.remove("good");
  if (!name) {
    detailsMessage.textContent = "Please type your name.";
    return;
  }
  if (!(age >= 4 && age <= 110)) {
    detailsMessage.textContent = "Please type an age from 4 to 110.";
    return;
  }
  saveProfile({ name: name, age: age, gender: gender ? gender.value : "" });
  showProfile();
  detailsMessage.textContent = "✓ Saved";
  detailsMessage.classList.add("good");
});

// ----- 2. The voice coach -----
const voiceSwitch = document.getElementById("voice-switch");
voiceSwitch.checked = settings.voice !== false;
voiceSwitch.addEventListener("change", function () {
  settings.voice = voiceSwitch.checked;
  saveSettings(settings);
});

for (const option of document.querySelectorAll("input[name=speed]")) {
  option.checked = option.value === settings.speed;
  option.addEventListener("change", function () {
    settings.speed = option.value;
    saveSettings(settings);
  });
}

document.getElementById("test-voice").addEventListener("click", function () {
  unlockSound();   // phones only play sound after a tap
  if (!voiceIsOn()) {
    alertVoiceOff();
    return;
  }
  const name = window.yogaProfile ? window.yogaProfile.name : "";
  sayFresh("Hi" + (name ? " " + name : "") + "! This is how I will sound when I coach you.");
});

// A short note under the Test button when the voice is off
function alertVoiceOff() {
  const button = document.getElementById("test-voice");
  button.textContent = "Turn the voice on first";
  setTimeout(function () { button.textContent = "▶ Test the voice"; }, 2000);
}

// ----- 3. How long to hold each pose -----
const holdBox = document.getElementById("hold-choices");
holdBox.innerHTML = HOLD_CHOICES.map(function (seconds) {
  return '<label><input type="radio" name="hold" value="' + seconds + '"><span>' + seconds + " s</span></label>";
}).join("");
for (const option of holdBox.querySelectorAll("input")) {
  option.checked = Number(option.value) === holdSeconds();
  option.addEventListener("change", function () {
    settings.hold = Number(option.value);
    saveSettings(settings);
  });
}

// ----- 4. Your progress -----
function showStreakSummary() {
  const progress = loadProgress();
  const streak = currentStreak(progress);
  const minutes = Math.floor(((progress[dayKey()] || {}).seconds || 0) / 60);
  document.getElementById("streak-summary").textContent =
    streak + " day" + (streak === 1 ? "" : "s") + " in a row · " + minutes + " min today";
}
showStreakSummary();

// Buttons that need two taps: the first explains, the second does it
function twoTaps(button, warning, sureText, action) {
  const firstText = button.textContent;
  button.addEventListener("click", function () {
    if (warning.hidden) {
      warning.hidden = false;
      button.textContent = sureText;
      button.classList.add("danger");
      return;
    }
    action();
    warning.hidden = true;
    button.textContent = firstText;
    button.classList.remove("danger");
  });
}

twoTaps(document.getElementById("reset-streak"), document.getElementById("streak-warning"),
  "Yes, reset my streak", function () {
    try {
      localStorage.removeItem(PROGRESS_NAME);
    } catch (error) {
      // storage blocked: nothing was saved anyway
    }
    showStreakSummary();
  });

// ----- 5. Switch person: remove everything, then start again -----
twoTaps(document.getElementById("switch-person"), document.getElementById("switch-warning"),
  "Yes, remove and start again", function () {
    try {
      localStorage.removeItem(PROFILE_NAME);
      localStorage.removeItem(PROGRESS_NAME);
      localStorage.removeItem(SETTINGS_NAME);
      sessionStorage.removeItem("yogaBuddyStarted");
    } catch (error) {
      // storage blocked: nothing was saved anyway
    }
    location.href = "index.html";   // the start page and the questions come back
  });
