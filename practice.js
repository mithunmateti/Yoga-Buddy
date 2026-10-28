// =============================================================
// practice.js — the Practice screen.
// When Start is pressed: turns on the camera, draws the body
// skeleton that MediaPipe finds (green = right, red = needs fixing),
// shows the live score and a tip, and runs the voice coach.
//
// PRIVACY: MediaPipe runs inside the browser, on this device, and
// nothing is saved. While you hold the pose, the AI buddy (buddy.js)
// sends a small camera photo to Google Gemini every few seconds.
// =============================================================

// Load MediaPipe's Pose Landmarker from the jsDelivr CDN
import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs";

// Our own pose-checking maths (pose-check.js)
import {
  measureJoints, calculateScore, canSee, outsidePicture, bodyLooksReal,
  smoothJoints, addHiddenJoints, startFresh, isWrong, jointToFix, tipFor
} from "./pose-check.js";

// The voice coach (coach.js), its voice (voice.js) and its sentences (phrases.js)
import { startCoach, restartCoach, stopCoach, updateCoach, checksNow } from "./coach.js";
import { unlockSound, chooseVoice } from "./voice.js";
import { SAY } from "./phrases.js";

// Where MediaPipe's helper files and the trained pose model are.
// "lite" is the fastest model (good for phones). For more accuracy,
// change both "lite" words in MODEL_URL to "full".
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// Lines to draw between body points, using MediaPipe's landmark numbers
// (PRD section 7): 11/12 shoulders, 13/14 elbows, 15/16 wrists,
// 23/24 hips, 25/26 knees, 27/28 ankles. Odd = left, even = right.
const BONES = [
  [11, 12],                       // shoulder to shoulder
  [11, 13], [13, 15],             // left arm
  [12, 14], [14, 16],             // right arm
  [11, 23], [12, 24], [23, 24],   // body
  [23, 25], [25, 27],             // left leg
  [24, 26], [26, 28]              // right leg
];

// The joints to draw a dot on
const JOINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

// Parts of the page we use
const video = document.getElementById("camera");
const canvas = document.getElementById("skeleton");
const pen = canvas.getContext("2d");   // the "pen" we draw on the canvas with
const statusText = document.getElementById("status");
const scoreText = document.getElementById("score");
const scoreCard = document.getElementById("score-card");
const tipText = document.getElementById("tip");
const debugList = document.getElementById("debug-angles");
const startPanel = document.getElementById("start-panel");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

// A problem with the picture must last this long (seconds) before we
// believe it: the body tracker sometimes loses a point for a moment
const PROBLEM_GRACE = 0.8;

// We need to measure at least this share of the pose (counting weights)
// to give a fair score
const ENOUGH_MEASURED = 2 / 3;

let poseLandmarker;      // MediaPipe's body finder (set up in step 3)
let lastVideoTime = -1;  // so we don't check the same video picture twice
let lastChecks = null;   // the checks we measured last time (see checkPose)


// ----- 1. Which pose is this? (read from the web address, like guide.js) -----
const params = new URLSearchParams(window.location.search);
const pose = POSES.find(function (p) {
  return p.id === params.get("pose");
});

if (pose) {
  document.title = pose.sanskrit + " – Yoga Buddy";
  document.getElementById("pose-name").textContent = pose.sanskrit;
  // "Back" goes back to this pose's guide
  document.getElementById("back-button").href = "guide.html?pose=" + pose.id;
}

// Scoring and the voice coach work for every pose in poses.js
const scoringOn = !!pose;


// ----- 2. Turn on the camera -----
async function startCamera() {
  // Ask the browser for the front ("user") camera. The browser asks
  // the user for permission the first time.
  // A phone or iPad held upright gets a tall picture, so the person
  // fills the camera box; a laptop gets a wide one.
  const upright = window.innerHeight > window.innerWidth;
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: upright ? 720 : 1280 },
      height: { ideal: upright ? 1280 : 720 }
    },
    audio: false
  });
  video.srcObject = stream;   // show the camera in the <video> element
  await video.play();         // wait until the video is playing
}


