// The 5 Basic Asanas (poses.js). See tests/skeleton-kit.mjs for how to draw one.
import { fromFront, fromSide } from "../skeleton-kit.mjs";

export default {
  // Arms straight up, fingers interlocked above the head
  tadasana: fromFront({
    nose: [50, 8], lShoulder: [56, 16], rShoulder: [44, 16], lElbow: [55.5, 6], rElbow: [44.5, 6],
    lWrist: [51, -2], rWrist: [49, -2], lHip: [53.5, 33], rHip: [46.5, 33],
    lKnee: [53.5, 46], rKnee: [46.5, 46], lAnkle: [53.5, 58], rAnkle: [46.5, 58]
  }),
  // Standing on the left leg, right foot on the inner left thigh, palms together above the head
  vrikshasana: fromFront({
    nose: [50, 8], lShoulder: [56, 16], rShoulder: [44, 16], lElbow: [55, 6], rElbow: [45, 6],
    lWrist: [50.5, -1], rWrist: [49.5, -1], lHip: [53.5, 33], rHip: [46.5, 33],
    lKnee: [53, 46], rKnee: [36, 40, 2], lAnkle: [53, 58], rAnkle: [51, 38, 1]
  }),
  // Left knee bent over the ankle, right leg straight, arms out at shoulder height
  virabhadrasana2: fromFront({
    nose: [50, 11], lShoulder: [56, 19], rShoulder: [44, 19], lElbow: [65, 19], rElbow: [35, 19],
    lWrist: [74, 19], rWrist: [26, 19], lHip: [53.5, 36], rHip: [46.5, 36],
    lKnee: [66, 40], rKnee: [39, 47], lAnkle: [67, 57], rAnkle: [31, 57]
  }),
  // Sitting back on an imaginary chair, arms up beside the ears (side view, facing right)
  utkatasana: fromSide({
    head: [47, 15], shoulder: [44, 22], elbow: [46, 12], wrist: [48, 3], hip: [41, 38],
    knee: [55, 45], ankle: [51, 57], toe: [56, 60]
  }),
  // Lying on the stomach, chest lifted on straight-ish arms (side view, facing right)
  bhujangasana: fromSide({
    head: [71, 23], shoulder: [66, 30], elbow: [68, 44], wrist: [70, 58], hip: [48, 55],
    knee: [33, 57], ankle: [18, 58], toe: [14, 59]
  })
};

// Cobra is a lying pose: only test it from the side (and a little slanted)
export const views = { bhujangasana: [90, -90, 45, -45] };

// Tadasana IS standing with the arms up, so that decoy doesn't count against it
export const allow = { tadasana: ["standing, arms up"] };
