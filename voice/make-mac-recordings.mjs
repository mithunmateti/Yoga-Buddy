// =============================================================
// make-mac-recordings.mjs — records the coach's sentences with the
// Mac's own voice ("Samantha"), for the VIDEO RECORDING feature.
//
// Why: a website can't record the phone's built-in voice, so while
// recording, the coach plays these ready-made files instead. The app can
// then send them to the speaker AND into the video at the same time.
//
// Run it from the Yoga Buddy folder (needs a Mac with Node.js):
//     node voice/make-mac-recordings.mjs
// It is free and has no daily limit. It skips sentences that already
// have a file. If you change a sentence in phrases.js or poses.js, run
// it again: it records only the new ones.
//
// Sentences that aren't here (a name, "Round 2 of 4", "You held X for 30
// seconds") are said with the phone's own voice, and don't appear in the video.
// =============================================================

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..");
const { allSentences, sentenceKey, forSpeaking, countFor } = await import(path.join(APP, "phrases.js"));

const VOICE = "Samantha";
const FOLDER = path.join(HERE, "samantha");
const LIST_FILE = path.join(FOLDER, "recorded.json");

const box = {};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(APP, "poses.js"), "utf8") + "\nthis.POSES = POSES;", box);
const coachCode = fs.readFileSync(path.join(APP, "coach.js"), "utf8");
const HOLD_SECONDS = Number((coachCode.match(/HOLD_SECONDS = (\d+)/) || [])[1] || 30);
const READY_SECONDS = Number((coachCode.match(/GET_READY_SECONDS = (\d+)/) || [])[1] || 5);

fs.mkdirSync(FOLDER, { recursive: true });
let list = { voice: VOICE, files: {} };
if (fs.existsSync(LIST_FILE)) {
  list = JSON.parse(fs.readFileSync(LIST_FILE, "utf8"));
}

// All fixed sentences, plus "I will count N seconds." for every hold time you can choose (5–60)
const sentences = allSentences(box.POSES, HOLD_SECONDS, READY_SECONDS);
for (let seconds = 5; seconds <= 60; seconds += 5) {
  const s = countFor(seconds);
  if (!sentences.includes(s)) sentences.push(s);
}

const todo = sentences.filter(s => !list.files[sentenceKey(s)] ||
                                   !fs.existsSync(path.join(FOLDER, list.files[sentenceKey(s)])));
console.log(sentences.length + " sentences, " + todo.length + " still to record.");

let done = 0;
for (const sentence of todo) {
  const key = sentenceKey(sentence);
  const aiff = path.join(os.tmpdir(), key + ".aiff");
  execFileSync("say", ["-v", VOICE, "-o", aiff, forSpeaking(sentence)]);
  // .m4a is small and plays on every phone (iPhone, Android, laptop)
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "64000", aiff, path.join(FOLDER, key + ".m4a")]);
  fs.unlinkSync(aiff);
  list.files[key] = key + ".m4a";
  done++;
  if (done % 20 === 0) console.log(done + "/" + todo.length);
}
fs.writeFileSync(LIST_FILE, JSON.stringify(list, null, 1));
console.log("All done: " + Object.keys(list.files).length + " recordings in voice/samantha/");
