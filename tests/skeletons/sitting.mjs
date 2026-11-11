// Test bodies for the 8 sitting poses (poses-sitting.js).
// See tests/skeleton-kit.mjs for how to draw one.
// Sitting on the floor: the hips are about 3 units (10 cm) above the floor (y = 57).
// Sitting on a chair: the seat is about 0.45 m high, so the hips are at y = 46,
// the thighs are level, the knees are at about 90° and the shins are upright.
import { fromFront, fromSide } from "../skeleton-kit.mjs";

export default {
  // Cross-legged, back tall, hands resting on the knees (front view: the
  // knees point out to the sides and forward, the shins cross in front)
  sukhasana: fromFront({
    nose: [50, 34], lShoulder: [56, 41], rShoulder: [44, 41],
    lElbow: [60, 48, 4], rElbow: [40, 48, 4], lWrist: [61, 55, 8], rWrist: [39, 55, 8],
    lHip: [53.5, 57], rHip: [46.5, 57],
    lKnee: [63, 57, 9], rKnee: [37, 57, 9],
    lAnkle: [50.5, 58.5, 12], rAnkle: [49.5, 58.5, 14]
  }),

  // Legs straight out in front, back upright, hands on the floor beside the hips
  dandasana: fromSide({
    head: [41, 34], shoulder: [40, 41], elbow: [40.5, 49.5], wrist: [41, 57.5], hip: [40, 57],
    knee: [53.5, 57.5], ankle: [67, 58], toe: [68, 53]
  }),

  // Kneeling, sitting back on the heels, hands on the thighs
  vajrasana: fromSide({
    head: [41, 27], shoulder: [40, 34], elbow: [42, 42.5], wrist: [48, 49], hip: [40, 50],
    knee: [50.6, 58], ankle: [37, 58.5], toe: [32, 59.5]
  }),

  // Legs straight in front, folding forward (a beginner's fold, body about 40° up)
  paschimottanasana: fromSide({
    head: [56, 43], shoulder: [52.3, 46.7], elbow: [59, 51], wrist: [66.5, 55], hip: [40, 57],
    knee: [53.5, 57.5], ankle: [67, 58], toe: [68, 53]
  }),

  // Left leg straight in front; right knee bent out to the side with the right
  // foot at the inner left thigh; folding forward over the left leg.
  // Drawn in 3D with fromFront: the third number is "forward".
  janusirsasana: fromFront({
    nose: [52, 42, 16], lShoulder: [58, 46, 11], rShoulder: [46, 46, 11],
    lElbow: [57.5, 51, 17], rElbow: [48.5, 51, 17], lWrist: [56, 56, 22], rWrist: [51, 56, 22],
    lHip: [53.5, 57, 0], rHip: [46.5, 57, 0],
    lKnee: [53.5, 57.5, 13.5], rKnee: [36, 58, 6],
    lAnkle: [53.5, 58, 27], rAnkle: [49, 58.5, 5]
  }),

  // Seated twist to the right: left leg folded on the floor (left heel beside
  // the right hip), right knee up with
  // the right foot outside the left knee. The shoulders turn about 45° to the
  // right; the left arm hugs the right knee, the right hand is on the floor behind.
  ardhamatsyendrasana: fromFront({
    nose: [49, 34, 2], lShoulder: [54.2, 41, 4.2], rShoulder: [45.8, 41, -4.2],
    lElbow: [47, 45, 9], rElbow: [42, 48, -8], lWrist: [41, 48, 6], rWrist: [41, 56, -10],
    lHip: [53.5, 57, 0], rHip: [46.5, 57, 0],
    lKnee: [48, 58, 12.5], rKnee: [48, 47, 9],
    lAnkle: [43, 58.5, 1.5], rAnkle: [56, 58, 11]
  }),

  // Sitting tall on a chair, feet flat, arms straight up beside the ears
  chairraisedarms: fromSide({
    head: [41, 23], shoulder: [40, 30], elbow: [40.5, 21], wrist: [41, 12.5], hip: [40, 46],
    knee: [53.5, 45.5], ankle: [53.5, 58.5], toe: [58, 60]
  }),

  // Sitting on a chair, folding forward over the thighs, arms hanging toward the floor
  chairforwardbend: fromSide({
    head: [57, 34], shoulder: [52.3, 35.7], elbow: [53, 44.7], wrist: [53.5, 53.2], hip: [40, 46],
    knee: [53.5, 45.5], ankle: [53.5, 58.5], toe: [58, 60]
  })
};

// Utkatasana (Chair pose) is "sitting on an imaginary chair" with the arms up.
// Sitting on a REAL chair with the arms up is genuinely almost the same shape
// (knees about 90°, arms up), and Utkatasana's checks can't see the chair.
// So the chair skeleton is allowed to look like Utkatasana. (Chair Raised Arms
// itself still tells Utkatasana apart, with its "On the chair" legs check.)
export const allow = { utkatasana: ["chairraisedarms"] };
