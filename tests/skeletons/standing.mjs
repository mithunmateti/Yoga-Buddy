// The 6 standing poses (poses-standing.js). See tests/skeleton-kit.mjs for how to draw one.
// Each body is the CORRECT finished pose, done on one side. The lab also
// turns it round to test the other camera angles.
import { fromFront, fromSide } from "../skeleton-kit.mjs";

export default {
  // Warrior I (side view, facing right): left knee bent over the ankle,
  // right leg straight behind, body upright, arms straight up
  virabhadrasana1: fromSide({
    head: [49, 19], shoulder: [47, 26], elbow: [47, 17], wrist: [47, 8], hip: [47, 42],
    knee: [61, 44], ankle: [62, 57], toe: [67, 60],
    knee2: [36, 50], ankle2: [25, 58], toe2: [27, 60]
  }),

  // Triangle (front view): wide straight legs, leaning over the LEFT leg,
  // left hand down by the left shin, right arm straight up (one vertical line)
  trikonasana: fromFront({
    nose: [68, 24.4], lShoulder: [66.5, 32.7], rShoulder: [59.7, 22.9],
    lElbow: [66.5, 41.5], rElbow: [59.7, 14.4], lWrist: [66.5, 50.2], rWrist: [59.7, 5.4],
    lHip: [53.5, 37], rHip: [46.5, 37], lKnee: [61.75, 47.5], rKnee: [38.25, 47.5],
    lAnkle: [70, 58], rAnkle: [30, 58]
  }),

  // Standing Forward Bend (side view, facing right): legs straight, hips over
  // the heels, body folded down over the legs, hands to the floor by the toes
  uttanasana: fromSide({
    head: [63, 46], shoulder: [61, 42.5], elbow: [60, 51], wrist: [58, 58], hip: [49, 32],
    knee: [51, 45], ankle: [52, 58], toe: [57, 60]
  }),

  // Pyramid (side view, facing right): left foot forward, right foot back,
  // both legs straight, a long flat back folded over the front leg,
  // hands on the front shin
  parsvottanasana: fromSide({
    head: [70, 39], shoulder: [65.8, 37.4], elbow: [65.5, 46], wrist: [63, 54], hip: [50, 35],
    knee: [57, 46.5], ankle: [64, 58], toe: [69, 60],
    knee2: [43, 46.5], ankle2: [36, 58], toe2: [40, 60]
  }),

  // Half Moon (front view, chest open to the camera): standing on the straight
  // LEFT leg, body level and pointing to the left, left hand on a block,
  // right leg lifted level to the right, right arm straight up
  ardhachandrasana: fromFront({
    nose: [81, 27.5], lShoulder: [76, 33.5], rShoulder: [76, 21.5],
    lElbow: [76, 42], rElbow: [76, 12.5], lWrist: [76, 51], rWrist: [76, 3.5],
    lHip: [60, 31], rHip: [60, 24], lKnee: [60, 45], rKnee: [46, 24],
    lAnkle: [60, 58], rAnkle: [33, 24]
  }),

  // Eagle (front view): standing on the bent LEFT leg, right thigh crossed over
  // the left, right foot hooked behind the left calf; upper arms forward at
  // shoulder height, elbows bent, forearms up and wrapped. The hips sit back and
  // the knees go forward, like a small chair (3rd number = forward)
  garudasana: fromFront({
    nose: [50, 12, 1], lShoulder: [56, 20, 0], rShoulder: [44, 20, 0],
    lElbow: [51, 21, 8], rElbow: [49, 20.5, 8.5], lWrist: [51, 12, 9], rWrist: [49, 11.5, 9.5],
    lHip: [53.5, 36, -4], rHip: [46.5, 36, -4], lKnee: [53, 47, 5], rKnee: [51.5, 45, 6],
    lAnkle: [53.5, 58, 0], rAnkle: [55, 54, -1]
  })
};
