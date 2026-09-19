/* Simple reading progress and restrained section reveals. */
(function () {
  "use strict";
  const progress = document.getElementById("progress");
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (range > 0 ? window.scrollY / range * 100 : 0) + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("js-anim");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})();
