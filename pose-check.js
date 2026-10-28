// =============================================================
// pose-check.js — the maths that checks a pose.
// It measures joint angles from MediaPipe's body points and
// compares them with the target angles in poses.js.
// =============================================================

// MediaPipe's landmark number for each body part (PRD section 7).
// "left" and "right" mean the user's OWN left and right.
const BODY_PARTS = {
  left:  { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 },
  right: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 }
};

// For each joint name used in poses.js: the 3 body parts that make
// its angle. The angle is measured at the MIDDLE one.
const ANGLE_POINTS = {
  knee:     ["hip", "knee", "ankle"],
  hip:      ["shoulder", "hip", "knee"],
  shoulder: ["hip", "shoulder", "elbow"],
  elbow:    ["shoulder", "elbow", "wrist"],
  legs:     ["hip", "knee", "ankle"],      // special: how steep the leg is, hip to ankle (see floorAngle)
  body:     ["shoulder", "hip", "knee"]    // special: how steep the body is, shoulder to hip
};

// MediaPipe says how sure it is that it can see each point (0 to 1).
// Points below this are ignored (PRD section 7, point 7).
const MIN_VISIBILITY = 0.5;


// ----- Can we trust this point? -----
// It must be clearly visible AND inside the camera picture.
// (When part of the body is out of the picture, MediaPipe still
// guesses where it is, and the guess can be wrong.)
// minVisibility is optional: a check in poses.js can ask for a lower
// value, e.g. when a foot is hidden behind the other leg.
export function canSee(point, minVisibility) {
  const needed = minVisibility || MIN_VISIBILITY;
  return point.visibility >= needed && !outsidePicture(point);
}

// Is this point outside the camera picture? (x and y go from 0 to 1 inside it)
export function outsidePicture(point) {
  return point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1;
}


// ----- The angle at point B, made by points A, B and C -----
// Uses the vector formula from PRD section 7:
//   angle = arccos( (BA · BC) / (|BA| × |BC|) )
export function angleAt(a, b, c) {
  // Vector from B to A, and vector from B to C
  const baX = a.x - b.x;
  const baY = a.y - b.y;
  const bcX = c.x - b.x;
  const bcY = c.y - b.y;

  // Dot product: BA · BC
  const dot = baX * bcX + baY * bcY;

  // Length of each vector (Pythagoras): |BA| and |BC|
  const lengthBA = Math.sqrt(baX * baX + baY * baY);
  const lengthBC = Math.sqrt(bcX * bcX + bcY * bcY);

  // Two points on top of each other: no angle (and no dividing by zero)
  if (lengthBA === 0 || lengthBC === 0) {
    return null;
  }

  // cos(angle). Keep it between -1 and 1 in case of tiny rounding errors.
  let cosine = dot / (lengthBA * lengthBC);
  cosine = Math.max(-1, Math.min(1, cosine));

  // Math.acos gives the angle in radians; × 180 / π changes it to degrees
  return Math.acos(cosine) * 180 / Math.PI;
}


// ----- Does this look like a real, whole body? -----
// When you are close to the camera (for example sitting at the laptop),
// MediaPipe sometimes squeezes a pretend whole body into the part of you
// it can see, with tiny "legs" on your chest. A real body is much bigger
// than its head: from the nose down to the ankles is about 10 to 15
// head-widths (ear to ear). We measured 11.7–15.5 for real full bodies,
// and about 1–2 for squeezed pretend ones. So below 6 is not real.
const BODY_HEADS_NEEDED = 6;

export function bodyLooksReal(points, width, height) {
  const headWidth = pixelDistance(points[7], points[8], width, height);   // ear to ear
  const ankles = { x: (points[27].x + points[28].x) / 2, y: (points[27].y + points[28].y) / 2 };
  const bodyLength = pixelDistance(points[0], ankles, width, height);      // nose to ankles
  return bodyLength >= BODY_HEADS_NEEDED * headWidth;
}

function pixelDistance(a, b, width, height) {
  return Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
}


