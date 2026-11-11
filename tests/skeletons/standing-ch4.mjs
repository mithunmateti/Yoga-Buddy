// The standing poses added from chapter 4 ("Standing Poses") of Yoga Anatomy
// (Kaminoff). See tests/skeleton-kit.mjs for how to draw one.
// Each body is the CORRECT finished pose, done on one side. The lab also
// turns it round to test the other camera angles.
// Side views face RIGHT with the person's LEFT side nearest; front views face
// you (the person's left is on YOUR right) and the third number is how far
// the point is in front of the body, towards the camera.
import { fromFront, fromSide } from "../skeleton-kit.mjs";

export default {
  // Extended Hand-to-Big-Toe (side view): standing on the right leg, the left
  // leg lifted straight out in front at hip height, the left hand reaching
  // along it, the right hand on the hip
  utthitahastapadangusthasana: fromSide({
    head: [51, 8], shoulder: [50, 16], elbow: [58, 22], wrist: [66, 28],
    elbow2: [47, 25], wrist2: [52, 32], hip: [50, 33],
    knee: [63, 33], ankle: [75, 33], toe: [77, 30],
    knee2: [50, 46], ankle2: [50, 58], toe2: [55, 60]
  }),

  // King of the Dancers (side view): standing on the right leg, the body
  // tipped forward, the left knee bent behind with the left hand holding
  // the foot, the right arm reaching forward and up
  natarajasana: fromSide({
    head: [67, 17], shoulder: [61, 22], elbow: [52, 22], wrist: [44, 19],
    elbow2: [69, 15], wrist2: [76, 8], hip: [50, 33],
    knee: [38, 30], ankle: [44, 19], toe: [46, 16],
    knee2: [50, 46], ankle2: [50, 58], toe2: [55, 60]
  }),

  // Warrior III (side view): standing on the right leg, the body and the
  // left leg in one level line, arms reaching forward
  virabhadrasana3: fromSide({
    head: [74, 32], shoulder: [66, 33], elbow: [75, 32], wrist: [83, 31], hip: [50, 33],
    knee: [37, 33], ankle: [25, 33], toe: [23, 36],
    knee2: [50, 46], ankle2: [50, 58], toe2: [55, 60]
  }),

  // Extended Side Angle (front view): left knee bent over the ankle, right
  // leg straight, the body leaning over the left thigh with the left hand
  // down, the right arm reaching over the ear in one line with the back leg
  utthitaparsvakonasana: fromFront({
    nose: [70, 24.5], lShoulder: [66.9, 33.2], rShoulder: [60.9, 22.8],
    lElbow: [69, 42], rElbow: [68.7, 18.3], lWrist: [70, 50.5], rWrist: [76.1, 14],
    lHip: [53.5, 36], rHip: [46.5, 36], lKnee: [66, 40], rKnee: [39, 47],
    lAnkle: [67, 57], rAnkle: [31, 57]
  }),

  // Revolved Side Angle, prayer-hands version (3D): left knee bent forward,
  // right leg straight behind, the body folded over the left thigh and
  // turned to the left so the right shoulder is low and the left one high,
  // palms together in front of the chest
  parivrttaparsvakonasana: fromFront({
    nose: [52, 34.5, 20], lShoulder: [51.6, 33, 11], rShoulder: [48.4, 43, 16.8],
    lElbow: [59, 30, 12], rElbow: [57, 46, 18], lWrist: [56, 38, 13.9], rWrist: [56, 38.5, 14],
    lHip: [53.5, 46, 0], rHip: [46.5, 46, 0], lKnee: [53.5, 45.5, 13], rKnee: [46.5, 51, -12],
    lAnkle: [53.5, 58, 12], rAnkle: [46.5, 56, -24]
  }),

  // Revolved Triangle (3D): left foot forward, right foot back, both legs
  // straight, hips facing forward, the body folded forward and turned to
  // the left: the RIGHT hand down by the left foot, the left arm straight up
  parivrttatrikonasana: fromFront({
    nose: [52, 29.5, 22], lShoulder: [50, 25, 15.9], rShoulder: [50, 37, 15.9],
    lElbow: [50, 16.5, 15.9], rElbow: [51.5, 45.5, 14], lWrist: [50, 8, 15.9], rWrist: [53, 54, 12],
    lHip: [53.5, 33, 0], rHip: [46.5, 33, 0], lKnee: [53.5, 45.5, 5], rKnee: [46.5, 45.5, -5],
    lAnkle: [53.5, 58, 10], rAnkle: [46.5, 58, -10]
  }),

  // Wide-Legged Forward Bend (front view): feet wide, legs straight, the body
  // hanging down between the legs, hands on the floor under the shoulders
  prasaritapadottanasana: fromFront({
    nose: [50, 52, 7], lShoulder: [56, 45, 5], rShoulder: [44, 45, 5],
    lElbow: [57, 52, 8], rElbow: [43, 52, 8], lWrist: [56, 59.5, 4], rWrist: [44, 59.5, 4],
    lHip: [53.5, 30, 0], rHip: [46.5, 30, 0], lKnee: [60, 43.5, 0], rKnee: [40, 43.5, 0],
    lAnkle: [66, 57, 0], rAnkle: [34, 57, 0]
  }),

  // Squat (front view, 3D): feet apart and heels down, knees bent deeply and
  // pointing out over the toes, hips low, chest up, palms together with the
  // elbows inside the knees
  upavesasana: fromFront({
    nose: [50, 24, 0], lShoulder: [56, 32, -2], rShoulder: [44, 32, -2],
    lElbow: [57, 41, 6], rElbow: [43, 41, 6], lWrist: [50.6, 35, 6], rWrist: [49.4, 35, 6],
    lHip: [53.5, 48, -4], rHip: [46.5, 48, -4], lKnee: [60, 44, 8], rKnee: [40, 44, 8],
    lAnkle: [57.5, 57, 2], rAnkle: [42.5, 57, 2]
  })
};
