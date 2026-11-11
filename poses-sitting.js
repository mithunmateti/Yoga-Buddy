// =============================================================
// poses-sitting.js — the SITTING poses (the "Sitting" tab on the home page).
//
// 6 poses on the floor and 2 chair-yoga poses. The chair poses are for
// older people, or anyone who finds getting down to the floor hard.
// Each pose adds itself to the POSES list from poses.js (see the notes at
// the top of poses.js for what every field means).
//
// Sitting poses need the camera LOW: about as high as your chest when you
// sit, and about 2 metres away, so it can see your hips, knees and feet.
//
// Useful numbers for sitting (see pose-check.js):
//   "body" steepness about 80–85 = back upright, smaller = leaning forward.
//                         (It never quite reaches 90, because your shoulders
//                         are wider than your hips, so each shoulder-to-hip
//                         line leans in a little.)
//   "legs" steepness 0  = legs flat on the floor. On a chair it is about 45
//                         (thighs level, shins upright). Standing is 90.
//   "hip" angle: 90 = sitting up tall, smaller = folding forward.
//
// Targets worked out from the test skeletons (tests/skeletons/sitting.mjs)
// and usual alignment cues; NOT yet tested on real people. Please test
// them yourselves and change the numbers if a pose scores too low or high.
// =============================================================

