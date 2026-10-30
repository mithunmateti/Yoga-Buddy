// =============================================================
// voice.js — Yoga Buddy's voice.
//
// The voice is chosen on the start screen (and remembered in this browser):
//  • "Automatic" (the default): the best voice on this computer.
//    Natural "Premium" or "Enhanced" voices are chosen first, if the
//    computer has them (Macs can download them for free).
//  • Any other voice on this computer.
//  • The natural AI voice, "Sulafat", made by Google Gemini (beta).
//    Fixed sentences (phrases.js, poses.js) play from ready-made
//    recordings in the voice folder. Other sentences are made live by
//    Gemini (only the words are sent, never photos). Gemini's free plan
//    only makes 10 new sentences a day, so when it says "wait", that
//    sentence is said with the computer's voice instead.
//
// Everything said is split into sentences and played one after another.
// =============================================================

import { GEMINI_KEY } from "./gemini-key.js?v=20261030b";
import { sentences, sentenceKey, forSpeaking } from "./phrases.js?v=20261030b";

const AI_VOICE = "Sulafat";                 // must match VOICE in voice/make-recordings.mjs
const RECORDINGS = "voice/sulafat/";        // where the ready-made recordings are
const LIVE_MODELS = ["gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts"];   // fastest first
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
const MAKE_LIMIT = 6000;                    // wait at most 6 seconds for a live sentence
const CHOICE_NAME = "yogaBuddyVoice";       // remembers the chosen voice in this browser

// Joke voices on Macs, which we don't offer
const JOKE_VOICES = ["Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos",
  "Good News", "Jester", "Organ", "Superstar", "Trinoids", "Whisper", "Wobble", "Zarvox",
  "Deranged", "Hysterical", "Pipe Organ", "Fred", "Junior", "Kathy", "Ralph"];

// "Automatic" chooses a "Premium" or "Enhanced" voice if the computer has one,
// otherwise the first of these that it has (the nicest sounding first)
const NICE_VOICES = ["Google UK English Female", "Google US English", "Samantha", "Daniel",
  "Karen", "Moira", "Tessa"];

const canSpeak = "speechSynthesis" in window;
const player = new Audio();   // plays the AI voice (one player, unlocked by the Start button)

let choice = loadChoice();    // "" = automatic, "device:" + a computer voice's name, or "ai"
let recorded = null;          // sentence key → recording file (null until loaded)
let queue = [];               // sentences waiting to be said: { text, sound }
let busy = false;             // saying (or getting ready to say) a sentence right now
let freshPending = false;     // sayFresh is about to start
let pieceStarted = 0;         // when the current sentence started (seconds)
let quietSince = 0;           // when we last finished talking (seconds)
let round = 0;                // goes up when we stop, so old sentences are dropped
let currentWords = null;      // kept here so the browser doesn't throw the words away
const liveSounds = new Map(); // sentences Gemini made live this time: key → Promise of a sound
const restUntil = {};         // model → time until which Google asked us to wait

// The time now, in seconds
function now() {
  return performance.now() / 1000;
}

// Load the list of ready-made recordings
const recordingsReady = fetch(RECORDINGS + "recorded.json")
  .then(function (response) { return response.ok ? response.json() : { files: {} }; })
  .then(function (list) { recorded = list.files || {}; })
  .catch(function () { recorded = {}; });


// ----- Which voice? -----

function loadChoice() {
  try {
    return localStorage.getItem(CHOICE_NAME) || "";
  } catch (error) {
    return "";   // storage blocked: automatic
  }
}

// The voices to choose from: automatic, the computer's English voices, the AI voice
export function voiceChoices() {
  const best = bestComputerVoice();
  const list = [{ id: "", name: "Automatic" + (best ? " (" + best.name + ")" : "") }];
  for (const voice of englishVoices()) {
    list.push({ id: "device:" + voice.name, name: voice.name });
  }
  list.push({ id: "ai", name: "✨ " + AI_VOICE + " – natural AI voice (beta)" });
  return list;
}

export function chosenVoice() {
  return choice;
}

export function chooseVoice(id) {
  choice = id;
  try {
    localStorage.setItem(CHOICE_NAME, id);
  } catch (error) {
    // can't remember it: it is only used this time
  }
}

// Run a function when the list of computer voices changes (it often arrives late)
export function onVoicesChanged(callback) {
  if (canSpeak) {
    speechSynthesis.addEventListener("voiceschanged", callback);
  }
}

function englishVoices() {
  if (!canSpeak) {
    return [];
  }
  return speechSynthesis.getVoices().filter(function (voice) {
    return voice.lang.replace("_", "-").startsWith("en") &&
           !JOKE_VOICES.some(function (joke) { return voice.name.startsWith(joke); });
  });
}

