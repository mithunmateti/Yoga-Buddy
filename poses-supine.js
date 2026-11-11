// =============================================================
// poses-supine.js — the SUPINE poses: lying on your BACK (the "Lying on your back" tab).
//
// "Supine" means lying on your back, face up.
// Put the camera LOW, near the floor, and lie sideways to it.
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
    id: "setubandhasana",
    sanskrit: "Setu Bandhasana",
    english: "Bridge",
    level: "Easy",
    focus: "Back",
    group: "supine",
    holdKind: "steady",
    tint: "#E9F1DD",
    image: "images/setubandhasana.svg",
    view: "side",
    camera: "Put the camera low, near the floor, and lie sideways to it.",
    safety: "Keep your neck still and your head on the floor. Skip it or lift only a little if your neck or back hurts.",
    steps: [
      { text: "Lie on your back, sideways to the camera.",           waitFor: [] },
      { text: "Bend your knees and put your feet flat.",             waitFor: ["Knees"] },
      { text: "Rest your arms on the floor by your sides.",          waitFor: [] },
      { text: "Press your feet down and lift your hips.",            waitFor: ["Hips"] },
      { text: "Make a straight line from shoulders to knees.",       waitFor: ["Lift"] }
    ],
    // The lifted hips (a straight line from shoulder to knee) ARE this pose,
    // so they count 3 times. "Lift": the body slopes gently up from the
    // shoulders (on the floor) to the hips, so you are lying, not standing.
    checks: [
      { name: "Hips", joint: "hip", side: "camera", target: 175, tolerance: 15, weight: 3,
        tipLow: "Lift your hips higher",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "camera", target: 90, tolerance: 20, weight: 2,
        tipLow: "Move your feet a little further away",
        tipHigh: "Bring your feet closer to you" },
      { name: "Lift", joint: "body", side: "camera", target: 25, tolerance: 15, weight: 2,
        tipLow: "Lift your hips higher",
        tipHigh: "Keep your shoulders on the floor" }
    ]
  }
);