// ----- How steep is the line from A to B? -----
// 0° = flat like the floor (lying down), 90° = straight up and down (standing).
// Used for Cobra: the angles between body parts are the same lying down
// and standing up, so we also check that the legs are flat on the floor.
// Surya Namaskar also checks how steep the body is (shoulder to hip), e.g.
// flat in the plank, sloping in Downward Dog, upright when standing.
export function floorAngle(a, b) {
  const across = Math.abs(b.x - a.x);
  const down = Math.abs(b.y - a.y);
  if (across === 0 && down === 0) {
    return null;
  }
  // Math.atan2 gives the angle of the line in radians; × 180 / π → degrees
  return Math.atan2(down, across) * 180 / Math.PI;
}


// ----- Measure every joint in a list of checks (from poses.js) -----
// checks: the pose's checks (or, in Surya Namaskar, the checks of the
// position we are on now).
// imageWidth and imageHeight are the camera picture's size in pixels.
// Gives back two lists:
//   joints:  one entry per measured joint, like
//            { check: (the check from poses.js), side: "left", angle: 172, off: 8,
//              point: (the joint), numbers: [23, 25, 27] (MediaPipe numbers of the 3 points) }
//   missing: body points we could NOT see clearly, like
//            { name: "left ankle", point: (the MediaPipe point) }
export function measureJoints(checks, points, imageWidth, imageHeight) {
  const joints = [];
  const missing = [];

  // Work out which leg is bent and which side faces the camera (see below)
  const sides = {
    bent: chooseBentLeg(points, imageWidth, imageHeight),
    camera: chooseCameraSide(points)
  };

  for (const check of checks) {
    for (const side of sidesToCheck(check, sides)) {
      // e.g. ["hip", "knee", "ankle"] → MediaPipe points 23, 25, 27
      const names = ANGLE_POINTS[check.joint];
      const numbers = [BODY_PARTS[side][names[0]], BODY_PARTS[side][names[1]], BODY_PARTS[side][names[2]]];
      const a = points[numbers[0]];
      const b = points[numbers[1]];
      const c = points[numbers[2]];

      // Can't clearly see all 3 points: note which body points are the
      // problem (each one only once) and move on to the next joint
      const three = [a, b, c];
      let allSeen = true;
      for (let i = 0; i < 3; i++) {
        if (!canSee(three[i], check.minVisibility)) {
          allSeen = false;
          const name = side + " " + names[i];   // e.g. "left ankle"
          if (!missing.some(function (m) { return m.name === name; })) {
            missing.push({ name: name, point: three[i] });
          }
        }
      }
      if (!allSeen) {
        continue;
      }

      let angle;
      if (check.joint === "legs") {
        // How steep the leg is, from the hip to the ankle
        angle = floorAngle(toPixels(a, imageWidth, imageHeight), toPixels(c, imageWidth, imageHeight));
      } else if (check.joint === "body") {
        // How steep the body is, from the shoulder to the hip
        angle = floorAngle(toPixels(a, imageWidth, imageHeight), toPixels(b, imageWidth, imageHeight));
      } else {
        // The angle at the middle point
        angle = angleAt(
          toPixels(a, imageWidth, imageHeight),
          toPixels(b, imageWidth, imageHeight),
          toPixels(c, imageWidth, imageHeight)
        );
      }
      if (angle === null) {
        continue;
      }

      joints.push({
        check: check,                         // name, target, tolerance, tip
        side: side,                           // "left" or "right"
        angle: angle,                         // the measured angle, in degrees
        off: Math.abs(angle - check.target),  // how many degrees away from the target
        point: b,                             // where the joint is (for drawing labels)
        numbers: numbers                      // for colouring the skeleton
      });
    }
  }

  return { joints: joints, missing: missing };
}

// Which side(s) of the body a check looks at (the "side" in poses.js)
function sidesToCheck(check, sides) {
  if (check.side === "both") {
    return ["left", "right"];
  }
  if (check.side === "camera") {
    return [sides.camera];
  }
  if (check.side === "bent") {
    return [sides.bent];
  }
  if (check.side === "straight") {
    return [otherSide(sides.bent)];
  }
  return [];
}

