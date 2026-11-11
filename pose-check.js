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
  legs:     ["hip", "knee", "ankle"],      // special: how steep the leg is, hip to ankle (see steepness)
  body:     ["shoulder", "hip", "knee"]    // special: how steep the body is, shoulder to hip
};
// (legsApart, armsLine and twist use both sides of the body: see WHOLE_BODY)

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
// checks: the pose's checks (or, in a flow, the checks of the position
// we are on now).
// points: MediaPipe's body points in the PICTURE (x and y from 0 to 1).
// imageWidth and imageHeight are the camera picture's size in pixels.
// world: (optional) MediaPipe's "world" points: the same body points in
//   3D, in metres, measured from the middle of the hips. They are what let
//   Yoga Buddy measure a pose from the FRONT, the SIDE or anywhere in
//   between (see "Front, side or in between" below).
// Gives back two lists:
//   joints:  one entry per measured joint, like
//            { check: (the check from poses.js), side: "left", angle: 172, off: 8,
//              point: (the joint), numbers: [23, 25, 27] (MediaPipe numbers of the 3 points) }
//   missing: body points we could NOT see clearly, like
//            { name: "left ankle", point: (the MediaPipe point) }
export function measureJoints(checks, points, imageWidth, imageHeight, world) {
  const joints = [];
  const missing = [];
  const view = { points: points, world: world || null, width: imageWidth, height: imageHeight };

  // Which way the person faces, which leg is bent and which side is
  // nearest the camera (see below)
  updateFacing(view);
  const sides = {
    bent: chooseBentLeg(view),
    camera: chooseCameraSide(view)
  };

  for (const check of checks) {
    for (const side of sidesToCheck(check, sides)) {
      const numbers = pointsFor(check.joint, side);
      if (!numbers) {
        continue;   // a joint name poses.js doesn't know
      }

      // Can't clearly see all the points: note which body points are the
      // problem (each one only once) and move on to the next joint.
      // (A whole-body joint measures other points than its 3 label points.)
      let allSeen = true;
      for (const number of WHOLE_BODY_NEEDS[check.joint] || numbers) {
        if (!canSee(points[number], check.minVisibility)) {
          allSeen = false;
          const name = PART_NAMES[number];   // e.g. "left ankle"
          if (!missing.some(function (m) { return m.name === name; })) {
            missing.push({ name: name, point: points[number] });
          }
        }
      }
      if (!allSeen) {
        continue;
      }

      const angle = measureAngle(check.joint, numbers, view);
      if (angle === null) {
        continue;
      }

      joints.push({
        check: check,                         // name, target, tolerance, tip
        side: side,                           // "left", "right" or "body"
        angle: angle,                         // the measured angle, in degrees
        off: Math.abs(angle - check.target),  // how many degrees away from the target
        point: points[numbers[1]],            // where the joint is (for drawing labels)
        numbers: numbers                      // for colouring the skeleton
      });
    }
  }

  return { joints: joints, missing: missing };
}

// The names of the body points, for "I can't see your left ankle"
const PART_NAMES = {};
for (const side of ["left", "right"]) {
  for (const part in BODY_PARTS[side]) {
    PART_NAMES[BODY_PARTS[side][part]] = side + " " + part;
  }
}

// The MediaPipe numbers of the points a joint needs. The angle is at the
// MIDDLE one (for the drawing), e.g. "knee" on the left → [23, 25, 27].
function pointsFor(joint, side) {
  if (WHOLE_BODY[joint]) {
    return WHOLE_BODY[joint];
  }
  const names = ANGLE_POINTS[joint];
  if (!names || !BODY_PARTS[side]) {
    return null;
  }
  return names.map(function (name) { return BODY_PARTS[side][name]; });
}

// Measure one joint, in degrees (or null if it can't be measured)
function measureAngle(joint, n, view) {
  if (joint === "legs") {
    return steepness(n[0], n[2], view);                // hip to ankle
  }
  if (joint === "body") {
    return steepness(n[0], n[1], view);                // shoulder to hip
  }
  if (joint === "legsApart") {
    // left hip → left ankle and right hip → right ankle
    return betweenLines([BODY_PARTS.left.hip, BODY_PARTS.left.ankle],
                        [BODY_PARTS.right.hip, BODY_PARTS.right.ankle], view);
  }
  if (joint === "armsLine") {
    // left shoulder → left wrist and right shoulder → right wrist
    return betweenLines([BODY_PARTS.left.shoulder, BODY_PARTS.left.wrist],
                        [BODY_PARTS.right.shoulder, BODY_PARTS.right.wrist], view);
  }
  if (joint === "twist") {
    return twistAngle(view);
  }
  return jointAngle(n[0], n[1], n[2], view);
}


