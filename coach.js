// =============================================================
// coach.js — the voice coach.
// 1. After Start, counts down 5 seconds, so you can step back.
// 2. Starts the steps as soon as you are in the picture. If the camera
//    can't see you properly, it says exactly what to do: "Step back a
//    little, so your feet are in the picture", "Move a little to your left"…
// 3. Reads the steps (from poses.js) aloud, one at a time, with a short
//    quiet gap (3.5 seconds) after each one. If a step the body tracker
//    can measure isn't right yet, it gives ONE tip, then moves on.
// 4. Times the hold (5 to 60 seconds, chosen on the guide). The timer only counts while your
//    score is 70 or more. During the hold the AI buddy watches and
//    chooses the words, like a real teacher. (Its answers take a few
//    seconds, which is too slow for the quick steps.)
//
// A FLOW like Surya Namaskar has no hold: each of its positions is one
// step (checked by the camera), first leading with the right leg, then
// again with the left leg. That is one round. A position can also have a
// short hold of its own ("hold" in poses), like in the morning flow.
//
// The camera also knows which way you are facing (pose-check.js). If a
// pose is easier to see from the side and you face the camera (or the
// other way round), the coach gives a friendly tip now and then.
//
// The voice itself is in voice.js; the fixed sentences are in phrases.js.
// =============================================================

import { worstJoint, tipFor, isWrong } from "./pose-check.js?v=20261122g";
import { buddyOn, askBuddy } from "./buddy.js?v=20261122g";
import { say, sayFresh, isTalking, quietFor, stopTalking } from "./voice.js?v=20261122g";
import { SAY, startIn, countFor, heldFor, roundStart, roundsDone, finishedFlow, stayFor } from "./phrases.js?v=20261122g";

// ----- Settings you can change -----
const GET_READY_SECONDS = 5;  // after Start: time to step back before the steps begin
const STEP_GAP = 3.5;       // after the coach speaks, wait this long (quiet) before the next step
const STEP_OK_TIME = 0.5;   // a measured step must look right for this long to count as done
let holdTime = holdForThisVisit();   // how long to hold the pose (chosen on the guide, hold-time.js)
const GOOD_SCORE = 70;      // the hold timer only counts at this score or above
const PROBLEM_TIME = 1.5;   // only tell you to move once a problem has lasted this long
const SAME_WORDS_GAP = 15;  // don't say the same "move" sentence again within 15 seconds
const REMIND_AFTER = 2;     // during the hold: say a tip when something has been wrong this long…
const REMIND_GAP = 4;       // …but stay quiet for at least this long between things we say
const SAME_TIP_GAP = 10;    // don't say the same tip again within 10 seconds
const AI_GAP = 6;           // ask the AI buddy at most once every 6 seconds (free-tier limit)
const AI_QUIET_LIMIT = 15;  // if the AI has had nothing to say for this long, use the angle tips
const FACING_TIP_AFTER = 4; // facing the "wrong" way for this long → a tip…
const FACING_TIP_GAP = 30;  // …but at most once every 30 seconds

// ----- Parts of the page -----
const coachLabel = document.getElementById("coach-label");
const coachText = document.getElementById("coach-text");
const coachFigure = document.getElementById("coach-figure");
const countdownText = document.getElementById("countdown");
const timerCard = document.getElementById("timer-card");
const timerNumber = document.getElementById("timer-seconds");
const timerNote = document.getElementById("timer-note");
const resultBox = document.getElementById("result");
const flowProgress = document.getElementById("flow-progress");
const roundBanner = document.getElementById("round-banner");
const timerOutOf = document.querySelector(".timer-out-of");
timerOutOf.textContent = "/" + holdTime + "s";

// The time now, in seconds
function now() {
  return performance.now() / 1000;
}


// =============================================================
// THE COACH
// =============================================================