// The computer voice to use: the chosen one, or else the best one
function deviceVoice() {
  if (choice.startsWith("device:")) {
    const name = choice.slice("device:".length);
    const chosen = englishVoices().find(function (voice) { return voice.name === name; });
    if (chosen) {
      return chosen;
    }
  }
  return bestComputerVoice();
}

// The nicest-sounding English voice on this computer
function bestComputerVoice() {
  const voices = englishVoices();
  const natural = voices.find(function (v) { return /Premium/i.test(v.name); }) ||
                  voices.find(function (v) { return /Enhanced/i.test(v.name); });
  if (natural) {
    return natural;
  }
  for (const name of NICE_VOICES) {
    const voice = voices.find(function (v) { return v.name === name; });
    if (voice) {
      return voice;
    }
  }
  return voices.find(function (v) { return v.default; }) || voices[0] || null;
}


// ----- Talking -----

// Browsers only play sound after you tap something. Call this inside a
// click (the Start and Try buttons): it plays a tiny silent sound, which
// lets the page play the voice later.
export function unlockSound() {
  // iPhones and iPads (Safari 17+): play sound even when the silent switch is on
  if (navigator.audioSession) {
    try {
      navigator.audioSession.type = "playback";
    } catch (error) {
      // not allowed here: the silent switch decides
    }
  }
  player.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
  player.play().catch(function () {});
  if (canSpeak) {
    // Safari ignores an empty sentence, so say a real (silent) word
    const hello = new SpeechSynthesisUtterance("Ready");
    hello.volume = 0;
    speechSynthesis.resume();
    speechSynthesis.speak(hello);
  }
}

// Say something (after anything that is already being said)
export function say(text) {
  for (const piece of splitForVoice(text)) {
    queue.push({ text: piece, sound: findSound(piece) });   // start getting the sound now
  }
  if (!busy) {
    playNext(round);
  }
}

// Stop talking, then say something new. (The short wait is because some
// browsers skip speech that starts at the very same moment as stopping.)
export function sayFresh(text) {
  stopTalking();
  freshPending = true;
  pieceStarted = now();
  const myRound = round;
  setTimeout(function () {
    if (myRound === round) {
      freshPending = false;
      say(text);
    }
  }, 150);
}

// Stop talking straight away and forget anything still waiting
export function stopTalking() {
  round++;
  queue = [];
  busy = false;
  freshPending = false;
  player.onended = null;
  player.onerror = null;
  player.pause();
  if (canSpeak) {
    speechSynthesis.cancel();
  }
  quietSince = now();
}

// Is the voice still talking? (Safety net: if a sentence never tells us it
// has finished, we stop waiting after 30 seconds.)
export function isTalking() {
  if ((busy || freshPending) && now() - pieceStarted > 30) {
    stopTalking();
  }
  return busy || freshPending;
}

// True if the voice has been quiet for at least this many seconds
export function quietFor(seconds) {
  return !isTalking() && now() - quietSince >= seconds;
}

// Split a text into pieces to say. With the AI voice, each sentence that has
// a recording is its own piece; new sentences next to each other stay
// together, so Gemini makes them in one go (it only allows a few a minute).
function splitForVoice(text) {
  const pieces = [];
  let live = "";
  for (const sentence of sentences(text)) {
    if (choice === "ai" && recorded && !recorded[sentenceKey(sentence)]) {
      live += (live ? " " : "") + sentence;
    } else {
      if (live) {
        pieces.push(live);
        live = "";
      }
      pieces.push(sentence);
    }
  }
  if (live) {
    pieces.push(live);
  }
  return pieces;
}

// Say the next piece in the queue
async function playNext(myRound) {
  const piece = queue.shift();
  if (!piece) {
    busy = false;
    quietSince = now();
    return;
  }
  // Voice turned off in Settings: say nothing (the words are still shown on screen)
  if (!voiceIsOn()) {
    queue = [];
    busy = false;
    quietSince = now();
    return;
  }
  busy = true;
  pieceStarted = now();
  // A recording or live sound, or null = computer voice. Only wait when we
  // have to: Safari only lets the first sentence play if it starts straight
  // away inside the tap, not after waiting.
  const sound = piece.sound && piece.sound.then ? await piece.sound : piece.sound;
  if (myRound !== round) {
    return;   // stopped while we were waiting
  }
  pieceStarted = now();

  // Go on to the next piece once, when this one has finished
  let finished = false;
  function next() {
    if (!finished && myRound === round) {
      finished = true;
      playNext(myRound);
    }
  }

  if (sound) {
    playSound(sound, piece.text, next);
  } else {
    speakWithComputer(piece.text, next);
  }
}