// ----- 3. Load MediaPipe's pose model -----
async function loadPoseModel() {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  const options = {
    runningMode: "VIDEO",             // we give it video pictures one after another
    numPoses: 1,                      // only look for one person
    // How sure MediaPipe must be before it says "there is a person" (normally 0.5).
    // Higher = fewer mistakes like seeing a person in a chair.
    minPoseDetectionConfidence: 0.7,
    minPosePresenceConfidence: 0.7,
    minTrackingConfidence: 0.7
  };
  try {
    // First try the graphics chip (GPU), which is faster
    options.baseOptions = { modelAssetPath: MODEL_URL, delegate: "GPU" };
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
  } catch (error) {
    // Some devices can't use the GPU for this, so use the normal processor (CPU)
    options.baseOptions = { modelAssetPath: MODEL_URL, delegate: "CPU" };
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
  }
}


// ----- 4. The main loop: runs again and again, many times a second -----
function loop() {
  // Only check the video if it has moved on to a new picture
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;

    // Ask MediaPipe to find the body in the current video picture
    const result = poseLandmarker.detectForVideo(video, performance.now());

    // result.landmarks is a list of people found. We asked for one,
    // so take the first. It is empty if nobody is in view.
    const points = result.landmarks[0];

    // Check the pose (measure the angles, work out the score and the tip),
    // show it, then tell the voice coach what we found
    let check = { inView: false, joints: [], score: null, tipJoint: null, problem: null, hidden: "" };
    if (scoringOn) {
      check = steady(checkPose(points));
      showCheck(check);
      updateCoach(check);
    }

    // Draw the skeleton, coloured green/red by the joint checks
    drawSkeleton(points, check.joints);
    drawAngleLabels(check.joints);
  }

  // Ask the browser to run loop() again before the next screen refresh
  requestAnimationFrame(loop);
}


// ----- 5. Draw the skeleton on the canvas -----

// Skeleton colours: green = joint is right, red = joint needs fixing,
// white = not checked in this pose
const GREEN = "#2ECC71";
const RED = "#FF4D4D";
const WHITE = "white";

function drawSkeleton(points, joints) {
  // Make the canvas the same size as the camera picture
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  // Wipe off the last drawing
  pen.clearRect(0, 0, canvas.width, canvas.height);

  // Nobody found in this picture: nothing to draw
  if (!points) {
    return;
  }

  // Work out the colour of each bone and joint dot
  const colours = skeletonColours(joints);

  // Draw the lines (bones)
  pen.lineWidth = 8;
  pen.lineCap = "round";
  for (const bone of BONES) {
    const start = points[bone[0]];
    const end = points[bone[1]];
    // Skip a line if we can't see either end clearly
    if (!canSee(start) || !canSee(end)) {
      continue;
    }
    pen.strokeStyle = colours.bones[boneKey(bone[0], bone[1])] || WHITE;
    pen.beginPath();
    pen.moveTo(toX(start), toY(start));
    pen.lineTo(toX(end), toY(end));
    pen.stroke();
  }

  // Draw a dot on each joint
  for (const number of JOINTS) {
    const point = points[number];
    if (!canSee(point)) {
      continue;
    }
    pen.fillStyle = colours.dots[number] || WHITE;
    pen.beginPath();
    pen.arc(toX(point), toY(point), 10, 0, 2 * Math.PI);   // a circle with radius 10
    pen.fill();
  }
}

// Works out the colour of every bone and joint dot from the joint checks.
// A bone can belong to two joints: shoulder–hip is part of the arm angle
// AND the hip angle. It is only red if ALL its joints are wrong, so when
// just the arms are wrong, only the arms go red (not the body as well).
function skeletonColours(joints) {
  const bones = {};   // e.g. bones["23-25"] = RED
  const dots = {};    // e.g. dots[25] = GREEN
  for (const joint of joints) {
    if (joint.remembered) {
      continue;   // hidden right now: nothing to colour
    }
    const colour = isWrong(joint) ? RED : GREEN;
    const n = joint.numbers;   // the joint's 3 points, e.g. [23, 25, 27] for the left knee
    for (const key of [boneKey(n[0], n[1]), boneKey(n[1], n[2])]) {
      if (bones[key] !== GREEN) {
        bones[key] = colour;   // green wins: one correct joint keeps the bone green
      }
    }
    dots[n[1]] = colour;       // the dot on the joint itself (the middle point)
  }
  return { bones: bones, dots: dots };
}

