// =============================================================
// phrases.js — every fixed sentence the voice coach says.
// They are all in one place, so they are easy to find and change.
//
// The natural AI voice has a ready-made recording of each sentence
// (in the "voice" folder), so it plays at once and needs no internet.
// If you change or add a sentence here or in poses.js, make the
// recordings again (see voice/README.txt). Until then, the new
// sentence is made live by Gemini, or said with the computer's voice.
// =============================================================

export const SAY = {
  // Getting ready
  stepBack:    "Step back now.",
  startAgain:  "Okay, let's start again.",
  begin:       "Let's begin.",

  // When the camera can't see the person properly
  nobody:      "I can't see you yet. Stand in front of the camera, about 2 to 3 metres away.",
  tooClose:    "You're too close to the camera. Step back until I can see you from head to feet.",
  feetOut:     "Step back a little, so your feet are in the picture.",
  handsOut:    "Step back a little, so your hands are in the picture.",
  headOut:     "Step back a little, so your head is in the picture.",
  allOut:      "Step back a bit more, so I can see all of you.",
  moveLeft:    "Move a little to your left.",
  moveRight:   "Move a little to your right.",
  cantSeeArms: "I can't see your arms clearly.",
  cantSeeLegs: "I can't see your legs clearly.",
  faceCamera:  "Please face the camera.",
  sideOn:      "Please turn sideways to the camera.",

  // The steps
  good:        "Good!",
  comfortable: "That's okay, only go as far as is comfortable.",

  // Holding the pose, and the end
  hold:        "Now hold the pose and breathe slowly.",
  wellDone:    "Well done!",
  relax:       "Now slowly come out of the pose and relax.",

  // A flow (Surya Namaskar)
  otherSide:   "Now the other side, leading with your left leg.",
  restNow:     "Now stand still and breathe normally for a moment."
};

// Sentences with a number or a name in them
export function startIn(seconds) {
  return "We start in " + seconds + " seconds.";
}

export function countFor(seconds) {
  return "I will count " + seconds + " seconds.";
}

export function heldFor(pose, seconds) {
  return "You held " + pose.sanskrit + " for " + seconds + " seconds.";
}

// Flows (Surya Namaskar): "Round 2.", "1 round of Surya Namaskar"…
export function roundNumber(round) {
  return "Round " + round + ".";
}

export function roundsDone(pose) {
  return pose.rounds + (pose.rounds === 1 ? " round" : " rounds") + " of " + pose.sanskrit;
}

export function finishedFlow(pose) {
  return "You finished " + roundsDone(pose) + ".";
}


// ----- Helpers shared by the voice and the recording maker -----

// Split a text into sentences, e.g. "Good! Stand tall." → ["Good!", "Stand tall."]
// Each sentence is spoken (and recorded) on its own, so it can be reused.
export function sentences(text) {
  const parts = String(text).match(/[^.!?]+[.!?]*/g) || [];
  return parts.map(function (part) { return part.trim(); }).filter(function (part) { return part !== ""; });
}

// A simple name for a sentence, used for its recording's file name,
// e.g. "Raise your left arm higher" → "raise-your-left-arm-higher".
// Capitals and punctuation don't matter.
export function sentenceKey(sentence) {
  return sentence.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// The words to send to the voice, with small fixes so they sound right:
// a full stop at the end (so it sounds finished), and "II" read as "two"
export function forSpeaking(sentence) {
  let words = sentence.replace(/\bII\b/g, "two");
  if (!/[.!?]$/.test(words)) {
    words += ".";
  }
  return words;
}

// Every fixed sentence for these poses (to make the recordings)
export function allSentences(poses, holdSeconds, readySeconds) {
  const texts = Object.values(SAY);
  texts.push(startIn(readySeconds), countFor(holdSeconds));
  for (const pose of poses) {
    // A single pose has steps, a hold and checks. A flow (Surya Namaskar)
    // has positions, each with its own checks, said once for each leg.
    let checks = pose.checks || [];
    if (pose.positions) {
      texts.push(finishedFlow(pose));
      for (let round = 2; round <= pose.rounds; round++) {
        texts.push(roundNumber(round));
      }
      for (const position of pose.positions) {
        for (const leg of ["right", "left"]) {
          const other = leg === "right" ? "left" : "right";
          texts.push(position.say.split("{leg}").join(leg).split("{other leg}").join(other));
        }
        checks = checks.concat(position.checks);
      }
    } else {
      texts.push(heldFor(pose, holdSeconds));
      for (const step of pose.steps) {
        texts.push(step.text);
      }
    }
    for (const check of checks) {
      for (const tip of [check.tipLow, check.tipHigh]) {
        if (tip) {
          texts.push(tip.replace("{side}", "left"), tip.replace("{side}", "right"));
        }
      }
    }
  }
  // Split into sentences, without repeats
  const seen = new Set();
  const list = [];
  for (const text of texts) {
    for (const sentence of sentences(text)) {
      if (!seen.has(sentenceKey(sentence))) {
        seen.add(sentenceKey(sentence));
        list.push(sentence);
      }
    }
  }
  return list;
}
