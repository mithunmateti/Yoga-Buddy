// =============================================================
// poses-kneeling.js — the KNEELING poses (the "Kneeling" tab).
//
// Poses done on your knees.
// Put the camera low, about as high as your chest when you kneel.
//
// The poses are sorted into tabs by the position of your body, the
// same way the book Yoga Anatomy (Kaminoff) sorts its chapters:
// standing, sitting, kneeling, supine (on your back), prone (on your
// tummy) and arm support (on your hands). Each pose says which one
// with "group".
//
// They use exactly the same format as poses.js (read the comments at the
// top of poses.js to see what every field means). This file just adds
// them to the same POSES list with POSES.push(…).
//
// Targets worked out from the test skeletons (tests/skeletons/) and usual
// alignment cues; NOT yet tested on real people. Please test them yourselves
// and change the numbers if a pose scores too low or too high.
// =============================================================

POSES.push(
  {
    id: "vajrasana",
    sanskrit: "Vajrasana",
    english: "Thunderbolt",
    level: "Easy",
    focus: "Digestion",
    group: "kneeling",
    holdKind: "steady",
    tint: "#F6EADF",
    image: "images/vajrasana.svg",
    view: "side",
    camera: "Put the camera low, about chest height when you sit, and 2 metres away.",
    safety: "Put a folded blanket under your knees or between your heels and hips if it feels uncomfortable. Skip it if you have knee or ankle pain.",
    steps: [
      { text: "Kneel on the floor, sideways to the camera.",       waitFor: [] },
      { text: "Bring your big toes together behind you.",          waitFor: [] },
      { text: "Sit back gently on your heels.",                    waitFor: ["Knees", "On the heels"] },
      { text: "Rest your hands on your thighs and sit tall.",      waitFor: ["Back"] },
      { text: "Breathe slowly and relax.",                         waitFor: [] }
    ],
    // Sitting back on the heels (knees folded tight) IS this pose: 3 times.
    // "On the heels": the hips are almost straight above the ankles, so the
    // hip-to-ankle line is steep (it is flat in cross-legged sitting).
    // The feet are partly hidden under the body, so they may be less sure.
    checks: [
      { name: "Knees", joint: "knee", side: "both", target: 35, tolerance: 25, weight: 3, minVisibility: 0.3,
        tipLow: "Lift your hips a little",
        tipHigh: "Sit back on your heels" },
      { name: "On the heels", joint: "legs", side: "camera", target: 75, tolerance: 20, minVisibility: 0.3,
        tipLow: "Sit back on your heels",
        tipHigh: "" },
      { name: "Back", joint: "body", side: "camera", target: 82, tolerance: 15, weight: 2,
        tipLow: "Sit up tall",
        tipHigh: "" }
    ]
  }
);