// The same name for a bone whichever end comes first, e.g. "23-25"
function boneKey(a, b) {
  return Math.min(a, b) + "-" + Math.max(a, b);
}

// MediaPipe gives x and y as fractions (0 to 1) of the picture's size.
// These change them into pixel positions on the canvas.
// x is flipped (1 - x) because the video is shown mirrored, like a selfie.
function toX(point) {
  return (1 - point.x) * canvas.width;
}

function toY(point) {
  return point.y * canvas.height;
}


// ----- 6. Check the pose -----
// Gives back what we found:
//   inView:   is the person in the picture? (Only a body part OUTSIDE the
//             picture means no. A hand or foot hidden behind the body is fine.)
//   joints:   the measured joints (smoothed), plus any hidden for a moment
//   score:    the score (or null if we can't measure enough of the pose)
//   tipJoint: the joint the tip is about (or null if everything is right)
//   problem:  what's wrong with the picture, as a name from SAY in phrases.js
//             (e.g. "feetOut", "moveLeft", "cantSeeArms"), or null
//   hidden:   (debug) which body points are hidden right now

function checkPose(points) {
  // Nobody found in the picture
  if (!points) {
    return notInView("nobody", "Nobody found");
  }

  // A squeezed pretend body (e.g. when you sit close to the camera) is not you
  if (!bodyLooksReal(points, video.videoWidth, video.videoHeight)) {
    return notInView("tooClose", "The body looks squeezed (too small for the head): too close?");
  }

  // Which checks to measure: the pose's, or in Surya Namaskar the ones of
  // the position the coach is on. When they change (a new position),
  // forget the old angles, so they don't mix with the new ones.
  const checks = checksNow();
  if (checks !== lastChecks) {
    lastChecks = checks;
    startFresh();
  }
  const measured = measureJoints(checks, points, video.videoWidth, video.videoHeight);

  // Part of the body is outside the picture: the person needs to move
  const move = whereToMove(points, measured.missing);
  if (move) {
    return notInView(move, "Outside the picture: " + measured.missing.map(describeMissing).join(", "));
  }

  // The person is in the picture
  smoothJoints(measured.joints);      // use the average of the last 10 frames
  addHiddenJoints(measured.joints);   // keep joints hidden for a moment
  const joints = measured.joints;
  const hidden = measured.missing.map(describeMissing).join(", ");

  // Too much of the pose is hidden to give a fair score
  if (measuredShare(joints, checks) < ENOUGH_MEASURED) {
    return { inView: true, joints: joints, score: null, tipJoint: null,
             problem: hiddenPart(measured.missing), hidden: hidden };
  }

  return { inView: true, joints: joints, score: calculateScore(joints),
           tipJoint: jointToFix(joints), problem: null, hidden: hidden };
}

function notInView(problem, hidden) {
  return { inView: false, joints: [], score: null, tipJoint: null, problem: problem, hidden: hidden };
}

// Which way should the person move so that all of them is in the picture?
// Gives a name from SAY ("feetOut", "moveLeft"…), or null if no need to move.
function whereToMove(points, missing) {
  let top = false;
  let bottom = false;
  let left = false;
  let right = false;
  for (const part of missing) {
    const p = part.point;
    if (outsidePicture(p)) {
      top = top || p.y < 0;
      bottom = bottom || p.y > 1;
      left = left || p.x < 0;
      right = right || p.x > 1;
    }
  }
  // The head (nose) above the picture
  const headOut = points[0].y < 0;
  top = top || headOut;
  // Both feet very unclear at the bottom of the picture: probably cut off
  const ankleL = points[27];
  const ankleR = points[28];
  if (ankleL.visibility < 0.3 && ankleR.visibility < 0.3 && Math.max(ankleL.y, ankleR.y) > 0.9) {
    bottom = true;
  }

  if ((top && bottom) || (left && right)) {
    return "allOut";
  }
  if (bottom) {
    return "feetOut";
  }
  if (top) {
    return headOut ? "headOut" : "handsOut";
  }
  // The camera picture is NOT mirrored: its left edge is on the person's
  // RIGHT side. Cut off on the left of the picture → move to your left.
  if (left) {
    return "moveLeft";
  }
  if (right) {
    return "moveRight";
  }
  return null;
}