// =============================================================
// FRONT, SIDE OR IN BETWEEN
// =============================================================
// A flat camera picture squashes any part of the body that points TOWARDS
// the camera. Seen from the front, a knee bent forward at 90° can look
// almost straight in the picture. So the old maths only worked when you
// stood the way the pose said (front or side).
//
// MediaPipe also guesses where every point is in 3D (the "world" points,
// in metres). Its depth guess is a bit wobbly, but it doesn't squash
// anything. So for every joint we look at how much its two bones point
// towards the camera:
//   • bones flat across the picture  → trust the picture angle (exact)
//   • bones pointing at the camera   → trust the 3D angle (not squashed)
//   • in between                     → a mix of the two
// That way the angles come out (nearly) the same whether you face the
// camera, turn sideways, or stand at a slant.
const FLAT_UNTIL = 0.2;   // depth share of a bone (0 = flat across, 1 = straight at the camera)
const DEEP_FROM = 0.55;

function jointAngle(i, j, k, view) {
  const p = view.points;
  const flat = angleAt(toPixels(p[i], view.width, view.height),
                       toPixels(p[j], view.width, view.height),
                       toPixels(p[k], view.width, view.height));
  const w = view.world;
  if (!w || flat === null) {
    return flat;
  }
  const deep = angleAt3D(w[i], w[j], w[k]);
  if (deep === null) {
    return flat;
  }
  const depth = Math.max(depthShare(w[j], w[i]), depthShare(w[j], w[k]));
  const trust3D = Math.min(1, Math.max(0, (depth - FLAT_UNTIL) / (DEEP_FROM - FLAT_UNTIL)));
  return flat * (1 - trust3D) + deep * trust3D;
}

// How much the bone from a to b points towards the camera (0 to 1)
function depthShare(a, b) {
  const length = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  return length === 0 ? 0 : Math.abs(b.z - a.z) / length;
}

// The angle at B in 3D, the same formula as angleAt with a z added
export function angleAt3D(a, b, c) {
  const ba = [a.x - b.x, a.y - b.y, a.z - b.z];
  const bc = [c.x - b.x, c.y - b.y, c.z - b.z];
  const dot = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2];
  const lengths = Math.hypot(ba[0], ba[1], ba[2]) * Math.hypot(bc[0], bc[1], bc[2]);
  if (lengths === 0) {
    return null;
  }
  return Math.acos(Math.max(-1, Math.min(1, dot / lengths))) * 180 / Math.PI;
}

// How steep the line from point i to point j is: 0° = flat like the floor,
// 90° = straight up and down. In 3D "flat" is any direction across the
// floor, towards the camera too, so lying down looks flat from every side.
function steepness(i, j, view) {
  if (view.world) {
    const a = view.world[i];
    const b = view.world[j];
    const across = Math.hypot(b.x - a.x, b.z - a.z);
    const down = Math.abs(b.y - a.y);
    if (across === 0 && down === 0) {
      return null;
    }
    return Math.atan2(down, across) * 180 / Math.PI;
  }
  return floorAngle(toPixels(view.points[i], view.width, view.height),
                    toPixels(view.points[j], view.width, view.height));
}

// The angle between two lines (each from its first point to its second):
// 0° = they point the same way, 180° = opposite ways.
// "legsApart": standing with feet together ≈ 0–10°, wide legs ≈ 40–90°.
// "armsLine":  arms stretched out in one straight line (like a T) = 180°.
function betweenLines(lineA, lineB, view) {
  const pick = view.world ? function (n) { return view.world[n]; }
                          : function (n) { return withZero(toPixels(view.points[n], view.width, view.height)); };
  const a0 = pick(lineA[0]);
  const a1 = pick(lineA[1]);
  const b0 = pick(lineB[0]);
  const b1 = pick(lineB[1]);
  // Move line B so it starts where line A starts, then measure the angle there
  const end = { x: a0.x + (b1.x - b0.x), y: a0.y + (b1.y - b0.y), z: a0.z + (b1.z - b0.z) };
  return angleAt3D(a1, a0, end);
}

function withZero(point) {
  return { x: point.x, y: point.y, z: 0 };
}

// "twist": how far the shoulders are turned compared with the hips, seen
// from above (0° = no twist). Only the 3D points can see this, so without
// them it isn't measured.
function twistAngle(view) {
  const w = view.world;
  if (!w) {
    return null;
  }
  const shoulders = Math.atan2(w[12].z - w[11].z, w[12].x - w[11].x);
  const hips = Math.atan2(w[24].z - w[23].z, w[24].x - w[23].x);
  let turn = Math.abs(shoulders - hips) * 180 / Math.PI;
  if (turn > 180) {
    turn = 360 - turn;
  }
  // A twist past 90° isn't possible: it means MediaPipe mixed up left and right
  return Math.min(turn, 180 - turn);
}

