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
  smoothJoints, addHiddenJoints, startFresh, isWrong, jointToFix, tipFor, facing
} from "./pose-check.js?v=20261122e";

// The voice coach (coach.js), its voice (voice.js) and its sentences (phrases.js)
import { startCoach, restartCoach, stopCoach, updateCoach, checksNow, handTarget, coachStage } from "./coach.js?v=20261122e";
import { canRecord, whyNoRecording, isRecording, hasVideoComing, startRecording, stopRecording, whenFileReady, hasUnsavedClip, saveClip, savedWhere } from "./recorder.js?v=20261122e";
import { unlockSound, chooseVoice, wakeVoice } from "./voice.js?v=20261122e";
import { SAY } from "./phrases.js?v=20261122e";
import { canCastPage, startCasting, stopCasting, isCasting, onCastChange, sendToTv } from "./cast.js?v=20261122e";

// Where MediaPipe's helper files and the trained pose models are.
// "lite" is the fastest model: phones use it, so they don't get hot and
// the battery lasts. "full" is slower but more accurate, especially its
// 3D guesses (the "world" points that let us measure a pose from the front
// AND the side), so laptops and desktops use it.
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_LITE = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const MODEL_FULL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";
// A touch screen (phone or tablet) gets the lite model
const onPhone = window.matchMedia("(pointer: coarse)").matches;
// iPhones and iPads. Every browser on them (Safari, Chrome, …) is really
// Safari inside (WebKit). (New iPads say they are a Mac, but have a touch screen.)
const onApple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
if (onApple) {
  document.documentElement.classList.add("apple");   // style.css: lighter effects on iPhones
}
// For testing: practice.html?pose=tadasana&delegate=cpu (or gpu)
const forcedDelegate = (new URLSearchParams(location.search).get("delegate") || "").toUpperCase();

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
// How far back you must stand depends on how WIDE the camera sees (its
// field of view, FOV). To fit something of size S in a view of angle A:
//
//     distance = S ÷ (2 × tan(A ÷ 2))
//
// So the wider the picture, the closer you can stand. Phone selfie
// cameras are 4:3: the sensor is 4 wide and 3 tall (on its side).
// We used to ask for a 16:9 picture, which the phone makes by CUTTING the
// 4:3 picture: held upright, a quarter of the width was thrown away. Then
// the screen (taller than the picture) cut off even more of the sides.
// Now we ask for the camera's own whole 4:3 picture, zoomed all the way
// out, and show all of it.
//
// Example, a selfie camera that sees 66° × 51° (4:3), held upright:
//   arms spread 1.6 m (+20% room = 1.9 m) across the picture:
//     old: 16:9 cut (40°) and the screen's cut (33°) → 3.2 m away
//     new: whole 4:3 width (51°)                      → 2.0 m away
//   head to feet 1.6 m (+20% room) up the picture (66°) → 1.5 m away
const CAMERA_LONG_SIDE = 1280;
const CAMERA_LONG_SIDE_APPLE = 640;

let cameraUpright = null;   // which way the phone was held when the camera started

let cameraTurn = 0;          // counts camera (re)starts: only the newest one counts
let cameraSwitching = false; // true while the camera is (re)starting: don't track then

async function startCamera() {
  const myTurn = ++cameraTurn;
  cameraSwitching = true;
  try {
    await openCamera(myTurn);
  } finally {
    if (myTurn === cameraTurn) {
      cameraSwitching = false;
    }
  }
}