// How much of the pose we measured (0 to 1), counting each check's weight
function measuredShare(joints, checks) {
  let wanted = 0;
  for (const check of checks) {
    wanted += (check.weight || 1) * (check.side === "both" ? 2 : 1);
  }
  let got = 0;
  for (const joint of joints) {
    got += joint.check.weight || 1;
  }
  return got / wanted;
}

// Are mostly arms or legs hidden? ("cantSeeArms" or "cantSeeLegs")
function hiddenPart(missing) {
  let arms = 0;
  let legs = 0;
  for (const part of missing) {
    if (/shoulder|elbow|wrist/.test(part.name)) {
      arms++;
    } else {
      legs++;
    }
  }
  return arms >= legs ? "cantSeeArms" : "cantSeeLegs";
}

// A problem with the picture must last a moment before we believe it.
// Until then, keep using the last good result.
let lastGood = null;       // the last result with the person in the picture
let lastGoodTime = 0;
let gone = false;          // has the person been out of the picture for a while?

function steady(check) {
  const t = performance.now() / 1000;
  if (check.inView) {
    lastGood = check;
    lastGoodTime = t;
    gone = false;
    return check;
  }
  if (lastGood && t - lastGoodTime < PROBLEM_GRACE) {
    return lastGood;   // only a moment: ignore it
  }
  if (!gone) {
    gone = true;
    lastGood = null;
    startFresh();      // forget old angles and tips, start fresh when the person is back
  }
  return check;
}

// Show the score, the big tip and the debug list
function showCheck(check) {
  if (check.score === null) {
    tipText.textContent = SAY[check.problem] || "Step back so your whole body is in view.";
    tipText.classList.remove("good");
    showScore(null);
  } else {
    showScore(check.score);
    showTip(check.tipJoint);
  }
  showAngles(check.joints, check.hidden);
}

// A photo from the camera for the AI buddy (a JPEG, 640 pixels wide:
// big enough to see hands, small enough to send quickly)
const PHOTO_WIDTH = 640;
const photoCanvas = document.createElement("canvas");
function takePhoto() {
  photoCanvas.width = PHOTO_WIDTH;
  photoCanvas.height = Math.round(PHOTO_WIDTH * video.videoHeight / video.videoWidth);
  photoCanvas.getContext("2d").drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
  // toDataURL gives "data:image/jpeg;base64,AAAA…"; Gemini wants only the part after the comma
  return photoCanvas.toDataURL("image/jpeg", 0.7).split(",")[1];
}

// Big tip: the tip for the joint to fix, or praise if every joint is right
function showTip(joint) {
  if (joint) {
    tipText.textContent = tipFor(joint);
    tipText.classList.remove("good");
  } else {
    tipText.textContent = "Great! Hold it there.";
    tipText.classList.add("good");
  }
}

// DEBUG: say why a body point can't be used, e.g.
// "left ankle (outside the picture)" or "left ankle (only 31% sure)"
function describeMissing(part) {
  const p = part.point;
  if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) {
    return part.name + " (outside the picture)";
  }
  return part.name + " (only " + Math.round(p.visibility * 100) + "% sure)";
}

// Big score number. "–" means there is no score right now.
// The card's colour shows how good it is: green 80+, amber 50–79, orange below 50.
function showScore(score) {
  if (score === null) {
    scoreText.textContent = "–";
    scoreCard.dataset.band = "";
  } else {
    scoreText.textContent = score;
    scoreCard.dataset.band = score >= 80 ? "great" : score >= 50 ? "ok" : "low";
  }
}

