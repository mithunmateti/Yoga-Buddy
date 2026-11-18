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
//   These use BOTH sides of the body, so they are measured once (side: "body"):
//   "legsApart" = the angle between the two legs, hip to ankle (feet together
//                about 0–10, a wide stance 40–90, the splits 180)
//   "armsLine"  = the angle between the two arms, shoulder to wrist (180 =
//                one straight line, like a T or Triangle's arms)
//   "twist"     = how far the shoulders are turned compared with the hips,
//                seen from above (0 = no twist). Needs the 3D points.
//   "shoulderLine" = how steep the shoulder-to-shoulder line is (0 = level,
//                90 = one shoulder right above the other, as in Side Angle)
//   "handCross" = is the hand by your feet the same-side hand (0, Triangle)
//                or the other hand (180, Revolved Triangle)?
//
// FRONT OR SIDE? The camera measures the angles in 3D as well as in the flat
// picture (pose-check.js), so a pose works whichever way you face. "view"
// below only says which way is BEST, so the coach can give a tip.
//
// side: which side of the body to check
//   "both"     = check the left AND the right side
//   "camera"   = only the side closest to the camera (for side-view poses)
//   "bent"     = only the leg that is MORE bent (front leg / lifted leg)
//   "straight" = only the leg that is LESS bent (back leg / standing leg)
//   "far"      = only the side furthest from the camera
//   "body"     = once, for the whole body (legsApart, armsLine, twist)
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

// MORE POSES live in poses-standing.js, poses-sitting.js, poses-kneeling.js,
// poses-supine.js, poses-prone.js, poses-arm-support.js and flows.js. They
// add themselves to this list with POSES.push(…).
//
// THE HOME TABS sort the poses by the position of your body, like the
// chapters of the book Yoga Anatomy (Kaminoff): every pose says its
// group: "standing", "sitting", "kneeling", "supine" (lying on your back),
// "prone" (lying on your tummy) or "armsupport" (on your hands).
// The 5 Basic Asanas below also say basic: true, so they are on the
// "Basic Asanas" tab as well. Flows go on the "Flows" tab.
// bookPage (optional) = the page of the pose in that book. Each tab lists
// its poses in book order.

