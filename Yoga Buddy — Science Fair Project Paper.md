# Yoga Buddy: A Web App That Makes Learning Yoga Easier

Oct 19, 2026 · @Mithun Mateti

**Team:** Mithun, Sidhanth, Advaith Sai

## Summary

Our project is called Yoga Buddy. It's a free website that helps people learn yoga at home. You stand in front of your laptop or phone camera, and Yoga Buddy checks your pose and tells you what to fix, like "raise your arms a bit higher" or "bend your knee more."

We made it because learning yoga from videos is hard when nobody is there to correct you.

## Why we made this

Yoga is really good for you. It helps with flexibility, balance and focus. But it only helps properly if you do the poses the right way.

We noticed that most people learn yoga from YouTube. The problem is, a video can show you a pose, but it can't see you. If your back is bent or your knee is in the wrong place, the video won't tell you. Doing poses wrong means less benefit, and sometimes it can even hurt.

A yoga teacher would fix this, but not everyone can join a class or pay for one. So we thought, what if your phone could act like a teacher?

## Our goal

Our goal was to build a simple website that can watch someone doing a yoga pose and help them do it correctly, without needing a teacher.

Before we started, we wrote down what Yoga Buddy needed to do for us to call it a success:

- It should spot the person's body using just a normal camera.
- It should give a helpful tip within about one second of a mistake.
- It should work on both a laptop and a phone, with nothing to install.
- It should be easy enough for a total beginner to use.
- It should never upload or save anyone's video.

## What we found out before building

- **Feedback helps you learn faster.** In sports, people improve faster when someone tells them what they are doing wrong, not just when they copy someone.
- **A normal camera can find your body.** Free computer programs (like MediaPipe and MoveNet) can find points on your body, such as shoulders, elbows, hips, knees and ankles, from a camera.
- **Every yoga pose has angles.** For example, in Virabhadrasana II your front knee is bent to about 90° and your arms are straight out at shoulder height. If we measure your angles, we can check how close you are to the correct pose.

## What Yoga Buddy does

We decided to keep the first version simple. It's better to have a few things that work really well than lots of things that half work.

| Feature | What it does |
| --- | --- |
| 5 beginner poses | Tadasana (Mountain), Vrikshasana (Tree), Virabhadrasana II (Warrior II), Utkatasana (Chair) and Bhujangasana (Cobra), each with a picture and easy steps |
| Live tips | The camera watches you and shows tips like "Raise your arms higher" |
| Pose score | Gives you a score out of 100 for each pose |
| Timer | Counts 30 seconds while you hold the pose, with breathing reminders |

Later we want to add: saving your progress, short daily routines, and Hindi and other Indian languages.

**Privacy:** everything happens on your own device. Your video is never uploaded or saved.

## How we made it

Our team designed Yoga Buddy with the help of coding tools. We planned the features, chose the poses and angles, and worked on the look of every screen ourselves.

| Team member | What they did |
| --- | --- |
| Mithun | App design, building the app with coding tools, fixing problems |
| Sidhanth&#32; | Screen design, poster and charts |
| Adhwaith Sai | Coding help, checking the correct angles for each pose |

## How it works

Yoga Buddy is a website, so it works on any laptop or phone with a camera. Here is what happens many times every second:

1. **See:** the camera takes a picture of you.
2. **Find:** the program finds points on your body, like your knees and elbows.
3. **Measure:** it measures the angle at each joint. For the knee, it uses your hip, knee and ankle.
4. **Compare:** it checks each angle against the correct angle for that pose.
5. **Tell:** if an angle is off by more than 15°, it shows a tip. Your score changes live.

To find the angle at a joint B, using two other points A and C, we use vectors (from physics):

```latex
\theta = \cos^{-1}\left(\frac{\vec{BA}\cdot\vec{BC}}{|\vec{BA}|\,|\vec{BC}|}\right)
```

The score starts at 100. We take away the average number of degrees your joints are off by. So the closer your angles, the higher your score.

## Choices we made and why

While planning Yoga Buddy, we had to make a lot of decisions. Here are the main ones.

**Why only 5 poses?** We picked easy poses that beginners can do safely. Each one uses different parts of the body, like the legs in Virabhadrasana II and the back in Bhujangasana. Five was enough to show the idea works.

**Why allow 15° of error?** Nobody can hold a pose perfectly, and the camera isn't perfect either. If we were too strict, the app would keep complaining and people would get annoyed. 15° felt like a fair middle point.

**Why short tips?** When you're balancing in Vrikshasana, you can't read a long sentence. So we kept every tip to a few words, like "Hips forward" or "Arms up."

**Why keep video on the device?** Many people won't want their camera video going to the internet. Doing everything on the device keeps it private.

## Conclusion

Yoga Buddy shows that a normal phone or laptop camera can be used to help people learn yoga the right way. With some simple maths, like measuring angles between body points, a website can spot mistakes and give tips, almost like a real teacher.

We also learned a lot while making it: how computers can find a body in a picture, how vectors from physics are used in real apps, and how to design something that's simple enough for anyone to use.

**What could be better:**

- The camera works worse in dim light or with loose clothes.
- We haven't properly tested it with a big group of people yet. That's our next step.

**Safety:** Yoga Buddy only uses easy beginner poses. If anything hurts, stop. It does not replace a real yoga teacher or a doctor.

**What's next:** test it with real beginners, save people's progress, add daily routines, add Telugu, Hindi and other Indian languages, and add voice tips so you don't have to look at the screen.
