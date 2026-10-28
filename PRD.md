How to use this file:
1. Make a new empty folder called `yoga-buddy`.
2. Put this file inside it and rename it to `PRD.md`.
3. Put your pose pictures in a folder called `images/` (see Part 3).
4. Open Claude Code in that folder and paste the **Mega Prompt** from Part 1.

---

## PART 1 — MEGA PROMPT
```
You are helping a team of three Class 9 students build "Yoga Buddy" for a school science fair.
Read PRD.md in this folder fully before writing any code. It is the source of truth.

Rules for how you work with us:
1. Build in the phases listed in PRD.md section 9. Do ONE phase at a time.
   After each phase, stop, tell us how to test it in the browser, and wait for us to say "next".
2. Keep the code simple enough for beginners to understand. Use plain HTML, CSS and
   JavaScript only. No React, no build tools, no npm, no backend. It must run by opening
   it with a simple local server (tell us exactly how).
3. Add short, clear comments in the code explaining what each part does.
4. After each phase, explain the new code to us in simple English in 5-10 bullet points,
   so we can explain it to the judges ourselves.
5. Use MediaPipe Pose Landmarker (@mediapipe/tasks-vision) loaded from a CDN for body
   detection. Everything must run on the user's device. Never upload or save video.
6. All pose data (target angles, tips, steps) must live in ONE file, poses.js, so we can
   edit angles and tips ourselves without touching the rest of the code.
7. If something in PRD.md is unclear or seems wrong, ask us before guessing.
8. Do not add features that are not in PRD.md. Keep version 1 small and working.

Start with Phase 1.
```

---

## PART 2 — PRD (Product Requirements Document)

### 1. What is Yoga Buddy?
A free website that helps beginners learn yoga poses correctly at home. The user stands
in front of their laptop or phone camera. Yoga Buddy finds their body, checks the pose,
gives short tips to fix mistakes, and shows a score out of 100.

### 2. The problem
People learning yoga from videos have nobody to correct them. A video can't see you.
Wrong poses give less benefit and can cause strain. Not everyone can afford a teacher.

### 3. Who it's for
- Beginners learning yoga at home
- Students who want a quick stretch break between studying
- People who can't afford or reach a yoga class

### 4. Success goals (version 1 is done when all of these are true)
- Finds the user's body with a normal laptop or phone camera
- Shows a correction tip within about 1 second of a mistake
- Works in Chrome on laptop and phone, nothing to install
- A beginner can use it without help
- No video ever leaves the device

### 5. Screens

**Screen 1 — Home**
- App name "Yoga Buddy" and a one-line tagline
- Grid of 5 pose cards (picture, Sanskrit name, English name in brackets)
- Small privacy note: "Your camera video stays on your device."

**Screen 2 — Pose guide**
- Big picture of the pose
- 3-5 easy steps to get into the pose
- Which way to face the camera (front or side)
- Safety note
- Button: "Start with camera"

**Screen 3 — Practice (the main screen)**
- "Start" button: the camera and the voice start when the user presses it
- Live camera view, mirrored (like a selfie camera)
- Body skeleton drawn on top: green lines for joints that are correct, red for joints that need fixing
- Big tip text (max 6 words), e.g. "Bend your left knee more"
- Live score out of 100
- Voice guide: reads the pose steps aloud, one at a time. It waits until the camera sees
  the user has done that step, then says the next one. Steps the camera can't check
  (like "Breathe slowly") move on after a few seconds.