async function openCamera(myTurn) {
  // Ask the browser for the front ("user") camera. The browser asks
  // the user for permission the first time.
  // A phone or iPad held upright gets a tall picture (3:4), a laptop or a
  // phone on its side gets a wide one (4:3).
  const upright = window.innerHeight > window.innerWidth;
  // iPhones get a smaller picture (640 × 480): it still shows the camera's
  // whole 4:3 view (so you stand just as close), but it is 4 times less
  // work for the body tracker each picture, which iPhones need.
  const longSide = onApple ? CAMERA_LONG_SIDE_APPLE : CAMERA_LONG_SIDE;
  const shortSide = Math.round(longSide * 3 / 4);
  const wanted = {
    facingMode: "user",
    aspectRatio: { ideal: upright ? 3 / 4 : 4 / 3 },
    width: { ideal: upright ? shortSide : longSide },
    height: { ideal: upright ? longSide : shortSide }
  };
  if (!onApple) {
    wanted.resizeMode = { ideal: "none" };   // the camera's own picture, not a cut-out of it
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: wanted, audio: false });
  } catch (error) {
    if (error.name !== "OverconstrainedError" && error.name !== "TypeError") {
      throw error;   // e.g. permission refused: show that message
    }
    // A browser that doesn't like one of the wishes: just the front camera
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
  }

  // A newer restart started while we waited: this camera isn't needed
  if (myTurn !== cameraTurn) {
    stopStream(stream);
    return;
  }

  // Stop the old camera picture (when restarting after turning the phone)
  stopStream(video.srcObject);

  const track = stream.getVideoTracks()[0];
  await zoomAllTheWayOut(track);
  watchTrack(track);
  cameraUpright = upright;
  video.srcObject = stream;   // show the camera in the <video> element
  await video.play();         // wait until the video is playing
  lastVideoTime = -1;
  lastNewPicture = performance.now();
}

function stopStream(stream) {
  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }
}

// iPhones sometimes pause or cut off the camera (a phone call, Siri,
// Control Center, switching app). Notice it and get the camera back.
function watchTrack(track) {
  if (!track) {
    return;
  }
  track.addEventListener("ended", function () {
    if (video.srcObject && video.srcObject.getVideoTracks()[0] === track) {
      console.warn("Camera stopped by the phone: starting it again");
      restartCamera();
    }
  });
  track.addEventListener("unmute", function () {
    video.play().catch(function () {});
  });
}

// Start the camera again (at most once every 3 seconds)
let lastRestart = -1e9;
function restartCamera() {
  const t = performance.now();
  if (cameraSwitching || t - lastRestart < 3000) {
    return;
  }
  lastRestart = t;
  startCamera().catch(function (error) {
    console.error(error);
  });
}

// The camera watchdog, called by the main loop. If the video hasn't moved
// on to a new picture for a while: first just press "play" again, and if
// that doesn't help, start the camera again.
let lastNewPicture = 0;
function checkCameraIsMoving() {
  if (cameraSwitching || document.hidden) {
    lastNewPicture = performance.now();
    return;
  }
  const still = performance.now() - lastNewPicture;
  if (still > 1500 && video.paused) {
    video.play().catch(function () {});
  }
  const track = video.srcObject ? video.srcObject.getVideoTracks()[0] : null;
  if (still > 4000 || (track && track.readyState === "ended")) {
    console.warn("Camera picture stuck for " + Math.round(still) + " ms: starting it again");
    restartCamera();
  }
}

// Coming back to the page: the phone paused the video, so play it again
document.addEventListener("visibilitychange", function () {
  if (!document.hidden && video.srcObject) {
    lastNewPicture = performance.now();
    video.play().catch(function () {});
  }
});

// Some phones start the selfie camera a little zoomed in. If the browser
// lets us (Chrome on Android, Safari 17+ on iPhone), zoom right out: a
// smaller zoom number = a wider view = you can stand closer.
async function zoomAllTheWayOut(track) {
  try {
    const can = track && track.getCapabilities ? track.getCapabilities() : {};
    const now = track.getSettings ? track.getSettings().zoom : undefined;
    if (can.zoom && typeof can.zoom.min === "number" && (now === undefined || now > can.zoom.min)) {
      await track.applyConstraints({ advanced: [{ zoom: can.zoom.min }] });
    }
  } catch (error) {
    // Not allowed on this browser: keep the normal view
  }
}