// DEBUG list, e.g. "✓ Knees (left): 172° → target 180°" (✗ = wrong),
// then which body points are hidden right now
function showAngles(joints, hidden) {
  let html = "";
  for (const joint of joints) {
    const mark = isWrong(joint) ? "✗ " : "✓ ";
    html += "<li>" + mark + joint.check.name + " (" + joint.side + "): " +
            Math.round(joint.angle) + "° → target " + joint.check.target + "°" +
            (joint.remembered ? " (hidden for a moment)" : "") + "</li>";
  }
  if (hidden) {
    html += "<li>Hidden: " + hidden + "</li>";
  }
  debugList.innerHTML = html;
}

// DEBUG: write each angle next to its joint on the canvas
function drawAngleLabels(joints) {
  pen.font = "bold 30px 'Plus Jakarta Sans', Arial, sans-serif";
  pen.lineWidth = 6;
  pen.strokeStyle = "rgba(0, 0, 0, 0.7)";   // dark outline so the text is easy to read
  pen.fillStyle = "yellow";
  for (const joint of joints) {
    if (joint.remembered) {
      continue;   // hidden right now: we don't know where it is
    }
    const text = Math.round(joint.angle) + "°";
    const x = toX(joint.point) + 14;
    const y = toY(joint.point) - 14;
    pen.strokeText(text, x, y);
    pen.fillText(text, x, y);
  }
}


// ----- 7. Start everything, one step at a time -----
async function start() {
  let stage = "camera";
  try {
    statusText.textContent = "Starting camera…";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("no camera here");
    }
    await startCamera();

    stage = "tracker";
    statusText.textContent = "Loading body tracker…";
    await loadPoseModel();

    statusText.textContent = "";   // an empty message is hidden
    loop();
  } catch (error) {
    console.error(error);
    stopCoach();   // no countdown or talking over the problem
    showProblem(friendlyMessage(stage, error));
  }
}

// A simple message for what went wrong, and what to do about it
function friendlyMessage(stage, error) {
  if (stage === "tracker") {
    return "The body tracker couldn't load. Check the internet connection, then try again.";
  }
  if (!navigator.mediaDevices) {
    return "This browser can't use the camera here. Open the Yoga Buddy link in Chrome or Safari.";
  }
  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "The camera is blocked. Allow the camera for this website " +
           "(look for the camera icon next to the web address), then try again.";
  }
  if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
    return "No camera was found. Check a camera is plugged in or switched on, then try again.";
  }
  if (error.name === "NotReadableError" || error.name === "AbortError") {
    return "Another app is using the camera. Close it (for example Zoom or FaceTime), then try again.";
  }
  return "Something went wrong starting the camera. Please try again.";
}

// Show the message in the camera box, with a Try again button
function showProblem(message) {
  statusText.textContent = "";
  const words = document.createElement("span");
  words.textContent = message;
  const again = document.createElement("button");
  again.className = "button";
  again.textContent = "Try again";
  again.addEventListener("click", function () { location.reload(); });
  statusText.append(words, again);
  statusText.classList.add("camera-problem");
  restartButton.hidden = true;   // only Try again helps now
}

// The angles box is only for checking the maths: add ?debug to the
// web address to see it (e.g. practice.html?pose=tadasana&debug)
if (new URLSearchParams(location.search).has("debug")) {
  document.body.classList.add("show-debug");
}

// There is no voice list on the screen any more, so always use the
// nicest voice on this computer (and forget a voice chosen before)
chooseVoice("");

// The Start button: hide the start screen and start the voice coach
// straight away (talking inside the click is what lets the browser use
// the voice). Its 5-second countdown runs while the camera starts.
startButton.addEventListener("click", function () {
  startPanel.hidden = true;
  restartButton.hidden = false;
  unlockSound();
  if (scoringOn) {
    startCoach(pose, takePhoto);
  }
  start();
});

// The Restart button: forget the old angles and start the steps again
restartButton.addEventListener("click", function () {
  startFresh();
  unlockSound();
  if (scoringOn) {
    restartCoach();
  }
});
