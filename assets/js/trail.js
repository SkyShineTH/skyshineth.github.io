/* SkyShine — glowing-dot cursor trail.
 * A crisp accent core that tracks the pointer + a soft halo that lags behind,
 * giving a subtle comet feel. Disabled for touch + reduced motion.
 */
(function () {
  "use strict";
  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (reduce || touch) return;

  const halo = document.createElement("div");
  const core = document.createElement("div");
  halo.className = "cursor-halo";
  core.className = "cursor-core";
  document.body.appendChild(halo);
  document.body.appendChild(core);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let hx = mx, hy = my, cx = mx, cy = my;
  let active = false;

  window.addEventListener("pointermove", function (e) {
    mx = e.clientX; my = e.clientY;
    if (!active) { active = true; document.body.classList.add("cursor-on"); }
    // grow over interactive elements
    const el = e.target;
    const interactive = el && el.closest &&
      el.closest("a,button,.chip,.rail-dot,[data-hover]");
    document.body.classList.toggle("cursor-hot", !!interactive);
  });
  window.addEventListener("pointerdown", function () {
    document.body.classList.add("cursor-press");
  });
  window.addEventListener("pointerup", function () {
    document.body.classList.remove("cursor-press");
  });
  window.addEventListener("mouseleave", function () {
    document.body.classList.remove("cursor-on");
  });

  function loop() {
    requestAnimationFrame(loop);
    cx += (mx - cx) * 0.35;
    cy += (my - cy) * 0.35;
    hx += (mx - hx) * 0.13;
    hy += (my - hy) * 0.13;
    core.style.transform = "translate(" + cx + "px," + cy + "px)";
    halo.style.transform = "translate(" + hx + "px," + hy + "px)";
  }
  loop();
})();