function otherSide(side) {
  return side === "left" ? "right" : "left";
}


// ----- Which leg is bent? (PRD section 7, point 8) -----
// In Tree and Warrior II you can use either leg. The "bent" leg is the
// one with the smaller knee angle; the other one is the "straight" leg.
// We remember the answer and only swap when the other knee is clearly
// (10° or more) more bent, so it doesn't flicker when both knees are
// almost the same (for example while standing up straight).
const SWAP_MARGIN = 10;
let bentLeg = null;   // "left" or "right"

function chooseBentLeg(points, width, height) {
  const left = kneeAngle(points, "left", width, height);
  const right = kneeAngle(points, "right", width, height);

  // Can't see both legs: keep the old answer (the missing points are
  // reported by measureJoints, so the user will be asked to step back)
  if (left === null || right === null) {
    return bentLeg || "left";
  }

  if (bentLeg === null) {
    bentLeg = left < right ? "left" : "right";
  } else if (bentLeg === "left" && right < left - SWAP_MARGIN) {
    bentLeg = "right";
  } else if (bentLeg === "right" && left < right - SWAP_MARGIN) {
    bentLeg = "left";
  }
  return bentLeg;
}

// The knee angle (hip–knee–ankle) of one leg, or null if we can't see it.
// In Tree pose the lifted foot is often hidden against the other leg, so
// MediaPipe is less sure about it. To choose WHICH leg is bent, a lower
// visibility (0.2) is good enough.
const LEG_CHOICE_VISIBILITY = 0.2;

function kneeAngle(points, side, width, height) {
  const hip = points[BODY_PARTS[side].hip];
  const knee = points[BODY_PARTS[side].knee];
  const ankle = points[BODY_PARTS[side].ankle];
  if (!canSee(hip, LEG_CHOICE_VISIBILITY) || !canSee(knee, LEG_CHOICE_VISIBILITY) ||
      !canSee(ankle, LEG_CHOICE_VISIBILITY)) {
    return null;
  }
  return angleAt(toPixels(hip, width, height), toPixels(knee, width, height), toPixels(ankle, width, height));
}


// ----- Which side faces the camera? (for side-view poses) -----
// MediaPipe gives every point a "z" (depth): a smaller z means closer to
// the camera. We add up z for the shoulder, hip and knee on each side;
// the side with the smaller total is the one facing the camera.
function chooseCameraSide(points) {
  const left = points[11].z + points[23].z + points[25].z;
  const right = points[12].z + points[24].z + points[26].z;
  return left < right ? "left" : "right";
}

// MediaPipe gives x and y as fractions (0 to 1) of the picture's width and
// height. The picture is wider than it is tall, so we change them to pixels
// first, otherwise the angles would come out squashed.
function toPixels(point, width, height) {
  return { x: point.x * width, y: point.y * height };
}


// ----- Smoothing (PRD section 7, point 6) -----
// The camera's measurements jump around a little from frame to frame.
// So instead of the newest angle, we use the AVERAGE of the last few
// angles for each joint. The score, tips and colours all come from these
// smoothed angles, so none of them flicker.
const SMOOTH_FRAMES = 10;
const angleHistory = {};   // e.g. angleHistory["Knees left"] = [172, 174, 171, ...]

export function smoothJoints(joints) {
  for (const joint of joints) {
    const key = joint.check.name + " " + joint.side;
    if (!angleHistory[key]) {
      angleHistory[key] = [];
    }
    const history = angleHistory[key];

    history.push(joint.angle);              // remember the newest angle
    if (history.length > SMOOTH_FRAMES) {
      history.shift();                      // forget the oldest one
    }

    // Use the average instead of the newest angle
    let total = 0;
    for (const angle of history) {
      total += angle;
    }
    joint.angle = total / history.length;
    joint.off = Math.abs(joint.angle - joint.check.target);

    // Remember it, in case it is hidden for a moment (see below)
    lastSeen[key] = { joint: joint, time: performance.now() / 1000 };
  }
}

