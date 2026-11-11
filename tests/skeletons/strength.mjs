// The 8 strength poses (poses-strength.js). See tests/skeleton-kit.mjs for how to draw one.
// Side views face RIGHT (the near side is the person's LEFT). Floor = y 60.
import { fromFront, fromSide } from "../skeleton-kit.mjs";

// ----- Side Plank needs a body lying sideways across the picture -----
// We draw a standing body (facing you) with the arms out, then TILT the
// whole drawing so the right arm points straight down at the floor.
function tilt(points, degrees) {
  const a = degrees * Math.PI / 180;
  const out = {};
  for (const name in points) {
    const [x, y, z] = points[name];
    const dx = x - 50;
    const dy = y - 30;
    out[name] = [50 + dx * Math.cos(a) - dy * Math.sin(a), 30 + dx * Math.sin(a) + dy * Math.cos(a), z || 0];
  }
  // Slide it down so the lowest point (hand or feet) touches the floor (y 58)
  let lowest = -Infinity;
  for (const name in out) {
    lowest = Math.max(lowest, out[name][1]);
  }
  for (const name in out) {
    out[name][1] += 58 - lowest;
  }
  return out;
}

// Standing, facing you: the right arm out to the side by ARM degrees (it will
// hold you up), the left arm out the other way (it will point at the ceiling),
// feet together (stacked). Then tilt by ARM degrees, so the right arm points
// straight down and the body slopes at 90 - ARM degrees.
const ARM = 60;
function armPoint(shoulder, length, outDegrees, toLeft) {
  const a = outDegrees * Math.PI / 180;
  return [shoulder[0] + (toLeft ? 1 : -1) * length * Math.sin(a), shoulder[1] + length * Math.cos(a)];
}
const sidePlankUpright = {
  nose: [50, 8], lShoulder: [56, 16], rShoulder: [44, 16],
  rElbow: armPoint([44, 16], 9, ARM, false), rWrist: armPoint([44, 16], 17.5, ARM, false),
  lElbow: armPoint([56, 16], 9, 180 - ARM, true), lWrist: armPoint([56, 16], 17.5, 180 - ARM, true),
  lHip: [53.5, 33], rHip: [46.5, 33],
  lKnee: [52.5, 46], rKnee: [47.5, 46],
  lAnkle: [51.5, 58], rAnkle: [48.5, 58],
  lToe: [51.5, 58, 5], rToe: [48.5, 58, 5]
};

export default {
  // Plank: arms straight under the shoulders, one straight line from head to heels
  phalakasana: fromSide({
    head: [70, 37], shoulder: [64, 40], elbow: [64, 49.5], wrist: [64, 59], hip: [48.8, 45.2],
    knee: [36, 49.6], ankle: [23.2, 53.9], toe: [20, 60]
  }),
  // Four-Limbed Staff: a low plank, elbows bent at a right angle beside the ribs
  chaturanga: fromSide({
    head: [70, 48], shoulder: [64, 50], elbow: [55.5, 50.5], wrist: [55.5, 59], hip: [48.2, 52.3],
    knee: [34.8, 54.3], ankle: [21.5, 56.3], toe: [18, 60]
  }),
  // Side Plank on the right hand, chest to the camera, left arm up to the ceiling
  vasisthasana: fromFront(tilt(sidePlankUpright, -ARM)),
  // Boat: balanced on the sit bones, body and legs make a V, arms forward
  navasana: fromSide({
    head: [30.2, 38.3], shoulder: [34.7, 43.7], elbow: [43.7, 43.7], wrist: [52.2, 43.7], hip: [45, 56],
    knee: [53.7, 45.7], ankle: [62.4, 35.4], toe: [64.5, 32]
  }),
  // Goddess: wide legs, knees bent out to the sides, arms in a "cactus".
  // The hips sit low, so thigh and shin are both about 13.5 long.
  utkatakonasana: fromFront({
    nose: [50, 18], lShoulder: [56, 26], rShoulder: [44, 26],
    lElbow: [65, 26], rElbow: [35, 26], lWrist: [65, 17.5], rWrist: [35, 17.5],
    lHip: [53.5, 43], rHip: [46.5, 43],
    lKnee: [66.5, 45.3], rKnee: [33.5, 45.3], lAnkle: [67.5, 58.8], rAnkle: [32.5, 58.8]
  }),
  // Bridge: lying on the back, feet flat, hips lifted so shoulder, hip and knee are in a line
  setubandhasana: fromSide({
    head: [25, 56], shoulder: [31, 57], elbow: [40, 58], wrist: [48.5, 58.5], hip: [45.7, 50.5],
    knee: [58, 45], ankle: [64.2, 57], toe: [69, 59.5]
  }),
  // Locust: lying on the stomach, chest and legs lifted a little, arms back by the hips
  salabhasana: fromSide({
    head: [69, 49], shoulder: [63.4, 52.9], elbow: [54.7, 51.6], wrist: [46, 52.3], hip: [48, 57],
    knee: [34.6, 55.1], ankle: [21.2, 53.3], toe: [17.5, 54]
  }),
  // Half Cobra: lying on the stomach, chest lifted a little on the forearms, hips down
  ardhabhujangasana: fromSide({
    head: [65, 46], shoulder: [59.1, 50], elbow: [63.2, 58], wrist: [71.7, 58.3], hip: [45, 57.5],
    knee: [31.5, 58], ankle: [18, 58.3], toe: [14, 59.5]
  })
};

// Bridge, Locust and Half Cobra are lying poses: from the front the camera
// sees only the head and shoulders, so they are only tested from the side
// (and a little slanted), like Cobra.
export const views = {
  setubandhasana: [90, -90, 45, -45],
  salabhasana: [90, -90, 45, -45],
  ardhabhujangasana: [90, -90, 45, -45]
};
