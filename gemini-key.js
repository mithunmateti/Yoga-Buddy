// =============================================================
// gemini-key.js — where the AI buddy gets its Google Gemini key.
//
// This file has NO key, so it is safe to put on GitHub. Without a key
// the AI buddy is simply off (the coach still works with the angles).
//
// To turn the AI buddy on on YOUR computer: make a file called
// gemini-key.local.js next to this one, containing:
//     export const GEMINI_KEY = "your key here";
// That file is in .gitignore, so it never goes to GitHub.
//
// Before putting a key on a public website, restrict it to the site's
// address in Google AI Studio, because anyone can read a website's code.
// =============================================================

let key = "";
try {
  key = (await import("./gemini-key.local.js")).GEMINI_KEY;
} catch (error) {
  // no local file: no key
}

export const GEMINI_KEY = key;
