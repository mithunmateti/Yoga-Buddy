// =============================================================
// recorder.js — "Record my practice".
//
// Makes a video of the practice: the camera picture (mirrored, like on
// the screen), the green/red skeleton, and the pose name, score, timer
// and tip on top. practice.js starts it when the person starts doing the
// pose (not during Start and the countdown) and stops it at the end.
//
// How it works: every new camera picture is drawn onto a hidden canvas,
// and the browser's MediaRecorder turns that canvas into a video file.
// It all happens on this device. Nothing is uploaded.
//
// Saving it:
//   • iPhone / iPad: websites aren't allowed to put files in Photos by
//     themselves, so a "Save to Photos" button opens the share sheet,
//     where "Save Video" puts it in Photos (one tap).
//   • Android: the video is downloaded straight away, so it appears in
//     the Gallery / Google Photos (Download folder). A button can save
//     or share it again.
//   • Laptop: it is downloaded to the Downloads folder.
// =============================================================

const CHOICE_NAME = "yogaBuddyRecord";   // remembers the "Record my practice" switch
const FRAMES_PER_SECOND = 30;
const LONGEST = 10 * 60 * 1000;          // stop by itself after 10 minutes (phone memory)

const onApple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const onAndroid = /Android/i.test(navigator.userAgent);

// The video types to try, best first. MP4 works in Photos and every
// gallery app; WebM is for older Chrome versions that can't make MP4.
const TYPES = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

const sheet = document.createElement("canvas");   // the hidden canvas the video is made from
const pen = sheet.getContext("2d");
let recorder = null;
let pieces = [];
let startedAt = 0;
let stopTimer = null;
let clockTimer = null;
let lastClip = null;      // { file, url } of the newest video
let onFinished = null;

// Can this browser record? (Safari 14.5+ on iPhone, Chrome on Android and laptops)
export function canRecord() {
  return typeof MediaRecorder !== "undefined";
}

// Can we make the video from our drawing (camera + skeleton + score)?
// If not, we record the plain camera picture instead.
function canDraw() {
  return typeof sheet.captureStream === "function";
}

// Why recording isn't possible here (shown to the person)
export function whyNoRecording() {
  if (onApple) {
    return "This iPhone's browser can't record videos yet. Update the iPhone (Settings → General → Software Update), then try again.";
  }
  return "This browser can't record videos. Try Chrome or Safari.";
}

function bestType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
    return "";
  }
  return TYPES.find(function (type) { return MediaRecorder.isTypeSupported(type); }) || "";
}

// The switch on the Start screen
export function recordingWanted() {
  try {
    return localStorage.getItem(CHOICE_NAME) === "on";
  } catch (error) {
    return false;
  }
}

export function setRecordingWanted(on) {
  try {
    localStorage.setItem(CHOICE_NAME, on ? "on" : "off");
  } catch (error) {
    // storage blocked: the switch works for this visit only
  }
}

export function isRecording() {
  return !!recorder && recorder.state === "recording";
}

// Started early and paused, waiting for the pose to begin (see prepareRecording)
let prepared = false;
let throwAway = false;   // stopped before it was ever un-paused: no video

export function isPrepared() {
  return prepared && !!recorder && recorder.state === "paused";
}

// Get the recorder going early (during the countdown), paused. On iPhones,
// starting a recorder changes the phone's sound settings for a moment,
// which can cut off the voice coach; doing it before the pose means the
// pose's instructions aren't cut off. resumeRecording() starts the video.
export function prepareRecording(width, height, finished, camera) {
  if (recorder) {
    return false;
  }
  return startRecording(width, height, finished, camera, true);
}

export function resumeRecording() {
  if (!isPrepared()) {
    return false;
  }
  recorder.resume();
  prepared = false;
  startedAt = performance.now();
  clearTimeout(stopTimer);
  stopTimer = setTimeout(stopRecording, LONGEST);
  showRecLight(true);
  return true;
}

