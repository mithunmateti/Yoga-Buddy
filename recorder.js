// =============================================================
// recorder.js — "Start recording".
//
// Makes a video of the practice: the camera picture (mirrored, like on
// the screen), the green/red skeleton, and the pose name, score, timer
// and tip on top. Everything happens on this device; nothing is uploaded.
//
// How it is used (practice.js):
//   • "Start recording" (or ⏺) starts it straight away, inside the tap.
//   • It stops by itself a moment after the pose (and its hold) is done.
//   • Tapping Done then saves it:
//       iPhone / iPad: websites can't put files into Photos on their own,
//         so the share sheet opens and "Save Video" puts it in Photos.
//       Android: it downloads, so it shows up in the Gallery / Google
//         Photos (Download album).
//       Laptop: it downloads to the Downloads folder.
//
// How it works: a hidden canvas is redrawn about 30 times a second with
// the newest camera picture, the skeleton and the words, and the
// browser's MediaRecorder turns that canvas into an MP4 (or WebM) video.
//
// Sound: browsers don't let any website record their built-in voice
// directly, so the video's sound comes from the phone's microphone, which
// hears the voice coach through the loudspeaker (and you). Echo
// cancelling is switched off, otherwise the phone would remove the
// coach's voice on purpose.
// =============================================================

const FRAMES_PER_SECOND = 30;
const LONGEST = 10 * 60 * 1000;   // stop by itself after 10 minutes (phone memory)

const onApple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const onAndroid = /Android/i.test(navigator.userAgent);

// The video types to try, best first. MP4 works in Photos and every
// gallery app; WebM is for older Chrome versions that can't make MP4.
const TYPES = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];

// The microphone settings for recording (practice.js asks for them with the camera)
export const MIC_WISHES = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };

// The Yoga Buddy logo, drawn small in the corner of the video
const logo = new Image();
logo.src = "images/icon-192.png";

const sheet = document.createElement("canvas");   // the hidden canvas the video is made from
const pen = sheet.getContext("2d");

let recorder = null;
let startedAt = 0;
let stopTimer = null;
let clockTimer = null;
let drawTimer = null;
let getFrame = null;     // practice.js: gives { video, skeleton, words } for each picture
let drawing = true;      // recording our drawing (false: the plain camera)
let clips = [];          // the videos made on this visit: { file, url, name, saved }
let fileWaiters = [];    // waiting for the video file (see whenFileReady)
let audioCtx = null;     // Web Audio: carries the microphone into the video
let soundOut = null;     // …into this, whose sound track goes into every video
let micNode = null;
let micStream = null;    // the camera stream with the microphone in it
let finishing = false;   // stopped, and the video file is still being made

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

export function isRecording() {
  return !!recorder && recorder.state !== "inactive";
}

// Recording, or stopped with the video file still being made
export function hasVideoComing() {
  return isRecording() || finishing;
}

// Start recording now. frameGiver() gives { video, skeleton, words }.
// camera: the camera's own stream (only needed if this browser can't
// record our drawing; then the plain camera is recorded).
// Gives back true if it started.
export function startRecording(frameGiver, camera) {
  if (hasVideoComing() || !canRecord()) {
    return false;
  }
  getFrame = frameGiver;

  // The video's size: tall for a phone held upright, wide otherwise.
  // iPhones get a smaller picture (the same size as their camera picture).
  const upright = window.innerHeight > window.innerWidth;
  const long = onApple ? 640 : 960;
  const short = Math.round(long * 3 / 4);
  sheet.width = upright ? short : long;
  sheet.height = upright ? long : short;
  drawFrame();

  let pictures = null;
  drawing = canDraw();
  if (drawing) {
    try {
      pictures = sheet.captureStream(FRAMES_PER_SECOND);
    } catch (error) {
      drawing = false;
    }
  }
  if (!drawing) {
    if (!camera) {
      return false;   // practice.js tries again once the camera is on
    }
    pictures = new MediaStream(camera.getVideoTracks());
  }

  // The sound track: always there (silent until the microphone is connected)
  const sound = soundTrack();
  if (camera) {
    useMicrophone(camera);
  }
  const withSound = sound ? new MediaStream(pictures.getVideoTracks().concat([sound])) : pictures;

  const first = makeRecorder(withSound);
  if (first && startWith(first)) {
    return true;
  }
  // This browser can't record that sound: record the pictures only
  const quiet = sound ? makeRecorder(pictures) : null;
  return !!quiet && startWith(quiet);
}

