// =============================================================
// tests/make-images.mjs — draws the pictures for the pose cards.
//
//   node tests/make-images.mjs            (re)draw every pose picture that is an .svg
//
// Each picture is a stick figure made from the pose's test skeleton
// (tests/skeletons/), on a soft circle in the pose's own colour — the
// same style as images/suryanamaskar.svg. Front-view poses are drawn
// from the front, side-view poses from the side (facing right).
// Pictures that aren't .svg (the photos of the 5 Basic Asanas) and
// suryanamaskar.svg are never touched.
// =============================================================

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fromSide } from "./skeleton-kit.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const KEEP = ["images/suryanamaskar.svg"];

// ----- Load the poses and skeletons (like pose-lab.mjs) -----
const files = ["poses.js"].concat(fs.readdirSync(ROOT).filter(function (f) { return /^(poses-.+|flows.*)\.js$/.test(f); }).sort());
const context = {};
vm.createContext(context);
vm.runInContext(files.map(function (f) { return fs.readFileSync(path.join(ROOT, f), "utf8"); }).join("\n;\n") + "\nthis.POSES = POSES;", context);
const skeletons = {};
for (const file of fs.readdirSync(path.join(HERE, "skeletons"))) {
  if (file.endsWith(".mjs")) {
    Object.assign(skeletons, (await import(pathToFileURL(path.join(HERE, "skeletons", file)).href)).default);
  }
}

// Which position of a flow is on its card, and what is drawn behind it
const FLOW_COVER = {
  chandranamaskar: { position: "Ardha Chandrasana", sky: "moon" },
  morningflow:     { position: "Virabhadrasana II", sky: "sunrise" },
  bedtimeflow:     { position: "Balasana", sky: "stars" }
};

const INK = "#1D2B2A";

// A few poses look clearer from the other side than their best camera view
const DRAW_FROM = { ardhamatsyendrasana: "side" };

