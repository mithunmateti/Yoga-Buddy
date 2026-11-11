// =============================================================
// poses-strength.js — the STRENGTH poses (the "Strength" tab on the home page).
//
// These poses make your arms, belly, back and legs strong:
// planks, Boat, Goddess, Bridge, Locust and Half Cobra.
// They use exactly the same format as poses.js (read the comments at the
// top of poses.js to see what every field means). This file just adds
// them to the same POSES list with POSES.push(…).
//
// Most of these poses are done on the floor, so they have a "camera" tip:
// put the camera low, near the floor, and turn sideways to it.
//
// Targets worked out from the test skeletons (tests/skeletons/strength.mjs)
// and usual alignment cues; NOT yet tested on real people. Please test them
// yourselves and change the numbers if a pose scores too low or too high.
// =============================================================

POSES.push(
  {
    id: "phalakasana",
    sanskrit: "Phalakasana",
    english: "Plank",
    level: "Medium",
    focus: "Core",
    group: "strength",
    holdKind: "steady",
    tint: "#E3EEF7",
    image: "images/phalakasana.svg",
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
    group: "strength",
    // A very tiring pose: short holds are safer, so it uses the shorter "balance" times
    holdKind: "balance",
    tint: "#F6E6DA",
    image: "images/chaturanga.svg",
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
    group: "strength",
    holdKind: "balance",
    tint: "#E8E4F4",
    image: "images/vasisthasana.svg",
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
  },

  {
    id: "navasana",
    sanskrit: "Navasana",
    english: "Boat",
    level: "Medium",
    focus: "Core",
    group: "strength",
    holdKind: "balance",
    tint: "#DDF0EE",
    image: "images/navasana.svg",
    view: "side",
    camera: "Put the camera low, near the floor, and sit sideways to it.",
    safety: "Keep your knees bent if your belly or back feels strained. Skip it if you have back pain or are pregnant.",
    steps: [
      { text: "Sit on the floor, sideways to the camera.",           waitFor: [] },
      { text: "Lean back a little and balance on your sit bones.",   waitFor: ["Lean back"] },
      { text: "Lift your feet off the floor, knees bent or straight.", waitFor: ["Legs up", "Knees"] },
      { text: "Make a V shape with your body and legs.",             waitFor: ["V shape"] },
      { text: "Reach your arms forward and breathe.",                waitFor: ["Arms"] }
    ],
    // The V shape (the angle at the hips) IS this pose, so it counts 3 times.
    // Knees can be bent (shins level with the floor, about 115–125°) or straight,
    // so the knee check is wide: it passes from 90° to 180°.
    checks: [
      { name: "V shape", joint: "hip", side: "camera", target: 80, tolerance: 20, weight: 3,
        tipLow: "Open your V a little",
        tipHigh: "Bring your legs and chest closer" },
      { name: "Lean back", joint: "body", side: "camera", target: 50, tolerance: 20, weight: 2,
        tipLow: "Sit up a little taller",
        tipHigh: "Lean back a little more" },
      { name: "Legs up", joint: "legs", side: "camera", target: 45, tolerance: 20, weight: 2,
        tipLow: "Lift your feet higher",
        tipHigh: "Lower your feet a little" },
      { name: "Knees", joint: "knee", side: "camera", target: 135, tolerance: 45,
        tipLow: "Straighten your legs a little",
        tipHigh: "" },
      { name: "Arms", joint: "shoulder", side: "camera", target: 50, tolerance: 25,
        tipLow: "Lift your arms a little",
        tipHigh: "Reach your arms forward, not up" }
    ]
  },

  {
    id: "utkatakonasana",
    sanskrit: "Utkata Konasana",
    english: "Goddess",
    level: "Medium",
    focus: "Legs",
    group: "strength",
    holdKind: "legs",
    tint: "#F8E3EC",
    image: "images/utkatakonasana.svg",
    view: "front",
    safety: "Only bend as deep as feels comfortable for your knees. Skip it or go gently if your knees or hips hurt.",
    steps: [
      { text: "Face the camera and step your feet wide apart.",       waitFor: ["Wide legs"] },
      { text: "Turn your toes out a little.",                         waitFor: [] },
      { text: "Bend your knees out over your toes.",                  waitFor: ["Knees"] },
      { text: "Lift your arms to shoulder height, elbows bent up.",   waitFor: ["Arms"] },
      { text: "Keep your back tall and breathe.",                     waitFor: [] }
    ],
    // The bent knees ARE this pose, so they count 3 times. "Wide legs" tells it
    // apart from Chair, and "Knees" on BOTH legs tells it apart from Warrior II.
    // Arms: "cactus" arms or arms straight forward both make about 90° at the
    // shoulder, so only the shoulder is measured (not the elbows).
    checks: [
      { name: "Knees", joint: "knee", side: "both", target: 105, tolerance: 25, weight: 3,
        tipLow: "Rise up a little",
        tipHigh: "Bend your {side} knee more" },
      { name: "Wide legs", joint: "legsApart", side: "body", target: 75, tolerance: 25, weight: 2,
        tipLow: "Step your feet wider apart",
        tipHigh: "Step your feet a little closer" },
      { name: "Arms", joint: "shoulder", side: "both", target: 90, tolerance: 25,
        tipLow: "Lift your {side} arm higher",
        tipHigh: "Lower your {side} arm a little" }
    ]
  },

  {
    id: "setubandhasana",
    sanskrit: "Setu Bandhasana",
    english: "Bridge",
    level: "Easy",
    focus: "Back",
    group: "strength",
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
  },

  {
    id: "salabhasana",
    sanskrit: "Salabhasana",
    english: "Locust",
    level: "Medium",
    focus: "Back",
    group: "strength",
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
    group: "strength",
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
