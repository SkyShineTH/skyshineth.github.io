/* SkyShine — scroll choreography (GSAP ScrollTrigger).
 * Reveals, pinned horizontal projects, chapter-rail sync, formation switching,
 * progress bar, motion toggle, hero scramble. Degrades gracefully w/o GSAP.
 */
(function () {
  "use strict";

  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const railDots = Array.from(document.querySelectorAll(".rail-dot"));
  const progress = document.getElementById("progress");
  const scrollcue = document.getElementById("scrollcue");

  function activateChapter(idx) {
    railDots.forEach((d, i) => d.classList.toggle("active", i === idx));
    if (window.SkyScene && window.SkyScene.ready) window.SkyScene.setFormation(idx);
  }

  // ---- hero scramble (runs once) -----------------------------------------
  function scramble() {
    if (reduce) return;
    const el = document.querySelector(".hero .role");
    if (!el) return;
    const glyphs = "█▓▒░<>/\\{}[]#*+=01";
    const targets = Array.from(el.querySelectorAll("b"));
    targets.forEach((node) => {
      const final = node.textContent;
      let frame = 0;
      const total = 26;
      const iv = setInterval(() => {
        frame++;
        const revealed = Math.floor((frame / total) * final.length);
        let out = final.slice(0, revealed);
        for (let i = revealed; i < final.length; i++) {
          out += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        node.textContent = out;
        if (frame >= total) { clearInterval(iv); node.textContent = final; }
      }, 38);
    });
  }

  // ---- no-GSAP fallback ---------------------------------------------------
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || reduce) {
    document.documentElement.classList.add("no-anim");
    // IntersectionObserver drives formation + rail without GSAP
    const secs = Array.from(document.querySelectorAll("[data-chapter]"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) activateChapter(parseInt(e.target.dataset.chapter, 10));
        });
      }, { threshold: 0.4 });
      secs.forEach((s) => io.observe(s));
    }
    setTimeout(scramble, 300);
    return;
  }

  document.documentElement.classList.add("js-anim");
  gsap.registerPlugin(ScrollTrigger);

  // ---- reveals ------------------------------------------------------------
  // Hero (above the fold) gets an immediate staggered intro so it never waits
  // on a ScrollTrigger refresh. Everything else reveals on scroll.
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest("#ch1")) return; // hero handled separately
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
    });
  });

  gsap.to("#ch1 .reveal", {
    opacity: 1, y: 0, duration: 1.0, ease: "power3.out",
    stagger: 0.12, delay: 0.15,
  });

  // bulletproof hero fallback — if the tab was backgrounded on load and the
  // rAF-driven tween never finished, force the hero visible after a beat.
  setTimeout(function () {
    document.querySelectorAll("#ch1 .reveal").forEach(function (el) {
      if (parseFloat(getComputedStyle(el).opacity) < 0.99) {
        el.style.opacity = "1"; el.style.transform = "none";
      }
    });
  }, 2600);

  // ---- horizontal projects (sticky + manual scroll mapping) --------------
  // Robust everywhere (no JS pinning). The .proj-scroll section is tall; its
  // sticky child holds the track, which we translate by scroll progress.
  const track = document.getElementById("projectsTrack");
  const projScroll = document.getElementById("projScroll");
  const projSticky = projScroll ? projScroll.querySelector(".proj-sticky") : null;
  if (track && projScroll) {
    const update = () => {
      const amount = Math.max(0, track.scrollWidth - window.innerWidth);
      // live geometry — robust to layout shifts / font loading
      const top = projScroll.offsetTop;
      const range = projScroll.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - top;
      const p = range > 0 ? Math.min(Math.max(scrolled / range, 0), 1) : 0;
      track.style.transform = "translate3d(" + (-p * amount).toFixed(1) + "px,0,0)";
      if (scrolled > -window.innerHeight && scrolled < range + window.innerHeight) {
        if (window.SkyScene && window.SkyScene.ready) window.SkyScene.setSubProgress(p);
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    window.addEventListener("load", update);
    update();
  }

  // ---- per-chapter formation + rail --------------------------------------
  document.querySelectorAll("[data-chapter]").forEach((sec) => {
    const idx = parseInt(sec.dataset.chapter, 10);
    ScrollTrigger.create({
      trigger: sec,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => { if (self.isActive) activateChapter(idx); },
    });
  });

  // ---- progress bar -------------------------------------------------------
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      if (progress) progress.style.width = (self.progress * 100).toFixed(2) + "%";
      if (scrollcue) scrollcue.style.opacity = self.progress > 0.02 ? "0" : "1";
    },
  });

  // rail click -> smooth scroll (let native anchor handle, but ensure refresh)
  railDots.forEach((d) => {
    d.addEventListener("click", () => setTimeout(() => ScrollTrigger.refresh(), 700));
  });

  // ---- motion toggle ------------------------------------------------------
  const toggle = document.getElementById("motionToggle");
  const label = document.getElementById("motionLabel");
  let motionOn = true;
  if (toggle) {
    toggle.addEventListener("click", () => {
      motionOn = !motionOn;
      document.body.classList.toggle("motion-off", !motionOn);
      toggle.classList.toggle("off", !motionOn);
      toggle.setAttribute("aria-pressed", String(motionOn));
      if (label) label.textContent = motionOn ? "Motion on" : "Motion off";
    });
  }

  // ---- init ---------------------------------------------------------------
  activateChapter(0);
  setTimeout(scramble, 400);
  window.addEventListener("load", () => ScrollTrigger.refresh());
  // fonts can shift layout — refresh once they settle
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
