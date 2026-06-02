/* SkyShine — WebGL background scene
 * A single morphing particle field. Each chapter sets a target "formation";
 * points lerp toward it every frame. Camera dollies + parallaxes with pointer.
 * Exposes window.SkyScene with { setFormation, ready, enabled }.
 */
(function () {
  "use strict";

  const COUNT = 2800;          // particle count
  const ACCENT = [0.39, 0.40, 0.95]; // #6366f1
  const ACCENT2 = [0.51, 0.55, 0.97]; // #818cf8
  const WHITE = [0.85, 0.88, 1.0];
  // light-theme particle palette (darker indigos, readable on a light ground)
  const L_ACCENT = [0.31, 0.27, 0.90]; // #4f46e5
  const L_ACCENT2 = [0.39, 0.40, 0.95];
  const L_DEEP = [0.21, 0.18, 0.55];   // deep indigo for the rare bright ones

  const SkyScene = {
    ready: false,
    enabled: false,
    _target: 0,
    setFormation: function () {},
    setSubProgress: function () {},
    setTheme: function () {},
  };
  window.SkyScene = SkyScene;

  // Bail gracefully if WebGL/THREE unavailable or reduced motion requested.
  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  if (typeof THREE === "undefined" || !hasWebGL() || reduceMotion) {
    document.documentElement.classList.add("no-webgl");
    return;
  }

  // ---- math helpers -------------------------------------------------------
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // ---- formation generators (return Float32Array length COUNT*3) ----------
  function fSphere() {
    const a = new Float32Array(COUNT * 3);
    const R = 30, off = 2 / COUNT, inc = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = i * off - 1 + off / 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * inc;
      a[i * 3] = Math.cos(phi) * r * R;
      a[i * 3 + 1] = y * R;
      a[i * 3 + 2] = Math.sin(phi) * r * R;
    }
    return a;
  }

  function fGalaxy() {
    const a = new Float32Array(COUNT * 3);
    const arms = 3;
    for (let i = 0; i < COUNT; i++) {
      const t = Math.pow(Math.random(), 0.6);
      const radius = t * 38;
      const arm = (i % arms) / arms * Math.PI * 2;
      const angle = arm + radius * 0.14;
      const spread = (1 - t) * 6 + 1.2;
      a[i * 3] = Math.cos(angle) * radius + rand(-spread, spread);
      a[i * 3 + 1] = rand(-spread, spread) * 0.8;
      a[i * 3 + 2] = Math.sin(angle) * radius + rand(-spread, spread);
    }
    return a;
  }

  function fHelix() {
    // intertwined streams flowing along Y — a "pipeline"
    const a = new Float32Array(COUNT * 3);
    const strands = 3, turns = 5, H = 64, R = 14;
    for (let i = 0; i < COUNT; i++) {
      const s = i % strands;
      const t = (i / COUNT);
      const ang = t * Math.PI * 2 * turns + (s / strands) * Math.PI * 2;
      const jitter = rand(-1.4, 1.4);
      a[i * 3] = Math.cos(ang) * (R + jitter);
      a[i * 3 + 1] = t * H - H / 2 + rand(-0.8, 0.8);
      a[i * 3 + 2] = Math.sin(ang) * (R + jitter);
    }
    return a;
  }

  function fClusters() {
    // four constellations — the featured projects
    const a = new Float32Array(COUNT * 3);
    const centers = [
      [-22, 10, -6], [20, 14, 4], [-16, -14, 8], [22, -12, -8],
    ];
    for (let i = 0; i < COUNT; i++) {
      const c = centers[i % centers.length];
      const spread = 7.5;
      a[i * 3] = c[0] + rand(-spread, spread) * (Math.random() ** 0.5);
      a[i * 3 + 1] = c[1] + rand(-spread, spread) * (Math.random() ** 0.5);
      a[i * 3 + 2] = c[2] + rand(-spread, spread);
    }
    return a;
  }

  function fLattice() {
    // 3D grid — skills matrix
    const a = new Float32Array(COUNT * 3);
    const n = Math.ceil(Math.cbrt(COUNT));
    const step = 56 / n, half = 28;
    let idx = 0;
    for (let x = 0; x < n && idx < COUNT; x++)
      for (let y = 0; y < n && idx < COUNT; y++)
        for (let z = 0; z < n && idx < COUNT; z++) {
          a[idx * 3] = x * step - half + rand(-0.6, 0.6);
          a[idx * 3 + 1] = y * step - half + rand(-0.6, 0.6);
          a[idx * 3 + 2] = z * step - half + rand(-0.6, 0.6);
          idx++;
        }
    return a;
  }

  function fTorus() {
    const a = new Float32Array(COUNT * 3);
    const R = 22, r = 8;
    for (let i = 0; i < COUNT; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      a[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
      a[i * 3 + 1] = r * Math.sin(v);
      a[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
    }
    return a;
  }

  const FORMATIONS = [fSphere(), fGalaxy(), fHelix(), fClusters(), fLattice(), fTorus()];

  // ---- soft round sprite --------------------------------------------------
  function makeSprite() {
    const s = 64;
    const cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.85)");
    g.addColorStop(0.55, "rgba(160,170,255,0.35)");
    g.addColorStop(1, "rgba(160,170,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.Texture(cv);
    tex.needsUpdate = true;
    return tex;
  }

  // ---- build --------------------------------------------------------------
  const canvas = document.getElementById("scene");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070a12, 0.012);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 0, 72);

  // geometry: current positions start at sphere
  const positions = new Float32Array(FORMATIONS[0]);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT); // stable per-particle seed for recolor
  for (let i = 0; i < COUNT; i++) {
    const m = Math.random();
    seeds[i] = m;
    const base = m > 0.92 ? WHITE : (m > 0.6 ? ACCENT2 : ACCENT);
    colors[i * 3] = base[0]; colors[i * 3 + 1] = base[1]; colors[i * 3 + 2] = base[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.85,
    map: makeSprite(),
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // a faint large halo for depth
  const haloGeo = new THREE.SphereGeometry(120, 24, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x121a33, side: THREE.BackSide, transparent: true, opacity: 0.5,
  });
  scene.add(new THREE.Mesh(haloGeo, haloMat));

  // ---- interaction state --------------------------------------------------
  let targetIdx = 0;
  let blendIdx = 0;          // smoothed formation index (allows mid-blend)
  let camZTarget = 72;
  let sub = 0;               // sub-progress within a chapter (0..1), for projects
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  SkyScene.setFormation = function (i) {
    targetIdx = clamp(i, 0, FORMATIONS.length - 1);
    // dolly the camera a touch per chapter for parallax variety
    camZTarget = 72 - targetIdx * 2.2;
  };
  SkyScene.setSubProgress = function (p) { sub = clamp(p, 0, 1); };
  SkyScene.ready = true;
  SkyScene.enabled = true;
  document.documentElement.classList.add("has-webgl");

  // ---- theme handling -----------------------------------------------------
  // Fog + halo lerp toward targets so theme switches feel smooth; particle
  // colours are swapped instantly (subtle at this density).
  const fogTarget = new THREE.Color(0x070a12);
  let haloTargetOpacity = 0.5;
  const haloTargetColor = new THREE.Color(0x121a33);

  SkyScene.setTheme = function (theme) {
    const light = theme === "light";
    mat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    mat.opacity = light ? 0.9 : 0.92;
    mat.needsUpdate = true;
    fogTarget.set(light ? 0xeceef6 : 0x070a12);
    haloTargetColor.set(light ? 0xd6dbf0 : 0x121a33);
    haloTargetOpacity = light ? 0.0 : 0.5;
    const cols = geo.attributes.color.array;
    for (let i = 0; i < COUNT; i++) {
      const m = seeds[i];
      const base = light
        ? (m > 0.92 ? L_DEEP : (m > 0.6 ? L_ACCENT2 : L_ACCENT))
        : (m > 0.92 ? WHITE : (m > 0.6 ? ACCENT2 : ACCENT));
      cols[i * 3] = base[0]; cols[i * 3 + 1] = base[1]; cols[i * 3 + 2] = base[2];
    }
    geo.attributes.color.needsUpdate = true;
  };

  // apply whatever theme is already on <html> (set FOUC-free in <head>)
  SkyScene.setTheme(document.documentElement.getAttribute("data-theme") || "dark");

  window.addEventListener("pointermove", function (e) {
    pointer.tx = (e.clientX / window.innerWidth - 0.5);
    pointer.ty = (e.clientY / window.innerHeight - 0.5);
  });

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // pause when tab hidden / scrolled far off (perf)
  let visible = true;
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
  });

  // ---- render loop --------------------------------------------------------
  const pos = geo.attributes.position.array;
  let t = 0;

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    t += 0.005;

    // smooth the blend index toward the target
    blendIdx += (targetIdx - blendIdx) * 0.05;
    const lo = Math.floor(blendIdx);
    const hi = Math.min(lo + 1, FORMATIONS.length - 1);
    const f = blendIdx - lo;
    const A = FORMATIONS[lo], B = FORMATIONS[hi];

    // lerp each point toward blended target with a soft spring
    for (let i = 0; i < pos.length; i++) {
      const target = A[i] + (B[i] - A[i]) * f;
      pos[i] += (target - pos[i]) * 0.045;
    }
    geo.attributes.position.needsUpdate = true;

    // gentle autorotation; clusters chapter rotates a bit more with sub-progress
    points.rotation.y += 0.0009;
    points.rotation.y += sub * 0.0006;
    points.rotation.x = Math.sin(t * 0.6) * 0.05;

    // pointer parallax (eased)
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x += (pointer.x * 14 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.y * 10 - camera.position.y) * 0.05;
    camera.position.z += (camZTarget - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);

    // theme lerp (fog + halo)
    scene.fog.color.lerp(fogTarget, 0.06);
    haloMat.color.lerp(haloTargetColor, 0.06);
    haloMat.opacity += (haloTargetOpacity - haloMat.opacity) * 0.06;

    renderer.render(scene, camera);
  }
  frame();
})();