// Turning the phone (upright ↔ on its side): ask for a picture the new
// way round, so the camera's whole view is used again
let turnTimer = null;
window.addEventListener("resize", function () {
  if (cameraUpright === null) {
    return;   // the camera isn't on yet
  }
  clearTimeout(turnTimer);
  turnTimer = setTimeout(function () {
    const upright = window.innerHeight > window.innerWidth;
    if (upright !== cameraUpright) {
      startCamera().catch(function (error) {
        console.error(error);
      });
    }
  }, 400);
});


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
  // Try the best choice first: the graphics chip (GPU) is faster than the
  // normal processor (CPU), and some devices can't use it for this. If the
  // full model can't load (e.g. a slow connection), the lite one still works.
  // iPhones are the other way round: there, the GPU way makes the phone
  // wait for the graphics chip after every picture, which can freeze the
  // whole page a second after starting. The CPU way is smooth on iPhones.
  let tries = onApple
    ? [[MODEL_LITE, "CPU"], [MODEL_LITE, "GPU"]]
    : onPhone
      ? [[MODEL_LITE, "GPU"], [MODEL_LITE, "CPU"]]
      : [[MODEL_FULL, "GPU"], [MODEL_FULL, "CPU"], [MODEL_LITE, "GPU"], [MODEL_LITE, "CPU"]];
  if (forcedDelegate === "CPU" || forcedDelegate === "GPU") {
    tries = tries.filter(function (choice) { return choice[1] === forcedDelegate; });
  }
  visionFiles = vision;
  modelOptions = options;
  let lastError = null;
  for (const choice of tries) {
    try {
      options.baseOptions = { modelAssetPath: choice[0], delegate: choice[1] };
      // Give up on a choice that hangs (it happened on iPhones) and try the next
      poseLandmarker = await withTimeLimit(PoseLandmarker.createFromOptions(vision, options), 20000);
      trackerChoice = choice;
      console.log("Body tracker: " + (choice[0] === MODEL_FULL ? "full" : "lite") + " model, " + choice[1]);
      return;
    } catch (error) {
      lastError = error;
      console.warn("Body tracker " + choice[1] + " didn't load:", error);
    }
  }
  throw lastError;
}

let visionFiles = null;     // MediaPipe's helper files (to start the tracker again)
let modelOptions = null;
let trackerChoice = null;   // [model, "GPU" or "CPU"] that is running now
let trackerSwitching = false;

function withTimeLimit(promise, ms) {
  return new Promise(function (resolve, reject) {
    const timer = setTimeout(function () { reject(new Error("took too long")); }, ms);
    promise.then(
      function (value) { clearTimeout(timer); resolve(value); },
      function (error) { clearTimeout(timer); reject(error); }
    );
  });
}

// Something is wrong with the tracker (it keeps failing, or the GPU way is
// too slow): start it again the CPU way, which works everywhere
async function switchTrackerToCPU(reason) {
  if (trackerSwitching || !visionFiles) {
    return;
  }
  trackerSwitching = true;
  console.warn("Body tracker: switching to CPU (" + reason + ")");
  try {
    const old = poseLandmarker;
    const options = Object.assign({}, modelOptions, {
      baseOptions: { modelAssetPath: trackerChoice ? trackerChoice[0] : MODEL_LITE, delegate: "CPU" }
    });
    const fresh = await withTimeLimit(PoseLandmarker.createFromOptions(visionFiles, options), 20000);
    poseLandmarker = fresh;
    trackerChoice = [options.baseOptions.modelAssetPath, "CPU"];
    lastStamp = 0;
    try { old.close(); } catch (error) { /* already broken */ }
  } catch (error) {
    console.error("Body tracker: CPU didn't load either", error);
  }
  loopErrors = 0;
  trackerSwitching = false;
}


// ----- Practice time for the weekly streak (progress.js) -----
// Counts only while the camera can see you, and is saved every few seconds.
let practiceSeconds = 0;     // counted but not saved yet
let lastFrameAt = null;

function countPracticeTime(inView) {
  const now = performance.now() / 1000;
  if (inView && lastFrameAt !== null) {
    practiceSeconds += Math.min(1, now - lastFrameAt);   // at most 1 s, e.g. after the tab was hidden
  }
  lastFrameAt = now;
  if (practiceSeconds >= 5) {
    savePracticeTime();
  }
}

