// =============================================================
// figure.js — draws a simple stick figure of a pose, seen from the
// side (the person faces RIGHT). Used for the Surya Namaskar poses on
// the guide screen and on the practice screen.
//
// A figure (in poses.js) gives the body points, each as [x, y] in a box
// 100 wide and 60 high. y goes DOWN: the floor is at y = 60.
//   head, shoulder, elbow, wrist, hip, knee, ankle, toe   = the near side
//   knee2, ankle2, toe2                                   = the far leg
//                                                           (only if it is
//                                                           somewhere else)
// The far leg is drawn lighter, behind the body.
// =============================================================

function figureSVG(figure) {
  if (!figure) {
    return "";
  }

  // A line from body point a to body point b
  function line(a, b, kind) {
    return '<line class="' + kind + '" x1="' + a[0] + '" y1="' + a[1] +
           '" x2="' + b[0] + '" y2="' + b[1] + '"></line>';
  }

  let parts = "";

  // The floor
  parts += '<line class="floor" x1="0" y1="60" x2="100" y2="60"></line>';

  // The far leg (behind the body), if it isn't hidden behind the near leg
  if (figure.knee2) {
    parts += line(figure.hip, figure.knee2, "far");
    parts += line(figure.knee2, figure.ankle2, "far");
    parts += line(figure.ankle2, figure.toe2, "far");
  }

  // The body, the near leg and the near arm
  parts += line(figure.shoulder, figure.hip, "near");
  parts += line(figure.hip, figure.knee, "near");
  parts += line(figure.knee, figure.ankle, "near");
  parts += line(figure.ankle, figure.toe, "near");
  parts += line(figure.shoulder, figure.elbow, "near");
  parts += line(figure.elbow, figure.wrist, "near");

  // The neck and the head
  parts += line(figure.shoulder, figure.head, "near");
  parts += '<circle class="head" cx="' + figure.head[0] + '" cy="' + figure.head[1] + '" r="4"></circle>';

  return '<svg class="figure" viewBox="-4 -6 108 70" aria-hidden="true">' + parts + '</svg>';
}
