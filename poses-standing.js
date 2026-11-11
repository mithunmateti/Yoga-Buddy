// =============================================================
// poses-standing.js — 6 more STANDING poses for Yoga Buddy.
//
// They add themselves to the POSES list from poses.js (so this file must
// load AFTER poses.js) and show up on the "Standing" tab of the home page
// because of group: "standing". The format is explained at the top of
// poses.js. (Warrior II and Chair are already in poses.js.)
//
// Targets worked out from the test skeleton (tests/skeletons/standing.mjs)
// and usual alignment cues; NOT yet tested on real people. Please test them
// yourselves and change the numbers if a pose scores too low or too high.
//
// Triangle, Warrior I, Pyramid, Half Moon and Eagle can be done on either
// side, so they never say "left" or "right": they use the "bent"/"straight"
// leg, or checks that are the same on both sides.
// =============================================================

POSES.push(
  // ---------------------------------------------------------------
  // WARRIOR I: front knee bent, back leg straight, arms up.
  // ---------------------------------------------------------------
  {
    id: "virabhadrasana1",
    sanskrit: "Virabhadrasana I",
    english: "Warrior I",
    level: "Medium",
    focus: "Legs",
    group: "standing",
    holdKind: "steady",             // like Warrior II in hold-time.js
    tint: "#F6E3D6",
    image: "images/virabhadrasana1.svg",
    view: "side",
    safety: "Go gently if your knees, hips or back hurt. Keep the front knee over the ankle, not past the toes. If your shoulders are stiff, or you have high blood pressure or a heart problem, keep your hands on your hips.",
    steps: [
      { text: "Step one foot back, back toes turned out a little.",   waitFor: ["Legs apart"] },
      { text: "Bend your front knee over your ankle.",                waitFor: ["Front knee"] },
      { text: "Keep your back leg straight and strong.",              waitFor: ["Back knee"] },
      { text: "Turn your hips to face forward.",                      waitFor: [] },
      { text: "Reach both arms straight up beside your ears.",        waitFor: ["Arms", "Upright"] },
      { text: "Later, do the other side too.",                        waitFor: [] }
    ],
    // From the skeleton: front knee 102°, back knee 180°, arms 180°,
    // legs about 100° apart (one forward, one back), body 90° steep (upright).
    // The bent front knee IS this pose, so it counts 3 times.
    // "Upright" tells it apart from a lunge that leans forward.
    checks: [
      { name: "Front knee", joint: "knee", side: "bent", target: 100, tolerance: 20, weight: 3,
        tipLow: "Bend your front knee less",
        tipHigh: "Bend your front knee more" },
      { name: "Back knee", joint: "knee", side: "straight", target: 180, tolerance: 20,
        tipLow: "Straighten your back leg",
        tipHigh: "" },
      { name: "Legs apart", joint: "legsApart", side: "body", target: 95, tolerance: 25,
        tipLow: "Take a bigger step back",
        tipHigh: "Take a smaller step" },
      { name: "Arms", joint: "shoulder", side: "both", target: 170, tolerance: 20, weight: 2,
        tipLow: "Reach your {side} arm higher",
        tipHigh: "" },
      { name: "Upright", joint: "body", side: "both", target: 85, tolerance: 15,
        tipLow: "Lift your chest up tall",
        tipHigh: "" }
    ]
  },

  // ---------------------------------------------------------------
  // TRIANGLE: wide straight legs, lean over the front leg, arms in a line.
  // ---------------------------------------------------------------
  {
    id: "trikonasana",
    sanskrit: "Trikonasana",
    english: "Triangle",
    level: "Easy",
    focus: "Side stretch",
    group: "standing",
    holdKind: "steady",
    tint: "#E3EEF8",
    image: "images/trikonasana.svg",
    view: "front",
    safety: "Only lean as far as feels comfortable; a hand on the shin is fine. Go gently if your back, hips or neck hurt, and look forward instead of up if your neck is sore.",
    steps: [
      { text: "Face the camera and step your feet wide apart.",     waitFor: ["Legs apart", "Knees"] },
      { text: "Stretch your arms out at shoulder height.",           waitFor: ["Arms in a line"] },
      { text: "Turn one foot out and lean over that leg.",          waitFor: ["Lean"] },
      { text: "Rest your lower hand on your shin.",                  waitFor: [] },
      { text: "Reach your top arm straight up to the sky.",         waitFor: ["Arms in a line"] },
      { text: "Later, do the other side too.",                       waitFor: [] }
    ],
    // From the skeleton: knees 180°, legs 76° apart, each leg about 52° steep,
    // arms 180° (one straight line), body leaning 18° (lower side) to 47°
    // (upper side) steep. Standing up straight would be 90°.
    // "Leg slope" makes sure both feet are on the floor (in Half Moon one
    // leg is lifted level instead).
    checks: [
      { name: "Legs apart", joint: "legsApart", side: "body", target: 75, tolerance: 20, weight: 2,
        tipLow: "Step your feet wider apart",
        tipHigh: "Bring your feet a little closer" },
      { name: "Leg slope", joint: "legs", side: "both", target: 55, tolerance: 20,
        tipLow: "Bring your feet a little closer",
        tipHigh: "Step your feet wider apart" },
      { name: "Knees", joint: "knee", side: "both", target: 180, tolerance: 20,
        tipLow: "Straighten your {side} leg",
        tipHigh: "" },
      { name: "Arms in a line", joint: "armsLine", side: "body", target: 180, tolerance: 20, weight: 2,
        tipLow: "Make one straight line with arms",
        tipHigh: "" },
      { name: "Lean", joint: "body", side: "both", target: 30, tolerance: 30, weight: 3,
        tipLow: "Lift your chest a little",
        tipHigh: "Lean further over your leg" }
    ]
  },

  // ---------------------------------------------------------------
  // STANDING FORWARD BEND: fold down from the hips.
  // ---------------------------------------------------------------
  {
    id: "uttanasana",
    sanskrit: "Uttanasana",
    english: "Standing Forward Bend",
    level: "Easy",
    focus: "Hamstrings",
    group: "standing",
    holdKind: "steady",
    tint: "#E8F2E1",
    image: "images/uttanasana.svg",
    view: "side",
    safety: "Bend your knees as much as you need. Skip it or go gently if you have back pain, feel dizzy, are pregnant or have high blood pressure. Come up slowly.",
    steps: [
      { text: "Stand sideways to the camera, feet together.",       waitFor: ["Feet together"] },
      { text: "Put your hands on your hips.",                        waitFor: [] },
      { text: "Fold forward slowly from your hips.",                 waitFor: ["Fold"] },
      { text: "Let your hands reach your shins or the floor.",       waitFor: [] },
      { text: "Soften your knees if you need, and breathe.",         waitFor: [] }
    ],
    // From the skeleton: hips folded to 40°, knees 176°, legs 83° steep
    // (standing), feet about 0° apart.
    // The fold at the hips IS this pose, so it counts 3 times.
    // Soft, bent knees are fine (the safety note says so), so "Knees" accepts
    // about 125–185°. A real squat (about 90°) still fails it.
    // "Standing legs" tells it apart from a SITTING forward bend, which has
    // the same fold but flat legs. "Feet together" tells it apart from Pyramid.
    checks: [
      { name: "Fold", joint: "hip", side: "camera", target: 40, tolerance: 30, weight: 3,
        tipLow: "",
        tipHigh: "Fold forward from your hips" },
      { name: "Knees", joint: "knee", side: "camera", target: 155, tolerance: 30,
        tipLow: "Straighten your legs a little",
        tipHigh: "" },
      { name: "Standing legs", joint: "legs", side: "camera", target: 85, tolerance: 15,
        tipLow: "Stand up on your feet",
        tipHigh: "" },
      { name: "Feet together", joint: "legsApart", side: "body", target: 5, tolerance: 15,
        tipLow: "",
        tipHigh: "Bring your feet together" }
    ]
  },

  // ---------------------------------------------------------------
  // PYRAMID: one foot forward, one back, fold over the front leg.
  // ---------------------------------------------------------------
  {
    id: "parsvottanasana",
    sanskrit: "Parsvottanasana",
    english: "Pyramid",
    level: "Medium",
    focus: "Hamstrings",
    group: "standing",
    holdKind: "steady",
    tint: "#F3E6F2",
    image: "images/parsvottanasana.svg",
    view: "side",
    safety: "Keep a small bend in the front knee if the back of the leg pulls. Skip it or go gently if you have back pain, feel dizzy, are pregnant or have high blood pressure.",
    steps: [
      { text: "Stand sideways and step one foot back, toes turned out a little.", waitFor: ["Legs apart"] },
      { text: "Keep both legs straight, hips facing forward.",         waitFor: ["Knees"] },
      { text: "Fold forward over your front leg with a long back.",   waitFor: ["Fold"] },
      { text: "Rest your hands on your shin or the floor.",           waitFor: ["Arms down"] },
      { text: "Later, do the other side too.",                         waitFor: [] }
    ],
    // From the skeleton: legs 62° apart (one forward, one back), knees 180°,
    // body 9° steep (a flat back; standing up would be 90°),
    // both arms pointing the same way, down (0°). That stays 0° however deep
    // you fold, while Triangle and Half Moon have the arms in a line (180°).
    // The fold IS this pose, so it counts 3 times.
    // The body slope is the same on both sides, so it works whichever leg
    // is in front and whichever side faces the camera.
    checks: [
      { name: "Legs apart", joint: "legsApart", side: "body", target: 60, tolerance: 20, weight: 2,
        tipLow: "Take a bigger step back",
        tipHigh: "Take a smaller step" },
      { name: "Knees", joint: "knee", side: "both", target: 180, tolerance: 20,
        tipLow: "Straighten your {side} leg",
        tipHigh: "" },
      { name: "Fold", joint: "body", side: "camera", target: 25, tolerance: 35, weight: 3,
        tipLow: "",
        tipHigh: "Fold over your front leg" },
      { name: "Arms down", joint: "armsLine", side: "body", target: 0, tolerance: 30,
        tipLow: "",
        tipHigh: "Bring both hands down" }
    ]
  },

  // ---------------------------------------------------------------
  // HALF MOON: balance on one straight leg, body and other leg level.
  // ---------------------------------------------------------------
  {
    id: "ardhachandrasana",
    sanskrit: "Ardha Chandrasana",
    english: "Half Moon",
    level: "Hard",
    focus: "Balance",
    group: "standing",
    holdKind: "balance",
    tint: "#FBF0D4",
    image: "images/ardhachandrasana.svg",
    view: "front",
    camera: "Leave plenty of room on both sides of you; this pose is wide.",
    safety: "Use a block, a thick book or a chair under your hand, and stand near a wall. Skip it or go gently if your balance is unsteady, or your hips, knees or back hurt. Look down or forward if your neck is sore.",
    steps: [
      { text: "Face the camera, lean over one leg like Triangle.",     waitFor: [] },
      { text: "Bend that knee, hand on a block ahead.",                waitFor: [] },
      { text: "Straighten your standing leg as the back leg lifts.",   waitFor: ["Leg lift", "Knees"] },
      { text: "Keep your body level, like a table top.",              waitFor: ["Level body"] },
      { text: "Reach your top arm straight up.",                       waitFor: ["Arms in a line"] },
      { text: "Later, do the other side too.",                         waitFor: [] }
    ],
    // From the skeleton: legs 90° apart (one down, one level), knees 180°,
    // body 9° steep (level), arms 180° (one straight line, one down, one up).
    // The lifted leg IS this pose, so it counts 3 times.
    checks: [
      { name: "Leg lift", joint: "legsApart", side: "body", target: 90, tolerance: 20, weight: 3,
        tipLow: "Lift your back leg higher",
        tipHigh: "Lower your lifted leg a little" },
      { name: "Knees", joint: "knee", side: "both", target: 180, tolerance: 20,
        tipLow: "Straighten your {side} leg",
        tipHigh: "" },
      { name: "Level body", joint: "body", side: "both", target: 10, tolerance: 20, weight: 2,
        tipLow: "",
        tipHigh: "Lean your body more level" },
      { name: "Arms in a line", joint: "armsLine", side: "body", target: 180, tolerance: 25,
        tipLow: "Reach your top arm straight up",
        tipHigh: "" }
    ]
  },

  // ---------------------------------------------------------------
  // EAGLE: knees bent, legs wrapped, arms wrapped at shoulder height.
  // ---------------------------------------------------------------
  {
    id: "garudasana",
    sanskrit: "Garudasana",
    english: "Eagle",
    level: "Hard",
    focus: "Balance",
    group: "standing",
    holdKind: "balance",
    tint: "#E0F1EF",
    image: "images/garudasana.svg",
    view: "front",
    safety: "Stand near a wall or chair. If wrapping is hard, just cross your thigh and rest the toes on the floor. Go gently if your knees or shoulders hurt.",
    steps: [
      { text: "Face the camera and bend your knees a little.",        waitFor: ["Standing knee"] },
      { text: "Cross one thigh over the other.",                       waitFor: ["Wrapped knee", "Crossed legs"] },
      { text: "Hook the foot behind your calf, or rest your toes.",   waitFor: [] },
      { text: "Cross your arms and bend your elbows up.",             waitFor: ["Elbows"] },
      { text: "Lift your elbows to shoulder height, sit tall.",       waitFor: ["Upper arms", "Upright"] },
      { text: "Later, do the other side too.",                         waitFor: [] }
    ],
    // From the skeleton: standing knee 116°, wrapped knee 100°, elbows 90°,
    // upper arms 91–95° from the body (shoulder height), body 74° steep
    // (the body leans forward a little as the hips sit back).
    // The crossed limbs hide each other from the camera, so we only check
    // what can be measured (knee bend, elbow bend, arm height, upright body),
    // and accept less sure points for the wrapped leg and the arms.
    // "Crossed legs": the wrapped foot ends up on the other side, so the two
    // hip-to-ankle lines cross at about 25°. Feet hip-width apart (a chair)
    // gives 0°, so this tells a real wrap apart from a small squat.
    checks: [
      { name: "Standing knee", joint: "knee", side: "straight", target: 130, tolerance: 25, weight: 2,
        tipLow: "Rise up a little",
        tipHigh: "Bend your standing knee more" },
      { name: "Wrapped knee", joint: "knee", side: "bent", target: 100, tolerance: 30, minVisibility: 0.2,
        tipLow: "",
        tipHigh: "Cross your thigh over higher" },
      { name: "Crossed legs", joint: "legsApart", side: "body", target: 25, tolerance: 15, weight: 2, minVisibility: 0.2,
        tipLow: "Cross your thigh over more",
        tipHigh: "Bring your legs closer" },
      { name: "Elbows", joint: "elbow", side: "both", target: 90, tolerance: 30, minVisibility: 0.3,
        tipLow: "Open your elbows a little",
        tipHigh: "Bend your {side} elbow more" },
      { name: "Upper arms", joint: "shoulder", side: "both", target: 90, tolerance: 25, weight: 2, minVisibility: 0.3,
        tipLow: "Lift your {side} elbow higher",
        tipHigh: "Lower your {side} elbow a little" },
      { name: "Upright", joint: "body", side: "both", target: 75, tolerance: 15,
        tipLow: "Sit up a little taller",
        tipHigh: "" }
    ]
  }
);