function savePracticeTime() {
  if (practiceSeconds > 0) {
    addPracticeTime(Math.round(practiceSeconds));
    practiceSeconds = 0;
  }
}

// Save what's left when leaving the page (Back, closing the tab, switching app)
window.addEventListener("pagehide", savePracticeTime);
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    savePracticeTime();
  }
});


// ----- 4. The main loop: runs again and again, many times a second -----
let loopErrors = 0;     // problems in a row (a few in a row: start the tracker again)
let lastStamp = 0;      // MediaPipe needs each picture's time to be later than the last
let slowFrames = 0;     // GPU pictures that took too long (iPhones)
let timedFrames = 0;

function loop() {
  // Book the next turn FIRST, so one problem can never stop the loop for good
  requestAnimationFrame(loop);

  checkCameraIsMoving();

  // Only check the video if it is playing and has moved on to a new picture
  const ready = !cameraSwitching && !trackerSwitching && video.readyState >= 2 &&
                video.videoWidth > 0 && !video.paused;
  if (ready && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    lastNewPicture = performance.now();
    try {
      lookAtPicture();
      loopErrors = 0;
    } catch (error) {
      loopErrors++;
      console.error("Body tracker problem (" + loopErrors + " in a row):", error);
      if (loopErrors >= 3) {
        switchTrackerToCPU("it kept failing");
      }
    }
  }
}

function lookAtPicture() {
  {
    // Ask MediaPipe to find the body in the current video picture
    const stamp = Math.max(performance.now(), lastStamp + 1);
    lastStamp = stamp;
    const result = poseLandmarker.detectForVideo(video, stamp);
    timeTheTracker(performance.now() - stamp);

    // result.landmarks is a list of people found. We asked for one,
    // so take the first. It is empty if nobody is in view.
    const points = result.landmarks[0];
    // The same body points in 3D, in metres (for measuring from any side)
    const world = result.worldLandmarks ? result.worldLandmarks[0] : null;

    // Check the pose (measure the angles, work out the score and the tip),
    // show it, then tell the voice coach what we found
    let check = { inView: false, joints: [], score: null, tipJoint: null, problem: null, hidden: "" };
    if (scoringOn) {
      check = steady(checkPose(points, world));
      check.facing = facing();               // "front", "side" or "slant" (coach.js)
      addHandsAndShoulders(check, points);   // for the hand check (coach.js)
      showCheck(check);
      updateCoach(check);
    }
    countPracticeTime(!!points);

    // Draw the skeleton, coloured green/red by the joint checks
    drawSkeleton(points, check.joints);
    drawAngleLabels(check.joints);
    drawHandTarget(handTarget());
    tellTheTv();
    recordThePractice();
  }
}

// On an iPhone, if the GPU way is in use and finding the body takes too long
// (over 70 ms a picture, most of the time), switch to the CPU way
function timeTheTracker(ms) {
  if (!onApple || !trackerChoice || trackerChoice[1] !== "GPU" || forcedDelegate === "GPU") {
    return;
  }
  timedFrames++;
  if (ms > 70) {
    slowFrames++;
  }
  if (timedFrames >= 20) {
    if (slowFrames > 10) {
      switchTrackerToCPU("too slow: " + slowFrames + " of 20 pictures over 70 ms");
    }
    timedFrames = 0;
    slowFrames = 0;
  }
}


// ----- Start recording (recorder.js) -----
// "🔴 Start recording" on the Start screen (or ⏺ in the top bar) starts the
// practice AND the video straight away. The video stops by itself a moment
// after the pose and its hold are done. Tapping Done then saves it to
// Photos (iPhone) / the Gallery (Android) / Downloads (laptop) and says so.
const startRecordButton = document.getElementById("start-record-button");
const recordButton = document.getElementById("record-button");
const clipSheet = document.getElementById("clip-sheet");
const clipTitle = document.getElementById("clip-title");
const clipText = document.getElementById("clip-text");
const clipSave = document.getElementById("clip-save");
const clipClose = document.getElementById("clip-close");
let recordingWanted = false;   // the person chose to record this practice
let recordingStarted = false;  // a recorder was started for it
let doneSince = null;          // when the coach said the pose was finished
let closeGoesHome = false;     // the message's other button goes to the home screen