let pose = null;
let getPhoto = null;          // function that takes a photo from the camera (from practice.js)
let stage = "off";            // "countdown" → "findBody" → "handCheck" → "steps" → "hold" → "done"
let countdownClock = null;    // the clock that counts 5, 4, 3, 2, 1
let steps = [];               // the steps to coach (see makeSteps)
let stepIndex = 0;            // which step we are on (0 = the first)
let stepDone = false;         // has the current step looked right (for a moment)?
let lookedRightSince = null;  // when the current step started looking right
let tipGiven = false;         // have we already given a tip for the current step?
let lastTip = "";             // the last tip we said…
let lastTipAt = -99;          // …and when
let wrongSince = null;        // during the hold: when something started being wrong
let held = 0;                 // seconds the pose has been held so far
let lastUpdate = null;        // time of the last camera picture
let latestJoints = [];        // the newest measurements (to tell the AI buddy)
let problem = null;           // what's wrong with the picture now (a name from SAY, or null)
let problemSince = 0;         // since when
let lastGuide = "";           // the last "move" sentence we said…
let lastGuideAt = -99;        // …and when
let positionHeld = null;      // in a flow: seconds held in this position (null = not holding)
let wrongFacingSince = null;  // since when the person faces the "wrong" way…
let facingTipAt = -99;        // …and when we last said so

// Start coaching a pose (called by the Start button, while the camera
// is still starting). takePhoto is a function that gives a camera photo
// for the AI buddy.
export function startCoach(thePose, takePhoto) {
  pose = thePose;
  getPhoto = takePhoto;
  // The number of rounds chosen on the guide (a flow like Surya Namaskar)
  if (pose.positions) {
    pose.rounds = roundsForThisVisit();
  }
  // Read it again: the questions may have been showing when the page opened
  holdTime = holdForThisVisit();
  timerOutOf.textContent = "/" + holdTime + "s";
  steps = makeSteps(pose);
  reset();
  say(hello() + SAY.stepBack + " " + startIn(GET_READY_SECONDS));
}

// The person's name (from profile.js), to use when talking to them
function hello() {
  return window.yogaProfile ? "Hi " + window.yogaProfile.name + ". " : "";
}

function wellDoneName() {
  return window.yogaProfile ? "Well done, " + window.yogaProfile.name + "!" : SAY.wellDone;
}

// Where the coach is now: "countdown", "findBody", "handCheck", "steps",
// "hold", "done" or "off" (practice.js uses it to start and stop recording)
export function coachStage() {
  return stage;
}

// Start again from the beginning (the "Restart" button)
export function restartCoach() {
  reset();
  sayFresh(SAY.startAgain + " " + SAY.stepBack + " " + startIn(GET_READY_SECONDS));
}

// Stop the coach (when the camera or the body tracker can't start)
export function stopCoach() {
  hideFlowWords();
  clearInterval(countdownClock);
  countdownText.textContent = "";
  stage = "off";
  stopTalking();
  showStep("Voice coach 🔊", "Waiting for the camera…");
}

let scoreTotal = 0;   // the score x time added up while holding, for the average
let scoreTime = 0;    // the time (seconds) the score was counted for

// "✓ Round 1 complete" in big letters for a moment
let bannerTimer = null;
function showRoundBanner(text) {
  roundBanner.textContent = text;
  roundBanner.hidden = false;
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(function () { roundBanner.hidden = true; }, 3000);
}

function hideFlowWords() {
  clearTimeout(bannerTimer);
  roundBanner.hidden = true;
  flowProgress.hidden = true;
}

function reset() {
  hideFlowWords();
  resultBox.hidden = true;
  scoreTotal = 0;
  scoreTime = 0;
  stage = "countdown";
  stepIndex = 0;
  held = 0;
  wrongSince = null;
  lastUpdate = null;
  aiAnswer = null;
  positionHeld = null;
  wrongFacingSince = null;
  showTimer(false);
  showStep("Get ready", "Step back about 2 metres, so the camera can see you from head to feet.");
  countDown();
}

