// =============================================================
// poses.js — ALL the pose information for Yoga Buddy lives here.
//
// You can change names, steps, tips and angles in this file
// without touching any other code. Every other file reads from
// the POSES list below.
// =============================================================

// HOW THE "steps" WORK
// --------------------
// The voice coach reads the steps aloud, one at a time.
//   text:    what to say (and show on the guide screen)
//   waitFor: names of checks (see below) that must look right before the
//            coach moves on to the next step, e.g. ["Arms"].
//            Use [] for a step the camera can't check (like "Interlock
//            your fingers"): the coach just waits a few seconds.
// After the last step, the coach times the hold (chosen on the guide, hold-time.js).

// HOW THE "checks" WORK
// ---------------------
// Each check measures ONE joint angle and compares it with a target.
//
// joint: which angle to measure (the angle is at the MIDDLE point)
//   "knee"     = hip – knee – ankle        (small = bent leg,      180 = straight leg)
//   "hip"      = shoulder – hip – knee     (small = folded body,   180 = straight body)
//   "shoulder" = hip – shoulder – elbow    (small = arm down,      180 = arm straight up)
//   "elbow"    = shoulder – elbow – wrist  (small = bent arm,      180 = straight arm)
//   "legs"     = how steep the leg is, hip to ankle (0 = lying flat on the floor,
//                90 = standing up). Not an angle at a joint: it checks you are lying down.
//   "body"     = how steep the body is, shoulder to hip (0 = flat like a plank,
//                90 = upright). Also not an angle at a joint.
//
// side: which side of the body to check
//   "both"     = check the left AND the right side
//   "camera"   = only the side closest to the camera (for side-view poses)
//   "bent"     = only the leg that is MORE bent (front leg / lifted leg)
//   "straight" = only the leg that is LESS bent (back leg / standing leg)
//
// target:    the correct angle, in degrees
// tolerance: how many degrees off is still OK
// tipLow:    tip when the angle is TOO SMALL (max 6 words)
// tipHigh:   tip when the angle is TOO BIG   (max 6 words)
// weight:    (optional) how much this joint counts in the score. Leave it
//            out to count once. Use a bigger number for the joint that makes
//            the pose what it is, e.g. weight: 3 counts three times.
// minVisibility: (optional) how sure MediaPipe must be that it can see the
//            points (0 to 1, normally 0.5). Use a lower number when a body
//            part is often hidden in this pose, like the lifted foot in Tree.
//
// In a tip, {side} is replaced by "left" or "right" (the user's own side).
// Leave a tip empty ("") if that mistake can't happen. For example, no
// angle can be bigger than 180°, so a 180° target never needs tipHigh.