POSES.push(
  {
    id: "sukhasana",
    sanskrit: "Sukhasana",
    english: "Easy",
    level: "Easy",
    focus: "Calm",
    group: "sitting",
    holdKind: "steady",
    tint: "#EFE8F6",
    image: "images/sukhasana.svg",
    view: "front",
    camera: "Put the camera low, about chest height when you sit, and 2 metres away.",
    safety: "Sit on a folded blanket if your hips or knees feel tight. If your knees hurt, stretch your legs out or sit on a chair instead.",
    steps: [
      { text: "Sit on the floor, facing the camera.",               waitFor: [] },
      { text: "Cross your legs, each foot under the other knee.",   waitFor: ["Legs on floor", "Knees"] },
      { text: "Let your knees relax down.",                         waitFor: ["Hips"] },
      { text: "Sit up tall and rest your hands on your knees.",     waitFor: ["Back"] },
      { text: "Relax your shoulders and breathe slowly.",           waitFor: [] }
    ],
    // The tall back IS this pose, so it counts 3 times.
    // "Legs on floor" tells it apart from standing and from chair sitting.
    // "Hips" (shoulder–hip–knee about 85°) means the knees are low and out
    // to the sides, which tells it apart from the twist, where one knee is up.
    checks: [
      { name: "Back", joint: "body", side: "both", target: 82, tolerance: 15, weight: 3,
        tipLow: "Sit up tall",
        tipHigh: "" },
      { name: "Legs on floor", joint: "legs", side: "both", target: 5, tolerance: 20, weight: 2,
        tipLow: "",
        tipHigh: "Sit down and cross your legs" },
      { name: "Knees", joint: "knee", side: "both", target: 55, tolerance: 25,
        tipLow: "Move your feet a little forward",
        tipHigh: "Cross your legs more" },
      { name: "Hips", joint: "hip", side: "both", target: 85, tolerance: 20,
        tipLow: "Let your knees relax down",
        tipHigh: "Lean forward a tiny bit" }
    ]
  },

  {
    id: "dandasana",
    sanskrit: "Dandasana",
    english: "Staff",
    level: "Easy",
    focus: "Posture",
    group: "sitting",
    holdKind: "steady",
    tint: "#E3F0EC",
    image: "images/dandasana.svg",
    view: "side",
    camera: "Put the camera low, about chest height when you sit, and 2 metres away.",
    safety: "If your back rounds or your hamstrings feel tight, sit on a folded blanket and bend your knees a little. Skip it if your lower back hurts.",
    steps: [
      { text: "Sit on the floor, sideways to the camera.",            waitFor: [] },
      { text: "Stretch both legs straight out in front, feet together.", waitFor: ["Legs on floor", "Knees"] },
      { text: "Put your hands on the floor beside your hips.",         waitFor: [] },
      { text: "Sit up tall, like a straight stick.",                   waitFor: ["Back", "Hips"] },
      { text: "Point your toes up and breathe slowly.",                waitFor: [] }
    ],
    // The tall back with straight legs IS this pose: the back counts 3 times.
    // The knees may bend a little (down to about 150°), as the safety note says.
    checks: [
      { name: "Back", joint: "body", side: "camera", target: 82, tolerance: 15, weight: 3,
        tipLow: "Sit up tall",
        tipHigh: "" },
      { name: "Hips", joint: "hip", side: "camera", target: 90, tolerance: 15, weight: 2,
        tipLow: "Lift your chest up",
        tipHigh: "Lean forward a tiny bit" },
      { name: "Knees", joint: "knee", side: "both", target: 175, tolerance: 25, weight: 2,
        tipLow: "Straighten your legs a little",
        tipHigh: "" },
      { name: "Legs on floor", joint: "legs", side: "camera", target: 0, tolerance: 15,
        tipLow: "",
        tipHigh: "Rest your legs on the floor" }
    ]
  },

  {
    id: "vajrasana",
    sanskrit: "Vajrasana",
    english: "Thunderbolt",
    level: "Easy",
    focus: "Digestion",
    group: "sitting",
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
  },

  {
    id: "paschimottanasana",
    sanskrit: "Paschimottanasana",
    english: "Seated Forward Bend",
    level: "Medium",
    focus: "Back stretch",
    group: "sitting",
    holdKind: "steady",
    tint: "#E2ECF7",
    image: "images/paschimottanasana.svg",
    view: "side",
    camera: "Put the camera low, about chest height when you sit, and 2 metres away.",
    safety: "Fold only as far as feels comfortable and bend your knees if you need to. Skip it if you have a back injury or sciatica, or if you are pregnant.",
    steps: [
      { text: "Sit sideways to the camera, legs straight in front.",  waitFor: ["Legs on floor"] },
      { text: "Breathe in and stretch your arms up.",                 waitFor: [] },
      { text: "Breathe out and fold forward from your hips.",         waitFor: ["Fold"] },
      { text: "Reach toward your shins or feet.",                     waitFor: ["Knees"] },
      { text: "Keep your back long and breathe slowly.",              waitFor: [] }
    ],
    // The forward fold (small hip angle) IS this pose: 3 times.
    // Beginners rarely reach their feet, so a fold anywhere from about 20°
    // to 70° counts, and soft knees (down to about 140°) count too,
    // so bending the knees, as the safety note says, is not marked wrong.
    checks: [
      { name: "Fold", joint: "hip", side: "camera", target: 45, tolerance: 25, weight: 3,
        tipLow: "Lift your chest a little",
        tipHigh: "Fold forward a little more" },
      { name: "Knees", joint: "knee", side: "both", target: 170, tolerance: 30,
        tipLow: "Straighten your legs a little",
        tipHigh: "" },
      { name: "Legs on floor", joint: "legs", side: "camera", target: 0, tolerance: 15, weight: 2,
        tipLow: "",
        tipHigh: "Rest your legs on the floor" }
    ]
  },

  {
    id: "janusirsasana",
    sanskrit: "Janu Sirsasana",
    english: "Head-to-Knee",
    level: "Medium",
    focus: "Hamstrings",
    group: "sitting",
    holdKind: "steady",
    tint: "#E8F3E1",
    image: "images/janusirsasana.svg",
    view: "side",
    camera: "Put the camera low, about chest height when you sit, and 2 metres away.",
    safety: "Never force your head down to the knee; fold only as far as is comfortable. If the bent knee hurts or floats up, put a cushion under it, or skip this pose. Go gently with a back injury.",
    steps: [
      { text: "Sit sideways to the camera, legs straight in front.",   waitFor: [] },
      { text: "Bend one knee, sole against your straight leg's inner thigh.",  waitFor: ["Bent knee", "Straight knee"] },
      { text: "Breathe in and sit up tall.",                           waitFor: [] },
      { text: "Breathe out and fold over your straight leg.",          waitFor: ["Fold"] },
      { text: "Later, do the other side too.",                         waitFor: [] }
    ],
    // One leg straight, one bent: either side is fine ("bent"/"straight").
    // The fold over the straight leg IS this pose: 3 times.
    checks: [
      { name: "Fold", joint: "hip", side: "straight", target: 50, tolerance: 25, weight: 3,
        tipLow: "Lift your chest a little",
        tipHigh: "Fold over your straight leg" },
      { name: "Bent knee", joint: "knee", side: "bent", target: 35, tolerance: 30, weight: 2,
        tipLow: "",
        tipHigh: "Bring your foot to your thigh" },
      { name: "Straight knee", joint: "knee", side: "straight", target: 170, tolerance: 20,
        tipLow: "Straighten your front leg",
        tipHigh: "" },
      { name: "Legs on floor", joint: "legs", side: "straight", target: 0, tolerance: 15,
        tipLow: "",
        tipHigh: "Rest your leg on the floor" }
    ]
  },

  {
    id: "ardhamatsyendrasana",
    sanskrit: "Ardha Matsyendrasana",
    english: "Half Spinal Twist",
    level: "Medium",
    focus: "Spine twist",
    group: "sitting",
    holdKind: "steady",
    tint: "#F7E3E8",
    image: "images/ardhamatsyendrasana.svg",
    view: "front",
    camera: "Put the camera low, about chest height when you sit, and 2 metres away.",
    safety: "Twist gently and only as far as is comfortable, keeping your back tall. Skip it if you have a back or disc problem, or if you are pregnant.",
    steps: [
      { text: "Sit facing the camera with your legs in front.",            waitFor: [] },
      { text: "Fold one leg on the floor, heel near your hip.",            waitFor: [] },
      { text: "Put your other foot on the floor outside that knee.",       waitFor: ["Knees"] },
      { text: "Sit tall, then gently turn toward your raised knee.",       waitFor: ["Back", "Twist"] },
      { text: "Hug the knee and breathe slowly.",                          waitFor: [] },
      { text: "Later, do the other side too.",                             waitFor: [] }
    ],
    // The turn of the shoulders compared with the hips IS this pose: 3 times.
    // "twist" needs MediaPipe's 3D points. A gentle 20° turn already counts.
    // "Back" wants about 78, not 82: when the shoulders turn, each shoulder
    // moves forward or back of its hip, so the line leans even when the back
    // is upright. "Knees" is the raised leg (the less bent one, "straight");
    // "Folded knee" is the leg folded on the floor, which is much tighter.
    checks: [
      { name: "Twist", joint: "twist", side: "body", target: 40, tolerance: 20, weight: 3,
        tipLow: "Turn a little more",
        tipHigh: "Turn back a little" },
      { name: "Back", joint: "body", side: "both", target: 78, tolerance: 15, weight: 2,
        tipLow: "Sit up tall",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "straight", target: 60, tolerance: 25,
        tipLow: "Move your foot a little forward",
        tipHigh: "Bring your knee closer to you" },
      { name: "Folded knee", joint: "knee", side: "bent", target: 35, tolerance: 30,
        tipLow: "",
        tipHigh: "Fold your bottom leg in more" }
    ]
  },

  {
    id: "chairraisedarms",
    sanskrit: "Urdhva Hastasana (chair)",
    english: "Chair Raised Arms",
    level: "Easy",
    focus: "Chair yoga",
    group: "sitting",
    holdKind: "steady",
    tint: "#FBF0D9",
    image: "images/chairraisedarms.svg",
    view: "side",
    camera: "Use a steady chair without wheels. Put the camera about chest height when you sit, 2 metres away.",
    safety: "Use a steady chair without wheels. Raise your arms only as high as is comfortable; keep them lower if your shoulders hurt.",
    steps: [
      { text: "Sit tall on a chair, sideways to the camera.",       waitFor: ["Back"] },
      { text: "Put your feet flat, knees over your ankles.",        waitFor: ["Knees", "On the chair"] },
      { text: "Breathe in and raise your arms up.",                 waitFor: ["Arms"] },
      { text: "Keep your shoulders soft and breathe slowly.",       waitFor: [] }
    ],
    // CHAIR YOGA. The raised arms ARE this pose: 3 times.
    // "On the chair": hip-to-ankle is about 45° on a chair (thighs level,
    // shins upright). Standing is 90, and in Utkatasana (no chair) the hips
    // are higher, about 60°, so this tells them apart.
    checks: [
      { name: "Arms", joint: "shoulder", side: "camera", target: 170, tolerance: 20, weight: 3,
        tipLow: "Reach your arms up higher",
        tipHigh: "" },
      { name: "Back", joint: "body", side: "camera", target: 82, tolerance: 15,
        tipLow: "Sit up tall",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "both", target: 90, tolerance: 20, weight: 2,
        tipLow: "Move your feet a little forward",
        tipHigh: "Bring your feet under your knees" },
      { name: "On the chair", joint: "legs", side: "both", target: 45, tolerance: 12,
        tipLow: "Bring your feet under your knees",
        tipHigh: "Sit down on the chair" }
    ]
  },

  {
    id: "chairforwardbend",
    sanskrit: "Uttanasana (chair)",
    english: "Chair Forward Bend",
    level: "Easy",
    focus: "Chair yoga",
    group: "sitting",
    holdKind: "steady",
    tint: "#E0EEF0",
    image: "images/chairforwardbend.svg",
    view: "side",
    camera: "Use a steady chair without wheels. Put the camera about chest height when you sit, 2 metres away.",
    safety: "Use a steady chair without wheels and come up slowly. Skip it if you have a back injury, glaucoma or high blood pressure, or feel dizzy.",
    steps: [
      { text: "Sit on a chair, sideways to the camera.",            waitFor: [] },
      { text: "Put your feet flat and a little apart.",             waitFor: ["Knees", "On the chair"] },
      { text: "Breathe out and fold forward over your thighs.",     waitFor: ["Fold"] },
      { text: "Let your hands hang toward the floor.",              waitFor: [] },
      { text: "Breathe slowly, then come up slowly.",               waitFor: [] }
    ],
    // CHAIR YOGA. The forward fold IS this pose: 3 times.
    checks: [
      { name: "Fold", joint: "hip", side: "camera", target: 40, tolerance: 25, weight: 3,
        tipLow: "Lift your chest a little",
        tipHigh: "Fold forward over your thighs" },
      { name: "Knees", joint: "knee", side: "both", target: 90, tolerance: 20, weight: 2,
        tipLow: "Move your feet a little forward",
        tipHigh: "Bring your feet under your knees" },
      { name: "On the chair", joint: "legs", side: "both", target: 45, tolerance: 12,
        tipLow: "Bring your feet under your knees",
        tipHigh: "Sit down on the chair" }
    ]
  }
);