- 30-second hold timer that starts after the last step, and only counts while score is 70 or above
- Voice reminders during the hold: if a joint stays wrong for about 2 seconds, the voice
  says its tip (at most once every ~4 seconds, so it doesn't nag)
- Breathing cue under the timer: "Breathe in… breathe out…" (switches every 4 seconds)
- Buttons: "Back" and "Restart"

**Screen 4 — Result**
- Best score for this pose
- One line of praise or advice depending on score
- Buttons: "Try again" and "Next pose"

### 6. The 5 poses (version 1)
| Pose | English | Camera view |
| --- | --- | --- |
| Tadasana | Palm Tree | Front |
| Vrikshasana | Tree | Front |
| Virabhadrasana II | Warrior II | Front |
| Utkatasana | Chair | Side |
| Bhujangasana | Cobra | Side |

### 7. How pose checking works
1. MediaPipe gives body points (landmarks) for each camera frame.
2. Calculate the angle at a joint using three points A, B, C (angle at B):
   `angle = arccos( (BA · BC) / (|BA| × |BC|) )`, converted to degrees.
3. Compare each angle with the target angle for that pose (from poses.js).
4. If a joint is off by more than its `tolerance` (default 15°), mark it red and show its tip.
   If several joints are wrong, show the tip for the worst one.
   Tips must be easy to understand: each joint has one tip for "angle too small" and one
   for "angle too big", and tips name the side of the body from the user's own point of
   view, e.g. "Straighten your left knee", "Lower your right arm a little".
5. Score = 100 minus the weighted average degrees off across all checked joints (minimum 0).
   Each check can have a `weight` in poses.js (default 1): the joint that defines the pose
   counts more, so someone not doing the pose can't get a good score from the other joints.
6. Smooth the score and tips over the last ~10 frames so they don't flicker.
7. Ignore landmarks with low visibility (below 0.5). If key body parts aren't visible,
   show "Step back so your whole body is in view."
8. For poses where either leg can be in front (Virabhadrasana II, Vrikshasana),
   detect which side the user is doing and check that side.

MediaPipe landmark numbers to use:
| Body part | Left | Right |
| --- | --- | --- |
| Shoulder | 11 | 12 |
| Elbow | 13 | 14 |
| Wrist | 15 | 16 |
| Hip | 23 | 24 |
| Knee | 25 | 26 |
| Ankle | 27 | 28 |

### 8. Look and feel
- Calm, friendly, clean. Lots of white space, rounded cards, soft colours.
- Colours and font: see Part 3, Input 4.
- Big, readable text on the practice screen (people stand 2 metres away).
- Mobile-friendly layout.

### 9. Build phases
- **Phase 1:** Home screen + pose guide screens with all 5 poses (no camera yet).
- **Phase 2:** Camera turns on, MediaPipe draws the skeleton on the user.
- **Phase 3:** Angle calculation + live score for Tadasana only. Show angles on screen for debugging.
- **Phase 4:** Clear tips (too small / too big, left / right), green/red joints, smoothing, "step back" message.
- **Phase 5:** "Start" button, voice step-by-step guide, 30-second hold timer, voice reminders
  (moved before "all poses" at the team's request on 2026-10-21; built for Tadasana first).
- **Phase 6:** All 5 poses + side detection, each pose calibrated from a reference video.
- **Phase 7:** Breathing cue, result screen.
- **Phase 8:** Polish: design, phone layout, loading message, camera-permission-denied message.
- **Phase 9:** Help us deploy it for free (GitHub Pages or Netlify) so we can open it at the fair.

### 10. Not in version 1 (do NOT build these yet)
Accounts/login, saving progress, routines, other languages, more poses.
(Voice was moved into version 1 on 2026-10-20. It uses the browser's built-in English voice,
preferring voices that run on the device.)

### 11. Safety text (show on every pose guide screen)
"Only go as far as feels comfortable. Stop if anything hurts. Yoga Buddy does not replace
a real yoga teacher or doctor."

---

## PART 3 — INPUTS YOUR TEAM MUST PREPARE

Fill these in before starting. Claude Code can only be as good as what you give it.

### Input 1 — Target angles (Advaith Sai checks these)
These are starting values. Check each one by doing the pose yourselves or from a trusted
yoga guide, then edit them. Put the final values in this table before Phase 3.

Joint angle = angle at the middle point. Example: knee = hip–knee–ankle.
From Phase 4, each joint also gets a second tip for the other direction (see section 7, point 4).

Tadasana is the Palm Tree version from the Common Yoga Protocol (team decision, 2026-10-20).
Its targets were measured frame by frame from the official "Yoga with Modi — Tadasana" video
(Ministry of AYUSH, CC BY 3.0): arms 177–179°, elbows 156–158°, knees 177–179°, hips 175°.
From the front, the camera cannot tell whether the heels are lifted, so that step is not checked.

Phase 6 (2026-10-21): the other four poses were calibrated the same way, from the official
"Yoga with Modi — Vrikshasana" video and freely licensed photos on Wikimedia Commons
(3 Warrior II, 2 Chair, 2 Cobra, 4 Tree). Chair and Cobra had the fewest good references,
so the team should test those two most. Cobra also checks that the legs are flat on the floor:
without it, someone standing up scored 72 as Cobra.

| Pose | Joint (points) | Target | Tolerance | Tip if wrong |
| --- | --- | --- | --- | --- |
| Tadasana | Arms (hip–shoulder–elbow), weight 3 | 175° | 15° | Raise your arm higher |
| Tadasana | Elbows (shoulder–elbow–wrist) | 165° | 15° | Straighten your arm |
| Tadasana | Knees (hip–knee–ankle) | 180° | 15° | Straighten your legs |
| Tadasana | Hips (shoulder–hip–knee) | 180° | 15° | Stand up tall |
| Vrikshasana | Standing knee | 180° | 15° | Straighten your standing leg |
| Vrikshasana | Bent knee, weight 3 (only "too low" is a mistake) | 30° | 40° | Lift your foot higher |
| Vrikshasana | Arms (hip–shoulder–elbow) | 175° | 20° | Reach your arm up |
| Virabhadrasana II | Front knee, weight 3 | 100° | 20° | Bend your front knee more / less |
| Virabhadrasana II | Back knee | 180° | 20° | Straighten your back leg |
| Virabhadrasana II | Arms (hip–shoulder–elbow) | 90° | 15° | Lift your arm higher / Lower your arm a little |
| Virabhadrasana II | Elbows (shoulder–elbow–wrist) | 180° | 15° | Straighten your arm |
| Utkatasana | Knees, weight 3 | 105° | 30° | Bend your knees more / Rise up a little |
| Utkatasana | Hips (shoulder–hip–knee) | 100° | 25° | Lean forward a little / Lift your chest up |
| Utkatasana | Arms (hip–shoulder–elbow) | 170° | 20° | Reach your arms up higher |
| Bhujangasana | Legs on floor (hip–ankle line vs floor), weight 3 | 0° | 20° | Lie down on your stomach |
| Bhujangasana | Elbows | 160° | 20° | Push up a little |
| Bhujangasana | Back (shoulder–hip–knee), weight 3 | 130° | 20° | Lift your chest higher / Lower your chest a little |
| Bhujangasana | Knees | 175° | 15° | Keep your legs straight |

### Input 2 — Pose pictures (Sidhanth)
- One clear picture per pose, same style for all 5 (drawn or photo of a teammate).
- Name them: `tadasana.png`, `vrikshasana.png`, `virabhadrasana2.png`, `utkatasana.png`, `bhujangasana.png`
- Put them in the `images/` folder.
- Only use pictures you made or are allowed to use. No copied Google images.

### Input 3 — Steps for each pose (Advaith Sai)
3-5 short steps per pose, in simple words. Example for Tadasana (Palm Tree):
1. Stand with your feet a little apart.
2. Interlock your fingers in front of you.
3. Breathe in and stretch your arms straight up.
4. Lift your heels and balance on your toes.
5. Hold for 10 to 30 seconds, then come down slowly.

### Input 4 — Design choices (Sidhanth + Mithun)
- Main colour: ____ (e.g. calm green #2E7D5B)
- Accent colour: ____
- Font: ____ (e.g. Poppins from Google Fonts)
- Tagline: ____ (e.g. "Your yoga teacher, right on your screen")
- Logo: optional, put as `images/logo.png`

### Input 5 — Testing checklist (everyone, after Phase 7)
- [ ] Works on a laptop in Chrome
- [ ] Works on a phone in Chrome
- [ ] Works in a normal room light
- [ ] Each pose gives the right tip when done wrong on purpose
- [ ] Score goes up when the pose is done correctly
- [ ] Shows a clear message if camera permission is denied