// Start recording. width/height: the camera picture's size. camera: the
// camera's own stream, used if this browser can't record our drawing.
// finished(clip) is called when the video file is ready.
let drawing = true;   // recording our drawing (false: the plain camera)

export function startRecording(width, height, finished, camera, paused) {
  if (isPrepared() && !paused) {
    return resumeRecording();
  }
  if (recorder || !canRecord() || !width || !height) {
    return false;
  }
  sheet.width = width;
  sheet.height = height;
  pen.fillStyle = "#000";
  pen.fillRect(0, 0, width, height);

  const type = bestType();
  let stream = null;
  drawing = canDraw();
  if (drawing) {
    try {
      stream = sheet.captureStream(FRAMES_PER_SECOND);
    } catch (error) {
      drawing = false;
    }
  }
  if (!drawing) {
    if (!camera) {
      return false;
    }
    stream = camera;
  }
  try {
    recorder = type
      ? new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2500000 })
      : new MediaRecorder(stream);
  } catch (error) {
    try {
      recorder = new MediaRecorder(stream);   // this browser chooses
    } catch (error2) {
      console.warn("Recording isn't possible here", error2);
      recorder = null;
      return false;
    }
  }
  pieces = [];
  onFinished = finished;
  recorder.addEventListener("dataavailable", function (event) {
    if (event.data && event.data.size > 0) {
      pieces.push(event.data);
    }
  });
  recorder.addEventListener("stop", makeFile);
  recorder.start(1000);   // a piece every second, so a long video isn't one huge block
  throwAway = false;
  if (paused) {
    recorder.pause();
    prepared = true;
    return true;
  }
  prepared = false;
  startedAt = performance.now();
  stopTimer = setTimeout(stopRecording, LONGEST);
  showRecLight(true);
  return true;
}

export function stopRecording() {
  clearTimeout(stopTimer);
  if (recorder && recorder.state !== "inactive") {
    throwAway = prepared;   // never un-paused: nothing worth keeping
    prepared = false;
    recorder.stop();   // makeFile runs when the last piece has arrived
  }
  showRecLight(false);
}

// Put the newest camera picture, the skeleton and the words on the video.
// practice.js calls this for every new camera picture while recording.
export function addFrame(video, skeleton, words) {
  if (!isRecording() || !drawing) {
    return;
  }
  const w = sheet.width;
  const h = sheet.height;

  // The camera, mirrored like a mirror (the same as on the screen)
  pen.save();
  pen.translate(w, 0);
  pen.scale(-1, 1);
  pen.drawImage(video, 0, 0, w, h);
  pen.restore();

  // The skeleton is already drawn the mirrored way round
  pen.drawImage(skeleton, 0, 0, w, h);

  drawWords(words, w, h);
}

// The pose name and timer at the top, the score in the corner, the tip at the bottom
function drawWords(words, w, h) {
  const unit = Math.min(w, h) / 20;   // text size that fits any picture size
  pen.textBaseline = "top";
  pen.lineJoin = "round";

  function text(str, x, y, size, colour, align) {
    if (!str) {
      return;
    }
    pen.font = "bold " + Math.round(size) + "px 'Plus Jakarta Sans', Arial, sans-serif";
    pen.textAlign = align || "left";
    pen.lineWidth = size / 6;
    pen.strokeStyle = "rgba(0, 0, 0, 0.75)";
    pen.strokeText(str, x, y);
    pen.fillStyle = colour;
    pen.fillText(str, x, y);
  }

  const pad = unit * 0.8;
  text(words.pose, pad, pad, unit * 1.1, "#ffffff");
  if (words.timer) {
    text("⏱ " + words.timer, pad, pad + unit * 1.5, unit * 0.9, "#ffffff");
  }
  if (words.score) {
    text(words.score, w - pad, pad, unit * 2, words.scoreColour || "#ffffff", "right");
    text("score", w - pad, pad + unit * 2.2, unit * 0.7, "#ffffff", "right");
  }
  if (words.tip) {
    wrapText(words.tip, w / 2, h - pad - unit * 3.4, w - pad * 2, unit, words.tipGood ? "#7CF29A" : "#ffffff", text);
  }
  text("Yoga Buddy", w - pad, h - pad - unit * 0.8, unit * 0.65, "rgba(255,255,255,0.85)", "right");
}

