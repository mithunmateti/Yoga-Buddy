// =============================================================
// flows.js — the yoga FLOWS (other than Surya Namaskar).
//
// A flow is a list of positions done one after another, like a dance.
// Surya Namaskar lives in poses.js. Every other flow lives here and
// adds itself to the same POSES list with POSES.push(…), so the home
// page shows it on the "Flows" tab.
//
// A flow uses the same format as Surya Namaskar in poses.js:
//   positions: the list of positions, each with its own words ("say"),
//              breath ("in", "out" or "normal"), stick figure (figure.js),
//              "views" sentences and checks.
//   {leg} / {other leg} in "say" become "right" / "left", and swap in
//   round 2, so you work both legs.
// =============================================================

POSES.push({
  // =============================================================
  // CHANDRA NAMASKAR (Moon Salutation): a calm FLOW of 14 positions.
  // It is like Surya Namaskar, but after each lunge you lift your arms
  // up into Ardha Chandrasana, a "crescent moon" lunge with a gentle
  // back bend. That crescent shape gives the flow its name.
  //
  // Round 1 steps back with your right leg, round 2 with your left.
  // The positions that are the same as Surya Namaskar copy its words,
  // figures and checks. The crescent lunge targets were worked out from
  // the test skeleton and usual alignment cues; NOT yet tested on real
  // people. Please test them and change the numbers if needed.
  // No breath holding, to be safe for beginners and children.
  //
  // Figure points: [x, y] in a box 100 wide and 60 high (y goes DOWN).
  // =============================================================
  id: "chandranamaskar",
  sanskrit: "Chandra Namaskar",
  english: "Moon Salutation",
  icon: "🌙",
  level: "Medium",
  focus: "Calm full-body flow",
  tint: "#E4E6F6",
  image: "images/chandranamaskar.svg",
  view: "side",
  roundsRecommended: 2,
  roundNote: "One round is the 14 positions, one after another. Round 1 steps back with your right leg, round 2 with your left, and so on. Move slowly and calmly. Yoga Buddy's voice will guide you. 🔊",
  camera: "Leave room in front of you and behind you, stand about 2.5 metres from the camera, and put the camera low (about waist height) so it can see your hands and feet in every position.",
  safety: "Move slowly and rest whenever you need to. Put a soft mat or towel under your back knee in the crescent lunge. Skip Cobra and Downward Dog, and keep the back bend small, if your wrists, back, knees or shoulders hurt, or if you are pregnant or have high blood pressure. If you are not sure, ask a doctor first.",
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
    // ARDHA CHANDRASANA here means the "crescent moon" low lunge (some books
    // call it Anjaneyasana). It is NOT the standing half-moon balance.
    // What makes it different from the lunge before it: the chest comes up
    // and the arms reach overhead. So the raised arm counts 3 times, and
    // "Upright" checks the chest has lifted off the front thigh.
    // The back knee rests on the floor, so the back leg is quite bent
    // (about 140° in the test skeleton); a straighter back leg is fine too,
    // so the "Back leg" check accepts anything from 120° up to fully straight.
    // The voice says "Breathe out" first, so there are never two breaths in a row.
    // Targets worked out from the test skeleton and usual alignment cues;
    // NOT yet tested on real people.
    {
      sanskrit: "Ardha Chandrasana",
      english: "Crescent moon pose",
      breath: "in",
      say: "Breathe out and lower your back knee to the floor. Breathe in, lift your chest and reach your arms up. Lean back gently, like a crescent moon.",
      figure: {
        head: [43, 22], shoulder: [44, 29], elbow: [43, 20], wrist: [42, 11], hip: [46, 45],
        knee: [59, 44], ankle: [59, 57], toe: [65, 60], knee2: [37, 56], ankle2: [24, 58],
        toe2: [20, 60]
      },
      views: {
        front: "Arms reach straight up beside the ears, the chest open.",
        back: "The back knee rests on the floor, the arms reach up.",
        left: "A gentle curve backwards, like a crescent moon, over the bent front knee.",
        right: "A gentle curve backwards, like a crescent moon, over the bent front knee.",
        top: "The front foot ahead, the back knee and foot behind on the floor."
      },
      checks: [
        { name: "Arms", joint: "shoulder", side: "camera", target: 170, tolerance: 20, weight: 3,
          tipLow: "Reach your arms up higher",
          tipHigh: "" },
        { name: "Upright", joint: "body", side: "camera", target: 85, tolerance: 15, weight: 2,
          tipLow: "Lift your chest up",
          tipHigh: "" },
        { name: "Front knee", joint: "knee", side: "bent", target: 95, tolerance: 25, weight: 2,
          tipLow: "Step your foot forward more",
          tipHigh: "Bend your front knee more" },
        { name: "Back leg", joint: "knee", side: "straight", target: 150, tolerance: 30,
          tipLow: "Slide your back knee further back",
          tipHigh: "" }
      ]
    },
    {
      sanskrit: "Dandasana",
      english: "Plank pose",
      breath: "out",
      say: "Breathe out. Hands down beside your front foot. Step your {other leg} leg back too, so your body makes one straight line, like a plank.",
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
    // The second crescent lunge, now with the other leg in front.
    {
      sanskrit: "Ardha Chandrasana",
      english: "Crescent moon pose",
      breath: "in",
      say: "Breathe out and lower your back knee. Breathe in, lift your chest and reach your arms up. Lean back gently, like a crescent moon.",
      figure: {
        head: [43, 22], shoulder: [44, 29], elbow: [43, 20], wrist: [42, 11], hip: [46, 45],
        knee: [59, 44], ankle: [59, 57], toe: [65, 60], knee2: [37, 56], ankle2: [24, 58],
        toe2: [20, 60]
      },
      views: {
        front: "Arms reach straight up beside the ears, the chest open.",
        back: "The back knee rests on the floor, the arms reach up.",
        left: "A gentle curve backwards, like a crescent moon, over the bent front knee.",
        right: "A gentle curve backwards, like a crescent moon, over the bent front knee.",
        top: "The front foot ahead, the back knee and foot behind on the floor."
      },
      checks: [
        { name: "Arms", joint: "shoulder", side: "camera", target: 170, tolerance: 20, weight: 3,
          tipLow: "Reach your arms up higher",
          tipHigh: "" },
        { name: "Upright", joint: "body", side: "camera", target: 85, tolerance: 15, weight: 2,
          tipLow: "Lift your chest up",
          tipHigh: "" },
        { name: "Front knee", joint: "knee", side: "bent", target: 95, tolerance: 25, weight: 2,
          tipLow: "Step your foot forward more",
          tipHigh: "Bend your front knee more" },
        { name: "Back leg", joint: "knee", side: "straight", target: 150, tolerance: 30,
          tipLow: "Slide your back knee further back",
          tipHigh: "" }
      ]
    },
    {
      sanskrit: "Padahastasana",
      english: "Hand to foot pose",
      breath: "out",
      say: "Breathe out. Hands down by your front foot. Bring your back foot forward next to it, and fold over your legs.",
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
});


// =============================================================
// The two DAILY flows: a 5-minute Morning Flow to
// wake up, and a calm Bedtime Stretch to relax before sleep.
//
// They use the same format as Surya Namaskar in poses.js. The extra
// thing here is "hold": after you reach a position, the coach says
// "Stay here and breathe for N seconds" and shows a timer. The guide
// guesses about (7 + hold) seconds per position, so:
//   Morning Flow:   10 positions, 230 s of holds  → about 5 minutes
//   Bedtime Stretch: 9 positions, 330 s of holds  → about 6½ minutes
//
// These flows do NOT use {leg}, so the rounds don't swap legs. Instead,
// one-sided poses (side bend, Warrior II, Tree, side stretch, lying
// twist) are written twice: first the right side, then the left.
//
// The camera stays in ONE place for each flow:
//   Morning Flow:    face the camera (view "front").
//   Bedtime Stretch: lie and sit sideways to a LOW camera (view "side").
//
// Targets worked out from the test skeletons (tests/skeletons/flows-daily.mjs
// and the stick figures below) and usual alignment cues; NOT yet tested on
// real people. These are relaxing flows, so the tolerances are generous.
// Please test them and change the numbers if a position scores too low or high.
// No breath holding, to be safe for beginners and children.
//
// Figure points: [x, y] in a box 100 wide and 60 high (y goes DOWN),
// the person facing RIGHT (see figure.js).
// =============================================================

POSES.push(
  // =============================================================
  // MORNING FLOW: a gentle 5-minute wake-up, all standing.
  // Stretch up, bend to each side, fold forward, Warrior II on each
  // side, Chair, Tree on each side, and finish in prayer pose.
  // =============================================================
  {
    id: "morningflow",
    sanskrit: "Morning Flow",
    english: "5-Minute Wake-Up",
    icon: "🌅",
    level: "Easy",
    focus: "Wake up and stretch",
    tint: "#FDEFD3",
    image: "images/morningflow.svg",
    view: "front",
    rounds: 1,   // the number chosen on the guide screen replaces this
    roundsRecommended: 1,
    roundNote: "A gentle wake-up for the start of your day. One round is 10 standing positions and takes about 5 minutes. You stay in each one for a few slow breaths. Yoga Buddy's voice will guide you. 🔊",
    camera: "Face the camera and stand about 2.5 metres away, with room to step your feet wide. Put the camera about waist height so it can see you from your hands above your head down to your feet.",
    safety: "Move slowly and only stretch as far as feels good. Stand near a wall or chair in Tree pose if your balance is wobbly. Bend your knees in the forward fold if your back or legs feel tight, and keep your head up if you feel dizzy or have high blood pressure. If you are pregnant or not sure, ask a doctor first.",
    positions: [
      {
        sanskrit: "Tadasana",
        english: "Morning stretch",
        breath: "in",
        hold: 25,
        say: "Stand tall, facing the camera. Breathe in and stretch your arms up high.",
        figure: {
          head: [50, 8], shoulder: [50, 15], elbow: [50, 6], wrist: [50, -2], hip: [50, 33],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "Arms straight up beside the ears, feet a little apart.",
          back: "Arms reach up, the back long and tall.",
          left: "One tall straight line from the heels to the fingertips.",
          right: "One tall straight line from the heels to the fingertips.",
          top: "Feet side by side, arms reaching up out of sight."
        },
        checks: [
          { name: "Arms", joint: "shoulder", side: "both", target: 172, tolerance: 20, weight: 3,
            tipLow: "Reach your {side} arm higher",
            tipHigh: "" },
          { name: "Elbows", joint: "elbow", side: "both", target: 172, tolerance: 20,
            tipLow: "Straighten your {side} arm",
            tipHigh: "" },
          { name: "Knees", joint: "knee", side: "both", target: 178, tolerance: 15,
            tipLow: "Straighten your {side} leg",
            tipHigh: "" },
          { name: "Upright", joint: "body", side: "camera", target: 90, tolerance: 15,
            tipLow: "Stand up straight",
            tipHigh: "" }
        ]
      },
      // SIDE BENDS: one arm reaches up and over, the other hand slides down
      // the leg. "Side bend" checks the body leans sideways (upright is 90°,
      // the test skeleton leans about 22°, which measures 60–80°; standing straight measures about 77–82°).
      // Each side's shoulder-to-hip line starts tilted because the shoulders are
      // wider than the hips, so "Side bend" is generous (50–82°) and "Arms"
      // (weight 3) does most of the work. "Arms" is the angle between
      // the two arms: about 140° when one reaches over and one slides down
      // (both arms up or both down is near 0°, a T shape is 180°).
      {
        sanskrit: "Tiryaka Tadasana",
        english: "Side bend, right",
        breath: "out",
        hold: 20,
        say: "Breathe out. Lift your left arm and lean over to your right. Slide your right hand down your leg.",
        figure: {
          head: [50, 8], shoulder: [50, 15], elbow: [50, 6], wrist: [50, -2], hip: [50, 33],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "The body curves to one side like a banana, one arm over the head.",
          back: "One arm reaches over, the other hand rests on the leg.",
          left: "Standing tall, the arm reaching up and over.",
          right: "Standing tall, the arm reaching up and over.",
          top: "Feet side by side, hips facing forward."
        },
        checks: [
          { name: "Side bend", joint: "body", side: "both", target: 66, tolerance: 16, weight: 2,
            tipLow: "Come up a little",
            tipHigh: "Lean further to the side" },
          { name: "Arms", joint: "armsLine", side: "body", target: 140, tolerance: 30, weight: 3,
            tipLow: "Slide your lower hand down",
            tipHigh: "Reach your arm over your head" },
          { name: "Knees", joint: "knee", side: "both", target: 178, tolerance: 15,
            tipLow: "Keep your {side} leg straight",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Tiryaka Tadasana",
        english: "Side bend, left",
        breath: "out",
        hold: 20,
        say: "Breathe in and come up. Now lift your right arm and lean to your left.",
        figure: {
          head: [50, 8], shoulder: [50, 15], elbow: [50, 6], wrist: [50, -2], hip: [50, 33],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "The body curves to the other side, the other arm over the head.",
          back: "One arm reaches over, the other hand rests on the leg.",
          left: "Standing tall, the arm reaching up and over.",
          right: "Standing tall, the arm reaching up and over.",
          top: "Feet side by side, hips facing forward."
        },
        checks: [
          { name: "Side bend", joint: "body", side: "both", target: 66, tolerance: 16, weight: 2,
            tipLow: "Come up a little",
            tipHigh: "Lean further to the side" },
          { name: "Arms", joint: "armsLine", side: "body", target: 140, tolerance: 30, weight: 3,
            tipLow: "Slide your lower hand down",
            tipHigh: "Reach your arm over your head" },
          { name: "Knees", joint: "knee", side: "both", target: 178, tolerance: 15,
            tipLow: "Keep your {side} leg straight",
            tipHigh: "" }
        ]
      },
      // Like Padahastasana in Surya Namaskar, but the hands only go as low as
      // is comfortable (knees may bend), so the fold tolerance is wide.
      {
        sanskrit: "Uttanasana",
        english: "Standing forward fold",
        breath: "out",
        hold: 25,
        say: "Come back to the middle. Breathe out and fold forward from your hips. Bend your knees if you need to. Let your head hang.",
        figure: {
          head: [62, 54], shoulder: [58, 48], elbow: [60, 54], wrist: [58, 59], hip: [42, 33],
          knee: [47, 46], ankle: [50, 57], toe: [55, 60]
        },
        views: {
          front: "The head hangs down, the hands reach toward the floor.",
          back: "The hips stay above the heels, the back is long or rounded.",
          left: "The body is folded in half over the legs.",
          right: "The body is folded in half over the legs.",
          top: "Hands near the feet, the head hanging down."
        },
        checks: [
          { name: "Fold", joint: "hip", side: "camera", target: 40, tolerance: 40, weight: 3,
            tipLow: "",
            tipHigh: "Fold forward more" },
          { name: "Knees", joint: "knee", side: "camera", target: 165, tolerance: 30,
            tipLow: "Straighten your legs a little",
            tipHigh: "" }
        ]
      },
      // WARRIOR II on each side. Same checks as Virabhadrasana II in poses.js,
      // plus "Wide legs" (the angle between the legs, about 70° in the test skeleton).
      {
        sanskrit: "Virabhadrasana II",
        english: "Warrior II, right",
        breath: "in",
        hold: 25,
        say: "Slowly roll up to standing. Step your feet wide apart. Turn your right foot out. Bend your right knee over your ankle. Stretch your arms out wide.",
        figure: {
          head: [50, 10], shoulder: [50, 17], elbow: [59, 17], wrist: [67.5, 17], hip: [50, 34],
          knee: [62, 43], ankle: [63, 57], toe: [68, 60], knee2: [40, 45], ankle2: [31, 57],
          toe2: [27, 60]
        },
        views: {
          front: "Feet wide apart, the front knee bent, arms stretched out in a T.",
          back: "Arms in one long line, the back leg straight.",
          left: "The front knee is bent right above the ankle.",
          right: "The back leg is straight and strong.",
          top: "The front foot points out to the side, the back foot points forward."
        },
        checks: [
          { name: "Front knee", joint: "knee", side: "bent", target: 105, tolerance: 25, weight: 3,
            tipLow: "Bend your front knee less",
            tipHigh: "Bend your front knee more" },
          { name: "Back knee", joint: "knee", side: "straight", target: 178, tolerance: 20,
            tipLow: "Straighten your back leg",
            tipHigh: "" },
          { name: "Wide legs", joint: "legsApart", side: "body", target: 65, tolerance: 20,
            tipLow: "Step your feet wider apart",
            tipHigh: "Bring your feet a bit closer" },
          { name: "Arms", joint: "shoulder", side: "both", target: 90, tolerance: 20,
            tipLow: "Lift your {side} arm higher",
            tipHigh: "Lower your {side} arm a little" }
        ]
      },
      {
        sanskrit: "Virabhadrasana II",
        english: "Warrior II, left",
        breath: "in",
        hold: 25,
        say: "Straighten your legs. Turn your left foot out. Bend your left knee over your ankle. Arms stay wide.",
        figure: {
          head: [50, 10], shoulder: [50, 17], elbow: [59, 17], wrist: [67.5, 17], hip: [50, 34],
          knee: [62, 43], ankle: [63, 57], toe: [68, 60], knee2: [40, 45], ankle2: [31, 57],
          toe2: [27, 60]
        },
        views: {
          front: "Feet wide apart, the other knee bent, arms stretched out in a T.",
          back: "Arms in one long line, the back leg straight.",
          left: "The back leg is straight and strong.",
          right: "The front knee is bent right above the ankle.",
          top: "The front foot points out to the side, the back foot points forward."
        },
        checks: [
          { name: "Front knee", joint: "knee", side: "bent", target: 105, tolerance: 25, weight: 3,
            tipLow: "Bend your front knee less",
            tipHigh: "Bend your front knee more" },
          { name: "Back knee", joint: "knee", side: "straight", target: 178, tolerance: 20,
            tipLow: "Straighten your back leg",
            tipHigh: "" },
          { name: "Wide legs", joint: "legsApart", side: "body", target: 65, tolerance: 20,
            tipLow: "Step your feet wider apart",
            tipHigh: "Bring your feet a bit closer" },
          { name: "Arms", joint: "shoulder", side: "both", target: 90, tolerance: 20,
            tipLow: "Lift your {side} arm higher",
            tipHigh: "Lower your {side} arm a little" }
        ]
      },
      // CHAIR: the same shape as Utkatasana in poses.js. Seen from the front
      // the bent knees point at the camera, and the 3D points measure them.
      {
        sanskrit: "Utkatasana",
        english: "Chair pose",
        breath: "out",
        hold: 20,
        say: "Step your feet together. Raise your arms up. Breathe out, bend your knees and sit back.",
        figure: {
          head: [47, 15], shoulder: [44, 22], elbow: [46, 12], wrist: [48, 3], hip: [41, 38],
          knee: [55, 45], ankle: [51, 57], toe: [56, 60]
        },
        views: {
          front: "Knees bent and together, arms reaching up.",
          back: "Hips pushed back, as if sitting on a chair.",
          left: "Knees bent, chest lifted, arms up by the ears.",
          right: "Knees bent, chest lifted, arms up by the ears.",
          top: "Feet together, knees over the toes."
        },
        checks: [
          { name: "Knees", joint: "knee", side: "both", target: 110, tolerance: 30, weight: 3,
            tipLow: "Rise up a little",
            tipHigh: "Bend your knees more" },
          { name: "Hips", joint: "hip", side: "both", target: 100, tolerance: 30,
            tipLow: "Lift your chest up",
            tipHigh: "Sit back a little more" },
          { name: "Arms", joint: "shoulder", side: "both", target: 165, tolerance: 25,
            tipLow: "Reach your {side} arm higher",
            tipHigh: "" }
        ]
      },
      // TREE on each side: the same checks as Vrikshasana in poses.js.
      {
        sanskrit: "Vrikshasana",
        english: "Tree, standing on the left leg",
        breath: "normal",
        hold: 25,
        say: "Stand up tall. Stand on your left leg. Rest your right foot on your inner leg, never the knee. Join your palms above your head.",
        figure: {
          head: [50, 8], shoulder: [50, 15], elbow: [50, 6], wrist: [50, -1], hip: [50, 33],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60], knee2: [57, 41], ankle2: [51, 38],
          toe2: [53, 41]
        },
        views: {
          front: "One foot on the inner thigh, the knee pointing out, palms together up high.",
          back: "Standing tall on one straight leg.",
          left: "The standing leg is straight, the arms reach up.",
          right: "The bent knee points out to the side.",
          top: "The bent knee opens out to the side."
        },
        checks: [
          { name: "Standing knee", joint: "knee", side: "straight", target: 178, tolerance: 15,
            tipLow: "Straighten your standing leg",
            tipHigh: "" },
          { name: "Bent knee", joint: "knee", side: "bent", target: 35, tolerance: 40, weight: 3, minVisibility: 0.2,
            tipLow: "",
            tipHigh: "Lift your foot higher" },
          { name: "Arms", joint: "shoulder", side: "both", target: 172, tolerance: 22,
            tipLow: "Reach your {side} arm up",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Vrikshasana",
        english: "Tree, standing on the right leg",
        breath: "normal",
        hold: 25,
        say: "Lower your foot. Now stand on your right leg. Rest your left foot on your inner leg, not the knee. Palms together up high.",
        figure: {
          head: [50, 8], shoulder: [50, 15], elbow: [50, 6], wrist: [50, -1], hip: [50, 33],
          knee: [50, 46], ankle: [50, 57], toe: [55, 60], knee2: [57, 41], ankle2: [51, 38],
          toe2: [53, 41]
        },
        views: {
          front: "The other foot on the inner thigh, palms together up high.",
          back: "Standing tall on one straight leg.",
          left: "The bent knee points out to the side.",
          right: "The standing leg is straight, the arms reach up.",
          top: "The bent knee opens out to the side."
        },
        checks: [
          { name: "Standing knee", joint: "knee", side: "straight", target: 178, tolerance: 15,
            tipLow: "Straighten your standing leg",
            tipHigh: "" },
          { name: "Bent knee", joint: "knee", side: "bent", target: 35, tolerance: 40, weight: 3, minVisibility: 0.2,
            tipLow: "",
            tipHigh: "Lift your foot higher" },
          { name: "Arms", joint: "shoulder", side: "both", target: 172, tolerance: 22,
            tipLow: "Reach your {side} arm up",
            tipHigh: "" }
        ]
      },
      {
        sanskrit: "Pranamasana",
        english: "Prayer pose",
        breath: "normal",
        hold: 20,
        say: "Lower your foot and stand on both feet. Bring your palms together at your chest. Smile and breathe. Have a great day!",
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
          { name: "Knees", joint: "knee", side: "both", target: 178, tolerance: 12,
            tipLow: "Straighten your {side} leg",
            tipHigh: "" },
          { name: "Upright", joint: "body", side: "camera", target: 90, tolerance: 12, weight: 2,
            tipLow: "Stand up straight",
            tipHigh: "" },
          { name: "Arms down", joint: "shoulder", side: "both", target: 20, tolerance: 25, weight: 2,
            tipLow: "",
            tipHigh: "Bring your hands to your chest" }
        ]
      }
    ]
  },

  // =============================================================
  // BEDTIME STRETCH: a calm wind-down of about 6½ minutes.
  // Sitting and lying poses with slow breathing, ending in Savasana.
  // Put the camera LOW, near the floor, and sit or lie sideways to it.
  // =============================================================
  {
    id: "bedtimeflow",
    sanskrit: "Bedtime Stretch",
    english: "Wind-Down Flow",
    icon: "✨",
    level: "Easy",
    focus: "Relax before sleep",
    tint: "#E6E3F5",
    image: "images/bedtimeflow.svg",
    view: "side",
    rounds: 1,   // the number chosen on the guide screen replaces this
    roundsRecommended: 1,
    restSay: "Rest here and breathe normally for a moment.",   // it ends lying down, so not "stand still"
    roundNote: "A calm wind-down before you sleep. One round is 9 slow positions, sitting and lying on the floor, and takes about 6 or 7 minutes. Breathe slowly and let your body relax. Yoga Buddy's voice will guide you. 🔊",
    camera: "Put a mat on the floor sideways to the camera. Place the camera low, near the floor, about 2.5 metres away, so it can see your whole body when you lie down.",
    safety: "Everything here should feel gentle: never force a stretch. Sit on a folded blanket if your hips or back feel tight, and keep your knees soft in the forward bend. Go gently in the twists if you have back, hip or knee problems. If your knees hurt in Child's pose, put a cushion between your hips and heels, or skip it. If you are pregnant, keep your knees wide in Child's pose and lie on your side for the relaxation. Also skip the lying twist and ask a doctor first.",
    positions: [
      // Sitting cross-legged: the body upright, the knees very bent and the
      // legs low on the floor (hip to ankle almost flat).
      {
        sanskrit: "Sukhasana",
        english: "Easy pose",
        breath: "normal",
        hold: 40,
        say: "Sit cross-legged, sideways to the camera. Rest your hands on your knees. Close your eyes. Breathe in slowly, and breathe out slowly.",
        figure: {
          head: [46, 31], shoulder: [45, 38], elbow: [50, 46], wrist: [57, 51], hip: [44, 55],
          knee: [57, 53], ankle: [50, 58], toe: [54, 59]
        },
        views: {
          front: "Legs crossed, hands resting on the knees, eyes closed.",
          back: "The back is tall and the shoulders are relaxed.",
          left: "Sitting up straight, the knees low and wide.",
          right: "Sitting up straight, the knees low and wide.",
          top: "The shins cross in front of the body."
        },
        checks: [
          { name: "Upright", joint: "body", side: "camera", target: 88, tolerance: 15, weight: 2,
            tipLow: "Sit up tall",
            tipHigh: "" },
          { name: "Crossed legs", joint: "knee", side: "camera", target: 35, tolerance: 30, weight: 2,
            tipLow: "",
            tipHigh: "Cross your legs" },
          { name: "On the floor", joint: "legs", side: "camera", target: 10, tolerance: 20,
            tipLow: "",
            tipHigh: "Sit down on the floor" }
        ]
      },
      // SEATED SIDE STRETCH on each side: one hand on the floor, the other arm
      // reaching over the head. The same "Side bend" and "Arms" checks as the
      // standing side bend in the Morning Flow.
      {
        sanskrit: "Parsva Sukhasana",
        english: "Seated side stretch, right",
        breath: "in",
        hold: 25,
        say: "Put your right hand on the floor beside you. Breathe in. Reach your left arm up and over to the right.",
        figure: {
          head: [46, 31], shoulder: [45, 38], elbow: [46, 29], wrist: [48, 21], hip: [44, 55],
          knee: [57, 53], ankle: [50, 58], toe: [54, 59]
        },
        views: {
          front: "Leaning to one side, the top arm reaching over the head.",
          back: "A long curve from the hip to the fingertips.",
          left: "Sitting cross-legged, the arm reaching up and over.",
          right: "Sitting cross-legged, the arm reaching up and over.",
          top: "The hand on the floor is beside the hip."
        },
        checks: [
          { name: "Side bend", joint: "body", side: "both", target: 66, tolerance: 16, weight: 2,
            tipLow: "Come up a little",
            tipHigh: "Lean further to the side" },
          { name: "Arms", joint: "armsLine", side: "body", target: 140, tolerance: 30, weight: 3,
            tipLow: "Rest your lower hand down",
            tipHigh: "Reach your arm over your head" },
          { name: "Crossed legs", joint: "knee", side: "camera", target: 35, tolerance: 30,
            tipLow: "",
            tipHigh: "Cross your legs" }
        ]
      },
      {
        sanskrit: "Parsva Sukhasana",
        english: "Seated side stretch, left",
        breath: "in",
        hold: 25,
        say: "Come back to the middle. Now put your left hand down. Reach your right arm over to the left.",
        figure: {
          head: [46, 31], shoulder: [45, 38], elbow: [46, 29], wrist: [48, 21], hip: [44, 55],
          knee: [57, 53], ankle: [50, 58], toe: [54, 59]
        },
        views: {
          front: "Leaning to the other side, the other arm over the head.",
          back: "A long curve from the hip to the fingertips.",
          left: "Sitting cross-legged, the arm reaching up and over.",
          right: "Sitting cross-legged, the arm reaching up and over.",
          top: "The hand on the floor is beside the hip."
        },
        checks: [
          { name: "Side bend", joint: "body", side: "both", target: 66, tolerance: 16, weight: 2,
            tipLow: "Come up a little",
            tipHigh: "Lean further to the side" },
          { name: "Arms", joint: "armsLine", side: "body", target: 140, tolerance: 30, weight: 3,
            tipLow: "Rest your lower hand down",
            tipHigh: "Reach your arm over your head" },
          { name: "Crossed legs", joint: "knee", side: "camera", target: 35, tolerance: 30,
            tipLow: "",
            tipHigh: "Cross your legs" }
        ]
      },
      // SEATED FORWARD BEND: legs straight out on the floor, the body folds
      // over them. Sitting up straight is about 90° at the hip; the test
      // figure folds to about 45°. Soft knees are fine, so the knees are generous.
      {
        sanskrit: "Paschimottanasana",
        english: "Seated forward bend",
        breath: "out",
        hold: 40,
        say: "Stretch both legs out in front. Breathe in and sit tall. Breathe out and fold forward gently. Hold your legs wherever they reach.",
        figure: {
          head: [55, 45], shoulder: [48, 46], elbow: [55, 51], wrist: [62, 55], hip: [35, 56],
          knee: [49, 57], ankle: [63, 57], toe: [65, 53]
        },
        views: {
          front: "The head bows down toward the legs.",
          back: "A long, gently rounded back.",
          left: "Legs straight on the floor, the body folded over them.",
          right: "Legs straight on the floor, the body folded over them.",
          top: "The hands reach toward the feet."
        },
        checks: [
          { name: "Fold", joint: "hip", side: "camera", target: 45, tolerance: 35, weight: 3,
            tipLow: "",
            tipHigh: "Fold forward a little more" },
          { name: "Legs out", joint: "knee", side: "camera", target: 172, tolerance: 25,
            tipLow: "Stretch your legs out",
            tipHigh: "" },
          { name: "Legs on floor", joint: "legs", side: "camera", target: 0, tolerance: 15, weight: 2,
            tipLow: "",
            tipHigh: "Sit with legs on the floor" }
        ]
      },
      // BUTTERFLY: the soles of the feet together, the knees dropping out to
      // the sides. The knees are VERY bent and the body stays upright.
      {
        sanskrit: "Baddha Konasana",
        english: "Butterfly pose",
        breath: "normal",
        hold: 40,
        say: "Sit up and bend your knees. Put the soles of your feet together. Hold your feet. Let your knees relax down.",
        figure: {
          head: [46, 31], shoulder: [45, 38], elbow: [50, 47], wrist: [53, 55], hip: [44, 55],
          knee: [55, 49], ankle: [52, 58], toe: [56, 59]
        },
        views: {
          front: "Knees open wide like butterfly wings, the feet together.",
          back: "Sitting tall with a long back.",
          left: "Sitting up straight, hands holding the feet.",
          right: "Sitting up straight, hands holding the feet.",
          top: "The soles of the feet press together, close to the body."
        },
        checks: [
          { name: "Upright", joint: "body", side: "camera", target: 85, tolerance: 15, weight: 2,
            tipLow: "Sit up tall",
            tipHigh: "" },
          { name: "Bent knees", joint: "knee", side: "camera", target: 35, tolerance: 30, weight: 2,
            tipLow: "",
            tipHigh: "Bring your feet closer in" },
          { name: "On the floor", joint: "legs", side: "camera", target: 10, tolerance: 20,
            tipLow: "",
            tipHigh: "Sit down on the floor" }
        ]
      },
      // CHILD'S POSE: kneeling, hips back on the heels, chest resting on the
      // thighs, arms forward on the floor. Very folded at the hip and knee.
      {
        sanskrit: "Balasana",
        english: "Child's pose",
        breath: "out",
        hold: 40,
        say: "Come onto your knees. Sit back on your heels. Breathe out and fold forward. Rest your forehead and arms on the floor.",
        figure: {
          head: [56, 56], shoulder: [48, 55], elbow: [57, 57], wrist: [65, 58], hip: [32, 49],
          knee: [44, 58], ankle: [30, 58], toe: [26, 59.5]
        },
        views: {
          front: "The forehead rests on the floor, the arms stretched forward.",
          back: "The back is round and soft, the hips on the heels.",
          left: "Folded up small, like a sleeping child.",
          right: "Folded up small, like a sleeping child.",
          top: "Arms reach forward, the knees under the chest."
        },
        checks: [
          { name: "Folded", joint: "hip", side: "camera", target: 30, tolerance: 30, weight: 3,
            tipLow: "",
            tipHigh: "Rest your chest on your thighs" },
          { name: "Kneeling", joint: "knee", side: "camera", target: 35, tolerance: 35, weight: 2,
            tipLow: "",
            tipHigh: "Sit back on your heels" },
          { name: "Chest down", joint: "body", side: "camera", target: 20, tolerance: 20,
            tipLow: "",
            tipHigh: "Lower your chest down" }
        ]
      },
      // LYING TWIST on each side: lying on your back, knees bent and dropped
      // to one side, arms out. The camera can't measure the twist itself
      // when you lie down (pose-check.js measures twists from above, which
      // only works sitting or standing), so we check that you are lying down
      // with your knees drawn in.
      {
        sanskrit: "Supta Matsyendrasana",
        english: "Lying twist, knees right",
        breath: "out",
        hold: 30,
        say: "Lie on your back. Hug your knees in. Stretch your arms out wide. Breathe out and lower your knees to the right.",
        figure: {
          head: [77, 55], shoulder: [70, 56.5], elbow: [68, 58], wrist: [66, 59], hip: [50, 56],
          knee: [50, 48], ankle: [37, 48.5], toe: [34, 48], knee2: [50, 54], ankle2: [37, 54.5],
          toe2: [34, 54]
        },
        views: {
          front: "The knees drop to one side, the arms rest out wide.",
          back: "Both shoulders stay on the floor.",
          left: "Lying down with the knees bent to one side.",
          right: "Lying down with the knees bent to one side.",
          top: "Arms in a T, the knees over to one side, the head looking the other way."
        },
        checks: [
          { name: "Lying down", joint: "body", side: "camera", target: 0, tolerance: 20, weight: 3,
            tipLow: "",
            tipHigh: "Lie down on your back" },
          { name: "Knees in", joint: "hip", side: "camera", target: 90, tolerance: 35, weight: 2,
            tipLow: "Ease your knees away a little",
            tipHigh: "Bring your knees in closer" }
        ]
      },
      {
        sanskrit: "Supta Matsyendrasana",
        english: "Lying twist, knees left",
        breath: "out",
        hold: 30,
        say: "Breathe in and bring your knees back up. Breathe out and lower them to the left.",
        figure: {
          head: [77, 55], shoulder: [70, 56.5], elbow: [68, 58], wrist: [66, 59], hip: [50, 56],
          knee: [50, 48], ankle: [37, 48.5], toe: [34, 48], knee2: [50, 54], ankle2: [37, 54.5],
          toe2: [34, 54]
        },
        views: {
          front: "The knees drop to the other side, the arms rest out wide.",
          back: "Both shoulders stay on the floor.",
          left: "Lying down with the knees bent to one side.",
          right: "Lying down with the knees bent to one side.",
          top: "Arms in a T, the knees over to the other side."
        },
        checks: [
          { name: "Lying down", joint: "body", side: "camera", target: 0, tolerance: 20, weight: 3,
            tipLow: "",
            tipHigh: "Lie down on your back" },
          { name: "Knees in", joint: "hip", side: "camera", target: 90, tolerance: 35, weight: 2,
            tipLow: "Ease your knees away a little",
            tipHigh: "Bring your knees in closer" }
        ]
      },
      // SAVASANA: lying flat and still. We check the body and legs are flat on
      // the floor and the legs are stretched out (not still bent from the twist);
      // the timer counts while you relax.
      {
        sanskrit: "Savasana",
        english: "Relaxation pose",
        breath: "normal",
        hold: 60,
        say: "Bring your knees to the middle and stretch your legs out. Lie flat with your arms by your sides. Close your eyes. Let your whole body relax. When you are ready, roll onto your side before sitting up.",
        figure: {
          head: [80, 55], shoulder: [73, 57], elbow: [64, 58], wrist: [56, 58.5], hip: [55, 57.5],
          knee: [41, 58], ankle: [27, 58], toe: [25, 54]
        },
        views: {
          front: "Lying still, the eyes closed, the face soft.",
          back: "The whole back rests on the floor.",
          left: "Lying flat, the arms a little away from the body.",
          right: "Lying flat, the arms a little away from the body.",
          top: "Legs a little apart, palms facing up."
        },
        checks: [
          { name: "Lying flat", joint: "body", side: "camera", target: 0, tolerance: 15, weight: 2,
            tipLow: "",
            tipHigh: "Lie down flat on your back" },
          { name: "Legs flat", joint: "legs", side: "camera", target: 0, tolerance: 15, weight: 2,
            tipLow: "",
            tipHigh: "Stretch your legs out flat" },
          { name: "Legs straight", joint: "knee", side: "camera", target: 172, tolerance: 20, weight: 2,
            tipLow: "Stretch your legs out straight",
            tipHigh: "" }
        ]
      }
    ]
  }
);
