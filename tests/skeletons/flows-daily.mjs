// =============================================================
// tests/skeletons/flows-daily.mjs — test bodies for the Morning Flow
// and the Bedtime Stretch (flows-daily.js).
//
// Positions with a stick figure get a 3D test body built from it by the
// lab. A side-view stick figure can't show everything, though: a side
// bend, a Tree knee pointing out to the side, a wide Warrior II stance,
// crossed legs or knees dropped into a twist all move SIDEWAYS. So those
// positions get a proper 3D body here, with the key "<flowId>:<number>"
// (0 = the first position).
// See tests/skeleton-kit.mjs for how to draw one (x = the person's left,
// y = up, z = forward, in metres).
// =============================================================
import { fromFront, fromSide, mirror, step } from "../skeleton-kit.mjs";
import basic from "./basic.mjs";

const UPPER = ["nose", "lShoulder", "rShoulder", "lElbow", "rElbow", "lWrist", "rWrist"];
const LEGS = ["lKnee", "rKnee", "lAnkle", "rAnkle", "lToe", "rToe"];

// A copy of a skeleton (so changing it doesn't change the original)
function copy(s) {
  const out = {};
  for (const name in s) {
    out[name] = { x: s[name].x, y: s[name].y, z: s[name].z };
  }
  return out;
}

// Tip some points over sideways (seen from the front), around a pivot
// point (x, y in metres). Positive degrees tip them to the person's RIGHT.
function tipSideways(s, names, degrees, pivot) {
  const a = degrees * Math.PI / 180;
  for (const name of names) {
    const q = s[name];
    const dx = q.x - pivot.x;
    const dy = q.y - pivot.y;
    q.x = pivot.x + dx * Math.cos(a) - dy * Math.sin(a);
    q.y = pivot.y + dx * Math.sin(a) + dy * Math.cos(a);
  }
}

// A straight arm from the shoulder in a direction [left, up, forward]
function arm(s, side, dir) {
  s[side + "Elbow"] = step(s[side + "Shoulder"], 0.29, dir);
  s[side + "Wrist"] = step(s[side + "Elbow"], 0.27, dir);
}

// The middle of the hips
function hipMiddle(s) {
  return { x: (s.lHip.x + s.rHip.x) / 2, y: (s.lHip.y + s.rHip.y) / 2 };
}

// SIDE BEND to the person's right: the upper body leans about 22° to the
// right, the left arm reaches up and further over the head (about 45° from
// straight up), and the right hand slides down the right leg.
// Use mirror() for the left side.
function sideBendRight(base, handDown) {
  const s = copy(base);
  const lean = 22;
  const middle = hipMiddle(s);
  tipSideways(s, UPPER, lean, { x: middle.x, y: middle.y + 0.08 });
  const over = (lean + 23) * Math.PI / 180;
  arm(s, "l", [-Math.sin(over), Math.cos(over), 0]);
  handDown(s);
  return s;
}

// Standing tall, arms by the sides (the plain standing body)
const standingTall = fromFront({
  nose: [50, 8], lShoulder: [56, 16], rShoulder: [44, 16], lElbow: [57, 26], rElbow: [43, 26],
  lWrist: [57, 35], rWrist: [43, 35], lHip: [53.5, 33], rHip: [46.5, 33],
  lKnee: [53.5, 46], rKnee: [46.5, 46], lAnkle: [53.5, 58], rAnkle: [46.5, 58]
});

const standingSideBend = sideBendRight(standingTall, function (s) {
  // the right hand slides down the outside of the right thigh
  arm(s, "r", [-0.12, -1, 0]);
});

// SITTING CROSS-LEGGED (Sukhasana): hips about 4 units above the floor,
// the knees out to the sides and forward, each shin tucked in under the
// other leg, hands resting on the knees. Knee angle about 30–40°.
const crossLegged = fromFront({
  nose: [50, 31, 1], lShoulder: [56, 39], rShoulder: [44, 39],
  lElbow: [60, 47, 4], rElbow: [40, 47, 4], lWrist: [62, 53, 9], rWrist: [38, 53, 9],
  lHip: [53.5, 56], rHip: [46.5, 56],
  lKnee: [63, 55, 10], rKnee: [37, 55, 10],
  lAnkle: [50, 57.5, 6], rAnkle: [48, 58, 4]
});