function makeRecorder(stream) {
  const type = bestType();
  try {
    return type
      ? new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2500000 })
      : new MediaRecorder(stream);
  } catch (error) {
    try {
      return new MediaRecorder(stream);   // this browser chooses
    } catch (error2) {
      console.warn("Recording isn't possible here", error2);
      return null;
    }
  }
}

// Collect the pieces of this recorder, start it, start drawing
function startWith(mine) {
  recorder = mine;
  const pieces = [];
  mine.addEventListener("dataavailable", function (event) {
    if (event.data && event.data.size > 0) {
      pieces.push(event.data);
    }
  });
  mine.addEventListener("stop", function () {
    makeFile(mine, pieces);
  });
  try {
    if (mine.state === "inactive") {
      mine.start(1000);   // a piece every second, so a long video isn't one huge block
    }
  } catch (error) {
    console.warn("Recording isn't possible here", error);
    recorder = null;
    return false;
  }
  startedAt = performance.now();
  stopTimer = setTimeout(stopRecording, LONGEST);
  if (drawing) {
    drawTimer = setInterval(drawFrame, 1000 / FRAMES_PER_SECOND);
  }
  showRecLight(true);
  return true;
}

// The video's sound track (made once). Must first happen inside a tap
// (Start recording), or iPhones keep the sound switched off.
function soundTrack() {
  try {
    if (!audioCtx) {
      const Context = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Context();
      soundOut = audioCtx.createMediaStreamDestination();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return soundOut.stream.getAudioTracks()[0] || null;
  } catch (error) {
    return null;   // no Web Audio: videos without sound
  }
}

// The camera stream came with the microphone: carry it into the video.
// (Called again when the camera restarts, e.g. after turning the phone.)
export function useMicrophone(stream) {
  micStream = stream;
  if (!audioCtx || !soundOut || !stream) {
    return;
  }
  const tracks = stream.getAudioTracks();
  if (!tracks.length) {
    return;
  }
  try {
    if (micNode) {
      micNode.disconnect();
    }
    micNode = audioCtx.createMediaStreamSource(new MediaStream([tracks[0]]));
    micNode.connect(soundOut);   // NOT to the loudspeaker (that would howl)
  } catch (error) {
    console.warn("Couldn't use the microphone for the video", error);
  }
}

// Stop recording. The video file is ready a moment later (whenFileReady).
export function stopRecording() {
  clearTimeout(stopTimer);
  clearInterval(drawTimer);
  if (recorder && recorder.state !== "inactive") {
    finishing = true;
    recorder.stop();   // makeFile runs when the last piece has arrived
  }
  showRecLight(false);
}

// Draw one picture of the video: the camera, the skeleton and the words
function drawFrame() {
  const w = sheet.width;
  const h = sheet.height;
  pen.fillStyle = "#000";
  pen.fillRect(0, 0, w, h);

  const frame = getFrame ? getFrame() : null;
  const video = frame && frame.video;
  if (!video || !video.videoWidth || video.readyState < 2) {
    // The camera isn't on yet (just after Start)
    drawWords({ pose: frame && frame.words ? frame.words.pose : "", tip: "Get ready…" }, w, h);
    return;
  }

  // Fit the camera picture inside the video, keeping its shape
  const scale = Math.min(w / video.videoWidth, h / video.videoHeight);
  const dw = video.videoWidth * scale;
  const dh = video.videoHeight * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;

  // The camera, mirrored like a mirror (the same as on the screen)
  pen.save();
  pen.translate(dx + dw, dy);
  pen.scale(-1, 1);
  pen.drawImage(video, 0, 0, dw, dh);
  pen.restore();

  // The skeleton is already drawn the mirrored way round, at the camera's size
  if (frame.skeleton && frame.skeleton.width) {
    pen.drawImage(frame.skeleton, dx, dy, dw, dh);
  }

  drawWords(frame.words || {}, w, h);
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
    wrapText(words.tip, w / 2, h - pad - unit * 5, w - pad * 2, unit, words.tipGood ? "#7CF29A" : "#ffffff", text);
  }
  drawLogo(w, h, unit);
}

