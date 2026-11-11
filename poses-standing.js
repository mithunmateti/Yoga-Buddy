// =============================================================
// poses-standing.js — the STANDING poses (the "Standing" tab).
//
// Poses done standing on your feet. The order and the levels follow chapter 4
// ("Standing Poses") of Yoga Anatomy by Leslie Kaminoff and Amy Matthews
// (2007): "bookPage" is the page each pose is on. Standing poses have the
// highest centre of gravity of all, so balancing them takes effort, and the
// book says their lessons help every other pose.
//
// Tadasana, Tree, Warrior II and Chair are in poses.js too (they are also
// Basic Asanas), so they show on the Standing tab AND the Basic tab.
//
// Poses done on one side (Triangle, the Warriors, the balances…) never say
// "left" or "right": they use the "bent"/"straight" leg, or checks that are
// the same on both sides, so you can start with either leg.
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
  // ---------------------------------------------------------------
  // WARRIOR I: front knee bent, back leg straight, arms up.
  // ---------------------------------------------------------------
  {
    id: "virabhadrasana1",
    bookPage: 54,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Virabhadrasana I",
    english: "Warrior I",
    level: "Easy",
    focus: "Gentle backbend",
    group: "standing",
    holdKind: "steady",             // like Warrior II in hold-time.js
    tint: "#F6E3D6",
    image: "images/virabhadrasana1.svg",
    view: "side",
    safety: "Go gently if your knees, hips or back hurt. Keep the front knee over the ankle, not past the toes. If your shoulders are stiff, or you have high blood pressure or a heart problem, keep your hands on your hips. Keep your back heel down. Go gently if the bottom of your back (where it meets the hips) hurts.",
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
    bookPage: 66,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Trikonasana",
    english: "Triangle",
    level: "Easy",
    focus: "Hip opener",
    group: "standing",
    holdKind: "steady",
    tint: "#E3EEF8",
    image: "images/trikonasana.svg",
    view: "front",
    safety: "Only lean as far as feels comfortable; a hand on the shin is fine. Go gently if your back, hips or neck hurt, and look forward instead of up if your neck is sore. Keep your front knee soft, not pushed back, and stop if you feel anything inside the knee.",
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
    bookPage: 42,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Uttanasana",
    english: "Standing Forward Bend",
    level: "Easy",
    focus: "Forward bend",
    group: "standing",
    holdKind: "steady",
    tint: "#E8F2E1",
    image: "images/uttanasana.svg",
    view: "side",
    safety: "Bend your knees as much as you need. Skip it or go gently if you have back pain, feel dizzy, are pregnant or have high blood pressure. Come up slowly. If you have a back injury or weak bones (osteoporosis), fold only a little at first. With high blood pressure, stay only while your breathing is easy. With low blood pressure, come up very slowly.",
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
    bookPage: 70,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Parsvottanasana",
    english: "Pyramid",
    level: "Easy",
    focus: "Forward bend",
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
    bookPage: 50,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Garudasana",
    english: "Eagle",
    level: "Hard",
    focus: "Balance",
    group: "standing",
    holdKind: "balance",
    tint: "#E0F1EF",
    image: "images/garudasana.svg",
    view: "front",
    safety: "Stand near a wall or chair. If wrapping is hard, just cross your thigh and rest the toes on the floor. Go gently if your knees or shoulders hurt. Never force the wrap: if your hips are tight, the knees get twisted instead.",
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
  },

  {
    id: "utkatakonasana",
    sanskrit: "Utkata Konasana",
    english: "Goddess",
    level: "Medium",
    focus: "Legs",
    group: "standing",
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
  // ---------------------------------------------------------------
  // EXTENDED HAND-TO-BIG-TOE: stand on one leg, the other leg lifted
  // straight out in front. (Book: an intermediate one-sided balance.)
  // ---------------------------------------------------------------
  {
    id: "utthitahastapadangusthasana",
    bookPage: 44,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Utthita Hasta Padangusthasana",
    english: "Hand-to-Big-Toe",
    level: "Medium",
    focus: "Balance",
    group: "standing",
    holdKind: "balance",
    tint: "#E8F0E0",
    image: "images/utthitahastapadangusthasana.svg",
    view: "side",
    safety: "Bend the lifted knee if the back of your leg is tight, so your back can stay tall. You can hold your knee or use a strap instead of your toe. Stand near a wall if your balance is unsteady.",
    steps: [
      { text: "Stand tall, sideways to the camera.",                  waitFor: ["Upright"] },
      { text: "Put one hand on your hip.",                           waitFor: [] },
      { text: "Lift your other knee and hold your big toe.",         waitFor: [] },
      { text: "Stretch that leg forward, as far as is comfortable.", waitFor: ["Leg lift"] },
      { text: "Keep your back tall. Bend the knee if you need.",     waitFor: ["Upright", "Standing leg"] },
      { text: "Later, do the other side too.",                       waitFor: [] }
    ],
    // The angle between the two legs is what makes this pose (about 90° with
    // the leg at hip height), so it counts 3 times. The lifted knee may bend:
    // the book says that is better than rounding the back.
    checks: [
      { name: "Standing leg", joint: "knee", side: "straight", target: 175, tolerance: 15,
        tipLow: "Straighten your standing leg",
        tipHigh: "" },
      { name: "Leg lift", joint: "legsApart", side: "body", target: 85, tolerance: 25, weight: 3,
        tipLow: "Lift your leg a little higher",
        tipHigh: "Lower your leg a little" },
      { name: "Lifted knee", joint: "knee", side: "bent", target: 170, tolerance: 35,
        tipLow: "Straighten your lifted leg a little",
        tipHigh: "" },
      { name: "Upright", joint: "body", side: "both", target: 81, tolerance: 12, weight: 2,
        tipLow: "Stand up tall",
        tipHigh: "" }
    ]
  },

  // ---------------------------------------------------------------
  // KING OF THE DANCERS: stand on one leg, hold the other foot behind
  // you, tip forward and reach. (Book: an advanced backbending balance.)
  // ---------------------------------------------------------------
  {
    id: "natarajasana",
    bookPage: 52,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Natarajasana",
    english: "King of the Dancers",
    level: "Hard",
    focus: "Balance backbend",
    group: "standing",
    holdKind: "balance",
    tint: "#F6E3EC",
    image: "images/natarajasana.svg",
    view: "side",
    safety: "This is a hard balance: hold it for a few quiet breaths only. Don't pull hard on your foot, which can strain your knee and lower back; a strap around the foot helps. Stand near a wall or chair, and skip it if your back or knees hurt.",
    steps: [
      { text: "Stand tall, sideways to the camera.",                   waitFor: [] },
      { text: "Bend one knee and hold that foot behind you.",         waitFor: ["Lifted knee"] },
      { text: "Reach your other arm forward and up.",                 waitFor: ["Front arm"] },
      { text: "Gently kick your foot back into your hand.",           waitFor: ["Leg back"] },
      { text: "Let your chest tip forward as the leg lifts.",         waitFor: ["Lean"] },
      { text: "Later, do the other side too.",                        waitFor: [] }
    ],
    // The lifted leg reaching back (a big angle between the legs) makes this
    // pose, so it counts 3 times. The body tips forward about halfway.
    checks: [
      { name: "Standing leg", joint: "knee", side: "straight", target: 175, tolerance: 15,
        tipLow: "Straighten your standing leg",
        tipHigh: "" },
      { name: "Lifted knee", joint: "knee", side: "bent", target: 75, tolerance: 30, weight: 2,
        tipLow: "",
        tipHigh: "Bend your back knee more" },
      { name: "Leg back", joint: "legsApart", side: "body", target: 150, tolerance: 30, weight: 3,
        tipLow: "Kick your foot back and up",
        tipHigh: "" },
      { name: "Lean", joint: "body", side: "both", target: 45, tolerance: 25,
        tipLow: "Lift your chest a little",
        tipHigh: "Tip your chest forward a little" },
      { name: "Front arm", joint: "shoulder", side: "straight", target: 165, tolerance: 25,
        tipLow: "Reach your front arm up",
        tipHigh: "" }
    ]
  },

  // ---------------------------------------------------------------
  // WARRIOR III: stand on one leg, the body and the other leg in one
  // level line. (Book: an intermediate one-sided balance.)
  // ---------------------------------------------------------------
  {
    id: "virabhadrasana3",
    bookPage: 60,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Virabhadrasana III",
    english: "Warrior III",
    level: "Medium",
    focus: "Balance",
    group: "standing",
    holdKind: "balance",
    tint: "#F7EBD9",
    image: "images/virabhadrasana3.svg",
    view: "side",
    safety: "If the back of your standing leg is tight, bend that knee a little instead of twisting your hips. Keep both hips level, facing the floor. Your hands on a chair or a wall make it easier.",
    steps: [
      { text: "Stand tall, sideways to the camera.",                waitFor: [] },
      { text: "Reach your arms forward at shoulder height.",       waitFor: ["Arms"] },
      { text: "Lean forward and lift one leg straight behind you.", waitFor: ["Back leg up"] },
      { text: "Make one level line from your hands to your heel.", waitFor: ["Level body"] },
      { text: "Later, do the other side too.",                     waitFor: [] }
    ],
    // The level body is the heart of this pose, so it counts 3 times.
    checks: [
      { name: "Knees", joint: "knee", side: "both", target: 175, tolerance: 20,
        tipLow: "Straighten your {side} leg",
        tipHigh: "" },
      { name: "Level body", joint: "body", side: "both", target: 5, tolerance: 18, weight: 3,
        tipLow: "",
        tipHigh: "Tip your chest down more" },
      { name: "Back leg up", joint: "legsApart", side: "body", target: 90, tolerance: 25, weight: 2,
        tipLow: "Lift your back leg higher",
        tipHigh: "Lower your back leg a little" },
      { name: "Arms", joint: "shoulder", side: "both", target: 170, tolerance: 25,
        tipLow: "Reach your arms forward",
        tipHigh: "" }
    ]
  },

  // ---------------------------------------------------------------
  // EXTENDED SIDE ANGLE: a Warrior II lunge, leaning over the front
  // thigh, the top arm over the ear. (Book: a basic side stretch.)
  // ---------------------------------------------------------------
  {
    id: "utthitaparsvakonasana",
    bookPage: 62,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Utthita Parsvakonasana",
    english: "Extended Side Angle",
    level: "Easy",
    focus: "Side stretch",
    group: "standing",
    holdKind: "legs",
    tint: "#E2ECF7",
    image: "images/utthitaparsvakonasana.svg",
    view: "front",
    safety: "Keep your front knee pointing over your toes, not falling inward. Rest your forearm on your thigh if your hand can't reach the floor. Go gently if your knees, hips or neck hurt, and look forward if your neck is sore.",
    steps: [
      { text: "Face the camera and step your feet wide apart.",   waitFor: [] },
      { text: "Turn one foot out and bend that knee.",           waitFor: ["Front knee", "Back leg"] },
      { text: "Lean over and rest your forearm on that thigh.",  waitFor: ["Side lean"] },
      { text: "Reach your top arm over your ear.",               waitFor: ["Top arm"] },
      { text: "Make one long line from back foot to fingertips.", waitFor: [] },
      { text: "Later, do the other side too.",                   waitFor: [] }
    ],
    // The lean shows as one shoulder above the other (shoulderLine): Warrior II
    // has level shoulders, so this tells the two apart. The bent front knee
    // counts 3 times, like in Warrior II. The top arm is on the side of the
    // straight back leg, so it uses side "straight".
    checks: [
      { name: "Front knee", joint: "knee", side: "bent", target: 100, tolerance: 25, weight: 3,
        tipLow: "Bend your front knee less",
        tipHigh: "Bend your front knee more" },
      { name: "Back leg", joint: "knee", side: "straight", target: 175, tolerance: 15,
        tipLow: "Straighten your back leg",
        tipHigh: "" },
      { name: "Side lean", joint: "shoulderLine", side: "body", target: 60, tolerance: 20, weight: 2,
        tipLow: "Lean further over your front leg",
        tipHigh: "Lift your chest a little" },
      { name: "Top arm", joint: "shoulder", side: "straight", target: 165, tolerance: 25,
        tipLow: "Reach your top arm overhead",
        tipHigh: "" }
    ]
  },

  // ---------------------------------------------------------------
  // REVOLVED SIDE ANGLE: a lunge, folded over the front thigh and
  // twisted, palms together. The book shows it with the arms bound
  // behind the back (an advanced pose) and warns that the bind can force
  // the spine and the shoulders too far, so Yoga Buddy uses the gentler
  // prayer-hands version.
  // ---------------------------------------------------------------
  {
    id: "parivrttaparsvakonasana",
    bookPage: 64,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Parivrtta Parsvakonasana",
    english: "Revolved Side Angle",
    level: "Hard",
    focus: "Twist",
    group: "standing",
    holdKind: "legs",
    tint: "#EFE4F6",
    image: "images/parivrttaparsvakonasana.svg",
    view: "side",
    safety: "Twist gently and never use your arms to force the twist further: let it come from your middle back. Put your back knee down on a blanket to make it easier. Skip it if your back or neck hurts, or if you are pregnant.",
    steps: [
      { text: "Stand sideways and step one foot far back.",           waitFor: [] },
      { text: "Bend your front knee over your ankle.",               waitFor: ["Front knee", "Back leg"] },
      { text: "Press your palms together in front of your chest.",   waitFor: ["Prayer hands"] },
      { text: "Fold forward over your front thigh.",                 waitFor: ["Fold"] },
      { text: "Twist and hook your elbow outside your front knee.",  waitFor: ["Turned chest"] },
      { text: "Later, do the other side too.",                       waitFor: [] }
    ],
    // When you twist, one shoulder ends up above the other (shoulderLine):
    // that IS this pose, so it counts 3 times. The bent elbows (prayer
    // hands) tell it apart from Extended Side Angle, whose arms are straight.
    checks: [
      { name: "Front knee", joint: "knee", side: "bent", target: 90, tolerance: 25, weight: 2,
        tipLow: "Bend your front knee less",
        tipHigh: "Bend your front knee more" },
      { name: "Back leg", joint: "knee", side: "straight", target: 170, tolerance: 20,
        tipLow: "Straighten your back leg",
        tipHigh: "" },
      { name: "Fold", joint: "hip", side: "bent", target: 50, tolerance: 30,
        tipLow: "",
        tipHigh: "Fold over your front thigh" },
      { name: "Turned chest", joint: "shoulderLine", side: "body", target: 60, tolerance: 25, weight: 3,
        tipLow: "Turn your chest further open",
        tipHigh: "" },
      { name: "Prayer hands", joint: "elbow", side: "both", target: 60, tolerance: 35,
        tipLow: "",
        tipHigh: "Press your palms together" }
    ]
  },

  // ---------------------------------------------------------------
  // REVOLVED TRIANGLE: both legs straight, fold forward and twist, the
  // OTHER hand down by the front foot, the top arm up. (Book: an
  // intermediate twist.)
  // ---------------------------------------------------------------
  {
    id: "parivrttatrikonasana",
    bookPage: 68,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Parivrtta Trikonasana",
    english: "Revolved Triangle",
    level: "Medium",
    focus: "Twist",
    group: "standing",
    holdKind: "steady",
    tint: "#E1F2EE",
    image: "images/parivrttatrikonasana.svg",
    view: "side",
    safety: "Put your lower hand on a block, a thick book or your shin if the floor is far away. Twist from your middle back and keep your hips level. Skip it if your back hurts or your balance is unsteady.",
    steps: [
      { text: "Stand sideways and step one foot back.",              waitFor: ["Legs apart"] },
      { text: "Keep both legs straight, hips facing forward.",      waitFor: ["Knees"] },
      { text: "Fold forward over your front leg.",                  waitFor: [] },
      { text: "Put the opposite hand down by your front foot.",     waitFor: ["Other hand down"] },
      { text: "Twist open and reach your top arm up.",              waitFor: ["Arms in a line"] },
      { text: "Later, do the other side too.",                      waitFor: [] }
    ],
    // Which hand is down is what makes this the REVOLVED triangle: in
    // Triangle it's the hand on the same side as the front foot, here it's
    // the other one ("handCross" near 180), so it counts 3 times.
    checks: [
      { name: "Knees", joint: "knee", side: "both", target: 175, tolerance: 15,
        tipLow: "Straighten your {side} leg",
        tipHigh: "" },
      { name: "Legs apart", joint: "legsApart", side: "body", target: 45, tolerance: 20,
        tipLow: "Step your feet a bit wider",
        tipHigh: "Step your feet a bit closer" },
      { name: "Other hand down", joint: "handCross", side: "body", target: 150, tolerance: 40, weight: 3,
        tipLow: "Twist: use your other hand",
        tipHigh: "" },
      { name: "Arms in a line", joint: "armsLine", side: "body", target: 170, tolerance: 25, weight: 2,
        tipLow: "Reach your top arm straight up",
        tipHigh: "" }
    ]
  },

  // ---------------------------------------------------------------
  // WIDE-LEGGED FORWARD BEND: feet wide, fold down between the legs.
  // (Book: a basic forward bend, and the safest, easiest upside-down pose.)
  // ---------------------------------------------------------------
  {
    id: "prasaritapadottanasana",
    bookPage: 74,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Prasarita Padottanasana",
    english: "Wide-Legged Forward Bend",
    level: "Easy",
    focus: "Forward bend",
    group: "standing",
    holdKind: "steady",
    tint: "#F4EFE0",
    image: "images/prasaritapadottanasana.svg",
    view: "front",
    safety: "Your head is lower than your heart here, so come up slowly. Skip it if you have high or low blood pressure or feel dizzy. Bend your knees a little if the backs of your legs pull.",
    steps: [
      { text: "Face the camera and step your feet wide apart.", waitFor: ["Legs apart"] },
      { text: "Put your hands on your hips.",                  waitFor: [] },
      { text: "Fold forward slowly from your hips.",           waitFor: ["Fold"] },
      { text: "Put your hands on the floor under your shoulders.", waitFor: [] },
      { text: "Let your head hang and breathe slowly.",       waitFor: ["Knees"] }
    ],
    // Folding at the hips (a small hip angle) makes this pose, so it counts
    // 3 times. The wide legs tell it apart from the Standing Forward Bend.
    checks: [
      { name: "Legs apart", joint: "legsApart", side: "body", target: 55, tolerance: 20, weight: 2,
        tipLow: "Step your feet wider apart",
        tipHigh: "Bring your feet a little closer" },
      { name: "Knees", joint: "knee", side: "both", target: 175, tolerance: 20,
        tipLow: "Straighten your {side} leg a little",
        tipHigh: "" },
      { name: "Fold", joint: "hip", side: "both", target: 30, tolerance: 30, weight: 3,
        tipLow: "",
        tipHigh: "Fold forward a little more" }
    ]
  },

  // ---------------------------------------------------------------
  // SQUAT: feet apart, heels down, sit low between your feet with the
  // palms together. (Book: a basic standing pose.)
  // ---------------------------------------------------------------
  {
    id: "upavesasana",
    bookPage: 76,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Upavesasana",
    english: "Squat",
    level: "Easy",
    focus: "Hips and feet",
    group: "standing",
    holdKind: "legs",
    tint: "#EDE6DC",
    image: "images/upavesasana.svg",
    view: "front",
    safety: "If your heels lift, put a folded blanket under them, but also practise without it so your feet get stronger. Go gently if your knees hurt; sitting on a low block makes it easier.",
    steps: [
      { text: "Face the camera, feet a little wider than your hips.", waitFor: [] },
      { text: "Turn your toes out a little.",                         waitFor: [] },
      { text: "Bend your knees and sink your hips down low.",          waitFor: ["Knees", "Hips"] },
      { text: "Press your palms together, elbows inside your knees.",  waitFor: [] },
      { text: "Lift your chest and breathe slowly.",                   waitFor: ["Upright"] }
    ],
    // The deeply bent knees make this pose, so they count 3 times. Hips low
    // and an upright chest tell it apart from Chair and from kneeling.
    checks: [
      { name: "Knees", joint: "knee", side: "both", target: 50, tolerance: 25, weight: 3,
        tipLow: "",
        tipHigh: "Sink your hips lower" },
      { name: "Hips", joint: "hip", side: "both", target: 60, tolerance: 25,
        tipLow: "",
        tipHigh: "Sit lower between your feet" },
      { name: "Upright", joint: "body", side: "both", target: 78, tolerance: 15,
        tipLow: "Lift your chest up",
        tipHigh: "" },
      // In a squat your hips are off the floor, above your feet, so the
      // hip-to-ankle line is steep. Sitting cross-legged it is flat. (Without
      // this, Easy Pose and the seated twist counted as a squat in the lab.)
      { name: "Hips up", joint: "legs", side: "both", target: 50, tolerance: 25,
        tipLow: "Lift your hips off the floor",
        tipHigh: "" }
    ]
  }
);