// ----- Joints hidden for a moment -----
// A joint is often hidden for a moment, e.g. hands in front of the body
// ("interlock your fingers"), or a foot behind the other leg. That does
// NOT mean the person has gone. For a short time we keep using its last
// angle, so the score and the tip don't jump around.
const REMEMBER_TIME = 1.5;   // seconds
const lastSeen = {};         // e.g. lastSeen["Arms left"] = { joint, time }

export function addHiddenJoints(joints) {
  const t = performance.now() / 1000;
  for (const key in lastSeen) {
    const old = lastSeen[key].joint;
    // Is this joint (or, for a one-side check, the same check) measured now?
    const measured = joints.some(function (joint) {
      return joint.check === old.check && (joint.side === old.side || old.check.side !== "both");
    });
    if (!measured && t - lastSeen[key].time <= REMEMBER_TIME) {
      joints.push(Object.assign({}, old, { remembered: true }));
    }
  }
}

// Forget all old angles, the current tip and which leg was bent
// (used when the body goes out of view, so we start fresh when it comes back)
export function startFresh() {
  for (const key in angleHistory) {
    delete angleHistory[key];
  }
  for (const key in lastSeen) {
    delete lastSeen[key];
  }
  tipKey = null;
  bentLeg = null;
}


// ----- Is this joint wrong? (PRD section 7, point 4) -----
// Wrong = more degrees off than its tolerance (15° if none is given)
export function isWrong(joint) {
  const tolerance = joint.check.tolerance || 15;
  return joint.off > tolerance;
}

// The wrong joint that is furthest from its target, or null if all are OK
export function worstJoint(joints) {
  let worst = null;
  for (const joint of joints) {
    if (isWrong(joint) && (worst === null || joint.off > worst.off)) {
      worst = joint;
    }
  }
  return worst;
}

// ----- Which joint should the tip be about? -----
// Like a real teacher: one correction at a time. We pick the worst joint,
// then KEEP talking about it until it is fixed. Without this, the tip
// jumped between joints that were almost equally wrong
// ("Lower your left arm", "Lower your right arm", "Lower your left arm"…).
let tipKey = null;   // which joint the tip is about now, e.g. "Arms left"

export function jointToFix(joints) {
  // Is the joint we are already talking about still wrong? Keep it.
  for (const joint of joints) {
    if (joint.check.name + " " + joint.side === tipKey && isWrong(joint)) {
      return joint;
    }
  }
  // Otherwise pick the worst joint now (null if everything is right)
  const worst = worstJoint(joints);
  if (worst) {
    tipKey = worst.check.name + " " + worst.side;
  } else {
    tipKey = null;
  }
  return worst;
}

// The tip for a wrong joint: tipLow if the angle is too small,
// tipHigh if it is too big. {side} becomes "left" or "right".
export function tipFor(joint) {
  let tip;
  if (joint.angle < joint.check.target) {
    tip = joint.check.tipLow;
  } else {
    tip = joint.check.tipHigh;
  }
  // If that tip was left empty in poses.js, use the other one
  if (!tip) {
    tip = joint.check.tipLow || joint.check.tipHigh;
  }
  return tip.replace("{side}", joint.side);
}


// ----- Score = 100 minus the average degrees off (PRD section 7, point 5) -----
// It is a WEIGHTED average: a check with weight 3 (in poses.js) counts three
// times, because it is the main part of the pose (like the raised arms in
// Tadasana). Checks without a weight count once.
// Never below 0. Gives null if no joints could be measured.
// (practice.js only asks for a score when ALL joints were measured, so a
// half-visible body can't get a good score just from the parts we can see.)
export function calculateScore(joints) {
  if (joints.length === 0) {
    return null;
  }

  let totalOff = 0;
  let totalWeight = 0;
  for (const joint of joints) {
    const weight = joint.check.weight || 1;
    totalOff += joint.off * weight;
    totalWeight += weight;
  }
  const averageOff = totalOff / totalWeight;

  return Math.max(0, Math.round(100 - averageOff));
}