// Joints that use points on BOTH sides of the body, measured once
// (side: "body" in poses.js). The middle number is where the label goes.
const WHOLE_BODY = {
  legsApart: [25, 23, 26],   // left knee, left hip, right knee
  armsLine:  [13, 11, 14],   // left elbow, left shoulder, right elbow
  twist:     [11, 23, 12]    // left shoulder, left hip, right shoulder
};
// …and the points they really measure, which must all be seen clearly
const WHOLE_BODY_NEEDS = {
  legsApart: [23, 24, 27, 28],   // both hips and both ankles
  armsLine:  [11, 12, 15, 16],   // both shoulders and both wrists
  twist:     [11, 12, 23, 24]    // both shoulders and both hips
};

// Which side(s) of the body a check looks at (the "side" in poses.js)
function sidesToCheck(check, sides) {
  if (WHOLE_BODY[check.joint] || check.side === "body") {
    return ["body"];
  }
  if (check.side === "both") {
    return ["left", "right"];
  }
  if (check.side === "camera") {
    return [sides.camera];
  }
  if (check.side === "far") {
    return [otherSide(sides.camera)];
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

function chooseBentLeg(view) {
  const left = kneeAngle(view, "left");
  const right = kneeAngle(view, "right");

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

function kneeAngle(view, side) {
  const parts = BODY_PARTS[side];
  for (const number of [parts.hip, parts.knee, parts.ankle]) {
    if (!canSee(view.points[number], LEG_CHOICE_VISIBILITY)) {
      return null;
    }
  }
  return jointAngle(parts.hip, parts.knee, parts.ankle, view);
}


// ----- Which way is the person facing? -----
// From above, the line from shoulder to shoulder (and hip to hip) runs
// straight across the picture when you face the camera, and points at the
// camera when you stand sideways. The angle of that line tells us:
//   under 35°  → "front" (facing the camera, or with your back to it)
//   over 55°   → "side"
//   in between → "slant"
// It is averaged over the last few pictures so it doesn't flicker.
const FACING_FRAMES = 15;
const turnHistory = [];
let facingNow = "front";

function updateFacing(view) {
  const turn = bodyTurn(view);
  if (turn === null) {
    return;
  }
  turnHistory.push(turn);
  if (turnHistory.length > FACING_FRAMES) {
    turnHistory.shift();
  }
  const average = turnHistory.reduce(function (a, b) { return a + b; }, 0) / turnHistory.length;
  facingNow = average < 35 ? "front" : average > 55 ? "side" : "slant";
}

// How far the body is turned away from facing the camera, 0° to 90°
function bodyTurn(view) {
  const w = view.world;
  const p = view.points;
  if (w) {
    const turns = [[11, 12], [23, 24]].map(function (pair) {
      const a = w[pair[0]];
      const b = w[pair[1]];
      return Math.atan2(Math.abs(b.z - a.z), Math.abs(b.x - a.x)) * 180 / Math.PI;
    });
    return (turns[0] + turns[1]) / 2;
  }
  // Without 3D points: compare how wide the shoulders look with how long
  // the body is. Facing the camera they are about 0.7 body-lengths wide;
  // sideways they almost disappear (about 0.1).
  if (!canSee(p[11]) || !canSee(p[12]) || !canSee(p[23]) || !canSee(p[24])) {
    return null;
  }
  const width = pixelDistance(p[11], p[12], view.width, view.height);
  const mid = function (a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  const length = pixelDistance(mid(p[11], p[12]), mid(p[23], p[24]), view.width, view.height);
  if (length === 0) {
    return null;
  }
  const share = Math.min(1, width / length / 0.7);
  return Math.acos(share) * 180 / Math.PI;
}

// "front", "side" or "slant" (practice.js shows it, coach.js uses it)
export function facing() {
  return facingNow;
}


// ----- Which side is nearest the camera? (for side-view poses) -----
// MediaPipe gives every point a "z" (depth): a smaller z means closer to
// the camera. We add up z for the shoulder, hip and knee on each side;
// the side with the smaller total is the one facing the camera.
// When you face the camera both sides are equally close, so we take the
// side MediaPipe can see more clearly instead. Like the bent leg, we only
// swap sides when the other side is clearly closer, so it doesn't flicker.
let cameraSide = null;

function chooseCameraSide(view) {
  const p = view.points;
  const z = view.world || p;
  const depth = {
    left: z[11].z + z[23].z + z[25].z,
    right: z[12].z + z[24].z + z[26].z
  };
  const clear = {
    left: p[11].visibility + p[23].visibility + p[25].visibility + p[27].visibility,
    right: p[12].visibility + p[24].visibility + p[26].visibility + p[28].visibility
  };
  let nearer;
  let margin;
  if (facingNow === "front") {
    nearer = clear.left >= clear.right ? "left" : "right";
    margin = Math.abs(clear.left - clear.right) > 0.2;
  } else {
    nearer = depth.left < depth.right ? "left" : "right";
    // world points are in metres (5 cm is clear); picture z is much smaller
    margin = Math.abs(depth.left - depth.right) > (view.world ? 0.05 : 0.02);
  }
  if (cameraSide === null || margin) {
    cameraSide = nearer;
  }
  return cameraSide;
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
  cameraSide = null;
  turnHistory.length = 0;
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
