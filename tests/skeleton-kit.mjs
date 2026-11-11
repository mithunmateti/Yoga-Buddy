// =============================================================
// tests/skeleton-kit.mjs — make pretend 3D bodies for testing poses.
//
// A "skeleton" is a body in a pose, in METRES, seen from the person:
//   x = to the person's LEFT, y = UP, z = FORWARD (the way they face).
//   The floor is y = 0.
// Points: nose, lShoulder, rShoulder, lElbow, rElbow, lWrist, rWrist,
//         lHip, rHip, lKnee, rKnee, lAnkle, rAnkle, lToe, rToe
//         (l = the person's left, r = their right).
//
// Two easy ways to draw one (both use the 100 × 60 box of figure.js,
// y going DOWN, the floor at y = 60, about 1 unit = 3.2 cm):
//   fromSide(figure)  — a side view, the person facing RIGHT, like the
//                       Surya Namaskar figures in poses.js. The near side
//                       is the LEFT side. Add knee2/ankle2/toe2 for the far
//                       (right) leg and elbow2/wrist2 for the far arm, if
//                       they are somewhere else.
//   fromFront(points) — a front view, the person FACING you. Their left
//                       side is on YOUR right (bigger x). Give each point
//                       as [x, y] or [x, y, forward] (forward = towards
//                       you, in the same units), e.g. a knee bent forward.
// You can also write the points in metres yourself.
// =============================================================

export const UNIT = 0.032;   // metres per figure unit

const NAMES = ["nose", "lShoulder", "rShoulder", "lElbow", "rElbow", "lWrist", "rWrist",
  "lHip", "rHip", "lKnee", "rKnee", "lAnkle", "rAnkle", "lToe", "rToe"];

function p(x, y, z) {
  return { x: x, y: y, z: z };
}

// Side view → 3D. Near (left) side 0.19 m / 0.11 m out from the middle.
export function fromSide(f, options) {
  const o = options || {};
  const shoulderOut = o.shoulderOut ?? 0.19;
  const hipOut = o.hipOut ?? 0.1;
  const footOut = o.footOut ?? hipOut;
  const pt = function (xy, out) {
    return p(out, (60 - xy[1]) * UNIT, (xy[0] - 50) * UNIT);
  };
  const s = {
    nose: pt([f.head[0] + 2, f.head[1]], 0),
    lShoulder: pt(f.shoulder, shoulderOut), rShoulder: pt(f.shoulder, -shoulderOut),
    lElbow: pt(f.elbow, shoulderOut + 0.02), rElbow: pt(f.elbow2 || f.elbow, -shoulderOut - 0.02),
    lWrist: pt(f.wrist, shoulderOut), rWrist: pt(f.wrist2 || f.wrist, -shoulderOut),
    lHip: pt(f.hip, hipOut), rHip: pt(f.hip, -hipOut),
    lKnee: pt(f.knee, footOut), rKnee: pt(f.knee2 || f.knee, -footOut),
    lAnkle: pt(f.ankle, footOut), rAnkle: pt(f.ankle2 || f.ankle, -footOut),
    lToe: pt(f.toe || [f.ankle[0] + 5, 60], footOut),
    rToe: pt(f.toe2 || f.toe || [f.ankle[0] + 5, 60], -footOut)
  };
  return s;
}

// Front view → 3D. Every point is needed (both sides).
export function fromFront(f) {
  const s = {};
  for (const name of NAMES) {
    let xy = f[name];
    if (!xy && name === "nose") {
      xy = f.head;
    }
    if (!xy && (name === "lToe" || name === "rToe")) {
      const a = f[name[0] + "Ankle"];
      xy = [a[0], 60, (a[2] || 0) + 5];
    }
    if (!xy) {
      throw new Error("fromFront: missing " + name);
    }
    s[name] = p((xy[0] - 50) * UNIT, (60 - xy[1]) * UNIT, (xy[2] || 0) * UNIT);
  }
  return s;
}

// Swap left and right (e.g. to test the pose done with the other leg)
export function mirror(s) {
  const out = {};
  for (const name of NAMES) {
    const from = name[0] === "l" ? "r" + name.slice(1) : name[0] === "r" ? "l" + name.slice(1) : name;
    const q = s[from];
    out[name] = p(-q.x, q.y, q.z);
  }
  return out;
}

// Move from a point by a length (metres) in a direction [left, up, forward]
export function step(from, length, dir) {
  const n = Math.hypot(dir[0], dir[1], dir[2]);
  return p(from.x + length * dir[0] / n, from.y + length * dir[1] / n, from.z + length * dir[2] / n);
}

// A plain standing body (Tadasana with arms down), to start from
export function standing() {
  return fromFront({
    nose: [50, 8], lShoulder: [56, 16], rShoulder: [44, 16], lElbow: [57, 26], rElbow: [43, 26],
    lWrist: [57, 35], rWrist: [43, 35], lHip: [53.5, 33], rHip: [46.5, 33],
    lKnee: [53.5, 46], rKnee: [46.5, 46], lAnkle: [53.5, 58], rAnkle: [46.5, 58]
  });
}