// Show 5, 4, 3, 2, 1 on the camera. Then start looking for the person.
// We look at the clock 5 times a second (instead of counting ticks), so
// it stays 5 seconds even when the computer is busy loading the body tracker.
function countDown() {
  clearInterval(countdownClock);   // (Restart during a countdown: stop the old one)
  const startAt = now() + GET_READY_SECONDS;
  countdownText.textContent = GET_READY_SECONDS;
  countdownClock = setInterval(function () {
    const left = Math.ceil(startAt - now());
    if (left > 0) {
      countdownText.textContent = left;
    } else {
      clearInterval(countdownClock);
      countdownText.textContent = "";   // an empty countdown is hidden
      stage = "findBody";
    }
  }, 200);
}

// Show a short message in the coach box, e.g. ("Step 2 of 4", "Interlock your fingers…"),
// and in Surya Namaskar a stick figure of the pose (figureSVG is in figure.js)
export function showStep(label, text, figure) {
  coachLabel.textContent = label;
  coachText.textContent = text;
  coachFigure.innerHTML = figure ? figureSVG(figure) : "";
}

// The steps to coach, each one { label, intro, text, checks }:
//  • a single pose: its steps from poses.js. A step's checks are the
//    ones named in its waitFor.
//  • a flow like Surya Namaskar: every position is a step, checked with
//    the position's own checks. A round is all the positions once. The
//    legs take turns: round 1 steps back with the right leg, round 2 with
//    the left leg, and so on.
function makeSteps(thePose) {
  const list = [];
  if (!thePose.positions) {
    thePose.steps.forEach(function (step, i) {
      list.push({
        label: "Step " + (i + 1) + " of " + thePose.steps.length,
        intro: "",
        text: step.text,
        checks: thePose.checks.filter(function (check) {
          return step.waitFor.includes(check.name);
        })
      });
    });
    return list;
  }
  const count = thePose.positions.length;
  const total = thePose.rounds;
  // Does this flow take turns with the legs? (Yes if it says "{leg}" anywhere)
  const turns = thePose.positions.some(function (position) { return position.say.includes("{leg}"); });
  for (let round = 1; round <= total; round++) {
    const leg = round % 2 === 1 ? "right" : "left";
    thePose.positions.forEach(function (position, i) {
      // At the start of a round: say the last one was complete, and which round this is
      let intro = "";
      if (i === 0) {
        intro = (round > 1 ? SAY.roundComplete + " " : "") + roundStart(round, total, turns ? leg : null) + " ";
      }
      list.push({
        label: "Round " + round + " of " + total + " · " + (i + 1) + " of " + count + " · " + position.sanskrit,
        progress: "Round " + round + " of " + total + " · " + (i + 1) + "/" + count,
        round: round,
        firstOfRound: i === 0,
        intro: intro,
        text: withLeg(position.say, leg),
        checks: position.checks,
        figure: position.figure,
        hold: position.hold || 0,                    // seconds to stay in this position (0 = none)
        view: position.view || thePose.view
      });
    });
  }
  return list;
}

// In a flow, "{leg}" in a sentence becomes the leg this half round is
// about ("right" or "left"), and "{other leg}" the other one
function withLeg(text, leg) {
  const other = leg === "right" ? "left" : "right";
  return text.split("{leg}").join(leg).split("{other leg}").join(other);
}

// The checks the camera should measure right now (practice.js asks for
// them every picture): the whole pose, or in a flow the position the
// coach is on
export function checksNow() {
  if (!pose) {
    return [];
  }
  if (!pose.positions) {
    return pose.checks;
  }
  const step = steps[stepIndex];
  return step ? step.checks : pose.positions[0].checks;
}

