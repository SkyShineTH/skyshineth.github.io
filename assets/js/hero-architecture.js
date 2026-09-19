(function () {
  "use strict";

  const scene = document.getElementById("hero-architecture");
  if (!scene) return;

  const nodes = Array.from(scene.querySelectorAll(".architecture-node"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let frame = 0;

  const selectNode = (node) => {
    const next = scene.dataset.active === node.dataset.node ? "" : node.dataset.node;
    if (next) scene.dataset.active = next;
    else delete scene.dataset.active;
    nodes.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.node === next)));
  };

  nodes.forEach((node) => {
    node.addEventListener("click", () => selectNode(node));
    node.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectNode(node);
    });
  });

  const resetPosition = () => {
    cancelAnimationFrame(frame);
    scene.style.setProperty("--architecture-x", "0px");
    scene.style.setProperty("--architecture-y", "0px");
  };

  scene.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const bounds = scene.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      scene.style.setProperty("--architecture-x", `${x.toFixed(1)}px`);
      scene.style.setProperty("--architecture-y", `${y.toFixed(1)}px`);
    });
  });
  scene.addEventListener("pointerleave", resetPosition);
  reducedMotion.addEventListener("change", resetPosition);
})();
