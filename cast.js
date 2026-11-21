// =============================================================
// cast.js — show the practice on a big screen (a TV).
//
// Two ways, because browsers allow different things:
//
// 1. Chrome with a Chromecast (or a cast-ready TV): the Presentation API
//    opens tv.html on the TV. While you practise, this file sends the TV
//    the skeleton, the score, the tip and the hold timer about 15 times a
//    second, so the TV shows a big, clear coach screen. (Only the drawing
//    and the words are sent, never the camera picture.)
//
// 2. Everything else (iPhone, most Android phones, Safari): a website is
//    not allowed to start casting by itself, so the 📺 button shows the
//    steps to mirror the screen with the phone's own Screen Mirroring /
//    Cast button. The whole app then shows on the TV.
// =============================================================

const TV_PAGE = new URL("tv.html", window.location.href).href;
const SEND_EVERY = 1000 / 15;   // milliseconds between updates to the TV

let request = null;
let connection = null;
let lastSent = 0;
let listener = null;   // told when casting starts or stops

// Can this browser cast a page by itself?
export function canCastPage() {
  return "PresentationRequest" in window && window.isSecureContext;
}

export function isCasting() {
  return !!connection && connection.state === "connected";
}

// Called with true / false when the TV connects or disconnects
export function onCastChange(callback) {
  listener = callback;
}

function changed() {
  if (listener) {
    listener(isCasting());
  }
}

function useConnection(newConnection) {
  connection = newConnection;
  connection.addEventListener("connect", changed);
  connection.addEventListener("close", function () {
    connection = null;
    changed();
  });
  connection.addEventListener("terminate", function () {
    connection = null;
    changed();
  });
  changed();
}

// Ask the browser to pick a TV and open the TV page on it.
// Gives true if it started, false if this browser or TV can't do it.
export async function startCasting() {
  if (!canCastPage()) {
    return false;
  }
  try {
    request = request || new PresentationRequest([TV_PAGE]);
    useConnection(await request.start());
    return true;
  } catch (error) {
    // No TV found, the person closed the list, or not allowed here
    console.warn("Casting didn't start:", error);
    return false;
  }
}

export function stopCasting() {
  if (connection) {
    connection.terminate();
    connection = null;
    changed();
  }
}

// Send the TV what is on the screen now (at most 15 times a second).
// state = { pose, score, tip, coach, timer, aspect, bones, dots }
export function sendToTv(state) {
  if (!isCasting()) {
    return;
  }
  const now = performance.now();
  if (now - lastSent < SEND_EVERY) {
    return;
  }
  lastSent = now;
  try {
    connection.send(JSON.stringify(state));
  } catch (error) {
    // The TV went away: the close event tidies up
  }
}