// Called by practice.js for every camera picture, with what it found:
//   inView:   true if the person is in the picture (all of them)
//   joints:   the measured joints (already smoothed)
//   score:    the score right now (or null if we can't see enough to score)
//   tipJoint: the joint the tip is about (or null if everything is right)
//   problem:  what's wrong with the picture (a name from SAY, e.g. "feetOut"), or null
export function updateCoach(check) {
  const t = now();
  // How much time has passed since the last picture (at most a quarter
  // of a second, so a slow moment can't add a big jump to the timer)
  let passed = 0;
  if (lastUpdate !== null) {
    passed = Math.min(t - lastUpdate, 0.25);
  }
  lastUpdate = t;
  latestJoints = check.joints;
  noteProblem(t, check.problem);

  // In a flow (Surya Namaskar) every moment we could score you counts
  // towards the average at the end (a hold counts them in doHold)
  if (pose.positions && stage === "steps" && check.inView && check.score !== null) {
    scoreTotal += check.score * passed;
    scoreTime += passed;
  }

  if (stage === "findBody") {
    findBody(t, check);
  } else if (stage === "handCheck") {
    doHandCheck(t, passed, check);
  } else if (stage === "steps") {
    doStep(t, passed, check);
    facingTip(t, check);
  } else if (stage === "hold") {
    facingTip(t, check);
    doHold(t, passed, check);
  }
}


// =============================================================
// TELLING THE PERSON WHERE TO STAND
// =============================================================

// A friendly tip when the person faces the "wrong" way for this pose:
// "side" poses are easier to see from the side, "front" poses from the
// front. Thanks to the 3D points the checks still work, so this is only a
// tip, never a stop. A pose with view "any" works both ways.
function facingTip(t, check) {
  const want = (stage === "steps" && steps[stepIndex] && steps[stepIndex].view) || pose.view;
  const wrong = check.inView && check.facing &&
    ((want === "side" && check.facing === "front") || (want === "front" && check.facing === "side"));
  if (!wrong) {
    wrongFacingSince = null;
    return;
  }
  if (wrongFacingSince === null) {
    wrongFacingSince = t;
  }
  if (t - wrongFacingSince >= FACING_TIP_AFTER && t - facingTipAt >= FACING_TIP_GAP && quietFor(REMIND_GAP)) {
    facingTipAt = t;
    speak(want === "side" ? SAY.sideOnTip : SAY.faceCameraTip);
  }
}

// Remember what the problem is, and since when
function noteProblem(t, newProblem) {
  if (newProblem !== problem) {
    problem = newProblem;
    problemSince = t;
  }
}

// Say what to do about the problem (e.g. "Move a little to your left"),
// once it has lasted a moment, and not the same words over and over
function guide(t) {
  if (!problem || t - problemSince < PROBLEM_TIME || !quietFor(4)) {
    return;
  }
  let words = SAY[problem];
  if (problem === "cantSeeArms" || problem === "cantSeeLegs") {
    words += " " + (pose.view === "side" ? SAY.sideOn : SAY.faceCamera);
  }
  if (words === lastGuide && t - lastGuideAt < SAME_WORDS_GAP) {
    return;
  }
  lastGuide = words;
  lastGuideAt = t;
  speak(words);
}


// =============================================================
// THE AI BUDDY (during the hold)
// =============================================================
// We ask in the background and carry on; when the answer arrives it is
// kept in aiAnswer until the coach uses it. Answers from before a
// Restart are thrown away.

let aiBusy = false;      // waiting for an answer right now?
let aiAskedAt = -99;     // when we last asked
let aiAnswer = null;     // the newest answer: { personVisible, say }
let aiHeardAt = -99;     // when the AI last gave us something to say
let lastSaid = "";       // the last thing the coach said (so the AI doesn't repeat it)

function askAI(t, question) {
  if (!buddyOn() || aiBusy || t - aiAskedAt < AI_GAP || !getPhoto) {
    return;
  }
  aiBusy = true;
  aiAskedAt = t;
  const askedStage = stage;
  const askedStep = stepIndex;

  const message =
    "Pose: " + pose.sanskrit + " (" + pose.english + "), " + pose.view + " view.\n" +
    "Now: " + question + "\n" +
    "Body tracker measurements:\n" + describeJoints(latestJoints) + "\n" +
    "Last thing you said: \"" + lastSaid + "\"";

  // (If the AI buddy has a problem, buddy.js writes it in the browser's
  // console. The coach just carries on with the angle tips.)
  askBuddy(getPhoto(), message).then(function (answer) {
    aiBusy = false;
    if (answer && answer.say) {
      aiHeardAt = now();
    }
    // Only keep the answer if we are still at the same point
    if (answer && stage === askedStage && stepIndex === askedStep) {
      aiAnswer = answer;
    }
  });
}

