// =============================================================
// make-recordings.mjs — makes the natural AI voice recordings.
//
// For every fixed sentence (phrases.js and poses.js), it asks Google
// Gemini to say it in the "Sulafat" voice, and saves a small audio file
// in voice/sulafat/. The app plays these files instead of asking Gemini
// every time (the free plan only allows 3 new sentences a minute).
//
// Run it from the Yoga Buddy folder (needs Node.js):
//     node voice/make-recordings.mjs
// It skips sentences that already have a recording, so you can stop it
// and run it again later. It takes about 20 seconds per new sentence.
// The free plan only allows 10 new sentences a day: when they are used
// up, it stops and says so. Run it again the next day.
// =============================================================

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));   // the voice folder
const APP = path.join(HERE, "..");                           // the Yoga Buddy folder

const { GEMINI_KEY } = await import(path.join(APP, "gemini-key.js"));
const { allSentences, sentenceKey, forSpeaking } = await import(path.join(APP, "phrases.js"));

const VOICE = "Sulafat";                    // must match VOICE in voice.js
const MODEL = "gemini-3.8-flash-tts";
const FOLDER = path.join(HERE, VOICE.toLowerCase());
const LIST_FILE = path.join(FOLDER, "recorded.json");
const GAP = 20500;                          // free plan: 3 sentences a minute

// poses.js is a normal script (not a module), so run it to get POSES
const posesCode = fs.readFileSync(path.join(APP, "poses.js"), "utf8");
const box = {};
vm.createContext(box);
vm.runInContext(posesCode + "\nthis.POSES = POSES;", box);

// The hold time, read from coach.js
const coachCode = fs.readFileSync(path.join(APP, "coach.js"), "utf8");
const HOLD_SECONDS = Number((coachCode.match(/HOLD_SECONDS = (\d+)/) || [])[1] || 30);
const READY_SECONDS = Number((coachCode.match(/GET_READY_SECONDS = (\d+)/) || [])[1] || 5);

// Which sentences already have a recording
fs.mkdirSync(FOLDER, { recursive: true });
let list = { voice: VOICE, model: MODEL, files: {} };
if (fs.existsSync(LIST_FILE)) {
  list = JSON.parse(fs.readFileSync(LIST_FILE, "utf8"));
}

// Can this computer make small .m4a files? (Macs can, with afconvert)
let canShrink = true;
try {
  execFileSync("which", ["afconvert"], { stdio: "ignore" });
} catch (error) {
  canShrink = false;
}

const wait = ms => new Promise(done => setTimeout(done, ms));

// Turn raw sound samples into a .wav file (some Gemini models send raw samples)
function wavFile(samples, rate) {
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + samples.length, 4);
  head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(samples.length, 40);
  return Buffer.concat([head, samples]);
}

// Ask Gemini to say one sentence. Gives back a .wav file (as a Buffer).
async function record(sentence) {
  for (let tries = 0; tries < 8; tries++) {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: forSpeaking(sentence) }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } }
        }
      })
    });
    const text = await response.text();

    if (response.status === 200) {
      const sound = JSON.parse(text).candidates[0].content.parts[0].inlineData;
      const bytes = Buffer.from(sound.data, "base64");
      if (sound.mimeType.includes("wav")) {
        return bytes;
      }
      const rate = Number((sound.mimeType.match(/rate=(\d+)/) || [])[1] || 24000);
      return wavFile(bytes, rate);
    }
    if (response.status === 404 && text.trim() === "") {
      await wait(2000);   // a short hiccup at Google: try again
      continue;
    }
    if (response.status === 429) {
      const error = JSON.parse(text).error;
      const limit = (error.details || []).find(d => d.violations);
      const retry = (error.details || []).find(d => d.retryDelay);
      if (limit && /PerDay/i.test(limit.violations[0].quotaId)) {
        throw new Error("Today's free limit is used up. Run this again tomorrow.");
      }
      const seconds = retry ? parseFloat(retry.retryDelay) : 30;
      console.log("   (Google says wait " + Math.ceil(seconds) + " s)");
      await wait((seconds + 1) * 1000);
      continue;
    }
    throw new Error("Gemini said " + response.status + ": " + text.slice(0, 200));
  }
  throw new Error("No answer from Gemini after several tries");
}

const sentences = allSentences(box.POSES, HOLD_SECONDS, READY_SECONDS);
const todo = sentences.filter(s => !list.files[sentenceKey(s)] ||
                                   !fs.existsSync(path.join(FOLDER, list.files[sentenceKey(s)])));
console.log(sentences.length + " sentences, " + todo.length + " still to record (about " +
            Math.ceil(todo.length * GAP / 60000) + " minutes).");

let lastAsked = 0;
let done = 0;
for (const sentence of todo) {
  // Keep to the free plan's speed limit
  const gap = lastAsked + GAP - Date.now();
  if (gap > 0) {
    await wait(gap);
  }
  lastAsked = Date.now();

  const key = sentenceKey(sentence);
  const wav = await record(sentence);
  let fileName = key + ".wav";
  fs.writeFileSync(path.join(FOLDER, fileName), wav);
  if (canShrink) {
    // .m4a is about 10 times smaller than .wav and sounds the same
    execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000",
                               path.join(FOLDER, fileName), path.join(FOLDER, key + ".m4a")]);
    fs.unlinkSync(path.join(FOLDER, fileName));
    fileName = key + ".m4a";
  }
  list.files[key] = fileName;
  fs.writeFileSync(LIST_FILE, JSON.stringify(list, null, 1));
  done++;
  console.log(done + "/" + todo.length + "  " + sentence);
}
console.log("All done.");
