// =============================================================
// progress.js — remembers how much you practise each day.
//
// For every day it saves (on this device only, in localStorage):
//   seconds: how long you practised (only while the camera can see you)
//   poses:   which poses you held for the full time you chose
//
//   goal:    the daily goal (minutes) that day
//
// A day counts for your streak when you practised for your daily goal.
// You choose the goal (5 minutes to 1.5 hours, on a slider) and the app recommends one for your
// age. The home screen (home.js) shows the streak and this week's days.
// =============================================================

const PROGRESS_NAME = "yogaBuddyProgress";
const GOAL_NAME = "yogaBuddyGoal";           // the daily goal you chose, in minutes
const GOAL_MIN = 5;              // the slider goes from 5 minutes…
const GOAL_MAX = 90;             // …to 1.5 hours
const GOAL_STEP = 5;
const OLD_STREAK_MINUTES = 10;   // days saved before you could choose counted at 10 minutes

// The goal we recommend, from your age (profile.js). Short enough to do
// every day: doing a little each day builds the habit better than a lot
// once a week.
//   under 13: 10 min · 13–17: 15 min · 18–59: 20 min · 60 and over: 15 min
function recommendedMinutes() {
  const profile = (typeof getProfile === "function" ? getProfile() : null) || window.yogaProfile || {};
  const age = Number(profile.age);
  if (!age) return 10;
  if (age < 13) return 10;
  if (age < 18) return 15;
  if (age < 60) return 20;
  return 15;
}

// Why we recommend it (shown under the choices)
function recommendedReason() {
  const profile = (typeof getProfile === "function" ? getProfile() : null) || window.yogaProfile || {};
  const age = Number(profile.age);
  if (!age) return "A good start for anyone.";
  if (age < 13) return "Just right for kids: short and fun every day.";
  if (age < 18) return "Fits around school, and enough to build strength and focus.";
  if (age < 60) return "Enough to feel stronger and calmer, without taking over your day.";
  return "Gentle and steady every day.";
}

// The goal you chose, or null if you haven't chosen yet
function chosenGoal() {
  try {
    const minutes = Number(localStorage.getItem(GOAL_NAME));
    return minutes >= GOAL_MIN && minutes <= GOAL_MAX ? minutes : null;
  } catch (error) {
    return null;
  }
}

// The goal in use now: your choice, or the recommended one until you choose
function dailyGoal() {
  return chosenGoal() || recommendedMinutes();
}

function setDailyGoal(minutes) {
  try {
    localStorage.setItem(GOAL_NAME, String(minutes));
  } catch (error) {
    // storage blocked: the goal works for this visit only
  }
  // Today counts with the new goal
  const progress = loadProgress();
  todayIn(progress).goal = minutes;
  saveProgress(progress);
}

// "25 min", "1 h", "1 h 30 min"
function goalText(minutes) {
  if (minutes < 60) return minutes + " min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h + " h" + (m ? " " + m + " min" : "");
}

// The goal for one day: the goal that day, or for older days the old 10 minutes
function goalFor(day, isToday) {
  if (isToday) return dailyGoal();
  return (day && day.goal) || OLD_STREAK_MINUTES;
}

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
  const day = todayIn(progress);
  day.seconds += seconds;
  day.goal = dailyGoal();   // remember today's goal, so changing it later doesn't change old days
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

// Did this day count for the streak? (practised for that day's goal)
function streakDay(day, isToday) {
  return !!day && day.seconds >= goalFor(day, isToday) * 60;
}

// Did you hold all 5 Basic Asanas that day?
function allPosesDay(day) {
  // Only the 5 Basic Asanas count (basic: true in poses.js)
  return !!day && POSES.filter(function (pose) { return pose.basic; })
    .every(function (pose) { return day.poses.includes(pose.id); });
}

// How many days in a row you reached your daily goal. Today counts once
// it is done; until then the streak from yesterday still stands.
function currentStreak(progress) {
  const date = new Date();
  const today = dayKey(date);
  if (!streakDay(progress[today], true)) {
    date.setDate(date.getDate() - 1);
  }
  let days = 0;
  while (streakDay(progress[dayKey(date)], dayKey(date) === today)) {
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
      practised: streakDay(day, dayKey(date) === dayKey()),
      allFive: allPosesDay(day)
    });
  }
  return week;
}
