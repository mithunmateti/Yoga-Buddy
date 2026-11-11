// =============================================================
// hold-time.js — how long to hold each pose.
//
// The pose guide has a bar from 5 to 60 seconds and a "Recommended"
// button. The choice is remembered for each pose, on this device.
//
// The recommended times are a starting point, not a medical rule, and most
// of them are our own estimate. We found no study that tested the best hold
// time for any age, so we used these as rough guides:
//   • Under 10: "up to 10 seconds" (Indian child yoga guidelines, NCPCR). We
//     only saw this quoted second-hand, and it is a limit, not a target.
//   • Adults: inside the 10–30 seconds of the Common Yoga Protocol (Ministry of
//     AYUSH). It has no age groups and doesn't cover Utkatasana or Virabhadrasana.
//   • 60 and over: the balance column stays below the average time people of
//     that age can stand on one leg (Springer et al., 2007). That is a balance
//     test, not a yoga recommendation.
// Gender is not used: we found no study or guideline with a different time for it.
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

// Which column each pose uses. A pose in the other pose files says it
// itself ("holdKind" in poses-standing.js and the others); these are the
// five Basic Asanas. Tadasana lifts the heels, so it is a balance pose here.
// Virabhadrasana stays "steady" because a study of older adults (Lu & Fishman, 2016)
// held it for 30 seconds. Utkatasana is "legs": it loaded the knees most in a lab study.
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

// The pose with this id, from the POSES list (poses.js and the other pose files)
function poseById(poseId) {
  return typeof POSES === "undefined" ? null : POSES.find(function (p) { return p.id === poseId; }) || null;
}

function recommendedHold(poseId) {
  const age = holdAge();
  const row = HOLD_TABLE.find(function (group) { return age <= group.upToAge; }) ||
              HOLD_TABLE[HOLD_TABLE.length - 1];
  const pose = poseById(poseId);
  const kind = HOLD_KIND[poseId] || (pose && pose.holdKind) || "steady";
  return row[kind];
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


// =============================================================
// Rounds of a flow (Surya Namaskar, Chandra Namaskar, …)
//
// One round = all the positions once. In Surya and Chandra Namaskar the
// legs take turns: round 1 steps back with the right leg, round 2 with the
// left, and so on, so an even number of rounds works both legs equally.
// 2 rounds is the suggestion, unless the flow says otherwise
// ("roundsRecommended", e.g. 1 for the 5-minute morning flow).
// =============================================================
const ROUNDS_MIN = 1;
const ROUNDS_MAX = 12;
const ROUNDS_RECOMMENDED = 2;
const ROUNDS_NAME = "yogaBuddyRounds";   // the numbers chosen: { suryanamaskar: 4 }

function validRounds(rounds) {
  return Number.isInteger(rounds) && rounds >= ROUNDS_MIN && rounds <= ROUNDS_MAX;
}

function loadRounds() {
  try {
    return JSON.parse(localStorage.getItem(ROUNDS_NAME)) || {};
  } catch (error) {
    return {};
  }
}

// The suggested number of rounds for this flow
function recommendedRounds(poseId) {
  const pose = poseById(poseId);
  return (pose && pose.roundsRecommended) || ROUNDS_RECOMMENDED;
}

// The rounds for this flow: the number chosen before, or else the suggestion
function roundsFor(poseId) {
  const chosen = Number(loadRounds()[poseId]);
  return validRounds(chosen) ? chosen : recommendedRounds(poseId);
}

function saveRounds(poseId, rounds) {
  const all = loadRounds();
  all[poseId] = rounds;
  try {
    localStorage.setItem(ROUNDS_NAME, JSON.stringify(all));
  } catch (error) {
    // storage blocked: the web address still carries the number to the practice screen
  }
}

function clearRounds(poseId) {
  const all = loadRounds();
  delete all[poseId];
  try {
    localStorage.setItem(ROUNDS_NAME, JSON.stringify(all));
  } catch (error) {
    // storage blocked: nothing was saved anyway
  }
}

// For the practice screen: practice.html?pose=suryanamaskar&rounds=4
function roundsForThisVisit() {
  const address = new URLSearchParams(location.search);
  const fromAddress = Number(address.get("rounds"));
  return validRounds(fromAddress) ? fromAddress : roundsFor(address.get("pose"));
}