const seatedSideBend = sideBendRight(crossLegged, function (s) {
  // the right hand rests on the floor, out to the side of the right hip
  const floor = { x: s.rHip.x - 0.2, y: 0.03, z: 0.02 };
  const sh = s.rShoulder;
  const reach = Math.hypot(floor.x - sh.x, floor.y - sh.y, floor.z - sh.z);
  const dir = [(floor.x - sh.x) / reach, (floor.y - sh.y) / reach, (floor.z - sh.z) / reach];
  // a soft elbow if the floor is closer than a straight arm
  s.rElbow = step(sh, Math.min(0.29, reach / 2), [dir[0] - 0.15, dir[1], dir[2]]);
  s.rWrist = { x: floor.x, y: floor.y, z: floor.z };
});

// BUTTERFLY (Baddha Konasana): the knees open wide and low, the soles of
// the feet together in front, the hands holding the feet. Knee angle about 45°.
const butterfly = fromFront({
  nose: [50, 32, 1], lShoulder: [56, 40], rShoulder: [44, 40],
  lElbow: [58, 48, 5], rElbow: [42, 48, 5], lWrist: [54, 55, 9], rWrist: [46, 55, 9],
  lHip: [53.5, 57], rHip: [46.5, 57],
  lKnee: [64, 54, 7], rKnee: [36, 54, 7],
  lAnkle: [51, 58.5, 10], rAnkle: [49, 58.5, 10]
});

// LYING TWIST (Supta Matsyendrasana): lying on the back, knees bent at
// about 90° above the hips, then dropped about 65° to the person's right.
// The hips roll a little with them (about 25°); the shoulders stay flat.
// The arms rest out wide on the floor (a T shape).
function lyingTwistRight() {
  // On the back, knees up over the hips, shins level ("table top")
  const s = fromSide({
    head: [77, 55], shoulder: [70, 56.5], elbow: [70, 58], wrist: [70, 58.5], hip: [50, 57],
    knee: [50, 43], ankle: [37, 43], toe: [34, 43]
  });
  // Arms out to the sides on the floor
  s.lElbow = { x: s.lShoulder.x + 0.29, y: 0.05, z: s.lShoulder.z };
  s.lWrist = { x: s.lShoulder.x + 0.56, y: 0.05, z: s.lShoulder.z };
  s.rElbow = { x: s.rShoulder.x - 0.29, y: 0.05, z: s.rShoulder.z };
  s.rWrist = { x: s.rShoulder.x - 0.56, y: 0.05, z: s.rShoulder.z };
  const pivot = { x: 0, y: s.lHip.y };
  tipSideways(s, LEGS, 65, pivot);
  tipSideways(s, ["lHip", "rHip"], 25, pivot);
  return s;
}

export default {
  // ----- Morning Flow -----
  // 1–2: side bend to the right, then to the left
  "morningflow:1": standingSideBend,
  "morningflow:2": mirror(standingSideBend),
  // 4–5: Warrior II with the right knee bent, then the left
  //      (basic.mjs bends the LEFT knee, so mirror it for the right)
  "morningflow:4": mirror(basic.virabhadrasana2),
  "morningflow:5": basic.virabhadrasana2,
  // 7–8: Tree standing on the left leg (basic.mjs), then on the right
  "morningflow:7": basic.vrikshasana,
  "morningflow:8": mirror(basic.vrikshasana),

  // ----- Bedtime Stretch -----
  "bedtimeflow:0": crossLegged,
  "bedtimeflow:1": seatedSideBend,
  "bedtimeflow:2": mirror(seatedSideBend),
  "bedtimeflow:4": butterfly,
  "bedtimeflow:6": lyingTwistRight(),
  "bedtimeflow:7": mirror(lyingTwistRight())
};