const POSES = [
  {
    id: "tadasana",                 // short name used in web addresses
    basic: true,   // also on the "Basic Asanas" tab
    group: "standing",
    bookPage: 34,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Tadasana",
    english: "Palm Tree",
    level: "Easy",                 // shown on the pose card: "Easy", "Medium" or "Hard"
    focus: "Posture",
    tint: "#F3ECE0",               // the pose's own soft colour (cards, guide)
    image: "images/tadasana.webp",
    view: "front",                  // "front" = face the camera, "side" = turn sideways
    safety: "If you get headaches, sleep badly or have low blood pressure, don't stand still for too long. Come down off your toes if you wobble.",
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
    basic: true,   // also on the "Basic Asanas" tab
    group: "standing",
    bookPage: 46,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Vrikshasana",
    english: "Tree",
    level: "Medium",
    focus: "Balance",
    tint: "#E1F0E8",
    image: "images/vrikshasana.webp",
    view: "front",
    safety: "Never press your foot on your knee. If you get dizzy or have a balance problem, stand next to a wall.",
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
    basic: true,   // also on the "Basic Asanas" tab
    group: "standing",
    bookPage: 58,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Virabhadrasana II",
    english: "Warrior II",
    level: "Easy",
    focus: "Hip opener",
    tint: "#F8E4DC",
    image: "images/virabhadrasana2.webp",
    view: "front",
    safety: "Keep your front knee over your ankle, pointing the same way as your toes. Keep the outer edge of your back foot pressing down. Go gently if your knees or hips hurt.",
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
    basic: true,   // also on the "Basic Asanas" tab
    group: "standing",
    bookPage: 40,   // Yoga Anatomy (Kaminoff), chapter 4 "Standing Poses"
    sanskrit: "Utkatasana",
    english: "Chair",
    level: "Easy",
    focus: "Strong legs",
    tint: "#ECE6F5",
    image: "images/utkatasana.webp",
    view: "side",
    safety: "Keep your knees pointing straight ahead over your toes, never twisting: bent knees are easy to hurt. Go gently if your knees or back hurt.",
    // DRAFT steps written by Claude. Advaith Sai, please check and edit.
    steps: [
      { text: "Stand with feet together, sideways to the camera.",       waitFor: ["Feet together"] },
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
        tipHigh: "" },
      // Without this, a Warrior I lunge (front knee bent, arms up) also
      // counted as Chair in the pose lab (tests/pose-lab.mjs). In Chair the
      // feet stay together, so the legs point the same way.
      { name: "Feet together", joint: "legsApart", side: "body", target: 5, tolerance: 20,
        tipLow: "",
        tipHigh: "Bring your feet together" }
    ]
  },

  {
    id: "bhujangasana",
    basic: true,   // also on the "Basic Asanas" tab
    group: "prone",
    sanskrit: "Bhujangasana",
    english: "Cobra",
    level: "Easy",
    focus: "Back stretch",
    tint: "#E2EDF6",
    image: "images/bhujangasana.webp",
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
  },

  // =============================================================
  // SURYA NAMASKAR (Sun Salutation): a FLOW of 12 positions, not one pose.
  // The coach goes through the 12 positions: that is 1 round, and it says
  // "Round complete". Round 1 steps back with your right leg, round 2 with
  // your left, and so on. You choose how many rounds on the guide screen.
  // There is no hold timer. Each position has its own checks, a stick figure
  // (figure.js) and words for the voice. {leg} is "right" or "left".
  //
  // The positions follow the usual 12 steps (Common Yoga Protocol,
  // Ministry of AYUSH). The target angles were worked out from the stick
  // figures below, with wide tolerances, and checked with the maths in
  // pose-check.js. NOT yet tested on real people: please test them
  // yourselves and change the numbers if a position scores too low or high.
  // No breath holding, to be safe for beginners and children.
  //
  // Figure points: [x, y] in a box 100 wide and 60 high (y goes DOWN).
  // =============================================================
  {
    id: "suryanamaskar",
    sanskrit: "Surya Namaskar",
    english: "Sun Salutation",
    level: "Medium",
    focus: "Full body flow",
    tint: "#FBE7D2",
    image: "images/suryanamaskar.webp",
    view: "side",
    rounds: 2,   // the number chosen on the guide screen replaces this (hold-time.js)
    roundNote: "One round is the 12 positions, one after another. Round 1 steps back with your right leg, round 2 with your left, and so on. Yoga Buddy's voice will guide you. 🔊",
    camera: "Leave room in front of you and behind you, stand about 2.5 metres from the camera, and put the camera low (about waist height) so it can see your hands and feet in every position.",
    safety: "Move slowly and rest whenever you need to. Skip Cobra and Downward Dog if your wrists, back or shoulders hurt, or if you are pregnant or have high blood pressure. If you are not sure, ask a doctor first.",
    positions: [
      {
        sanskrit: "Pranamasana",
        english: "Prayer pose",
        breath: "normal",
        say: "Stand tall, sideways to the camera. Press your palms together at your chest and breathe normally.",
        figure: {
          head: [50, 8], shoulder: [50, 15], elbow: [52, 25], wrist: [58, 22], hip: [50, 33],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "Feet together, palms pressed together at the chest.",
          back: "Shoulders relaxed, the back long and straight.",
          left: "The body is one tall line from head to heels.",
          right: "The body is one tall line from head to heels.",
          top: "Feet side by side, elbows out a little."
        },
        checks: [
          { name: "Knees", joint: "knee", side: "camera", target: 178, tolerance: 12,
            tipLow: "Straighten your legs",
            tipHigh: "" },
          { name: "Back", joint: "hip", side: "camera", target: 178, tolerance: 12,
            tipLow: "Stand up tall",
            tipHigh: "" },
          { name: "Upright", joint: "body", side: "camera", target: 90, tolerance: 12, weight: 2,
            tipLow: "Stand up straight",
            tipHigh: "" },
          { name: "Arms down", joint: "shoulder", side: "camera", target: 20, tolerance: 25, weight: 2,
            tipLow: "",
            tipHigh: "Bring your hands to your chest" }
        ]
      },
      {
        sanskrit: "Hasta Uttanasana",
        english: "Raised arms pose",
        breath: "in",
        say: "Breathe in. Stretch your arms up beside your ears and lean back a little.",
        figure: {
          head: [47, 10], shoulder: [47, 17], elbow: [46, 9], wrist: [45, 1], hip: [50, 34],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "Arms straight up and shoulder-width apart, the chest open.",
          back: "Arms by the ears, the back gently arched.",
          left: "A soft curve backwards from the hips to the fingertips.",
          right: "A soft curve backwards from the hips to the fingertips.",
          top: "Feet together, arms reaching up out of sight."
        },
        checks: [
          { name: "Arms", joint: "shoulder", side: "camera", target: 170, tolerance: 20, weight: 2,
            tipLow: "Reach your arms up higher",
            tipHigh: "" },
          { name: "Elbows", joint: "elbow", side: "camera", target: 172, tolerance: 20,
            tipLow: "Straighten your arms",
            tipHigh: "" },
          { name: "Back", joint: "hip", side: "camera", target: 168, tolerance: 15, weight: 2,
            tipLow: "Lean back a little",
            tipHigh: "Come up a little" },
          { name: "Knees", joint: "knee", side: "camera", target: 176, tolerance: 15,
            tipLow: "Keep your legs straight",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Padahastasana",
        english: "Hand to foot pose",
        breath: "out",
        say: "Breathe out. Bend forward from your hips and put your hands on the floor beside your feet. Bend your knees if you need to.",
        figure: {
          head: [62, 54], shoulder: [58, 48], elbow: [60, 54], wrist: [58, 59], hip: [42, 33],
          knee: [47, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "The head hangs down between the arms, hands by the feet.",
          back: "The back is rounded or flat, the hips high.",
          left: "The body is folded in half over the legs.",
          right: "The body is folded in half over the legs.",
          top: "Hands flat on the floor next to the feet."
        },
        checks: [
          { name: "Fold", joint: "hip", side: "camera", target: 30, tolerance: 35, weight: 3,
            tipLow: "",
            tipHigh: "Fold forward more" },
          { name: "Knees", joint: "knee", side: "camera", target: 165, tolerance: 30,
            tipLow: "Straighten your legs a little",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Ashwa Sanchalanasana",
        english: "Horse riding pose",
        breath: "in",
        say: "Breathe in. Step your {leg} leg far back and rest the knee on the floor if you like. Bend your {other leg} knee and look forward.",
        figure: {
          head: [51, 16], shoulder: [52, 25], elbow: [57, 40], wrist: [60, 57], hip: [46, 40],
          knee: [58, 42], ankle: [58, 57], toe: [64, 60], knee2: [32, 52], ankle2: [22, 56],
          toe2: [19, 60]
        },
        views: {
          front: "One knee bent in front, the other leg stretched far behind.",
          back: "The back leg stretches out and the chest lifts.",
          left: "The front knee is bent at a right angle above the ankle.",
          right: "The front knee is bent at a right angle above the ankle.",
          top: "Hands on the floor on both sides of the front foot."
        },
        checks: [
          { name: "Front knee", joint: "knee", side: "bent", target: 95, tolerance: 25, weight: 3,
            tipLow: "Step your foot forward more",
            tipHigh: "Bend your front knee more" },
          { name: "Back leg", joint: "knee", side: "straight", target: 165, tolerance: 25,
            tipLow: "Stretch your back leg out",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Dandasana",
        english: "Plank pose",
        breath: "out",
        say: "Breathe out. Step your {other leg} leg back too, so your body makes one straight line, like a plank.",
        figure: {
          head: [66, 32], shoulder: [60, 36], elbow: [60, 47], wrist: [60, 59], hip: [34, 44],
          knee: [18, 50], ankle: [8, 56], toe: [4, 60]
        },
        views: {
          front: "Arms straight under the shoulders, the head looking down.",
          back: "The body is straight from the head to the heels.",
          left: "One long slanting line from the heels to the head.",
          right: "One long slanting line from the heels to the head.",
          top: "Hands under the shoulders, feet together behind."
        },
        checks: [
          { name: "Line", joint: "body", side: "camera", target: 18, tolerance: 15, weight: 3,
            tipLow: "",
            tipHigh: "Make one straight line" },
          { name: "Hips", joint: "hip", side: "camera", target: 175, tolerance: 15, weight: 2,
            tipLow: "Don't lift or drop your hips",
            tipHigh: "" },
          { name: "Arms", joint: "elbow", side: "camera", target: 172, tolerance: 15,
            tipLow: "Straighten your arms",
            tipHigh: "" },
          { name: "Knees", joint: "knee", side: "camera", target: 170, tolerance: 15,
            tipLow: "Straighten your legs",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Ashtanga Namaskara",
        english: "Eight limbs pose",
        breath: "out",
        say: "Breathe out. Lower your knees, chest and chin to the floor, with your hips lifted.",
        figure: {
          head: [62, 57], shoulder: [56, 53], elbow: [48, 47], wrist: [49, 59], hip: [38, 45],
          knee: [26, 58], ankle: [14, 57], toe: [10, 60]
        },
        views: {
          front: "Two hands, chin, chest, two knees and two feet touch the floor.",
          back: "The hips are lifted a little above the floor.",
          left: "Eight points touch the floor and the elbows are bent.",
          right: "Eight points touch the floor and the elbows are bent.",
          top: "Hands beside the chest, elbows close to the body."
        },
        checks: [
          { name: "Chest", joint: "body", side: "camera", target: 25, tolerance: 25, weight: 2,
            tipLow: "",
            tipHigh: "Lower your chest to the floor" },
          { name: "Elbows", joint: "elbow", side: "camera", target: 50, tolerance: 40, weight: 2,
            tipLow: "",
            tipHigh: "Bend your elbows more" }
        ]
      },
      {
        sanskrit: "Bhujangasana",
        english: "Cobra pose",
        breath: "in",
        say: "Breathe in. Slide forward and lift your chest into Cobra. Keep your hips down and your elbows soft.",
        figure: {
          head: [56, 30], shoulder: [50, 34], elbow: [56, 47], wrist: [58, 58], hip: [30, 56],
          knee: [18, 57], ankle: [8, 57], toe: [4, 59]
        },
        views: {
          front: "The chest lifts up, the arms are soft and the head looks forward.",
          back: "The lower back is gently curved, the shoulders away from the ears.",
          left: "The chest is up and the hips and legs rest on the floor.",
          right: "The chest is up and the hips and legs rest on the floor.",
          top: "Hands under the shoulders, legs straight behind."
        },
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
      },
      {
        sanskrit: "Parvatasana",
        english: "Downward dog",
        breath: "out",
        say: "Breathe out. Lift your hips high, like an upside-down V. Press your heels down and keep your head between your arms.",
        figure: {
          head: [60, 49], shoulder: [56, 41], elbow: [62, 50], wrist: [68, 59], hip: [34, 16],
          knee: [22, 36], ankle: [12, 56], toe: [8, 60]
        },
        views: {
          front: "The head hangs between the straight arms.",
          back: "The back is long and the hips are the highest point.",
          left: "The body makes an upside-down V.",
          right: "The body makes an upside-down V.",
          top: "Hands and feet about a body length apart."
        },
        checks: [
          { name: "Hips", joint: "hip", side: "camera", target: 75, tolerance: 20, weight: 3,
            tipLow: "Lower your hips a little",
            tipHigh: "Lift your hips higher" },
          { name: "Legs", joint: "knee", side: "camera", target: 170, tolerance: 20,
            tipLow: "Straighten your legs",
            tipHigh: "" },
          { name: "Arms", joint: "elbow", side: "camera", target: 172, tolerance: 15,
            tipLow: "Straighten your arms",
            tipHigh: "" },
          { name: "Reach", joint: "shoulder", side: "camera", target: 170, tolerance: 25, weight: 2,
            tipLow: "Push your chest toward your legs",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Ashwa Sanchalanasana",
        english: "Horse riding pose",
        breath: "in",
        say: "Breathe in. Step your {leg} foot forward between your hands. Bend your {leg} knee and stretch your {other leg} leg back.",
        figure: {
          head: [51, 16], shoulder: [52, 25], elbow: [57, 40], wrist: [60, 57], hip: [46, 40],
          knee: [58, 42], ankle: [58, 57], toe: [64, 60], knee2: [32, 52], ankle2: [22, 56],
          toe2: [19, 60]
        },
        views: {
          front: "One knee bent in front, the other leg stretched far behind.",
          back: "The back leg stretches out and the chest lifts.",
          left: "The front knee is bent at a right angle above the ankle.",
          right: "The front knee is bent at a right angle above the ankle.",
          top: "Hands on the floor on both sides of the front foot."
        },
        checks: [
          { name: "Front knee", joint: "knee", side: "bent", target: 95, tolerance: 25, weight: 3,
            tipLow: "Step your foot forward more",
            tipHigh: "Bend your front knee more" },
          { name: "Back leg", joint: "knee", side: "straight", target: 165, tolerance: 25,
            tipLow: "Stretch your back leg out",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Padahastasana",
        english: "Hand to foot pose",
        breath: "out",
        say: "Breathe out. Bring your {other leg} foot forward next to the other one, and fold forward over your legs.",
        figure: {
          head: [62, 54], shoulder: [58, 48], elbow: [60, 54], wrist: [58, 59], hip: [42, 33],
          knee: [47, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "The head hangs down between the arms, hands by the feet.",
          back: "The back is rounded or flat, the hips high.",
          left: "The body is folded in half over the legs.",
          right: "The body is folded in half over the legs.",
          top: "Hands flat on the floor next to the feet."
        },
        checks: [
          { name: "Fold", joint: "hip", side: "camera", target: 30, tolerance: 35, weight: 3,
            tipLow: "",
            tipHigh: "Fold forward more" },
          { name: "Knees", joint: "knee", side: "camera", target: 165, tolerance: 30,
            tipLow: "Straighten your legs a little",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Hasta Uttanasana",
        english: "Raised arms pose",
        breath: "in",
        say: "Breathe in. Rise up slowly, stretch your arms overhead and lean back a little.",
        figure: {
          head: [47, 10], shoulder: [47, 17], elbow: [46, 9], wrist: [45, 1], hip: [50, 34],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "Arms straight up and shoulder-width apart, the chest open.",
          back: "Arms by the ears, the back gently arched.",
          left: "A soft curve backwards from the hips to the fingertips.",
          right: "A soft curve backwards from the hips to the fingertips.",
          top: "Feet together, arms reaching up out of sight."
        },
        checks: [
          { name: "Arms", joint: "shoulder", side: "camera", target: 170, tolerance: 20, weight: 2,
            tipLow: "Reach your arms up higher",
            tipHigh: "" },
          { name: "Elbows", joint: "elbow", side: "camera", target: 172, tolerance: 20,
            tipLow: "Straighten your arms",
            tipHigh: "" },
          { name: "Back", joint: "hip", side: "camera", target: 168, tolerance: 15, weight: 2,
            tipLow: "Lean back a little",
            tipHigh: "Come up a little" },
          { name: "Knees", joint: "knee", side: "camera", target: 176, tolerance: 15,
            tipLow: "Keep your legs straight",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Pranamasana",
        english: "Prayer pose",
        breath: "normal",
        say: "Breathe out. Bring your hands back to your chest in prayer pose, and stand tall.",
        figure: {
          head: [50, 8], shoulder: [50, 15], elbow: [52, 25], wrist: [58, 22], hip: [50, 33],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "Feet together, palms pressed together at the chest.",
          back: "Shoulders relaxed, the back long and straight.",
          left: "The body is one tall line from head to heels.",
          right: "The body is one tall line from head to heels.",
          top: "Feet side by side, elbows out a little."
        },
        checks: [
          { name: "Knees", joint: "knee", side: "camera", target: 178, tolerance: 12,
            tipLow: "Straighten your legs",
            tipHigh: "" },
          { name: "Back", joint: "hip", side: "camera", target: 178, tolerance: 12,
            tipLow: "Stand up tall",
            tipHigh: "" },
          { name: "Upright", joint: "body", side: "camera", target: 90, tolerance: 12, weight: 2,
            tipLow: "Stand up straight",
            tipHigh: "" },
          { name: "Arms down", joint: "shoulder", side: "camera", target: 20, tolerance: 25, weight: 2,
            tipLow: "",
            tipHigh: "Bring your hands to your chest" }
        ]
      }
    ]
  }
];
