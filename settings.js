// =============================================================
// settings.js — the choices on the Settings page.
//
//   voice: is the voice coach on? (the words are always shown too)
//   speed: how fast the voice talks: "slow", "normal" or "fast"
//   hold:  how many seconds to hold each pose: 5, 10, 20, 30, 45 or 60
//
// Saved in this browser (localStorage), like the profile.
// The other pages read them with voiceIsOn(), voiceRate() and holdSeconds().
// =============================================================

const SETTINGS_NAME = "yogaBuddySettings";
const DEFAULT_SETTINGS = { voice: true, speed: "normal", hold: 30 };
const VOICE_SPEEDS = { slow: 0.8, normal: 0.95, fast: 1.1 };   // for speechSynthesis
const HOLD_CHOICES = [5, 10, 20, 30, 45, 60];

function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(SETTINGS_NAME)) || {};
  } catch (error) {
    // storage blocked: the defaults are used
  }
  return Object.assign({}, DEFAULT_SETTINGS, saved);
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings));
  } catch (error) {
    // storage blocked: only used on this page
  }
}

function voiceIsOn() {
  return loadSettings().voice !== false;
}

function voiceRate() {
  return VOICE_SPEEDS[loadSettings().speed] || VOICE_SPEEDS.normal;
}

function holdSeconds() {
  const hold = Number(loadSettings().hold);
  return HOLD_CHOICES.includes(hold) ? hold : DEFAULT_SETTINGS.hold;
}