// The Yoga Buddy logo as a small watermark in the bottom-right corner
function drawLogo(w, h, unit) {
  if (!logo.complete || !logo.naturalWidth) {
    return;
  }
  const size = Math.round(unit * 1.7);
  const x = w - size - unit * 0.6;
  const y = h - size - unit * 0.6;
  const r = size * 0.22;   // rounded corners, like the app icon
  pen.save();
  pen.globalAlpha = 0.85;
  pen.beginPath();
  pen.moveTo(x + r, y);
  pen.arcTo(x + size, y, x + size, y + size, r);
  pen.arcTo(x + size, y + size, x, y + size, r);
  pen.arcTo(x, y + size, x, y, r);
  pen.arcTo(x, y, x + size, y, r);
  pen.closePath();
  pen.clip();
  pen.drawImage(logo, x, y, size, size);
  pen.restore();
}

// Long tips go over two lines
function wrapText(str, x, y, maxWidth, unit, colour, text) {
  pen.font = "bold " + Math.round(unit) + "px 'Plus Jakarta Sans', Arial, sans-serif";
  const lines = [""];
  for (const word of str.split(" ")) {
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
function makeFile(mine, pieces) {
  const type = mine.mimeType || bestType() || "video/mp4";
  if (recorder === mine) {
    recorder = null;
    finishing = false;
  }
  if (pieces.length) {
    const blob = new Blob(pieces, { type: type.split(";")[0] });
    const ending = type.includes("mp4") ? "mp4" : "webm";
    const stamp = new Date();
    const name = "Yoga-Buddy-" + stamp.getFullYear() + "-" + pad2(stamp.getMonth() + 1) + "-" + pad2(stamp.getDate()) +
                 "-" + pad2(stamp.getHours()) + pad2(stamp.getMinutes()) + pad2(stamp.getSeconds()) +
                 (clips.length ? "-" + (clips.length + 1) : "") + "." + ending;
    let file;
    try {
      file = new File([blob], name, { type: blob.type });
    } catch (error) {
      file = blob;   // very old browsers: no File; a Blob still downloads
    }
    clips.push({ file: file, url: URL.createObjectURL(blob), name: name, saved: false });
  }
  finishWaiting();
}

function finishWaiting() {
  const waiters = fileWaiters;
  fileWaiters = [];
  for (const done of waiters) {
    done(hasUnsavedClip());
  }
}

// Wait until the newest video file has been made (after stopRecording).
// Gives true if there is a video that hasn't been saved yet.
export function whenFileReady() {
  if (!isRecording() && !finishing) {
    return Promise.resolve(hasUnsavedClip());
  }
  return new Promise(function (resolve) {
    fileWaiters.push(resolve);
  });
}

function unsavedClips() {
  return clips.filter(function (clip) { return !clip.saved; });
}

export function hasUnsavedClip() {
  return unsavedClips().length > 0;
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

// Save every video that hasn't been saved yet (usually one; more if
// "Practice again" was used). On an iPhone this must happen inside a tap
// (Done): the share sheet opens, and "Save Video" puts them in Photos.
// Gives back "saved", "downloaded" (iPhone: went to the Files app instead),
// "cancelled" (share sheet closed), "needs-tap" (iPhone: not inside a tap
// any more) or "failed".
export async function saveClip() {
  const todo = unsavedClips();
  if (!todo.length) {
    return "failed";
  }
  // Android and laptops: download them (Android shows downloaded videos in
  // the Gallery and Google Photos)
  if (!onApple) {
    let all = true;
    for (const clip of todo) {
      if (download(clip)) {
        clip.saved = true;
      } else {
        all = false;
      }
    }
    if (all) {
      return "saved";
    }
  }
  const left = unsavedClips();
  const files = left.map(function (clip) { return clip.file; });
  if (navigator.canShare && navigator.share && navigator.canShare({ files: files })) {
    try {
      await navigator.share({ files: files });
      left.forEach(function (clip) { clip.saved = true; });
      return "saved";
    } catch (error) {
      if (error.name === "AbortError") {
        return "cancelled";    // the person closed the share sheet
      }
      if (onApple) {
        return "needs-tap";    // not inside a tap any more (or another hiccup): ask for a tap
      }
    }
  }
  let any = false;
  for (const clip of left) {
    if (download(clip)) {
      clip.saved = true;
      any = true;
    }
  }
  return any ? (onApple ? "downloaded" : "saved") : "failed";
}

// Where the saved video went, for the message on the screen
export function savedWhere() {
  return onApple ? "Photos" : onAndroid ? "Gallery" : "Downloads folder";
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