// What goes into each picture of the video
function frameNow() {
  const timerCard = document.getElementById("timer-card");
  return {
    video: video,
    skeleton: canvas,
    words: {
      pose: pose ? pose.sanskrit : "",
      timer: timerCard && !timerCard.hidden ? timerCard.querySelector(".timer-number").textContent : "",
      score: scoreText.textContent !== "\u2013" ? scoreText.textContent : "",
      scoreColour: scoreCard.dataset.band === "great" ? "#7CF29A" : scoreCard.dataset.band === "ok" ? "#FFD166" : "#FF9F6B",
      tip: tipText.textContent,
      tipGood: tipText.classList.contains("good")
    }
  };
}

function beginRecording() {
  const ok = startRecording(frameNow, video.srcObject);
  if (ok && onApple) {
    setTimeout(wakeVoice, 600);   // starting a recorder can silence the voice on iPhones
  }
  showRecordButton();
  return ok;
}

// Called for every new camera picture (the main loop)
function recordThePractice() {
  if (!recordingWanted) {
    return;
  }
  if (!isRecording()) {
    // This browser can only record the plain camera: start once it is on
    if (!recordingStarted && video.srcObject) {
      recordingStarted = beginRecording();
    }
    return;
  }
  // The pose (and its hold) is done: stop a moment later, so the video is
  // ready by the time Done is tapped
  if (coachStage() === "done") {
    doneSince = doneSince || performance.now();
    if (performance.now() - doneSince > 1500) {
      stopRecording();
      showRecordButton();
    }
  } else {
    doneSince = null;
  }
}

function showRecordButton() {
  const on = isRecording();
  recordButton.classList.toggle("armed", on);
  recordButton.setAttribute("aria-pressed", on ? "true" : "false");
  recordButton.querySelector(".record-word").textContent = on ? "Stop" : "Record";
}

// The ⏺ button in the top bar
recordButton.addEventListener("click", function () {
  if (!canRecord()) {
    showMessage("\ud83c\udfa5 Recording", whyNoRecording(), "", "OK", false);
    return;
  }
  if (!document.body.classList.contains("live")) {
    startPractice(true);   // before Start: the same as "Start recording"
    return;
  }
  if (isRecording()) {
    stopRecording();       // kept until Done (or Restart) saves it
    recordingWanted = false;
    showRecordButton();
    return;
  }
  recordingWanted = true;
  if (hasUnsavedClip()) {
    // Save the last video first (this tap lets an iPhone open the share sheet)
    saveNow(false).then(function () { recordingStarted = beginRecording(); });
  } else {
    recordingStarted = beginRecording();
  }
});

// A message on the screen (the same card as the Save video card)
function showMessage(title, text, saveText, closeText, goesHome) {
  clipTitle.textContent = title;
  clipText.textContent = text;
  clipSave.hidden = !saveText;
  clipSave.textContent = saveText || "";
  clipSave.disabled = false;
  clipClose.hidden = !closeText;
  clipClose.textContent = closeText || "";
  closeGoesHome = goesHome;
  if (goesHome) {
    document.getElementById("result").hidden = true;   // only the message, not the score card behind it
  }
  clipSheet.hidden = false;
}

// Save the video now and say so. Must start inside a tap for iPhones.
async function saveNow(thenGoHome) {
  const result = await saveClip();
  const where = savedWhere();
  const saveWord = onApple ? "Save to Photos" : "Save video";
  const home = thenGoHome ? "Go to home" : "OK";
  if (result === "saved") {
    showMessage("\u2705 Saved", "The recording has been saved to your " + where + ".", "", home, thenGoHome);
    if (thenGoHome) {
      setTimeout(goHome, 3500);
    }
  } else if (result === "cancelled") {
    showMessage("\ud83c\udfa5 Not saved yet", "The recording wasn't saved. Tap " + saveWord + " to save it.",
                saveWord, thenGoHome ? "Don't save, go home" : "Close", thenGoHome);
  } else if (result === "needs-tap") {
    showMessage("\ud83c\udfa5 Your recording is ready", "Tap " + saveWord + " to put it in your " + where + ".",
                saveWord, thenGoHome ? "Don't save, go home" : "Close", thenGoHome);
  } else {
    showMessage("\ud83c\udfa5 Recording", "Sorry, the recording couldn't be saved on this phone.", "", home, thenGoHome);
  }
}