// ---------------------------------------------------------------
// Turning a skeleton into what MediaPipe would give for one camera view
// ---------------------------------------------------------------
// yaw: how far the person has turned (degrees). 0 = facing the camera,
// 90 = sideways (facing the picture's left), -90 = sideways the other way,
// 45 = at a slant. noise: wobble added like a real camera (metres of depth
// wobble for the 3D points; the picture gets 1/10 of it). seed: so a test
// run always gets the same wobble.
export function cameraView(s, yaw, noise, seed, imageWidth, imageHeight) {
  const W = imageWidth || 1280;
  const H = imageHeight || 720;
  const D = 3.2;             // camera distance, metres
  const F = 1.35 * H;        // focal length in pixels
  const random = randomFrom(seed || 1);
  const wobble = function (size) {
    // roughly a bell curve between -2 and 2, times size
    return (random() + random() + random() + random() - 2) * size;
  };
  const a = yaw * Math.PI / 180;

  // Into the camera's frame: X right in the picture, Y down, Z away from the camera
  const cam = {};
  for (const name of NAMES) {
    const q = s[name];
    const x = q.x * Math.cos(a) - q.z * Math.sin(a);
    const z = q.x * Math.sin(a) + q.z * Math.cos(a);
    cam[name] = { X: x, Y: -q.y, Z: -z };
  }
  const hips = { X: (cam.lHip.X + cam.rHip.X) / 2, Y: (cam.lHip.Y + cam.rHip.Y) / 2, Z: (cam.lHip.Z + cam.rHip.Z) / 2 };

  // Centre the body in the picture
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const name of NAMES) {
    minX = Math.min(minX, cam[name].X); maxX = Math.max(maxX, cam[name].X);
    minY = Math.min(minY, cam[name].Y); maxY = Math.max(maxY, cam[name].Y);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const image = {};
  const world = {};
  for (const name of NAMES) {
    const c = cam[name];
    const depth = D + c.Z;
    image[name] = {
      x: (W / 2 + F * (c.X - cx) / depth + wobble(noise * 30)) / W,
      y: (H / 2 + F * (c.Y - cy) / depth + wobble(noise * 30)) / H,
      z: (c.Z - hips.Z) * F / D / W,
      visibility: 0.99
    };
    world[name] = {
      x: c.X - hips.X + wobble(noise / 3),
      y: c.Y - hips.Y + wobble(noise / 3),
      z: c.Z - hips.Z + wobble(noise),
      visibility: 0.99
    };
  }
  return { points: toMediaPipe(image, s, false), world: toMediaPipe(world, s, true), width: W, height: H };
}

// The 33 MediaPipe points from our 15
function toMediaPipe(q, s, isWorld) {
  const list = new Array(33);
  const copy = function (pt, dx, dy) {
    return { x: pt.x + (dx || 0), y: pt.y + (dy || 0), z: pt.z, visibility: pt.visibility };
  };
  const ear = isWorld ? 0.07 : 0.01;
  for (let i = 0; i <= 10; i++) {
    list[i] = copy(q.nose);
  }
  list[7] = copy(q.nose, ear, 0);
  list[8] = copy(q.nose, -ear, 0);
  list[11] = q.lShoulder; list[12] = q.rShoulder;
  list[13] = q.lElbow; list[14] = q.rElbow;
  list[15] = q.lWrist; list[16] = q.rWrist;
  list[17] = list[19] = list[21] = copy(q.lWrist);
  list[18] = list[20] = list[22] = copy(q.rWrist);
  list[23] = q.lHip; list[24] = q.rHip;
  list[25] = q.lKnee; list[26] = q.rKnee;
  list[27] = q.lAnkle; list[28] = q.rAnkle;
  list[29] = copy(q.lAnkle); list[30] = copy(q.rAnkle);
  list[31] = q.lToe; list[32] = q.rToe;
  return list;
}

function randomFrom(seed) {
  let state = seed >>> 0 || 1;
  return function () {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// Side-view figure for figure.js (the guide's stick figures), from a skeleton:
// the person facing RIGHT, the left side near.
export function toFigure(s) {
  const f = function (q) {
    return [Math.round((50 + q.z / UNIT) * 10) / 10, Math.round((60 - q.y / UNIT) * 10) / 10];
  };
  const fig = {
    head: f({ y: s.nose.y, z: s.nose.z - 0.06 }), shoulder: f(s.lShoulder), elbow: f(s.lElbow),
    wrist: f(s.lWrist), hip: f(s.lHip), knee: f(s.lKnee), ankle: f(s.lAnkle), toe: f(s.lToe)
  };
  const far = { knee2: f(s.rKnee), ankle2: f(s.rAnkle), toe2: f(s.rToe) };
  const apart = Math.hypot(far.knee2[0] - fig.knee[0], far.knee2[1] - fig.knee[1]) +
                Math.hypot(far.ankle2[0] - fig.ankle[0], far.ankle2[1] - fig.ankle[1]);
  if (apart > 3) {
    Object.assign(fig, far);
  }
  return fig;
}
