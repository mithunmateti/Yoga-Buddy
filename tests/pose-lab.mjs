// =============================================================
// tests/pose-lab.mjs — tests every pose WITHOUT a camera.
//
//   node tests/pose-lab.mjs               test everything
//   node tests/pose-lab.mjs trikonasana   test the poses whose id contains this word
//   node tests/pose-lab.mjs --figure chandranamaskar:4
//                                         print the stick figure (for poses.js) of a skeleton
//
// For every pose (and every position of a flow) there is a pretend 3D
// body in tests/skeletons/. The lab turns it into what MediaPipe would
// give from different camera angles (front, both sides, slanted), with
// and without camera wobble, and runs Yoga Buddy's real checking code
// (pose-check.js) on it. A pose passes when the right body scores 85 or
// more from every angle the pose is meant to work from.
//
// It also checks:
//   • a different pose doesn't fool the checks (e.g. just standing must
//     not count as Triangle),
//   • in a flow, a position isn't already "done" in the position before
//     it (the coach would skip it),
//   • every step's checks are right in the finished pose.
// And it shows the OLD way (picture only, no 3D) next to the new way,
// so you can see what the 3D points improved.
// =============================================================

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";
import { measureJoints, smoothJoints, startFresh, calculateScore, isWrong, tipFor } from "../pose-check.js";
import { cameraView, toFigure, standing, fromFront, fromSide } from "./skeleton-kit.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const PASS = 85;          // the right body must score at least this
const GOOD_SCORE = 70;    // coach.js: the hold timer counts at 70 or more

// ----- Load the poses, like the web pages do -----
// poses.js first (it makes the POSES list), then every other poses-….js and flows….js file
const POSE_FILES = ["poses.js"].concat(fs.readdirSync(ROOT).filter(function (file) {
  return /^(poses-.+|flows.*)\.js$/.test(file);
}).sort());
const context = { console: console };
vm.createContext(context);
let code = "";
for (const file of POSE_FILES) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full)) {
    code += fs.readFileSync(full, "utf8") + "\n;\n";
  }
}
vm.runInContext(code + "\nthis.POSES = POSES;", context);
const POSES = context.POSES;

// ----- Load the skeletons -----
const skeletons = {};
const requiredViews = {};
const allowed = {};   // decoys that may look like a pose, e.g. "standing, arms up" IS Tadasana
for (const file of fs.readdirSync(path.join(HERE, "skeletons")).sort()) {
  if (!file.endsWith(".mjs")) {
    continue;
  }
  const mod = await import(pathToFileURL(path.join(HERE, "skeletons", file)).href);
  Object.assign(skeletons, mod.default);
  Object.assign(requiredViews, mod.views || {});
  Object.assign(allowed, mod.allow || {});
}

// ----- Command line -----
const args = process.argv.slice(2);
if (args[0] === "--figure") {
  const s = skeletons[args[1]];
  if (!s) {
    console.error("No skeleton called " + args[1]);
    process.exit(1);
  }
  console.log(JSON.stringify(toFigure(s)).replace(/"(\w+)":/g, "$1: ").replace(/,(\w)/g, ", $1"));
  process.exit(0);
}
const only = args.find(function (a) { return !a.startsWith("-"); });
const quiet = args.includes("--quiet");

// ----- Measuring one view -----
// frames: how many camera pictures (with wobble) to smooth over, like practice.js
function score(checks, skeleton, yaw, options) {
  const o = options || {};
  startFresh();
  let joints = [];
  const frames = o.noise ? 12 : 16;
  for (let i = 0; i < frames; i++) {
    const v = cameraView(skeleton, yaw, o.noise || 0, 1000 * (o.seed || 1) + i);
    const measured = measureJoints(checks, v.points, v.width, v.height, o.flat ? null : v.world);
    smoothJoints(measured.joints);
    joints = measured.joints;
  }
  const wrong = joints.filter(isWrong);
  return { score: calculateScore(joints), joints: joints, wrong: wrong };
}

function viewsFor(id, pose) {
  if (requiredViews[id]) {
    return requiredViews[id];
  }
  return pose.view === "side" ? [90, -90, 45, -45] : [0, 45, -45];
}

const VIEW_NAME = { "0": "front", "90": "side", "-90": "side2", "45": "slant", "-45": "slant2", "180": "back" };
const ALL_VIEWS = [0, 45, -45, 90, -90];

// ----- Some bodies that must NOT count as most poses -----
const decoys = {
  "just standing": standing(),
  "standing, arms up": fromFront({
    nose: [50, 8], lShoulder: [56, 16], rShoulder: [44, 16], lElbow: [57, 7], rElbow: [43, 7],
    lWrist: [57, -1], rWrist: [43, -1], lHip: [53.5, 33], rHip: [46.5, 33],
    lKnee: [53.5, 46], rKnee: [46.5, 46], lAnkle: [53.5, 58], rAnkle: [46.5, 58]
  })
};

// ----- Run the tests -----
const problems = [];
const notes = [];
const rows = [];

function describe(result) {
  return result.wrong.map(function (j) {
    return j.check.name + (j.side === "body" ? "" : " " + j.side) + " " + Math.round(j.angle) + "° (want " + j.check.target + "±" + (j.check.tolerance || 15) + ")";
  }).join(", ");
}

