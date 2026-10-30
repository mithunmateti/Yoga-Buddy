// =============================================================
// hold-time.js — how long to hold each pose.
//
// The pose guide has a bar from 5 to 60 seconds and a "Recommended"
// button. The choice is remembered for each pose, on this device.
//
// The recommended times are a starting point, not a medical rule.
// No study has tested the best hold time for any age, so:
//   • Under 10: "up to 10 seconds" (Indian child yoga guidelines, NCPCR).
//   • Adults: inside the 10–30 seconds of the Common Yoga Protocol
//     (Ministry of AYUSH), which has no age groups.
//   • 60 and over: our own estimate, kept below the average time people
//     of that age can stand on one leg (Springer et al., 2007).
//   • Everything else in the table is our own estimate too.
// Gender is not used: no study or guideline sets a different time for it.
// =============================================================

const HOLD_MIN = 5;
const HOLD_MAX = 60;
const HOLD_STEP = 5;
const HOLD_NAME = "yogaBuddyHoldTimes";   // the times chosen: { tadasana: 20, … }

// Seconds for each age group: up to this age, then each kind of pose
const HOLD_TABLE = [
  { upToAge: 9,   steady: 10, balance: 10, legs: 10 },
  { upToAge: 14,  steady: 15, balance: 10, legs: 10 },
  { upToAge: 17,  steady: 20, balance: 15, legs: 15 },
  { upToAge: 59,  steady: 30, balance: 20, legs: 20 },
  { upToAge: 69,  steady: 20, balance: 15, legs: 15 },
  { upToAge: 79,  steady: 20, balance: 10, legs: 10 },
  { upToAge: 110, steady: 15, balance: 5,  legs: 10 }
];

// Which column each pose uses. Tadasana lifts the heels, so it is a balance pose here.
const HOLD_KIND = {
  tadasana: "balance",
  vrikshasana: "balance",
  utkatasana: "legs",
  virabhadrasana2: "steady",
  bhujangasana: "steady"
};

// The age from the profile, or 30 if we don't know it yet
function holdAge() {
  const age = window.yogaProfile ? Number(window.yogaProfile.age) : 0;
  return age > 0 ? age : 30;
}

function recommendedHold(poseId) {
  const age = holdAge();
  const row = HOLD_TABLE.find(function (group) { return age <= group.upToAge; }) ||
              HOLD_TABLE[HOLD_TABLE.length - 1];
  return row[HOLD_KIND[poseId] || "steady"];
}

function validHold(seconds) {
  return seconds >= HOLD_MIN && seconds <= HOLD_MAX && seconds % HOLD_STEP === 0;
}

function loadHoldTimes() {
  try {
    return JSON.parse(localStorage.getItem(HOLD_NAME)) || {};
  } catch (error) {
    return {};
  }
}

// The time for this pose: the one chosen before, or else the recommended one
function holdFor(poseId) {
  const chosen = Number(loadHoldTimes()[poseId]);
  return validHold(chosen) ? chosen : recommendedHold(poseId);
}

function saveHold(poseId, seconds) {
  const times = loadHoldTimes();
  times[poseId] = seconds;
  try {
    localStorage.setItem(HOLD_NAME, JSON.stringify(times));
  } catch (error) {
    // storage blocked: the web address still carries the time to the practice screen
  }
}

// Forget the chosen time, so this pose goes back to the recommended one
// (and follows the age if it changes in Settings)
function clearHold(poseId) {
  const times = loadHoldTimes();
  delete times[poseId];
  try {
    localStorage.setItem(HOLD_NAME, JSON.stringify(times));
  } catch (error) {
    // storage blocked: nothing was saved anyway
  }
}

// For the practice screen: practice.html?pose=tadasana&hold=20
function holdForThisVisit() {
  const address = new URLSearchParams(location.search);
  const fromAddress = Number(address.get("hold"));
  return validHold(fromAddress) ? fromAddress : holdFor(address.get("pose"));
}
