// =============================================================
// buddy.js — the AI buddy, using Google Gemini.
//
// While you hold a pose, every few seconds the voice coach sends Gemini:
//   • one small photo from the camera, and
//   • what the on-device body tracker measured (angles, what's wrong).
// Gemini looks at the photo like a real teacher and answers with:
//   • personVisible: can it really see a person?
//   • say:           a short, friendly sentence for the voice to speak.
//
// PRIVACY: when a key is set, the AI buddy is on, so while you hold a pose, photos
// leave the device and go to Google. Yoga Buddy itself never saves them.
// The API key is built in (gemini-key.js), so nobody has to type it.
// =============================================================

import { GEMINI_KEY } from "./gemini-key.js?v=20261030b";

// Which Gemini model to use. "flash-lite" is Google's fastest model.
// If Google renames it, the backup "latest" name is tried instead.
const MODEL = "gemini-3.5-flash-lite";
const BACKUP_MODEL = "gemini-flash-lite-latest";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

const OLD_NAMES = ["yogaBuddyGeminiKey", "yogaBuddyAIOff"];  // settings older versions kept in this browser
const WAIT_LIMIT = 15000;                 // give up on an answer after 15 seconds

let model = MODEL;
let restUntil = 0;   // after an error, wait until this time before asking again
let problem = "";    // the last problem, in plain words (shown on screen)

// What went wrong last time ("" if the last answer was fine)
export function buddyProblem() {
  return problem;
}


// ----- Always on -----

// Forget settings kept by older versions of the app (a typed-in key, "Turn off")
try {
  for (const name of OLD_NAMES) {
    localStorage.removeItem(name);
  }
} catch (error) {
  // some browsers block storage (e.g. private windows): nothing to do
}

// Is the AI buddy on? (Always, as long as there is a key in gemini-key.js)
export function buddyOn() {
  return GEMINI_KEY !== "";
}


// ----- What we tell Gemini about its job -----
const INSTRUCTIONS = `You are Yoga Buddy, a kind and encouraging yoga buddy for beginners, many of them school students.
You coach ONE yoga pose. You get a photo from the person's laptop or phone camera, plus measurements from a body tracker running on their device.
Rules:
- Only talk about what you can really see in the photo. If you cannot clearly see a real person, set personVisible to false. Furniture, clothes, posters or shadows are not a person.
- The photo is NOT mirrored: the person's LEFT side appears on the RIGHT of the image. Always say left and right from the person's own point of view.
- Trust the measured angles for exact numbers. Use the photo for everything else: hands, fingers, feet, heels, balance, how they look.
- "say" is spoken out loud: simple English, warm, at most 18 words, ONE idea only. No emojis, no lists, no numbers of degrees.
- Do not repeat what you said last time. Leave "say" empty if there is nothing useful to add.
- Safety first: if the person looks strained, wobbly or in pain, gently tell them to come out of the pose. Never push them past what is comfortable.`;

// The shape of the answer we want back from Gemini
const ANSWER_SHAPE = {
  type: "OBJECT",
  properties: {
    personVisible: { type: "BOOLEAN" },
    say: { type: "STRING" }
  },
  required: ["personVisible", "say"]
};


// ----- Ask the AI buddy -----
//   photo:   the camera picture as a base64 JPEG (without the "data:" start)
//   message: what is happening and what we want to know (plain text)
// Gives back { personVisible, say }, or null if it didn't work
// (no internet, too many requests…). The coach then carries on
// without the AI.
export async function askBuddy(photo, message) {
  if (!buddyOn() || Date.now() < restUntil) {
    return null;
  }

  const request = {
    systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
    contents: [{
      role: "user",
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: photo } },
        { text: message }
      ]
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ANSWER_SHAPE,
      temperature: 0.7,
      maxOutputTokens: 800,
      // Answer straight away instead of "thinking" first: about 2 seconds
      // instead of 8–11 seconds in our tests, with answers just as good
      thinkingConfig: { thinkingLevel: "minimal" }
    }
  };

  // Stop waiting if Gemini takes too long
  const stopper = new AbortController();
  const timer = setTimeout(function () { stopper.abort(); }, WAIT_LIMIT);

  try {
    const response = await fetch(API_URL + model + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify(request),
      signal: stopper.signal
    });

    if (response.status === 404) {
      const details = await response.text();
      if (details.includes("model") && model !== BACKUP_MODEL) {
        // Google says the model name has changed: use the backup name from now on
        console.warn("AI buddy: model " + model + " not found, trying " + BACKUP_MODEL);
        problem = "model name not found, trying another one";
        model = BACKUP_MODEL;
      } else {
        // An empty "not found" is a short hiccup at Google: just try again soon
        console.warn("AI buddy: Gemini hiccup (404), trying again soon");
        problem = "Gemini did not answer, trying again";
        restUntil = Date.now() + 3000;
      }
      return null;
    }
    if (response.status === 429) {
      // Too many requests (free tier limit): rest for 30 seconds
      console.warn("AI buddy: too many requests, resting for 30 s");
      problem = "too many requests, resting for 30 seconds";
      restUntil = Date.now() + 30000;
      return null;
    }
    if (!response.ok) {
      const details = await response.text();
      console.warn("AI buddy: Gemini said " + response.status, details);
      if (details.includes("API key not valid") || details.includes("API_KEY_INVALID")) {
        problem = "your Gemini key is not valid";
      } else {
        problem = "Gemini error " + response.status;
      }
      restUntil = Date.now() + 10000;
      return null;
    }

    // The answer is JSON text inside candidates[0].content.parts
    const data = await response.json();
    const candidate = (data.candidates || [])[0];
    const parts = (candidate && candidate.content && candidate.content.parts) || [];
    const text = parts.map(function (p) { return p.text || ""; }).join("");
    let answer;
    try {
      answer = JSON.parse(text);
    } catch (error) {
      // Gemini sometimes sends back an empty answer: just ask again next time
      // (no need to rest, the internet is fine)
      console.warn("AI buddy: empty answer (" + (candidate ? candidate.finishReason : "no answer") + ")");
      problem = "an empty answer, asking again";
      return null;
    }
    problem = "";
    return {
      personVisible: answer.personVisible === true,
      say: String(answer.say || "").slice(0, 200)
    };
  } catch (error) {
    console.warn("AI buddy: no answer (" + error.message + ")");
    problem = "no answer (is the internet on?)";
    restUntil = Date.now() + 10000;
    return null;
  } finally {
    clearTimeout(timer);
  }
}