function goHome() {
  location.href = "index.html";
}

clipSave.addEventListener("click", function () {
  saveNow(closeGoesHome);
});

clipClose.addEventListener("click", function () {
  if (closeGoesHome) {
    goHome();
  } else {
    clipSheet.hidden = true;
  }
});

// "Done" on the result screen: save the video (if there is one), say so, go home
document.getElementById("result-done").addEventListener("click", async function (event) {
  if (!hasVideoComing() && !hasUnsavedClip()) {
    return;   // nothing recorded: go home as normal
  }
  event.preventDefault();
  if (!hasVideoComing()) {
    saveNow(true);   // straight away, inside the tap (iPhone share sheet)
    return;
  }
  // Done was tapped very quickly: finish the video first
  stopRecording();
  showRecordButton();
  showMessage("\ud83c\udfa5 Saving your recording\u2026", "Just a moment.", "", "", true);
  if (await whenFileReady()) {
    saveNow(true);
  } else {
    goHome();
  }
});

document.getElementById("rec-light").addEventListener("click", function () {
  stopRecording();
  recordingWanted = false;
  showRecordButton();
});
window.addEventListener("pagehide", stopRecording);
showRecordButton();


// ----- Showing it on a TV (cast.js) -----
// The skeleton lines and dots from drawSkeleton, as 0–1 positions
const tvFrame = { bones: [], dots: [] };
const castButton = document.getElementById("cast-button");
const castHelp = document.getElementById("cast-help");

function tellTheTv() {
  if (!isCasting()) {
    return;
  }
  const timerCard = document.getElementById("timer-card");
  const timer = timerCard && !timerCard.hidden
    ? document.getElementById("timer-seconds").textContent + " s held · " + document.getElementById("timer-note").textContent
    : "";
  sendToTv({
    pose: document.getElementById("pose-name").textContent,
    score: scoreText.textContent,
    tip: tipText.textContent,
    tipGood: tipText.classList.contains("good"),
    coach: document.getElementById("coach-text").textContent,
    timer: timer,
    aspect: video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 0.75,
    bones: tvFrame.bones,
    dots: tvFrame.dots
  });
}

// 📺: cast to a TV if this browser can (Chrome + Chromecast), otherwise
// show how to mirror the screen with the phone's own button
castButton.addEventListener("click", async function () {
  if (isCasting()) {
    stopCasting();
    return;
  }
  const started = canCastPage() && await startCasting();
  if (!started) {
    castHelp.hidden = false;
  }
});

document.getElementById("cast-help-close").addEventListener("click", function () {
  castHelp.hidden = true;
});

onCastChange(function (casting) {
  castButton.classList.toggle("casting", casting);
  castButton.setAttribute("aria-label", casting ? "Stop showing on the TV" : "Show on a TV");
  castButton.title = castButton.getAttribute("aria-label");
});


// The hand check (coach.js) needs where the hands and shoulders are.
// Hands = the wrists and index fingers (MediaPipe 15, 16, 19, 20) we can see clearly.
function addHandsAndShoulders(check, points) {
  check.hands = [];
  check.shoulders = null;
  check.aspect = video.videoWidth / video.videoHeight;   // to measure distances in real proportions
  if (!points) {
    return;
  }
  for (const number of [15, 16, 19, 20]) {
    if (canSee(points[number])) {
      check.hands.push(points[number]);
    }
  }
  if (canSee(points[11]) && canSee(points[12])) {
    check.shoulders = [points[11], points[12]];
  }
}

