// =============================================================
// tv.js — the TV side of casting (see cast.js).
//
// The phone or laptop sends a message about 15 times a second:
//   { pose, score, tip, tipGood, coach, timer, aspect, bones, dots }
// bones: [[x1, y1, x2, y2, colour], ...]  dots: [[x, y, colour], ...]
// (x and y go from 0 to 1 across the camera picture, already mirrored
// like a selfie). We just draw it, big.
// =============================================================

const waiting = document.getElementById("waiting");
const canvas = document.getElementById("tv-skeleton");
const pen = canvas.getContext("2d");

function show(state) {
  waiting.hidden = true;
  document.getElementById("tv-pose").textContent = state.pose || "";
  document.getElementById("tv-score").textContent = state.score || "–";
  document.getElementById("tv-timer").textContent = state.timer || "";
  document.getElementById("tv-coach").textContent = state.coach || "";
  const tip = document.getElementById("tv-tip");
  tip.textContent = state.tip || "";
  tip.classList.toggle("good", !!state.tipGood);
  draw(state);
}

// Draw the skeleton in the middle of the stage, keeping the camera's shape
function draw(state) {
  const box = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * scale);
  canvas.height = Math.round(box.height * scale);
  pen.clearRect(0, 0, canvas.width, canvas.height);

  const aspect = state.aspect || 0.75;   // width ÷ height of the camera picture
  let width = canvas.width;
  let height = width / aspect;
  if (height > canvas.height) {
    height = canvas.height;
    width = height * aspect;
  }
  const left = (canvas.width - width) / 2;
  const top = (canvas.height - height) / 2;
  const x = (value) => left + value * width;
  const y = (value) => top + value * height;
  const thick = Math.max(4, height / 90);

  pen.lineCap = "round";
  pen.lineWidth = thick;
  for (const [x1, y1, x2, y2, colour] of state.bones || []) {
    pen.strokeStyle = colour;
    pen.beginPath();
    pen.moveTo(x(x1), y(y1));
    pen.lineTo(x(x2), y(y2));
    pen.stroke();
  }
  for (const [px, py, colour] of state.dots || []) {
    pen.fillStyle = colour;
    pen.beginPath();
    pen.arc(x(px), y(py), thick * 1.2, 0, 2 * Math.PI);
    pen.fill();
  }
}

function listen(connection) {
  connection.addEventListener("message", function (event) {
    try {
      show(JSON.parse(event.data));
    } catch (error) {
      // a broken message: skip it
    }
  });
  connection.addEventListener("close", function () {
    waiting.hidden = false;
  });
}

// Opened by cast.js on the TV: listen to every phone or laptop that connects
if (navigator.presentation && navigator.presentation.receiver) {
  navigator.presentation.receiver.connectionList.then(function (list) {
    list.connections.forEach(listen);
    list.addEventListener("connectionavailable", function (event) {
      listen(event.connection);
    });
  });
}
