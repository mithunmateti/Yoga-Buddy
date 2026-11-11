// =============================================================
// poses-prone.js — the PRONE poses: lying on your TUMMY (the "Lying on your tummy" tab).
//
// "Prone" means lying on your front, face down.
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
    id: "salabhasana",
    sanskrit: "Salabhasana",
    english: "Locust",
    level: "Medium",
    focus: "Back",
    group: "prone",
    // Lifting the legs and chest is tiring for the back, so short holds are safer
    holdKind: "balance",
    tint: "#F5EFD9",
    image: "images/salabhasana.svg",
    view: "side",
    camera: "Put the camera low, near the floor, and lie sideways to it.",
    safety: "Lift only a little and never force it. Skip it if you have back pain or are pregnant.",
    steps: [
      { text: "Lie on your stomach, sideways to the camera.",       waitFor: [] },
      { text: "Put your arms back along your body.",                waitFor: ["Arms back"] },
      { text: "Lift your chest a little off the floor.",            waitFor: ["Chest up"] },
      { text: "Now lift your straight legs a little too.",          waitFor: ["Legs up", "Knees"] },
      { text: "Look at the floor and keep breathing.",              waitFor: ["Back"] }
    ],
    // The gently arched back (the angle at the hips) IS this pose, so it counts 3 times.
    // "Arms back" tells Locust apart from Plank (arms under the shoulders),
    // and the straight elbows tell it apart from Half Cobra.
    checks: [
      { name: "Back", joint: "hip", side: "camera", target: 155, tolerance: 15, weight: 3,
        tipLow: "Lift a little less",
        tipHigh: "Lift your chest and legs" },
      { name: "Chest up", joint: "body", side: "camera", target: 16, tolerance: 12,
        tipLow: "Lift your chest a little",
        tipHigh: "Lower your chest a little" },
      // Legs flat on the floor (0–4°) don't count: the legs must really lift.
      { name: "Legs up", joint: "legs", side: "camera", target: 12, tolerance: 8,
        tipLow: "Lift your legs a little",
        tipHigh: "Lower your legs a little" },
      { name: "Arms back", joint: "shoulder", side: "camera", target: 20, tolerance: 20, weight: 2,
        tipLow: "",
        tipHigh: "Arms back by your sides" },
      { name: "Elbows", joint: "elbow", side: "camera", target: 175, tolerance: 20,
        tipLow: "Straighten your arms",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "camera", target: 178, tolerance: 15,
        tipLow: "Keep your legs straight",
        tipHigh: "" }
    ]
  },

  {
    id: "ardhabhujangasana",
    sanskrit: "Ardha Bhujangasana",
    english: "Half Cobra",
    level: "Easy",
    focus: "Back",
    group: "prone",
    holdKind: "steady",
    tint: "#E0ECF4",
    image: "images/ardhabhujangasana.svg",
    view: "side",
    camera: "Put the camera low, near the floor, and lie sideways to it.",
    safety: "Lift only as high as feels easy for your back. Skip it if you have back pain or are pregnant.",
    steps: [
      { text: "Lie on your stomach, sideways to the camera.",       waitFor: ["Legs on floor"] },
      { text: "Put your elbows under your shoulders, forearms down.", waitFor: [] },
      { text: "Lift your chest a little, keeping elbows bent.",     waitFor: ["Elbows", "Back"] },
      { text: "Keep your hips and legs on the floor.",              waitFor: ["Knees"] },
      { text: "Relax your shoulders and breathe.",                  waitFor: [] }
    ],
    // The gently lifted chest (back angle) IS this pose, so it counts 3 times.
    // How it differs from full Cobra (Bhujangasana, poses.js): the elbows stay
    // clearly BENT (about 90–130° here, Cobra about 160°) and the back is less
    // arched (about 155° here, Cobra about 130°).
    checks: [
      { name: "Legs on floor", joint: "legs", side: "camera", target: 0, tolerance: 20, weight: 2,
        tipLow: "",
        tipHigh: "Lie down on your stomach" },
      { name: "Back", joint: "hip", side: "camera", target: 155, tolerance: 15, weight: 3,
        tipLow: "Lower your chest a little",
        tipHigh: "Lift your chest a little" },
      { name: "Elbows", joint: "elbow", side: "camera", target: 110, tolerance: 30, weight: 2,
        tipLow: "Lift your chest a little",
        tipHigh: "Bend your elbows more" },
      { name: "Knees", joint: "knee", side: "camera", target: 178, tolerance: 15,
        tipLow: "Keep your legs straight",
        tipHigh: "" }
    ]
  }
);