// Long tips go over two lines
function wrapText(str, x, y, maxWidth, unit, colour, text) {
  pen.font = "bold " + Math.round(unit) + "px 'Plus Jakarta Sans', Arial, sans-serif";
  const wordsList = str.split(" ");
  const lines = [""];
  for (const word of wordsList) {
    const tryLine = (lines[lines.length - 1] + " " + word).trim();
    if (pen.measureText(tryLine).width > maxWidth && lines[lines.length - 1]) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = tryLine;
    }
  }
  lines.slice(0, 2).forEach(function (line, i) {
    text(line, x, y + i * unit * 1.25, unit, colour, "center");
  });
}

// The recording has stopped: join the pieces into one video file
function makeFile() {
  const type = (recorder && recorder.mimeType) || bestType() || "video/mp4";
  recorder = null;
  if (!pieces.length || throwAway) {
    pieces = [];
    throwAway = false;
    return;
  }
  const blob = new Blob(pieces, { type: type.split(";")[0] });
  pieces = [];
  const ending = type.includes("mp4") ? "mp4" : "webm";
  const stamp = new Date();
  const name = "Yoga-Buddy-" + stamp.getFullYear() + "-" + pad2(stamp.getMonth() + 1) + "-" + pad2(stamp.getDate()) +
               "-" + pad2(stamp.getHours()) + pad2(stamp.getMinutes()) + pad2(stamp.getSeconds()) + "." + ending;
  if (lastClip) {
    URL.revokeObjectURL(lastClip.url);
  }
  let file;
  try {
    file = new File([blob], name, { type: blob.type });
  } catch (error) {
    file = blob;   // very old browsers: no File, a Blob works for downloading
    file.name = name;
  }
  lastClip = { file: file, url: URL.createObjectURL(blob), name: name };

  // Android and laptops: save it straight away. iPhone: needs a tap (see saveClip).
  let saved = false;
  if (!onApple) {
    saved = download(lastClip);
  }
  if (onFinished) {
    onFinished({ saved: saved, onApple: onApple, onAndroid: onAndroid, seconds: Math.round((performance.now() - startedAt) / 1000) });
  }
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function download(clip) {
  try {
    const link = document.createElement("a");
    link.href = clip.url;
    link.download = clip.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch (error) {
    return false;
  }
}

// The "Save to Photos" button (must be called inside a tap).
// The share sheet is how a website saves a video to Photos on an iPhone;
// on Android it also offers Google Photos and other apps.
export async function saveClip() {
  if (!lastClip) {
    return "none";
  }
  const files = [lastClip.file];
  if (navigator.canShare && navigator.share && navigator.canShare({ files: files })) {
    try {
      await navigator.share({ files: files, title: "Yoga Buddy practice" });
      return "shared";
    } catch (error) {
      if (error.name === "AbortError") {
        return "cancelled";   // the person closed the share sheet
      }
    }
  }
  return download(lastClip) ? "downloaded" : "failed";
}

export function hasClip() {
  return !!lastClip;
}

// The red "● REC 0:12" light on the camera
const recLight = document.getElementById("rec-light");
const recClock = document.getElementById("rec-clock");

function showRecLight(on) {
  if (!recLight) {
    return;
  }
  recLight.hidden = !on;
  clearInterval(clockTimer);
  if (on) {
    recClock.textContent = "0:00";
    clockTimer = setInterval(function () {
      const s = Math.floor((performance.now() - startedAt) / 1000);
      recClock.textContent = Math.floor(s / 60) + ":" + pad2(s % 60);
    }, 500);
  }
}