function testItem(id, label, checks, pose, others) {
  const s = skeletons[id];
  if (!s) {
    problems.push(label + ": no skeleton in tests/skeletons/ (key \"" + id + "\")");
    return;
  }
  const required = viewsFor(id, pose);
  const row = { label: label, cells: {}, flat: {} };
  for (const yaw of ALL_VIEWS) {
    const clean = score(checks, s, yaw);
    const noisy = [1, 2, 3].map(function (seed) { return score(checks, s, yaw, { noise: 0.05, seed: seed }); });
    const worstNoisy = noisy.reduce(function (a, b) { return (a.score ?? -1) <= (b.score ?? -1) ? a : b; });
    const flat = score(checks, s, yaw, { flat: true });
    row.cells[yaw] = { clean: clean.score, noisy: worstNoisy.score };
    row.flat[yaw] = flat.score;
    if (required.includes(yaw)) {
      if (clean.score === null || clean.score < PASS || clean.wrong.length) {
        problems.push(label + " from the " + VIEW_NAME[yaw] + ": scores " + clean.score + (clean.wrong.length ? " — wrong: " + describe(clean) : ""));
      } else if (worstNoisy.score === null || worstNoisy.score < GOOD_SCORE) {
        problems.push(label + " from the " + VIEW_NAME[yaw] + " with camera wobble: scores " + worstNoisy.score + " — wrong: " + describe(worstNoisy));
      }
    }
  }
  rows.push(row);

  // A different body must not count as this pose
  const firstView = required[0];
  for (const name in others) {
    const r = score(checks, others[name], firstView);
    if (r.score !== null && r.score >= GOOD_SCORE && r.wrong.length === 0) {
      problems.push(label + ": \"" + name + "\" ALSO counts as this pose (score " + r.score + "). Add a check that tells them apart.");
    } else if (r.score !== null && r.score >= GOOD_SCORE) {
      notes.push(label + ": \"" + name + "\" scores " + r.score + " (but gets a tip: " + describe(r).split(",")[0] + ")");
    }
  }
}

for (const pose of POSES) {
  if (only && !pose.id.includes(only)) {
    continue;
  }
  if (!pose.positions) {
    const others = Object.assign({}, decoys);
    for (const other of POSES) {
      if (other !== pose && !other.positions && skeletons[other.id] && !(allowed[pose.id] || []).includes(other.id)) {
        others[other.sanskrit] = skeletons[other.id];
      }
    }
    for (const name of allowed[pose.id] || []) {
      delete others[name];
    }
    testItem(pose.id, pose.sanskrit, pose.checks, pose, others);
    // Every step's checks must be right in the finished pose
    const names = pose.checks.map(function (c) { return c.name; });
    for (const st of pose.steps) {
      for (const name of st.waitFor) {
        if (!names.includes(name)) {
          problems.push(pose.sanskrit + ": step \"" + st.text + "\" waits for \"" + name + "\", but there is no check with that name");
        }
      }
    }
  } else {
    pose.positions.forEach(function (position, i) {
      const id = pose.id + ":" + i;
      // No skeleton written for this position? Build one from its stick figure.
      if (!skeletons[id] && position.figure) {
        skeletons[id] = fromSide(position.figure);
      }
      const label = pose.sanskrit + " " + (i + 1) + ". " + position.sanskrit;
      const fakePose = { view: position.view || pose.view };
      if (position.checks.length === 0) {
        if (!skeletons[id]) {
          notes.push(label + ": no checks (the coach just waits), no skeleton needed");
          return;
        }
      }
      testItem(id, label, position.checks, fakePose, {});
      // Not already "done" in the position before (the coach would rush on)
      const before = skeletons[pose.id + ":" + (i - 1)];
      // (A position with a hold time is held anyway, so it can't be skipped.)
      if (before && position.checks.length && !position.hold && !position.sameAsBefore) {
        const r = score(position.checks, before, viewsFor(id, fakePose)[0]);
        if (r.score !== null && r.wrong.length === 0) {
          problems.push(label + ": already looks right in the position BEFORE it (score " + r.score + "), so the coach would skip it");
        }
      }
    });
  }
}

// ----- Print the results -----
const pad = function (text, n) { text = String(text); return text.length >= n ? text.slice(0, n) : text + " ".repeat(n - text.length); };
if (!quiet) {
  console.log("\nScore of the right body from each camera angle: NEW (3D + picture) / OLD (picture only)");
  console.log(pad("Pose", 44) + ALL_VIEWS.map(function (y) { return pad(VIEW_NAME[y], 13); }).join(""));
  for (const row of rows) {
    console.log(pad(row.label, 44) + ALL_VIEWS.map(function (y) {
      const c = row.cells[y];
      return pad((c.clean ?? "–") + "/" + (row.flat[y] ?? "–") + (c.noisy !== null && c.noisy < GOOD_SCORE ? "!" : ""), 13);
    }).join(""));
  }
  console.log("(! = drops below " + GOOD_SCORE + " with camera wobble)");
}
if (notes.length && !quiet) {
  console.log("\nNotes:");
  for (const n of notes) console.log("  · " + n);
}
if (problems.length) {
  console.log("\n✗ " + problems.length + " problem" + (problems.length === 1 ? "" : "s") + ":");
  for (const pr of problems) console.log("  ✗ " + pr);
  process.exitCode = 1;
} else {
  console.log("\n✓ All " + rows.length + " poses and positions pass.");
}
