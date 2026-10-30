// =============================================================
// progress.js — remembers how much you practise each day.
//
// For every day it saves (on this device only, in localStorage):
//   seconds: how long you practised (only while the camera can see you)
//   poses:   which poses you held for the full time you chose
//
// A day counts for your streak when you practised for 10 minutes.
// The home screen (home.js) shows the streak and this week's days.
// =============================================================

const PROGRESS_NAME = "yogaBuddyProgress";
const STREAK_MINUTES = 10;      // practise this long in a day to keep the streak

// Today's date as "2026-10-28" (in the person's own time zone)
function dayKey(date) {
  const d = date || new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
         String(d.getDate()).padStart(2, "0");
}

// Every day saved so far: { "2026-10-28": { seconds: 412, poses: ["tadasana"] }, … }
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_NAME)) || {};
  } catch (error) {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_NAME, JSON.stringify(progress));
  } catch (error) {
    // storage blocked: today's practice is not remembered
  }
}

function todayIn(progress) {
  const key = dayKey();
  if (!progress[key]) {
    progress[key] = { seconds: 0, poses: [] };
  }
  return progress[key];
}

// Add some practice time to today (practice.js calls this every few seconds)
function addPracticeTime(seconds) {
  const progress = loadProgress();
  todayIn(progress).seconds += seconds;
  saveProgress(progress);
}

// Remember that a pose was held for the full time today (coach.js)
function recordPose(poseId) {
  const progress = loadProgress();
  const day = todayIn(progress);
  if (!day.poses.includes(poseId)) {
    day.poses.push(poseId);
  }
  saveProgress(progress);
}

// Did this day count for the streak? (10 minutes of practice)
function streakDay(day) {
  return !!day && day.seconds >= STREAK_MINUTES * 60;
}

// Did you hold all 5 poses that day?
function allPosesDay(day) {
  return !!day && POSES.every(function (pose) { return day.poses.includes(pose.id); });
}

// How many days in a row you practised for 10 minutes. Today counts once
// it is done; until then the streak from yesterday still stands.
function currentStreak(progress) {
  const date = new Date();
  if (!streakDay(progress[dayKey(date)])) {
    date.setDate(date.getDate() - 1);
  }
  let days = 0;
  while (streakDay(progress[dayKey(date)])) {
    days++;
    date.setDate(date.getDate() - 1);
  }
  return days;
}

// This week, Monday to Sunday: one entry per day
function thisWeek(progress) {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));   // back to Monday
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const day = progress[dayKey(date)];
    week.push({
      letter: "MTWTFSS"[i],
      isToday: dayKey(date) === dayKey(),
      isFuture: date > new Date() && dayKey(date) !== dayKey(),
      practised: streakDay(day),
      allFive: allPosesDay(day)
    });
  }
  return week;
}