// The glowing circle for the hand check. It fills up with green while
// your hand is inside it. (x and y are MediaPipe fractions, like the body points.)
function drawHandTarget(target) {
  if (!target) {
    return;
  }
  const x = toX(target);
  const y = toY(target);
  const r = target.r * canvas.height;
  const pulse = 1 + 0.06 * Math.sin(performance.now() / 180);

  pen.save();
  // Soft glow
  pen.fillStyle = target.done ? "rgba(95, 211, 148, 0.35)" : "rgba(232, 131, 58, 0.22)";
  pen.beginPath();
  pen.arc(x, y, r * pulse, 0, 2 * Math.PI);
  pen.fill();
  // Ring
  pen.lineWidth = Math.max(6, r * 0.12);
  pen.strokeStyle = target.done ? "#5FD394" : "#F2A65A";
  pen.beginPath();
  pen.arc(x, y, r * pulse, 0, 2 * Math.PI);
  pen.stroke();
  // How long the hand has been inside: a green arc going round
  if (target.progress > 0 && !target.done) {
    pen.strokeStyle = "#5FD394";
    pen.lineWidth = Math.max(8, r * 0.16);
    pen.beginPath();
    pen.arc(x, y, r * pulse, -Math.PI / 2, -Math.PI / 2 + target.progress * 2 * Math.PI);
    pen.stroke();
  }
  // A hand in the middle, or a tick when it's done
  pen.font = Math.round(r * 0.9) + "px sans-serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillStyle = "white";
  pen.fillText(target.done ? "✓" : "✋", x, y);
  pen.restore();
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
  tvFrame.bones = [];
  tvFrame.dots = [];

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
    tvFrame.bones.push([1 - start.x, start.y, 1 - end.x, end.y, pen.strokeStyle]);
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
    tvFrame.dots.push([1 - point.x, point.y, pen.fillStyle]);
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

function checkPose(points, world) {
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
  const measured = measureJoints(checks, points, video.videoWidth, video.videoHeight, world);

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
  if (!video.videoWidth) {
    return null;   // the camera is (re)starting: no photo this time
  }
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
  html += "<li>Facing: " + facing() + "</li>";
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
    lastNewPicture = performance.now();   // the watchdog starts counting now
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

// Stop the phone's screen from going dark while you are holding a pose.
// (Safari 16.4 and newer. Anywhere else it simply does nothing.)
let wakeLock = null;
async function keepScreenOn() {
  try {
    if ("wakeLock" in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", function () { wakeLock = null; });
    }
  } catch (error) {
    // not allowed (e.g. low battery mode): the screen may dim, that's all
  }
}
document.addEventListener("visibilitychange", function () {
  if (!document.hidden && document.body.classList.contains("live")) {
    keepScreenOn();   // the browser lets go of it when you switch app
  }
});

// The Start button: hide the start screen and start the voice coach
// straight away (talking inside the click is what lets the browser use
// the voice). Its 5-second countdown runs while the camera starts.
// "🔴 Start recording" does the same, and starts the video in the same tap.
function startPractice(withRecording) {
  document.body.classList.add("live");   // a phone held upright fills the screen (style.css)
  keepScreenOn();
  startPanel.hidden = true;
  restartButton.hidden = false;
  unlockSound();
  if (withRecording) {
    if (canRecord()) {
      recordingWanted = true;
      recordingStarted = beginRecording();
    } else {
      showMessage("\ud83c\udfa5 Recording", whyNoRecording(), "", "OK", false);
    }
  }
  if (scoringOn) {
    startCoach(pose, takePhoto);
  }
  start();
}

startButton.addEventListener("click", function () {
  startPractice(false);
});
startRecordButton.addEventListener("click", function () {
  startPractice(true);
});

// The Restart button: forget the old angles and start the steps again
restartButton.addEventListener("click", function () {
  // Recording was on and the last video finished: save it now (this tap
  // lets an iPhone open the share sheet), then record the new try too.
  // (Still recording? Then it just keeps going.)
  if (recordingWanted && !isRecording()) {
    whenFileReady().then(function (unsaved) {
      return unsaved ? saveNow(false) : null;
    }).then(function () { recordingStarted = beginRecording(); });
  }
  doneSince = null;
  startFresh();
  unlockSound();
  if (scoringOn) {
    restartCoach();
  }
});
