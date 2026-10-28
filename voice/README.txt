THE "VOICE" FOLDER
==================

This folder has ready-made recordings of the coach's sentences in the
natural AI voice "Sulafat" (made by Google Gemini). The app plays these
when you choose "Sulafat – natural AI voice (beta)" on the start screen.

  sulafat/recorded.json   the list of sentences that have a recording
  sulafat/*.m4a           the recordings (one sentence each)
  make-recordings.mjs     the program that makes them

HOW TO MAKE THE RECORDINGS
--------------------------
In the Terminal, in the Yoga Buddy folder, run:

    node voice/make-recordings.mjs

It skips sentences that already have a recording.

Gemini's FREE plan only makes 10 sentences a day (and 3 a minute), and
there are 84 sentences. So run it once a day until it says "All done"
(about 8 days), or switch on billing for the Gemini key (it would then
cost only a few cents in total).

If you change a sentence in phrases.js or poses.js, run it again: it
records only the new sentences.

Sentences without a recording are said with the computer's own voice.