// Take the newest AI answer (each answer is used only once)
function takeAIAnswer() {
  const answer = aiAnswer;
  aiAnswer = null;
  return answer;
}

// The measurements as text for the AI, e.g. "Arms (left): 120°, target 175° (wrong)"
function describeJoints(joints) {
  if (joints.length === 0) {
    return "(the body tracker cannot measure the body right now)";
  }
  const lines = [];
  for (const joint of joints) {
    lines.push("- " + joint.check.name + " (" + joint.side + "): " + Math.round(joint.angle) +
               "°, target " + joint.check.target + "° " + (isWrong(joint) ? "(WRONG: " + tipFor(joint) + ")" : "(ok)"));
  }
  return lines.join("\n");
}

// Say something and remember it
function speak(text) {
  lastSaid = text;
  say(text);
}

// Say a tip (from the AI or from the angles): only after a short quiet
// moment, and not the same words again within a few seconds
function sayTip(t, words) {
  if (!quietFor(REMIND_GAP) || (words === lastTip && t - lastTipAt < SAME_TIP_GAP)) {
    return;
  }
  lastTip = words;
  lastTipAt = t;
  speak(words);
}

// Is the AI buddy helping right now? Then it does the talking, because it
// can see more than the angles. If it has had nothing to say for a while
// (or it isn't working), the angle tips take over.
function aiIsHelping(t) {
  return buddyOn() && t - aiHeardAt < AI_QUIET_LIMIT;
}


// ----- Stage 1: after the countdown, start as soon as the person is in the picture -----
function findBody(t, check) {
  if (check.inView) {
    if (humanChecked) {
      goToStep(0, SAY.begin + " ");
    } else {
      startHandCheck(t, check);   // first: is it a real person?
    }
  } else if (!isTalking()) {
    guide(t);   // say what to do, e.g. "Step back a little, so your feet are in the picture"
  }
}


// ----- Stage 1b: the hand check -----
// A glowing circle appears beside you (practice.js draws it). Move your hand
// into it and keep it there for a moment: a photo or a poster can't do that,
// so it means a real person is in front of the camera. It is done once per visit.
const HAND_HOLD = 1.2;       // seconds the hand must stay inside the circle
const HAND_REMIND = 10;      // say it again if nothing happens for this long
let humanChecked = false;    // passed the hand check (stays passed after Restart)
let target = null;           // the circle: { x, y, r } (MediaPipe fractions; r is a share of the height)
let handInside = 0;          // seconds the hand has been inside (goes down again when it leaves)
let handAskedAt = 0;         // when we last asked
let handDoneUntil = 0;       // show the green tick until then

function startHandCheck(t, check) {
  stage = "handCheck";
  target = placeTarget(check);
  handInside = 0;
  handAskedAt = t;
  showStep("Hand check ✋", "Move your hand into the glowing circle and keep it there.");
  speak(SAY.handCheck);
}

