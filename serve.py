# serve.py — runs Yoga Buddy at http://localhost:8000
#
# Start it from the Yoga Buddy folder with:   python3 serve.py
# Stop it with Ctrl + C.
#
# It works like "python3 -m http.server 8000", but it also tells the
# browser NOT to keep old copies of our files. (With the normal server,
# Chrome sometimes kept using an old coach.js after we changed it.)

import http.server
import os

PORT = 8000


class NoOldCopies(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


# Serve the folder this file is in, wherever it is started from
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Yoga Buddy is running at http://localhost:" + str(PORT) + "  (Ctrl + C to stop)")
http.server.ThreadingHTTPServer(("", PORT), NoOldCopies).serve_forever()
