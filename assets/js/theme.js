/* SkyShine — theme management.
 * Three modes: 'dark' (default identity), 'light', 'auto' (follows the OS
 * colour-scheme / ambient lighting and live-updates when it changes).
 * Choice persists in localStorage. The effective theme is written to
 * <html data-theme>; scene.js + CSS react to it.
 */
(function () {
  "use strict";
  const KEY = "skyshine-theme";
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

  let mode = "dark";
  try { mode = localStorage.getItem(KEY) || "dark"; } catch (e) {}
  if (mode !== "light" && mode !== "auto") mode = "dark";

  function resolve(m) {
    if (m === "auto") return (mq && mq.matches) ? "light" : "dark";
    return m;
  }

  function syncButtons() {
    document.querySelectorAll(".theme-seg").forEach((b) => {
      const on = b.dataset.theme === mode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  function apply() {
    const eff = resolve(mode);
    root.classList.add("theme-switching");
    root.setAttribute("data-theme", eff);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", eff === "light" ? "#eceef6" : "#070a12");
    if (window.SkyScene && window.SkyScene.setTheme) window.SkyScene.setTheme(eff);
    syncButtons();
    // re-enable transitions after the new colours have painted.
    // setTimeout fallback guarantees removal even when no continuous rAF
    // loop is running (e.g. no-WebGL / reduced-motion paths).
    if (document.body) void document.body.offsetWidth;
    const clear = function () { root.classList.remove("theme-switching"); };
    requestAnimationFrame(function () { requestAnimationFrame(clear); });
    setTimeout(clear, 80);
  }

  function set(m) {
    mode = m;
    try { localStorage.setItem(KEY, m); } catch (e) {}
    apply();
  }

  document.querySelectorAll(".theme-seg").forEach((b) => {
    b.addEventListener("click", () => set(b.dataset.theme));
  });

  // live-update when the OS lighting flips (only matters in auto mode)
  if (mq) {
    const onChange = () => { if (mode === "auto") apply(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  window.SkyTheme = { get: () => mode, effective: () => resolve(mode), set: set };
  apply();
})();