function svgFor(pose) {
  let skeleton = skeletons[pose.id];
  let view = DRAW_FROM[pose.id] || (pose.view === "side" ? "side" : "front");
  let sky = null;
  if (pose.positions) {
    const cover = FLOW_COVER[pose.id] || { position: 0 };
    let index = typeof cover.position === "number" ? cover.position
      : pose.positions.findIndex(function (p) { return p.sanskrit.indexOf(cover.position) === 0; });
    if (index < 0) {
      index = 0;
    }
    const position = pose.positions[index];
    skeleton = skeletons[pose.id + ":" + index] || (position.figure && fromSide(position.figure));
    view = (position.view || pose.view) === "front" ? "front" : "side";
    sky = cover.sky || null;
  }
  if (!skeleton) {
    return null;
  }

  // Flatten the skeleton onto the picture: front = x across, side = forward across
  const flat = {};
  for (const name in skeleton) {
    const q = skeleton[name];
    flat[name] = view === "front" ? { x: q.x, y: q.y, depth: q.z } : { x: q.z, y: q.y, depth: q.x };
  }
  // The head: a little behind and above the nose
  const nose = skeleton.nose;
  flat.head = view === "front" ? { x: nose.x, y: nose.y + 0.03, depth: nose.z }
                               : { x: nose.z - 0.05, y: nose.y + 0.03, depth: 0 };

  // Fit it into the middle of the circle (400 × 500 picture), on a floor line
  const chair = pose.id.indexOf("chair") === 0;
  let minX = Infinity, maxX = -Infinity, minY = 0, maxY = -Infinity;   // (the floor, y = 0, is always in)
  for (const name in flat) {
    minX = Math.min(minX, flat[name].x); maxX = Math.max(maxX, flat[name].x);
    minY = Math.min(minY, flat[name].y); maxY = Math.max(maxY, flat[name].y);
  }
  if (chair) {
    maxX = Math.max(maxX, Math.min(flat.lHip.x, flat.rHip.x) - 0.25 + 0.5);
    minX = Math.min(minX, Math.min(flat.lHip.x, flat.rHip.x) - 0.28);
  }
  const headRoom = 0.14;
  const scale = Math.min(270 / (maxX - minX + 0.24), 300 / (maxY + headRoom - minY));
  const midX = (minX + maxX) / 2;
  const height = (maxY + headRoom - minY) * scale;
  const floorY = Math.round(255 + height / 2);
  const X = function (q) { return Math.round((200 + (q.x - midX) * scale) * 10) / 10; };
  const Y = function (q) { return Math.round((floorY - (q.y - minY) * scale) * 10) / 10; };

  const mid = function (a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, depth: (a.depth + b.depth) / 2 }; };
  const neck = mid(flat.lShoulder, flat.rShoulder);
  const pelvis = mid(flat.lHip, flat.rHip);

  // The bones; in a side view the right side is the far side (drawn first, lighter)
  const sides = { l: [], r: [] };
  for (const s of ["l", "r"]) {
    sides[s].push([flat[s + "Shoulder"], flat[s + "Elbow"]], [flat[s + "Elbow"], flat[s + "Wrist"]],
                  [flat[s + "Hip"], flat[s + "Knee"]], [flat[s + "Knee"], flat[s + "Ankle"]],
                  [flat[s + "Ankle"], flat[s + "Toe"]]);
  }
  const line = function (a, b) {
    return '<line x1="' + X(a) + '" y1="' + Y(a) + '" x2="' + X(b) + '" y2="' + Y(b) + '"/>';
  };
  let far = "";
  let near = "";
  if (view === "side") {
    far = sides.r.map(function (b) { return line(b[0], b[1]); }).join("");
    near = sides.l.map(function (b) { return line(b[0], b[1]); }).join("");
  } else {
    near = sides.l.concat(sides.r).map(function (b) { return line(b[0], b[1]); }).join("");
    near += line(flat.lShoulder, flat.rShoulder) + line(flat.lHip, flat.rHip);
  }
  near += line(neck, pelvis) + line(neck, flat.head);

  // Chair yoga: a simple chair under the hips (behind the person)
  let chairDrawing = "";
  if (chair) {
    const seatY = Math.min(flat.lHip.y, flat.rHip.y) - 0.06;
    const back = Math.min(flat.lHip.x, flat.rHip.x) - 0.2;
    const front = back + 0.45;
    const P = function (x, y) { return { x: x, y: y }; };
    chairDrawing = '<g stroke="#8A6A4F" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.7">' +
      line(P(back, seatY), P(front, seatY)) + line(P(back, 0), P(back, seatY + 0.5)) +
      line(P(front, 0), P(front, seatY)) + "</g>";
  }

  const tint = pose.tint || "#E6EEF0";
  let back =
    '<circle cx="200" cy="250" r="178" fill="' + tint + '"/>' +
    '<circle cx="200" cy="250" r="140" fill="#FFFFFF" opacity="0.45"/>';
  if (sky === "moon") {
    back += '<circle cx="292" cy="112" r="40" fill="#F4E9C8"/><circle cx="310" cy="100" r="34" fill="' + tint + '"/>';
  } else if (sky === "sunrise") {
    back += '<circle cx="300" cy="120" r="38" fill="#FFC979"/><circle cx="300" cy="120" r="52" fill="#FFC979" opacity="0.3"/>';
  } else if (sky === "stars") {
    back += '<g fill="#F4E9C8"><circle cx="110" cy="120" r="5"/><circle cx="290" cy="96" r="6"/><circle cx="318" cy="170" r="4"/><circle cx="150" cy="80" r="3.5"/></g>' +
            '<circle cx="268" cy="132" r="30" fill="#F4E9C8"/><circle cx="282" cy="122" r="26" fill="' + tint + '"/>';
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img" aria-label="' +
    pose.english.replace(/"/g, "") + ' pose">' +
    "<!-- Drawn by tests/make-images.mjs from the test skeleton -->" +
    back + chairDrawing +
    '<g stroke="' + INK + '" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
    (far ? '<g opacity="0.38">' + far + "</g>" : "") + near + "</g>" +
    '<circle cx="' + X(flat.head) + '" cy="' + Y(flat.head) + '" r="22" fill="' + INK + '"/>' +
    '<line x1="60" y1="' + (floorY + 10) + '" x2="340" y2="' + (floorY + 10) + '" stroke="' + INK + '" stroke-opacity="0.22" stroke-width="6" stroke-linecap="round"/>' +
    "</svg>\n";
}

let made = 0;
for (const pose of context.POSES) {
  if (!pose.image || !pose.image.endsWith(".svg") || KEEP.includes(pose.image)) {
    continue;
  }
  const svg = svgFor(pose);
  if (!svg) {
    console.log("✗ " + pose.id + ": no skeleton to draw");
    continue;
  }
  fs.writeFileSync(path.join(ROOT, pose.image), svg);
  made++;
}
console.log("Drew " + made + " pictures.");