// Play the AI voice. If the sound can't be played, use the computer voice.
function playSound(url, text, next) {
  const myRound = round;
  function useComputerVoice() {
    if (myRound === round) {
      player.onended = null;
      player.onerror = null;
      speakWithComputer(text, next);
    }
  }
  player.onended = next;
  player.onerror = useComputerVoice;
  player.src = url;
  player.play().catch(useComputerVoice);
  setTimeout(next, 20000);   // safety net
}

// Say it with the computer's own voice
function speakWithComputer(text, next) {
  if (!canSpeak) {
    next();   // no voice on this device: the words are still shown on screen
    return;
  }
  const words = new SpeechSynthesisUtterance(text);
  const voice = deviceVoice();
  if (voice) {
    words.voice = voice;
    words.lang = voice.lang;
  } else {
    words.lang = "en-IN";
  }
  words.rate = voiceRate();   // Slow, Normal or Fast (Settings, settings.js)
  words.onend = next;
  words.onerror = next;
  currentWords = words;
  speechSynthesis.resume();   // Safari sometimes gets stuck "paused"
  speechSynthesis.speak(words);
  setTimeout(next, 12000);   // safety net
}


// ----- Getting the AI voice's sound for a piece -----
// Gives back a sound address, or null to use the computer voice.

function findSound(text) {
  if (choice !== "ai") {
    return null;   // straight away, not a promise (see playNext)
  }
  return findAISound(text);
}

async function findAISound(text) {
  await recordingsReady;
  const file = recorded[sentenceKey(text)];
  if (file) {
    return RECORDINGS + file;   // a ready-made recording
  }
  return makeLive(text);
}

// Ask Gemini to say a new sentence (each one is only made once per visit)
function makeLive(text) {
  const key = sentenceKey(text);
  if (!liveSounds.has(key)) {
    const promise = askGeminiToSay(text).then(function (url) {
      if (!url) {
        liveSounds.delete(key);   // didn't work: try again next time
      }
      return url;
    });
    liveSounds.set(key, promise);
  }
  return liveSounds.get(key);
}

async function askGeminiToSay(text) {
  const giveUpAt = Date.now() + MAKE_LIMIT;
  for (const model of LIVE_MODELS) {
    if (Date.now() < (restUntil[model] || 0) || Date.now() >= giveUpAt) {
      continue;   // Google asked us to wait for this model, or no time left
    }
    const stopper = new AbortController();
    const timer = setTimeout(function () { stopper.abort(); }, giveUpAt - Date.now());
    try {
      const response = await fetch(API_URL + model + ":generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: forSpeaking(text) }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: AI_VOICE } } }
          }
        }),
        signal: stopper.signal
      });
      if (response.status === 429) {
        // Too many new sentences: wait as long as Google asks (about a minute)
        restUntil[model] = Date.now() + waitTime(await response.text()) * 1000;
        continue;
      }
      if (!response.ok) {
        restUntil[model] = Date.now() + 5000;   // a hiccup: leave this model for a moment
        continue;
      }
      const data = await response.json();
      const sound = data.candidates[0].content.parts[0].inlineData;
      return URL.createObjectURL(soundToWav(sound));
    } catch (error) {
      // no answer in time, or no internet: try the next model (if there is time)
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

// How many seconds Google asked us to wait (from its "retryDelay"), or 60
function waitTime(errorText) {
  const match = errorText.match(/"retryDelay":\s*"([\d.]+)s"/);
  return match ? Number(match[1]) + 1 : 60;
}

// Gemini's sound is a .wav file, or (from some models) raw samples that
// need a .wav header in front
function soundToWav(sound) {
  const bytes = Uint8Array.from(atob(sound.data), function (c) { return c.charCodeAt(0); });
  if (sound.mimeType.includes("wav")) {
    return new Blob([bytes], { type: "audio/wav" });
  }
  const rate = Number((sound.mimeType.match(/rate=(\d+)/) || [])[1] || 24000);
  const head = new DataView(new ArrayBuffer(44));
  const text = function (at, letters) {
    for (let i = 0; i < letters.length; i++) {
      head.setUint8(at + i, letters.charCodeAt(i));
    }
  };
  text(0, "RIFF");
  head.setUint32(4, 36 + bytes.length, true);
  text(8, "WAVEfmt ");
  head.setUint32(16, 16, true);
  head.setUint16(20, 1, true);
  head.setUint16(22, 1, true);
  head.setUint32(24, rate, true);
  head.setUint32(28, rate * 2, true);
  head.setUint16(32, 2, true);
  head.setUint16(34, 16, true);
  text(36, "data");
  head.setUint32(40, bytes.length, true);
  return new Blob([head, bytes], { type: "audio/wav" });
}