const POSES = [
  {
    id: "tadasana",                 // short name used in web addresses
    sanskrit: "Tadasana",
    english: "Palm Tree",
    level: "Easy",                 // shown on the pose card: "Easy" or "Medium"
    focus: "Posture",
    tint: "#F3ECE0",               // the pose's own soft colour (cards, guide)
    image: "images/tadasana.png",
    view: "front",                  // "front" = face the camera, "side" = turn sideways
    // Steps follow the Common Yoga Protocol (Ministry of AYUSH) version of Tadasana.
    steps: [
      { text: "Stand tall with your feet a little apart.",       waitFor: ["Knees", "Hips"] },
      { text: "Interlock your fingers in front of you.",         waitFor: [] },
      { text: "Breathe in and stretch your arms straight up.",   waitFor: ["Arms"] },
      { text: "Lift your heels and balance on your toes.",       waitFor: [] }
    ],
    // Targets measured from the official "Yoga with Modi — Tadasana" video
    // (Ministry of AYUSH, CC BY 3.0), frame by frame, 68–76 s:
    //   arms 177–179°, elbows 156–158°, knees 177–179°, hips 175°.
    // Note: from the front the camera can't tell if the heels are lifted,
    // so that step is not checked.
    // The raised arms ARE this pose, so they count 3 times in the score.
    checks: [
      { name: "Arms", joint: "shoulder", side: "both", target: 175, tolerance: 15, weight: 3,
        tipLow: "Raise your {side} arm higher",
        tipHigh: "" },
      { name: "Elbows", joint: "elbow", side: "both", target: 165, tolerance: 15,
        tipLow: "Straighten your {side} arm",
        tipHigh: "" },
      { name: "Knees", joint: "knee", side: "both", target: 180, tolerance: 15,
        tipLow: "Straighten your {side} leg",
        tipHigh: "" },
      { name: "Hips", joint: "hip", side: "both", target: 180, tolerance: 15,
        tipLow: "Stand up tall",
        tipHigh: "" }
    ]
  },

  {
    id: "vrikshasana",
    sanskrit: "Vrikshasana",
    english: "Tree",
    level: "Medium",
    focus: "Balance",
    tint: "#E1F0E8",
    image: "images/vrikshasana.png",
    view: "front",
    // Steps follow the Common Yoga Protocol (Ministry of AYUSH) version.
    steps: [
      { text: "Stand tall and look at one spot in front of you.",               waitFor: [] },
      { text: "Put your weight on one foot.",                                   waitFor: [] },
      { text: "Place your other foot on your inner thigh, never on the knee.",  waitFor: ["Bent knee"] },
      { text: "Join your palms and raise your arms above your head.",           waitFor: ["Arms"] },
      { text: "Keep looking at your spot and breathe slowly.",                  waitFor: [] }
    ],
    // Targets measured from the official "Yoga with Modi — Vrikshasana" video
    // (Ministry of AYUSH, CC BY 3.0), 63–77 s, plus 4 photos from Wikimedia Commons:
    //   bent knee 7–70° (video median 35°), standing knee 177°, arms 166–178°.
    // A very bent knee is correct (the heel goes high up the inner thigh), so
    // only a foot that is too LOW is a mistake: anything up to 70° is fine.
    // The lifted foot is often hidden against the other leg, so the bent
    // knee accepts points MediaPipe is only 20% sure about.
    // The lifted leg IS this pose, so it counts 3 times in the score.
    checks: [
      { name: "Standing knee", joint: "knee", side: "straight", target: 180, tolerance: 15,
        tipLow: "Straighten your standing leg",
        tipHigh: "" },
      { name: "Bent knee", joint: "knee", side: "bent", target: 30, tolerance: 40, weight: 3, minVisibility: 0.2,
        tipLow: "",
        tipHigh: "Lift your foot higher" },
      { name: "Arms", joint: "shoulder", side: "both", target: 175, tolerance: 20,
        tipLow: "Reach your {side} arm up",
        tipHigh: "" }
    ]
  },

  {
    id: "virabhadrasana2",
    sanskrit: "Virabhadrasana II",
    english: "Warrior II",
    level: "Medium",
    focus: "Strength",
    tint: "#F8E4DC",
    image: "images/virabhadrasana2.png",
    view: "front",
    // DRAFT steps written by Claude. Advaith Sai, please check and edit.
    steps: [
      { text: "Stand with your feet wide apart.",            waitFor: [] },
      { text: "Turn one foot out to the side.",              waitFor: [] },
      { text: "Bend that front knee over your ankle.",       waitFor: ["Front knee"] },
      { text: "Keep your back leg straight.",                waitFor: ["Back knee"] },
      { text: "Stretch your arms out at shoulder height.",   waitFor: ["Arms", "Elbows"] }
    ],
    // Targets measured from 3 Warrior II photos on Wikimedia Commons (CC BY 2.0):
    //   front knee 96–117° (seen from the front a 90° knee looks a bit wider),
    //   back knee 162–179°, arms 89–105°, elbows 166–179°.
    // The bent front knee IS this pose, so it counts 3 times in the score.
    checks: [
      { name: "Front knee", joint: "knee", side: "bent", target: 100, tolerance: 20, weight: 3,
        tipLow: "Bend your front knee less",
        tipHigh: "Bend your front knee more" },
      { name: "Back knee", joint: "knee", side: "straight", target: 180, tolerance: 20,
        tipLow: "Straighten your back leg",
        tipHigh: "" },
      { name: "Arms", joint: "shoulder", side: "both", target: 90, tolerance: 15,
        tipLow: "Lift your {side} arm higher",
        tipHigh: "Lower your {side} arm a little" },
      { name: "Elbows", joint: "elbow", side: "both", target: 180, tolerance: 15,
        tipLow: "Straighten your {side} arm",
        tipHigh: "" }
    ]
  },

  {
    id: "utkatasana",
    sanskrit: "Utkatasana",
    english: "Chair",
    level: "Medium",
    focus: "Legs",
    tint: "#ECE6F5",
    image: "images/utkatasana.png",
    view: "side",
    // DRAFT steps written by Claude. Advaith Sai, please check and edit.
    steps: [
      { text: "Stand with feet together, sideways to the camera.",       waitFor: [] },
      { text: "Raise your arms straight up beside your ears.",           waitFor: ["Arms"] },
      { text: "Bend your knees and sit back, like sitting on a chair.",  waitFor: ["Knees"] },
      { text: "Keep your chest lifted and weight in your heels.",        waitFor: ["Hips"] },
      { text: "Breathe slowly.",                                         waitFor: [] }
    ],
    // Targets from 2 Chair-pose photos on Wikimedia Commons (CC BY):
    //   knees 80–108°, hips 85–122°, arms 131–170°. Only 2 good photos were
    //   found, so these targets are less certain: please test them yourselves.
    // The bent knees ARE this pose, so they count 3 times in the score.
    checks: [
      { name: "Knees", joint: "knee", side: "camera", target: 105, tolerance: 30, weight: 3,
        tipLow: "Rise up a little",
        tipHigh: "Bend your knees more" },
      { name: "Hips", joint: "hip", side: "camera", target: 100, tolerance: 25,
        tipLow: "Lift your chest up",
        tipHigh: "Lean forward a little" },
      { name: "Arms", joint: "shoulder", side: "camera", target: 170, tolerance: 20,
        tipLow: "Reach your arms up higher",
        tipHigh: "" }
    ]
  },

  {
    id: "bhujangasana",
    sanskrit: "Bhujangasana",
    english: "Cobra",
    level: "Easy",
    focus: "Back stretch",
    tint: "#E2EDF6",
    image: "images/bhujangasana.png",
    view: "side",
    // DRAFT steps written by Claude. Advaith Sai, please check and edit.
    steps: [
      { text: "Place your camera low, then lie on your stomach sideways to it.",  waitFor: ["Legs on floor"] },
      { text: "Keep your legs straight and feet together.",                       waitFor: ["Knees"] },
      { text: "Put your hands on the floor under your shoulders.",                waitFor: [] },
      { text: "Press into your hands and slowly lift your chest.",                waitFor: ["Back"] },
      { text: "Keep your hips down, elbows soft, and breathe.",                   waitFor: ["Elbows"] }
    ],
    // Targets from 2 Cobra photos on Wikimedia Commons (CC BY-SA):
    //   elbows 148–163°, back 116–133°, knees 163–166°. Only 2 good photos were
    //   found (lying-down poses are harder for MediaPipe), so please test these.
    // The lifted chest (back angle) IS this pose, so it counts 3 times.
    // "Legs on floor": in testing, someone STANDING scored 72 as Cobra, because
    // standing has the same straight elbows and knees. This check makes sure
    // you are lying down.
    checks: [
      { name: "Legs on floor", joint: "legs", side: "camera", target: 0, tolerance: 20, weight: 3,
        tipLow: "",
        tipHigh: "Lie down on your stomach" },
      { name: "Elbows", joint: "elbow", side: "camera", target: 160, tolerance: 20,
        tipLow: "Push up a little",
        tipHigh: "" },
      { name: "Back", joint: "hip", side: "camera", target: 130, tolerance: 20, weight: 3,
        tipLow: "Lower your chest a little",
        tipHigh: "Lift your chest higher" },
      { name: "Knees", joint: "knee", side: "camera", target: 175, tolerance: 15,
        tipLow: "Keep your legs straight",
        tipHigh: "" }
    ]
  }
];