// Put the circle beside you at shoulder height, out to one side (left or
// right at random), about where your hand reaches. It must be away from
// where your hands are now, so you have to move to reach it.
function placeTarget(check) {
  const aspect = check.aspect || 1;
  let cx = 0.5, cy = 0.35, width = 0.12;   // if we can't see the shoulders
  if (check.shoulders) {
    const a = check.shoulders[0];
    const b = check.shoulders[1];
    cx = (a.x + b.x) / 2;
    cy = (a.y + b.y) / 2;
    width = Math.max(0.04, Math.hypot((a.x - b.x) * aspect, a.y - b.y));   // in shares of the height
  }
  const r = Math.min(0.12, Math.max(0.06, width * 0.6));
  const choices = [-1, 1].map(function (side) {
    return {
      // (kept away from the edges: a phone in full screen cuts a little off each side)
      x: clamp(cx + side * width * 1.6 / aspect, 0.24, 0.76),
      y: clamp(cy - width * 0.4, 0.1, 0.8),
      r: r
    };
  });
  // Pick a random side, but not one where a hand already is
  const free = choices.filter(function (c) { return !handIn(check, c, 2); });
  const list = free.length ? free : choices;
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

// Is one of the hands inside the circle? (bigger = how many times the radius)
function handIn(check, circle, bigger) {
  const aspect = check.aspect || 1;
  return (check.hands || []).some(function (hand) {
    const dx = (hand.x - circle.x) * aspect;
    const dy = hand.y - circle.y;
    return Math.hypot(dx, dy) <= circle.r * (bigger || 1);
  });
}

function doHandCheck(t, passed, check) {
  if (!check.inView) {
    if (!isTalking()) {
      guide(t);   // e.g. "Step back a little…"
    }
    return;
  }
  if (handIn(check, target)) {
    handInside += passed;
  } else {
    handInside = Math.max(0, handInside - passed * 2);   // it empties if the hand leaves
  }
  if (handInside >= HAND_HOLD) {
    humanChecked = true;
    handDoneUntil = t + 1.2;
    goToStep(0, SAY.handOk + " " + SAY.begin + " ");
    return;
  }
  // Nothing yet: move the circle (maybe it was hard to reach) and ask again
  if (t - handAskedAt > HAND_REMIND && handInside === 0 && quietFor(4)) {
    handAskedAt = t;
    target = placeTarget(check);
    speak(SAY.handAgain);
  }
}

// For practice.js: the circle to draw now, or null
export function handTarget() {
  if (stage === "handCheck" && target) {
    return { x: target.x, y: target.y, r: target.r, progress: Math.min(1, handInside / HAND_HOLD), done: false };
  }
  if (target && now() < handDoneUntil) {
    return { x: target.x, y: target.y, r: target.r, progress: 1, done: true };   // the green tick, for a moment
  }
  return null;
}


// ----- Stage 2: the steps, one at a time -----
function goToStep(index, before) {
  stage = "steps";
  stepIndex = index;
  stepDone = false;
  lookedRightSince = null;
  tipGiven = false;
  const step = steps[index];
  showStep(step.label, step.text, step.figure);
  if (step.progress) {
    flowProgress.textContent = step.progress;
    flowProgress.hidden = false;
  }
  if (step.firstOfRound && step.round > 1) {
    showRoundBanner("✓ Round " + (step.round - 1) + " complete");
  }
  speak(before + step.intro + step.text);
}

function nextStep(before) {
  if (stepIndex + 1 < steps.length) {
    goToStep(stepIndex + 1, before);
  } else if (pose.positions) {
    finishFlow(before);   // a flow (Surya Namaskar) has no hold
  } else {
    startHold(before);
  }
}

function doStep(t, passed, check) {
  // In a flow, staying in a position for its hold time (see holdPosition)
  if (positionHeld !== null) {
    holdPosition(t, passed, check);
    return;
  }

  // The person went out of the picture: say what to do, and wait
  if (!check.inView) {
    lookedRightSince = null;
    if (!isTalking()) {
      guide(t);
    }
    return;
  }

  // The joints this step is about, e.g. both "Arms" for "stretch your arms up".
  // (A joint hidden for a moment, like hands in front of the body, is
  // simply not measured.)
  const step = steps[stepIndex];
  const stepJoints = [];
  for (const joint of check.joints) {
    if (step.checks.includes(joint.check)) {
      stepJoints.push(joint);
    }
  }
  const wrongJoint = worstJoint(stepJoints);

  // Remember if the step has looked right for a moment (even while the
  // coach is still talking: some people are quick!)
  if (stepJoints.length > 0 && wrongJoint === null) {
    if (lookedRightSince === null) {
      lookedRightSince = t;
    }
    if (t - lookedRightSince >= STEP_OK_TIME) {
      stepDone = true;
    }
  } else {
    lookedRightSince = null;
  }

  // Give the person a short quiet gap to do the step
  if (!quietFor(STEP_GAP)) {
    return;
  }

  if (stepJoints.length === 0) {
    stepFinished("");                   // the camera can't measure this step (like fingers): move on
  } else if (stepDone) {
    stepFinished(SAY.good + " ");
  } else if (wrongJoint === null) {
    return;                             // it looks right just now: wait a moment to be sure
  } else if (!tipGiven) {
    tipGiven = true;
    speak(tipFor(wrongJoint));          // one tip (e.g. "Raise your arms higher"), then another gap
  } else if (pose.positions) {
    stepFinished("");                   // a flow keeps flowing: just go on
  } else {
    stepFinished(SAY.comfortable + " ");   // still not quite right: move on kindly
  }
}

// A step is done. In a flow, a position with a hold time ("hold" in
// poses) is held first: "Stay here for 20 seconds."
function stepFinished(before) {
  const step = steps[stepIndex];
  if (step.hold > 0) {
    positionHeld = 0;
    wrongSince = null;
    timerOutOf.textContent = "/" + step.hold + "s";
    showTimer(true);
    showPositionTimer(step, "Breathe slowly…");
    speak(before + stayFor(step.hold));
    return;
  }
  nextStep(before);
}

// Holding a position of a flow. Flows are gentle, so the timer counts
// whenever someone is in front of the camera (also while a tip is given,
// and when part of you is hidden, which happens a lot lying down). It
// only pauses when nobody is there at all.
function holdPosition(t, passed, check) {
  const step = steps[stepIndex];
  if (check.inView || step.checks.length === 0 || check.problem !== "nobody") {
    positionHeld += passed;
    showPositionTimer(step, "Breathe slowly…");
  } else {
    showPositionTimer(step, "Paused: " + (SAY[check.problem] || "I can't see you."));
    if (!isTalking()) {
      guide(t);
    }
  }
  if (positionHeld >= step.hold) {
    positionHeld = null;
    showTimer(false);
    timerOutOf.textContent = "/" + holdTime + "s";
    nextStep("");
    return;
  }
  // One gentle tip if something stays wrong for a few seconds
  const tipJoint = check.inView ? check.tipJoint : null;
  if (tipJoint && step.checks.includes(tipJoint.check)) {
    if (wrongSince === null) {
      wrongSince = t;
    }
    if (t - wrongSince >= REMIND_AFTER) {
      sayTip(t, tipFor(tipJoint));
    }
  } else {
    wrongSince = null;
  }
}

function showPositionTimer(step, note) {
  timerNumber.textContent = Math.min(step.hold, Math.floor(positionHeld));
  timerCard.style.setProperty("--progress", Math.min(1, positionHeld / step.hold));
  timerNote.textContent = note;
}


// ----- Stage 3: hold the pose for the chosen time -----
function startHold(before) {
  stage = "hold";
  held = 0;
  scoreTotal = 0;
  scoreTime = 0;
  wrongSince = null;
  aiAnswer = null;
  showStep("Hold the pose", "Breathe slowly. The timer counts while your score is " + GOOD_SCORE + " or more.");
  showTimer(true);
  updateTimer("Counting…");
  speak(before + SAY.hold + " " + countFor(holdTime));
}

function doHold(t, passed, check) {
  const score = check.score;

  // Every moment we could see and score you counts towards the average,
  // including the moments the timer was paused
  if (check.inView && score !== null) {
    scoreTotal += score * passed;
    scoreTime += passed;
  }

  // 1. The timer only counts while we can see the body and the score is good
  if (!check.inView) {
    updateTimer("Paused: " + SAY[check.problem]);
  } else if (score === null) {
    updateTimer("Paused: " + (SAY[check.problem] || "I can't see you clearly."));
  } else if (score < GOOD_SCORE) {
    updateTimer("Paused: fix your pose");
  } else {
    held += passed;
    updateTimer("Counting… keep breathing");
  }

  if (held >= holdTime) {
    finish();
    return;
  }

  // 2. What to say
  if (!check.inView || score === null) {
    wrongSince = null;
    if (!isTalking()) {
      guide(t);
    }
    return;
  }

  if (buddyOn()) {
    // The AI looks every few seconds and decides: a correction, some
    // encouragement, or nothing
    askAI(t, "The person is holding the pose (" + Math.floor(held) + " of " + holdTime + " seconds, score " + score + "). " +
             "If something is wrong, give ONE short correction. Otherwise, now and then, a short encouragement. " +
             "Leave 'say' empty if you spoke recently and they look fine.");
    const answer = takeAIAnswer();
    if (answer && answer.say) {
      sayTip(t, answer.say);
      return;
    }
    if (aiIsHelping(t)) {
      return;   // the AI is doing the talking
    }
  }

  // Without the AI (or when it has had nothing to say for a while): say
  // the tip once something has been wrong for a couple of seconds
  if (check.tipJoint) {
    if (wrongSince === null) {
      wrongSince = t;
    }
    if (t - wrongSince >= REMIND_AFTER) {
      sayTip(t, tipFor(check.tipJoint));
    }
  } else {
    wrongSince = null;
  }
}


// ----- Stage 4: done! -----
function finish() {
  stage = "done";
  recordPose(pose.id);   // for the weekly streak (progress.js)
  held = holdTime;
  updateTimer("Done!");
  showStep("Well done!", "You held " + pose.sanskrit + " for " + holdTime + " seconds.");
  sayFresh(wellDoneName() + " " + heldFor(pose, holdTime) + " " + SAY.relax);
  showResult();
}

// The average score screen, a moment after "Done!"
function showResult() {
  const average = scoreTime > 0 ? Math.round(scoreTotal / scoreTime) : null;
  const band = average === null ? "" : average >= 80 ? "great" : average >= 50 ? "ok" : "low";
  const message = average === null ? "We couldn't measure your pose clearly this time." :
    average >= 90 ? "Excellent! Your pose was very steady." :
    average >= 80 ? "Great hold! Just a few small things to polish." :
    average >= 70 ? "Good job! A little more practice and it will be even better." :
    average >= 50 ? "Nice effort. Try again and follow the tips to improve." :
    "Keep practising. Watch the tips and try again.";
  document.getElementById("result-pose").textContent = pose.sanskrit + " · " +
    (pose.positions ? pose.rounds + (pose.rounds === 1 ? " round" : " rounds") : holdTime + " seconds");
  document.getElementById("result-number").textContent = average === null ? "–" : average;
  document.getElementById("result-score").dataset.band = band;
  document.getElementById("result-message").textContent = message;
  setTimeout(function () {
    if (stage === "done") {   // (not if you pressed Restart in the meantime)
      resultBox.hidden = false;
    }
  }, 1200);
}

// "Practice again" on the result screen does the same as the Restart button
document.getElementById("result-again").addEventListener("click", function () {
  resultBox.hidden = true;
  document.getElementById("restart-button").click();
});

// The end of a flow (Surya Namaskar)
function finishFlow(before) {
  stage = "done";
  showStep("Round complete!", "Well done! You finished " + roundsDone(pose) + ".");
  flowProgress.hidden = true;
  showRoundBanner("✓ Round " + pose.rounds + " complete");
  // A flow can end with its own words ("restSay"), e.g. the bedtime flow ends lying down
  speak(before + SAY.roundComplete + " " + SAY.wellDone + " " + finishedFlow(pose) + " " + (pose.restSay || SAY.restNow));
  showResult();
}


// ----- The timer on the screen -----
function showTimer(visible) {
  timerCard.hidden = !visible;
}

function updateTimer(note) {
  timerNumber.textContent = Math.min(holdTime, Math.floor(held));
  timerCard.style.setProperty("--progress", Math.min(1, held / holdTime));   // fills the ring
  timerNote.textContent = note;
}
