// =============================================================
// coach.js — the voice coach.
// 1. After Start, counts down 5 seconds, so you can step back.
// 2. Starts the steps as soon as you are in the picture. If the camera
//    can't see you properly, it says exactly what to do: "Step back a
//    little, so your feet are in the picture", "Move a little to your left"…
// 3. Reads the steps (from poses.js) aloud, one at a time, with a short
//    quiet gap (3.5 seconds) after each one. If a step the body tracker
//    can measure isn't right yet, it gives ONE tip, then moves on.
// 4. Times a 30-second hold. The timer only counts while your
//    score is 70 or more. During the hold the AI buddy watches and
//    chooses the words, like a real teacher. (Its answers take a few
//    seconds, which is too slow for the quick steps.)
//
// A FLOW like Surya Namaskar has no hold: each of its positions is one
// step (checked by the camera), first leading with the right leg, then
// again with the left leg. That is one round.
//
// The voice itself is in voice.js; the fixed sentences are in phrases.js.
// =============================================================

import { worstJoint, tipFor, isWrong } from "./pose-check.js";
import { buddyOn, askBuddy } from "./buddy.js";
import { say, sayFresh, isTalking, quietFor, stopTalking } from "./voice.js";
import { SAY, startIn, countFor, heldFor, roundNumber, roundsDone, finishedFlow } from "./phrases.js";

// ----- Settings you can change -----
const GET_READY_SECONDS = 5;  // after Start: time to step back before the steps begin
const STEP_GAP = 3.5;       // after the coach speaks, wait this long (quiet) before the next step
const STEP_OK_TIME = 0.5;   // a measured step must look right for this long to count as done
const HOLD_SECONDS = 30;    // how long to hold the pose
const GOOD_SCORE = 70;      // the hold timer only counts at this score or above
const PROBLEM_TIME = 1.5;   // only tell you to move once a problem has lasted this long
const SAME_WORDS_GAP = 15;  // don't say the same "move" sentence again within 15 seconds
const REMIND_AFTER = 2;     // during the hold: say a tip when something has been wrong this long…
const REMIND_GAP = 4;       // …but stay quiet for at least this long between things we say
const SAME_TIP_GAP = 10;    // don't say the same tip again within 10 seconds
const AI_GAP = 6;           // ask the AI buddy at most once every 6 seconds (free-tier limit)
const AI_QUIET_LIMIT = 15;  // if the AI has had nothing to say for this long, use the angle tips

// ----- Parts of the page -----
const coachLabel = document.getElementById("coach-label");
const coachText = document.getElementById("coach-text");
const coachFigure = document.getElementById("coach-figure");
const countdownText = document.getElementById("countdown");
const timerCard = document.getElementById("timer-card");
const timerNumber = document.getElementById("timer-seconds");
const timerFill = document.getElementById("timer-fill");
const timerNote = document.getElementById("timer-note");

// The time now, in seconds
function now() {
  return performance.now() / 1000;
}


// =============================================================
// THE COACH
// =============================================================

let pose = null;
let getPhoto = null;          // function that takes a photo from the camera (from practice.js)
let stage = "off";            // "countdown" → "findBody" → "steps" → "hold" → "done"
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

// Start coaching a pose (called by the Start button, while the camera
// is still starting). takePhoto is a function that gives a camera photo
// for the AI buddy.
export function startCoach(thePose, takePhoto) {
  pose = thePose;
  getPhoto = takePhoto;
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

// Start again from the beginning (the "Restart" button)
export function restartCoach() {
  reset();
  sayFresh(SAY.startAgain + " " + SAY.stepBack + " " + startIn(GET_READY_SECONDS));
}

// Stop the coach (when the camera or the body tracker can't start)
export function stopCoach() {
  clearInterval(countdownClock);
  countdownText.textContent = "";
  stage = "off";
  stopTalking();
  showStep("Voice coach 🔊", "Waiting for the camera…");
}

function reset() {
  stage = "countdown";
  stepIndex = 0;
  held = 0;
  wrongSince = null;
  lastUpdate = null;
  aiAnswer = null;
  showTimer(false);
  showStep("Get ready", "Step back 2–3 metres, so the camera can see you from head to feet.");
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
//    the position's own checks. Each round goes through the positions
//    twice: first leading with the right leg, then with the left leg.
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
  for (let round = 1; round <= thePose.rounds; round++) {
    for (const leg of ["right", "left"]) {
      thePose.positions.forEach(function (position, i) {
        // Say something new at the start of each half round
        let intro = "";
        if (i === 0 && leg === "left") {
          intro = SAY.otherSide + " ";
        } else if (i === 0 && round > 1) {
          intro = roundNumber(round) + " ";
        }
        list.push({
          label: (i + 1) + " of " + count + " · " + position.sanskrit + " · " + leg + " leg",
          intro: intro,
          text: withLeg(position.say, leg),
          checks: position.checks,
          figure: position.figure
        });
      });
    }
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

  if (stage === "findBody") {
    findBody(t, check);
  } else if (stage === "steps") {
    doStep(t, check);
  } else if (stage === "hold") {
    doHold(t, passed, check);
  }
}


// =============================================================
// TELLING THE PERSON WHERE TO STAND
// =============================================================

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
    goToStep(0, SAY.begin + " ");
  } else if (!isTalking()) {
    guide(t);   // say what to do, e.g. "Step back a little, so your feet are in the picture"
  }
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

function doStep(t, check) {
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
    nextStep("");                       // the camera can't measure this step (like fingers): move on
  } else if (stepDone) {
    nextStep(SAY.good + " ");
  } else if (wrongJoint === null) {
    return;                             // it looks right just now: wait a moment to be sure
  } else if (!tipGiven) {
    tipGiven = true;
    speak(tipFor(wrongJoint));          // one tip (e.g. "Raise your arms higher"), then another gap
  } else if (pose.positions) {
    nextStep("");                       // a flow keeps flowing: just go on
  } else {
    nextStep(SAY.comfortable + " ");    // still not quite right: move on kindly
  }
}


// ----- Stage 3: hold the pose for 30 seconds -----
function startHold(before) {
  stage = "hold";
  held = 0;
  wrongSince = null;
  aiAnswer = null;
  showStep("Hold the pose", "Breathe slowly. The timer counts while your score is " + GOOD_SCORE + " or more.");
  showTimer(true);
  updateTimer("Counting…");
  speak(before + SAY.hold + " " + countFor(HOLD_SECONDS));
}

function doHold(t, passed, check) {
  const score = check.score;

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

  if (held >= HOLD_SECONDS) {
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
    askAI(t, "The person is holding the pose (" + Math.floor(held) + " of " + HOLD_SECONDS + " seconds, score " + score + "). " +
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
  held = HOLD_SECONDS;
  updateTimer("Done!");
  showStep("Well done!", "You held " + pose.sanskrit + " for " + HOLD_SECONDS + " seconds.");
  sayFresh(wellDoneName() + " " + heldFor(pose, HOLD_SECONDS) + " " + SAY.relax);
}

// The end of a flow (Surya Namaskar)
function finishFlow(before) {
  stage = "done";
  showStep("Well done!", "You finished " + roundsDone(pose) + ".");
  speak(before + SAY.wellDone + " " + finishedFlow(pose) + " " + SAY.restNow);
}


// ----- The timer on the screen -----
function showTimer(visible) {
  timerCard.hidden = !visible;
}

function updateTimer(note) {
  timerNumber.textContent = Math.min(HOLD_SECONDS, Math.floor(held));
  timerFill.style.width = (held / HOLD_SECONDS * 100) + "%";
  timerNote.textContent = note;
}
