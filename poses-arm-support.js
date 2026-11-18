// =============================================================
// poses-arm-support.js — the ARM SUPPORT poses (the "On your hands" tab).
//
// Poses where your hands and arms hold up your body, like a plank.
// Put the camera LOW, near the floor, and turn sideways to it.
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
    id: "phalakasana",
    sanskrit: "Phalakasana",
    english: "Plank",
    level: "Medium",
    focus: "Core",
    group: "armsupport",
    holdKind: "steady",
    tint: "#E3EEF7",
    image: "images/phalakasana.webp",
    view: "side",
    camera: "Put the camera low, near the floor, and turn sideways to it.",
    safety: "Drop your knees to the floor whenever you need a rest. Skip it or go gently if your wrists, shoulders or back hurt.",
    steps: [
      { text: "Come onto your hands and knees, sideways to the camera.", waitFor: [] },
      { text: "Put your hands right under your shoulders.",            waitFor: ["Arms"] },
      { text: "Step your feet back and straighten your legs.",          waitFor: ["Knees"] },
      { text: "Make one straight line from your head to your heels.",   waitFor: ["Line", "Hips"] },
      { text: "Keep breathing slowly.",                                 waitFor: [] }
    ],
    // The straight, low body line IS this pose, so it counts 3 times.
    // "Both hands down": both arms point the same way (at the floor). This tells
    // Plank apart from Side Plank, where one arm points at the ceiling.
    checks: [
      { name: "Line", joint: "body", side: "camera", target: 20, tolerance: 15, weight: 3,
        tipLow: "",
        tipHigh: "Make one straight line" },
      { name: "Hips", joint: "hip", side: "camera", target: 178, tolerance: 15, weight: 2,
        tipLow: "Don't lift or drop your hips",
        tipHigh: "" },
      { name: "Arms", joint: "elbow", side: "camera", target: 178, tolerance: 15,
        tipLow: "Straighten your arms",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "camera", target: 178, tolerance: 15,
        tipLow: "Straighten your legs",
        tipHigh: "" },
      // Arms straight down to the floor make about 70° with the sloping body
      { name: "Hands under shoulders", joint: "shoulder", side: "camera", target: 72, tolerance: 20,
        tipLow: "Move your hands forward a little",
        tipHigh: "Move your hands back a little" },
      { name: "Both hands down", joint: "armsLine", side: "body", target: 0, tolerance: 25,
        tipLow: "",
        tipHigh: "Put both hands on the floor" }
    ]
  },

  {
    id: "chaturanga",
    sanskrit: "Chaturanga Dandasana",
    english: "Four-Limbed Staff",
    level: "Hard",
    focus: "Arms",
    group: "armsupport",
    // A very tiring pose: short holds are safer, so it uses the shorter "balance" times
    holdKind: "balance",
    tint: "#F6E6DA",
    image: "images/chaturanga.webp",
    view: "side",
    camera: "Put the camera low, near the floor, and turn sideways to it.",
    safety: "This is hard, so keep your knees down until you feel strong. Skip it if your wrists, elbows or shoulders hurt.",
    steps: [
      { text: "Start in Plank, sideways to the camera.",                waitFor: [] },
      { text: "Too hard? Keep your knees on the floor.",                waitFor: [] },
      { text: "Keep your elbows close to your body.",                   waitFor: [] },
      { text: "Bend your elbows and lower yourself halfway down.",      waitFor: ["Elbows"] },
      { text: "Keep your body straight, just above the floor.",         waitFor: ["Low line", "Hips"] }
    ],
    // The elbows bent to a right angle ARE this pose, so they count 3 times.
    // The knees-down option is only in the steps: the camera doesn't measure it.
    checks: [
      { name: "Elbows", joint: "elbow", side: "camera", target: 92, tolerance: 20, weight: 3,
        tipLow: "Push up a little",
        tipHigh: "Bend your elbows more" },
      { name: "Low line", joint: "body", side: "camera", target: 8, tolerance: 12, weight: 2,
        tipLow: "",
        tipHigh: "Lower your chest a little" },
      { name: "Hips", joint: "hip", side: "camera", target: 178, tolerance: 15, weight: 2,
        tipLow: "Don't lift or drop your hips",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "camera", target: 178, tolerance: 15,
        tipLow: "Straighten your legs",
        tipHigh: "" }
    ]
  },

  {
    id: "vasisthasana",
    sanskrit: "Vasisthasana",
    english: "Side Plank",
    level: "Hard",
    focus: "Core",
    group: "armsupport",
    holdKind: "balance",
    tint: "#E8E4F4",
    image: "images/vasisthasana.webp",
    view: "front",
    camera: "Put the camera low, near the floor. Face it with your chest.",
    safety: "Rest your bottom knee on the floor for an easier version. Skip it if your wrists or shoulders hurt.",
    steps: [
      { text: "Start in Plank with your chest facing the camera.",        waitFor: [] },
      { text: "Turn onto one hand and the side of your feet.",           waitFor: ["Bottom arm"] },
      { text: "Make one straight line from head to feet.",               waitFor: ["Line", "Knees"] },
      { text: "Reach your top arm up to the ceiling.",                   waitFor: ["Top arm"] },
      { text: "Later, do the other side too.",                           waitFor: [] }
    ],
    // The straight body line IS this pose, so it counts 3 times.
    // "Top arm": the two arms make one straight line, from the floor to the ceiling.
    // "Lying sideways": the body slopes low across the picture (not upright).
    // The shoulder is high on the straight arm, so when the hips sag the
    // shoulder-to-hip line gets STEEPER, and when the hips go too high it gets FLATTER.
    // "Line" can't tell which way the hips moved, so "Lying sideways" gives that tip.
    checks: [
      { name: "Line", joint: "hip", side: "both", target: 178, tolerance: 15, weight: 3,
        tipLow: "Make one straight line",
        tipHigh: "" },
      { name: "Lying sideways", joint: "body", side: "both", target: 30, tolerance: 18, weight: 2,
        tipLow: "Lower your hips a little",
        tipHigh: "Lift your hips a little" },
      { name: "Top arm", joint: "armsLine", side: "body", target: 180, tolerance: 25, weight: 2,
        tipLow: "Reach your top arm straight up",
        tipHigh: "" },
      { name: "Bottom arm", joint: "elbow", side: "both", target: 178, tolerance: 15,
        tipLow: "Straighten your {side} arm",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "both", target: 178, tolerance: 15,
        tipLow: "Straighten your legs",
        tipHigh: "" }
    ]
  }
);
