/*
 * Home page: a 3D one-take scroll story (Three.js + GSAP ScrollTrigger).
 * Dark is the default; light follows the device setting.
 * Content comes from the page (index.md front matter), so this file holds no copy.
 */
(function () {
  'use strict';

  const app = {
    state: { lang: 'en', chap: 0, forced: 'auto', sysLight: false },

    init() {
      let lang = 'en';
      try {
        const saved = window.localStorage.getItem('fu-lang');
        if (saved === 'en' || saved === 'th') lang = saved;
        else if ((navigator.language || '').toLowerCase().indexOf('th') === 0) lang = 'th';
      } catch (e) { /* storage can be blocked; English is fine */ }
      this._scheme = window.matchMedia('(prefers-color-scheme: light)');
      this.state.lang = lang;
      this.state.sysLight = this._scheme.matches;
      // Phones (upright or sideways): project details start collapsed behind a "Details" toggle.
      if (window.matchMedia('(max-width: 760px), (max-height: 500px)').matches) {
        document.querySelectorAll('.det').forEach((d) => d.removeAttribute('open'));
      }
      // The colour-mode debug panel only shows with ?debug=mode in the address.
      if (new URLSearchParams(window.location.search).get('debug') === 'mode') {
        const dbg = document.querySelector('.dbg');
        if (dbg) dbg.hidden = false;
      }
      document.addEventListener('click', (e) => {
        const go = e.target.closest('[data-go]');
        if (go) { e.preventDefault(); this.goChapter(Number(go.dataset.go)); return; }
        const lg = e.target.closest('[data-lang]');
        if (lg) { this.setLang(lg.dataset.lang); return; }
        const md = e.target.closest('[data-mode]');
        if (md) this.setMode(md.dataset.mode);
      });
      const onScheme = () => {
        this.setState({ sysLight: this._scheme.matches });
        if (this.state.forced === 'auto') this.restart();
      };
      if (this._scheme.addEventListener) this._scheme.addEventListener('change', onScheme);
      this.apply();
      this.waitBoot(0);
    },

    setState(patch) {
      Object.assign(this.state, patch);
      this.apply();
    },

    // Reflect the state in the page: language, forced colour mode, current chapter.
    apply() {
      const st = this.state;
      const root = document.querySelector('.pg');
      if (root) root.className = 'pg lang-' + st.lang + (st.forced === 'auto' ? '' : ' force-' + st.forced);
      document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === st.lang)));
      document.querySelectorAll('.cn').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.go) === st.chap)));
      document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === st.forced)));
      const status = document.querySelector('.dbg-status');
      if (status) {
        const effLight = st.forced === 'auto' ? st.sysLight : st.forced === 'light';
        status.textContent = 'device: ' + (st.sysLight ? 'light' : 'dark / none') + ' · showing: ' + (effLight ? 'สว่าง' : 'มืด');
      }
    },

    setLang(lang) {
      try { window.localStorage.setItem('fu-lang', lang); } catch (e) { /* ignore */ }
      this.setState({ lang: lang });
    },

    setMode(mode) {
      this._forced = mode;
      this.setState({ forced: mode });
      this.restart();
    },

    themes() {
      return {
    dark: {
      clear: 0x05031a, fogA: 0x8a2878, fogB: 0x2a0f55, fog: [0.0042, 0.0036],
      sky: [
        'uniform float uNight; varying vec3 vP;',
        'void main() {',
        '  float h = vP.y;',
        '  vec3 top = vec3(0.02, 0.012, 0.10);',
        '  vec3 mid = mix(vec3(0.23, 0.075, 0.40), vec3(0.06, 0.03, 0.18), uNight);',
        '  vec3 hor = mix(vec3(0.54, 0.16, 0.47), vec3(0.16, 0.06, 0.33), uNight);',
        '  vec3 c = mix(hor, mid, smoothstep(-0.02, 0.14, h));',
        '  c = mix(c, top, smoothstep(0.14, 0.62, h));',
        '  c += vec3(1.0, 0.3, 0.55) * 0.35 * (1.0 - uNight) * exp(-pow((h - 0.03) / 0.05, 2.0));',
        '  gl_FragColor = vec4(c, 1.0);',
        '}'
      ].join('\n'),
      stars: true, clouds: false,
      sunLow: 'vec3(1.0, 0.18, 0.59)', sunHigh: 'vec3(1.0, 0.82, 0.25)', halo: [0xff4f8b, 0.55],
      ground: 0x07041a, grid: [0xff2e97, 0.6], road: 0x00e5ff,
      winBase: '#0b0720', winCols: ['#00e5ff', '#ff2e97', '#ffd23f', '#cfc3ff'], winP: 0.28, winA: 0.55,
      neon: [0x00e5ff, 0xff2e97], trafficDark: false,
      billBg: 'rgba(11,7,32,0.86)', billLine: 'rgba(255,255,255,0.05)', billTitle: '#f6e9ff', billSub: 'rgba(246,233,255,0.35)', billCols: ['#00e5ff', '#ff2e97'], billHalo: null, pole: 0x1a0b3e,
      towerTint: 0x9a8ac0, winLit: 0x00e5ff,
      room: { wall: 0x07051a, grid: 0x2d1f5e, bezel: 0x0b0720, edge: 0x00e5ff, desk: 0x150d33, key: 0x1d1640, accent: 0x00e5ff, strip: 0xff2e97, plate: 0x0e0a26 },
      sunStart: 80, sunEnd: -70, nightEnd: 1
    },
    light: {
      clear: 0xdbe8fa, fogA: 0xdbe8fa, fogB: 0xdbe8fa, fog: [0.0027, 0.0027],
      sky: [
        'uniform float uNight; varying vec3 vP;',
        'void main() {',
        '  float h = vP.y;',
        '  vec3 top = vec3(0.35, 0.59, 0.97);',
        '  vec3 mid = vec3(0.66, 0.82, 1.0);',
        '  vec3 hor = vec3(0.86, 0.91, 0.98);',
        '  vec3 c = mix(hor, mid, smoothstep(-0.02, 0.18, h));',
        '  c = mix(c, top, smoothstep(0.18, 0.75, h));',
        '  c += vec3(1.0, 0.78, 0.55) * 0.10 * exp(-pow((h - 0.02) / 0.05, 2.0));',
        '  gl_FragColor = vec4(c, 1.0);',
        '}'
      ].join('\n'),
      stars: false, clouds: true,
      sunLow: 'vec3(1.0, 0.45, 0.42)', sunHigh: 'vec3(1.0, 0.94, 0.62)', halo: [0xfff1c0, 0.7],
      ground: 0xeef1f9, grid: [0x3d6bff, 0.45], road: 0xff2e97,
      winBase: '#e3e8f4', winCols: ['#8cc8ff', '#5d8fe0', '#3a4a7a', '#ffffff', '#b9d9ff'], winP: 0.8, winA: 0.7,
      neon: [0x2b6cff, 0xff2e97], trafficDark: true,
      billBg: 'rgba(255,255,255,0.93)', billLine: 'rgba(20,18,58,0.04)', billTitle: '#14123a', billSub: 'rgba(20,18,58,0.3)', billCols: ['#2b6cff', '#ff2e97'], billHalo: 0xffffff, pole: 0x9aa6c8,
      towerTint: 0xffffff, winLit: 0xffffff,
      room: { wall: 0xeef1fa, grid: 0xc9cfe6, bezel: 0x14123a, edge: 0x2b6cff, desk: 0xd7ddee, key: 0xffffff, accent: 0x2b6cff, strip: 0x2b6cff, plate: 0xb9c2dc },
      sunStart: -30, sunEnd: 240, nightEnd: 0
    }
      };
    },

    waitBoot(n) {
      if (window.THREE && window.gsap && window.ScrollTrigger) this.boot();
      else if (n < 150) this._timer = setTimeout(() => this.waitBoot(n + 1), 100);
    },

    restart() {
      this.teardown();
      this.boot();
    },

    teardown() {
      const gl = document.querySelector('.gl');
      if (gl) gl.classList.remove('ready');
      if (this.mm) { this.mm.revert(); this.mm = null; }
      if (this._tick && window.gsap) window.gsap.ticker.remove(this._tick);
      this._tick = null;
      if (this._onResize) window.removeEventListener('resize', this._onResize);
      if (this._onPointer) window.removeEventListener('pointermove', this._onPointer);
      if (this.scene) {
        this.scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            const ms = Array.isArray(o.material) ? o.material : [o.material];
            ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
          }
        });
        this.scene = null;
      }
      if (this.renderer) { this.renderer.dispose(); this.renderer = null; }
      this._tl = null;
    },

    goChapter(i) {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (i === 4) {
        const c = document.getElementById('contact');
        if (c) c.scrollIntoView({ behavior: behavior });
        const t = document.getElementById('contact-title');
        if (t) setTimeout(() => t.focus({ preventScroll: true }), behavior === 'smooth' ? 900 : 0);
        return;
      }
      if (i === 0) { window.scrollTo({ top: 0, behavior: behavior }); return; }
      const st = this._tl && this._tl.scrollTrigger;
      if (st) { window.scrollTo({ top: st.labelToScroll(['', 'about', 'p1', 'skills'][i]), behavior: behavior }); return; }
      const el = document.getElementById(['top', 'fb-about', 'work', 'fb-skills'][i]);
      if (el) el.scrollIntoView({ behavior: behavior });
    },

    boot() {
      const THREE = window.THREE;
      const g = window.gsap;
      const ST = window.ScrollTrigger;
      const canvas = document.querySelector('.gl');
      const stage = document.querySelector('.stage');
      const story = document.querySelector('.story');
      const fb = document.querySelector('.fb');
      if (!THREE || !g || !ST || !canvas || !stage || !story) return;
      g.registerPlugin(ST);
      ST.config({ ignoreMobileResize: true });

      const TH = this.themes();
      const forced = this._forced || 'auto';
      const wantLight = forced === 'auto' ? window.matchMedia('(prefers-color-scheme: light)').matches : forced === 'light';
      const T = wantLight ? TH.light : TH.dark;
      const mobile = window.matchMedia('(max-width: 760px)').matches || window.matchMedia('(pointer: coarse)').matches;
      // Phones held upright get their own framing: billboards and the terminal are placed to fit a tall screen.
      const portrait = window.innerWidth < window.innerHeight;
      this._portrait = portrait;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobile, powerPreference: 'high-performance' });
      } catch (e) {
        return;
      }
      this.renderer = renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
      renderer.setClearColor(T.clear, 1);

      // Seeded random numbers, so the city looks the same on every visit.
      let seed = 7;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

      const scene = new THREE.Scene();
      this.scene = scene;
      const fogA = new THREE.Color(T.fogA), fogB = new THREE.Color(T.fogB);
      scene.fog = new THREE.FogExp2(fogA.clone(), mobile ? T.fog[0] : T.fog[1]);
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 3200);

      const glowTex = (() => {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const x = c.getContext('2d');
        const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        gr.addColorStop(0, 'rgba(255,255,255,1)');
        gr.addColorStop(0.25, 'rgba(255,255,255,0.55)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();
      const glow = (color, sx, sy, opacity) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: color, transparent: true, opacity: opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
        s.scale.set(sx, sy, 1);
        return s;
      };

      // Sky dome.
      const skyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false,
        uniforms: { uNight: { value: 0 } },
        vertexShader: 'varying vec3 vP; void main() { vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: T.sky
      });
      const sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 32, 16), skyMat);
      sky.renderOrder = -3;
      scene.add(sky);

      // Stars (dark mode): a shell that travels with the camera.
      const starN = mobile ? 700 : 1600;
      const sp = new Float32Array(starN * 3);
      for (let i = 0; i < starN; i++) {
        const th = rnd() * Math.PI * 2, ph = Math.acos(0.04 + rnd() * 0.96), r = 1500 + rnd() * 500;
        sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = r * Math.cos(ph); sp[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xf6e9ff, size: mobile ? 1.6 : 1.8, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false, fog: false });
      const stars = new THREE.Points(sg, starMat);
      stars.renderOrder = -2;
      stars.visible = T.stars;
      scene.add(stars);

      // Clouds (light mode): placed in the world so they drift past.
      if (T.clouds) {
        const cloudTex = (() => {
          const c = document.createElement('canvas');
          c.width = 256; c.height = 128;
          const x = c.getContext('2d');
          for (let i = 0; i < 9; i++) {
            const cx = 50 + rnd() * 156, cy = 58 + (rnd() - 0.5) * 30, r = 26 + rnd() * 26;
            const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r);
            gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
          }
          return new THREE.CanvasTexture(c);
        })();
        const cloudN = mobile ? 34 : 80;
        for (let i = 0; i < cloudN; i++) {
          const c = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.75 + rnd() * 0.25, depthWrite: false }));
          const sc = 140 + rnd() * 220;
          c.scale.set(sc, sc * 0.45, 1);
          c.position.set((rnd() - 0.5) * 1300, 110 + rnd() * 330, 260 - rnd() * 1900);
          scene.add(c);
        }
      }

      // The striped sun, kept at a fixed distance in front of the camera.
      const sunMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false,
        vertexShader: 'varying vec2 vU; void main() { vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: [
          'varying vec2 vU;',
          'void main() {',
          '  vec2 p = vU - 0.5;',
          '  if (length(p) > 0.5) discard;',
          '  float y = vU.y;',
          '  if (y < 0.5) { float band = fract(y * 12.0); float w = mix(0.55, 0.06, y * 2.0); if (band < w * 0.5) discard; }',
          '  vec3 c = mix(' + T.sunLow + ', ' + T.sunHigh + ', smoothstep(0.1, 0.9, y));',
          '  gl_FragColor = vec4(c, 1.0);',
          '}'
        ].join('\n')
      });
      const sunG = new THREE.Group();
      const halo = glow(T.halo[0], 900, 900, T.halo[1]);
      halo.position.z = -5;
      sunG.add(halo);
      sunG.add(new THREE.Mesh(new THREE.PlaneGeometry(300, 300), sunMat));
      scene.add(sunG);

      // Terrain with a flat road, mountains on both sides, pushed back inside the city.
      const segX = mobile ? 60 : 100, segZ = mobile ? 150 : 260;
      const W = 700, L = 1900, z0 = 170;
      const hAt = (x, z) => {
        const ax = Math.abs(x);
        const start = 18 + smooth(-260, -360, z) * 95;
        if (ax <= start) return 0;
        const k = (ax - start) / 70;
        const n = 0.55 + 0.45 * Math.sin(x * 0.09 + z * 0.021) * Math.cos(z * 0.047 - x * 0.013);
        return Math.pow(k, 1.35) * 42 * n;
      };
      const ground = new THREE.PlaneGeometry(W, L, segX, segZ);
      ground.rotateX(-Math.PI / 2);
      ground.translate(0, 0, z0 - L / 2);
      const gp = ground.attributes.position;
      for (let i = 0; i < gp.count; i++) gp.setY(i, hAt(gp.getX(i), gp.getZ(i)));
      scene.add(new THREE.Mesh(ground, new THREE.MeshBasicMaterial({ color: T.ground })));
      const lv = [];
      const xs = (i) => -W / 2 + (W * i) / segX;
      const zs = (j) => z0 - (L * j) / segZ;
      for (let j = 0; j <= segZ; j++) for (let i = 0; i < segX; i++) lv.push(xs(i), hAt(xs(i), zs(j)) + 0.06, zs(j), xs(i + 1), hAt(xs(i + 1), zs(j)) + 0.06, zs(j));
      for (let i = 0; i <= segX; i++) for (let j = 0; j < segZ; j++) lv.push(xs(i), hAt(xs(i), zs(j)) + 0.06, zs(j), xs(i), hAt(xs(i), zs(j + 1)) + 0.06, zs(j + 1));
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lv, 3));
      scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: T.grid[0], transparent: true, opacity: T.grid[1] })));
      [-6, 6].forEach((x) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, L), new THREE.MeshBasicMaterial({ color: T.road }));
        m.position.set(x, 0.1, z0 - L / 2);
        scene.add(m);
      });

      // City towers.
      const winTex = (() => {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 256;
        const x = c.getContext('2d');
        x.fillStyle = T.winBase; x.fillRect(0, 0, 128, 256);
        for (let r = 0; r < 20; r++) for (let k = 0; k < 8; k++) {
          if (rnd() < T.winP) {
            x.globalAlpha = T.winA + rnd() * (1 - T.winA);
            x.fillStyle = T.winCols[Math.floor(rnd() * T.winCols.length)];
            x.fillRect(6 + k * 15, 8 + r * 12, 8, 6);
          }
        }
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1, 2);
        return t;
      })();
      // Billboard spots, known before the city is built so towers can leave room for them.
      const billData = Array.from(document.querySelectorAll('.panel[data-bill]')).map((el) => el.dataset.bill.split('|'));
      const billZ = [-460, -660, -860].slice(0, Math.max(1, billData.length));
      const billSide = [-1, 1, -1];
      // How far in front of a billboard the camera stops; further back on a tall screen so the whole sign fits.
      const BOFF = portrait ? 34 : 26;
      const billX = portrait ? 7.5 : 11, billTurn = portrait ? 0.28 : 0.45;
      // On a tall screen the card covers the bottom, so the camera aims below the sign to lift it into the top half.
      const billDrop = portrait ? 9.5 : 0;
      const billAim = portrait ? 0.95 : 0.5;
      const nearBill = (side, z, d) => billZ.some((bz, i) => billSide[i] === side && Math.abs(z - bz) < 14 + d / 2);
      const bMax = mobile ? 150 : 280;
      const box = new THREE.BoxGeometry(1, 1, 1);
      box.translate(0, 0.5, 0);
      const towers = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ map: winTex }), bMax);
      const roofs = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ color: 0xffffff }), bMax);
      const dm = new THREE.Object3D();
      const neon = [new THREE.Color(T.neon[0]), new THREE.Color(T.neon[1])];
      let nb = 0, nr = 0;
      for (let z = -330; z > -1140 && nb < bMax; z -= 8 + rnd() * 9) {
        for (const side of [-1, 1]) {
          if (nb >= bMax) break;
          const back = rnd() < 0.35;
          const w = 8 + rnd() * 10, d = 8 + rnd() * 10;
          const h = (back ? 50 : 18) + rnd() * (back ? 120 : 80);
          // Front-row towers next to a billboard step back so the sign never cuts into them.
          const inner = back ? 60 : (nearBill(side, z, d) ? 24 : 13);
          const x = side * (inner + w / 2 + rnd() * (back ? 70 : 34));
          dm.position.set(x, 0, z); dm.scale.set(w, h, d); dm.updateMatrix();
          towers.setMatrixAt(nb++, dm.matrix);
          if (rnd() < 0.4 && nr < bMax) {
            dm.position.set(x, h, z); dm.scale.set(w * 1.02, 0.6, d * 1.02); dm.updateMatrix();
            roofs.setMatrixAt(nr, dm.matrix);
            roofs.setColorAt(nr, neon[nr % 2]);
            nr++;
          }
        }
      }
      towers.count = nb; roofs.count = nr;
      if (roofs.instanceColor) roofs.instanceColor.needsUpdate = true;
      scene.add(towers); scene.add(roofs);

      // Flying traffic.
      const trN = mobile ? 50 : 120;
      const tp = new Float32Array(trN * 3), tc = new Float32Array(trN * 3), tv = new Float32Array(trN);
      const dark = new THREE.Color(0x14123a);
      for (let i = 0; i < trN; i++) {
        tp[i * 3] = (rnd() - 0.5) * 80; tp[i * 3 + 1] = 18 + rnd() * 45; tp[i * 3 + 2] = -340 - rnd() * 820;
        const c = T.trafficDark ? (i % 3 ? dark : neon[1]) : neon[i % 2];
        tc[i * 3] = c.r; tc[i * 3 + 1] = c.g; tc[i * 3 + 2] = c.b;
        tv[i] = (20 + rnd() * 40) * (rnd() < 0.5 ? 1 : -1);
      }
      const tg = new THREE.BufferGeometry();
      tg.setAttribute('position', new THREE.BufferAttribute(tp, 3));
      tg.setAttribute('color', new THREE.BufferAttribute(tc, 3));
      const trafficMat = T.trafficDark
        ? new THREE.PointsMaterial({ size: 1.6, map: glowTex, vertexColors: true, transparent: true, depthWrite: false })
        : new THREE.PointsMaterial({ size: 2.4, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      scene.add(new THREE.Points(tg, trafficMat));

      // Three project billboards.
      const billTex = [];
      const drawBill = (i) => {
        const c = billTex[i].image;
        const x = c.getContext('2d');
        const col = T.billCols[i % 2];
        x.clearRect(0, 0, 512, 320);
        x.fillStyle = T.billBg; x.fillRect(0, 0, 512, 320);
        x.fillStyle = T.billLine;
        for (let y = 0; y < 320; y += 4) x.fillRect(0, y, 512, 1);
        x.strokeStyle = col; x.lineWidth = 6; x.strokeRect(8, 8, 496, 304);
        x.fillStyle = col; x.font = '500 24px "JetBrains Mono", monospace';
        x.fillText('PROJECT 0' + (i + 1), 36, 64);
        const words = billData[i] || ['PROJECT', '0' + (i + 1)];
        let size = 76;
        x.font = '700 ' + size + 'px "Space Grotesk", sans-serif';
        while (size > 40 && Math.max(x.measureText(words[0]).width, x.measureText(words[1] || '').width) > 440) {
          size -= 4; x.font = '700 ' + size + 'px "Space Grotesk", sans-serif';
        }
        x.fillStyle = T.billTitle; x.fillText(words[0], 32, 170);
        x.fillStyle = T.billSub; x.fillText(words[1] || '', 32, 250);
        billTex[i].needsUpdate = true;
      };
      const bills = billZ.map((z, i) => {
        const c = document.createElement('canvas'); c.width = 512; c.height = 320;
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
        billTex.push(t); drawBill(i);
        const grp = new THREE.Group();
        const hal = glow(T.billHalo !== null ? T.billHalo : (i % 2 ? 0xff2e97 : 0x00e5ff), 30, 20, T.billHalo !== null ? 0.5 : 0.35);
        hal.position.z = -0.4;
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9, 0.4), new THREE.MeshBasicMaterial({ color: T.pole }));
        pole.position.y = -9.5;
        grp.add(hal);
        grp.add(new THREE.Mesh(new THREE.PlaneGeometry(16, 10), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide })));
        grp.add(pole);
        grp.position.set(billSide[i] * billX, 14, z);
        grp.rotation.y = billSide[i] * -billTurn;
        scene.add(grp);
        return grp;
      });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (this.scene === scene) { billTex.forEach((t, i) => drawBill(i)); drawTerm(Math.max(0, typed)); } });

      // The tower at the end of the avenue, with one lit window.
      const towerEnd = new THREE.Mesh(new THREE.BoxGeometry(44, 280, 44), new THREE.MeshBasicMaterial({ map: winTex, color: T.towerTint }));
      towerEnd.position.set(0, 140, -1190);
      scene.add(towerEnd);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.5), new THREE.MeshBasicMaterial({ color: T.winLit }));
      win.position.set(0, 42, -1167.7);
      scene.add(win);
      const winGlow = glow(T.winLit, 36, 26, 0.7);
      winGlow.position.set(0, 42, -1167);
      scene.add(winGlow);
      [-22.3, 22.3].forEach((x, i) => {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 280, 0.6), new THREE.MeshBasicMaterial({ color: neon[i].getHex() }));
        s.position.set(x, 140, -1167.8);
        scene.add(s);
      });

      // The terminal room for skills, built far away; a flash hides the jump.
      const RX = 8000;
      const R = T.room;
      const room = new THREE.Group();
      room.position.set(RX, 0, 0);
      room.add(new THREE.Mesh(new THREE.BoxGeometry(26, 12, 30), new THREE.MeshBasicMaterial({ color: R.wall, side: THREE.BackSide })));
      const rgrid = new THREE.GridHelper(26, 26, R.grid, R.grid);
      rgrid.position.y = -5.9;
      room.add(rgrid);

      // Portrait screens (phones) get a tall monitor with short lines and bigger text.
      const SW = portrait ? 5 : 8, SH = portrait ? 8.2 : 5, SY = portrait ? 0.9 : 0.6, SZ = -8;
      const TW = portrait ? 1024 : 2048, TH2 = portrait ? 1680 : 1280;
      const PAD = portrait ? 52 : 72, TOP = portrait ? 170 : 160;
      let FS = portrait ? 44 : 44, LH = portrait ? 62 : 62;
      const listOf = (g) => Array.from(document.querySelectorAll('.skills [data-group="' + g + '"] li'));
      const wrap = (items, max) => {
        const lines = [];
        let cur = '';
        items.forEach((it) => {
          const next = cur ? cur + ' · ' + it : it;
          if (next.length + 2 > max && cur) { lines.push('  ' + cur); cur = it; } else cur = next;
        });
        if (cur) lines.push('  ' + cur);
        return lines;
      };
      const maxCh = portrait ? 30 : 58;
      const core = listOf('core').map((li) => li.textContent.trim());
      const familiar = listOf('familiar').map((li) => li.textContent.trim());
      const creds = listOf('creds').map((li) => ({ name: li.dataset.short, issued: li.dataset.issued }));
      const termLines = [['p', '$ whoami'], ['o', 'fasai, junior system engineer'], ['p', '$ skills --core']]
        .concat(wrap(core, maxCh).map((l) => ['o', l]))
        .concat([['p', '$ skills --familiar']])
        .concat(wrap(familiar, maxCh).map((l) => ['d', l]))
        .concat([['p', '$ certs']])
        .concat(portrait
          ? creds.reduce((acc, c) => acc.concat([['c', '✓ ' + c.name], ['d', '  ' + c.issued]]), [])
          : creds.map((c) => ['c', '✓ ' + c.name + ' · ' + c.issued]))
        .concat([['p', '$ ']]);
      // Shrink the text if the list is too long for the screen.
      while (TOP + termLines.length * LH > TH2 - 30 && FS > 22) { FS -= 2; LH = Math.round(FS * 1.42); }
      const totalChars = termLines.reduce((acc, l) => acc + l[1].length, 0);
      const lineCol = { p: '#00e5ff', o: '#f6e9ff', d: '#b9a8e0', c: '#f6e9ff' };
      const termC = document.createElement('canvas'); termC.width = TW; termC.height = TH2;
      const termTex = new THREE.CanvasTexture(termC); termTex.colorSpace = THREE.SRGBColorSpace;
      termTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const curWorld = new THREE.Vector3(RX, SY, SZ);
      let typed = -1;
      let flashKey = null;
      const drawTerm = (n) => {
        const x = termC.getContext('2d');
        x.fillStyle = '#08061c'; x.fillRect(0, 0, TW, TH2);
        // title bar
        x.fillStyle = '#140f33'; x.fillRect(0, 0, TW, 96);
        [['#ff5f57', 44], ['#febc2e', 88], ['#28c840', 132]].forEach((d) => { x.fillStyle = d[0]; x.beginPath(); x.arc(d[1], 48, 13, 0, Math.PI * 2); x.fill(); });
        x.fillStyle = '#b9a8e0'; x.font = '500 ' + Math.round(FS * 0.7) + 'px "JetBrains Mono", monospace'; x.textAlign = 'center';
        x.fillText(portrait ? '04 / SKILLS' : '04 / SKILLS & CREDENTIALS  ·  fasai@skyshine', TW / 2, 58);
        x.textAlign = 'left';
        // text, typed one character at a time
        x.font = '500 ' + FS + 'px "JetBrains Mono", monospace';
        let left = n;
        termLines.forEach((l, i) => {
          if (left <= 0) return;
          const str = l[1].slice(0, left); left -= l[1].length;
          const y = TOP + i * LH;
          if (l[0] === 'c' && str.charAt(0) === '✓') {
            x.fillStyle = '#3dffa8'; x.fillText('✓', PAD, y);
            x.fillStyle = lineCol.c; x.fillText(str.slice(1), PAD + x.measureText('✓').width, y);
          } else {
            x.fillStyle = lineCol[l[0]]; x.fillText(str, PAD, y);
          }
        });
        // cursor after the last prompt; it carries the sun colours for the final dive
        const cy = TOP + (termLines.length - 1) * LH;
        const cx = PAD + x.measureText('$ ').width;
        const cw = FS * 0.62, ch = FS * 1.1;
        const gr = x.createLinearGradient(0, cy - FS * 0.85, 0, cy - FS * 0.85 + ch);
        gr.addColorStop(0, '#ffd23f'); gr.addColorStop(1, '#ff2e97');
        x.fillStyle = gr; x.fillRect(cx, cy - FS * 0.85, cw, ch);
        curWorld.set(RX - SW / 2 + ((cx + cw / 2) / TW) * SW, SY + SH / 2 - ((cy - FS * 0.85 + ch / 2) / TH2) * SH, SZ);
        // scanlines and a soft glare
        x.fillStyle = 'rgba(255,255,255,0.025)';
        for (let yy = 96; yy < TH2; yy += 4) x.fillRect(0, yy, TW, 1);
        const gl3 = x.createLinearGradient(0, 0, TW * 0.6, TH2 * 0.6);
        gl3.addColorStop(0, 'rgba(255,255,255,0.06)'); gl3.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = gl3; x.fillRect(0, 0, TW, TH2);
        termTex.needsUpdate = true;
        if (flashKey) flashKey();
      };
      drawTerm(0);

      // Monitor: screen, bezel, power light, neck and base.
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: termTex }));
      screen.position.set(0, SY, SZ);
      room.add(screen);
      const bezelG = new THREE.BoxGeometry(SW + 0.5, SH + 0.5, 0.35);
      const bezel = new THREE.Mesh(bezelG, new THREE.MeshBasicMaterial({ color: R.bezel }));
      bezel.position.set(0, SY, SZ - 0.2);
      room.add(bezel);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(bezelG), new THREE.LineBasicMaterial({ color: R.edge }));
      edges.position.copy(bezel.position);
      room.add(edges);
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: R.accent }));
      led.position.set(0, SY - SH / 2 - 0.13, SZ - 0.01);
      room.add(led);
      const sglow = glow(0x00e5ff, SW * 2.6, SH * 2.6, 0.22); sglow.position.set(0, SY, SZ - 0.5); room.add(sglow);
      const DY = portrait ? SY - SH / 2 - 0.95 : -2.7;
      const bezelBottom = SY - SH / 2 - 0.25;
      const neckH = bezelBottom - (DY + 0.15);
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, neckH, 0.3), new THREE.MeshBasicMaterial({ color: R.bezel }));
      neck.position.set(0, DY + 0.15 + neckH / 2, SZ - 0.45);
      room.add(neck);
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.3), new THREE.MeshBasicMaterial({ color: R.bezel }));
      base.position.set(0, DY + 0.2, SZ - 0.2);
      room.add(base);

      // Desk with a neon edge.
      const desk = new THREE.Mesh(new THREE.BoxGeometry(15, 0.3, 5), new THREE.MeshBasicMaterial({ color: R.desk }));
      desk.position.set(0, DY, -6.8); room.add(desk);
      const deskEdge = new THREE.Mesh(new THREE.BoxGeometry(15, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: R.strip }));
      deskEdge.position.set(0, DY + 0.12, -4.3); room.add(deskEdge);

      // Keyboard: real keycaps that light up as the terminal types.
      const KZ = -5.0, KY = DY + 0.15;
      const plate = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.14, 2.0), new THREE.MeshBasicMaterial({ color: R.plate }));
      plate.position.set(0, KY + 0.07, KZ); room.add(plate);
      const under = glow(R.strip, 8, 1.6, 0.35); under.position.set(0, KY, KZ + 0.4); room.add(under);
      const keyPos = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 15; c++) {
        if (r === 3 && c > 3 && c < 11) continue;
        keyPos.push([-2.45 + c * 0.35, KY + 0.2, KZ - 0.62 + r * 0.42]);
      }
      const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.29, 0.12, 0.33), new THREE.MeshBasicMaterial({ color: 0xffffff }), keyPos.length);
      const keyBase = new THREE.Color(R.key), keyHot = new THREE.Color(R.accent), kc = new THREE.Color();
      const heat = new Float32Array(keyPos.length);
      keyPos.forEach((kp, i) => { dm.position.set(kp[0], kp[1], kp[2]); dm.scale.set(1, 1, 1); dm.updateMatrix(); keys.setMatrixAt(i, dm.matrix); keys.setColorAt(i, keyBase); });
      room.add(keys);
      const space = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 0.33), new THREE.MeshBasicMaterial({ color: R.key }));
      space.position.set(0, KY + 0.2, KZ - 0.62 + 3 * 0.42); room.add(space);
      flashKey = () => { heat[Math.floor(Math.random() * keyPos.length)] = 1; };
      const coolKeys = () => {
        for (let i = 0; i < heat.length; i++) {
          if (heat[i] > 0.01) { heat[i] *= 0.88; kc.copy(keyBase).lerp(keyHot, heat[i]); keys.setColorAt(i, kc); }
          else if (heat[i] !== 0) { heat[i] = 0; keys.setColorAt(i, keyBase); }
        }
        keys.instanceColor.needsUpdate = true;
      };

      // Mouse on a pad, and a mug.
      const pad = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.8), new THREE.MeshBasicMaterial({ color: R.plate }));
      pad.position.set(4.1, KY + 0.02, KZ); room.add(pad);
      const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.72), new THREE.MeshBasicMaterial({ color: R.key }));
      mouse.position.set(4.1, KY + 0.14, KZ + 0.1); room.add(mouse);
      const mouseLed = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.42), new THREE.MeshBasicMaterial({ color: R.accent }));
      mouseLed.position.set(4.1, KY + 0.25, KZ + 0.1); room.add(mouseLed);
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.75, 24), new THREE.MeshBasicMaterial({ color: 0xff2e97 }));
      mug.position.set(-4.2, KY + 0.38, KZ - 0.3); room.add(mug);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 18), new THREE.MeshBasicMaterial({ color: 0xff2e97 }));
      handle.position.set(-3.84, KY + 0.4, KZ - 0.3); room.add(handle);

      // Second monitor with a small uptime dashboard (wide screens only).
      if (!portrait) {
        const dc = document.createElement('canvas'); dc.width = 1024; dc.height = 640;
        const dx = dc.getContext('2d');
        dx.fillStyle = '#0d0a24'; dx.fillRect(0, 0, 1024, 640);
        dx.fillStyle = '#b9a8e0'; dx.font = '500 30px "JetBrains Mono", monospace'; dx.fillText('uptime · latency', 40, 60);
        dx.strokeStyle = '#2d1f5e'; dx.lineWidth = 2;
        for (let yy = 120; yy <= 400; yy += 70) { dx.beginPath(); dx.moveTo(40, yy); dx.lineTo(984, yy); dx.stroke(); }
        dx.strokeStyle = '#00e5ff'; dx.lineWidth = 5; dx.beginPath();
        let v = 260;
        for (let i = 0; i <= 40; i++) { v = Math.max(140, Math.min(380, v + (rnd() - 0.5) * 60)); const px = 40 + i * 23.6; if (i === 0) dx.moveTo(px, v); else dx.lineTo(px, v); }
        dx.stroke();
        for (let i = 0; i < 16; i++) { const bh = 40 + rnd() * 120; dx.fillStyle = i % 5 === 4 ? '#ff2e97' : '#3a2a78'; dx.fillRect(40 + i * 59, 600 - bh, 44, bh); }
        const dTex = new THREE.CanvasTexture(dc); dTex.colorSpace = THREE.SRGBColorSpace;
        const side = new THREE.Group();
        const sScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.4), new THREE.MeshBasicMaterial({ map: dTex }));
        const sBezel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 0.25), new THREE.MeshBasicMaterial({ color: R.bezel }));
        sBezel.position.z = -0.15;
        side.add(sBezel); side.add(sScreen);
        side.position.set(-6.9, SY - 0.6, -6.9);
        side.rotation.y = 0.55;
        room.add(side);
        const sNeck = new THREE.Mesh(new THREE.BoxGeometry(0.35, (SY - 0.6 - 1.4) - (DY + 0.15), 0.25), new THREE.MeshBasicMaterial({ color: R.bezel }));
        sNeck.position.set(-6.9, (SY - 0.6 - 1.4 + DY + 0.15) / 2, -7.05);
        room.add(sNeck);
      }

      // A window on the back wall with the city outside.
      const wnd = new THREE.Mesh(new THREE.PlaneGeometry(7, 4), new THREE.MeshBasicMaterial({ map: winTex, color: T.towerTint }));
      wnd.position.set(-7.5, 2.6, -14.9); room.add(wnd);
      const wndFrame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(7, 4)), new THREE.LineBasicMaterial({ color: R.edge }));
      wndFrame.position.copy(wnd.position); room.add(wndFrame);

      [[-12, 0xff2e97], [12, 0x00e5ff]].forEach((a) => {
        const t = new THREE.Mesh(new THREE.BoxGeometry(0.25, 10, 0.25), new THREE.MeshBasicMaterial({ color: a[1] }));
        t.position.set(a[0], 0, -10); room.add(t);
        const gl2 = glow(a[1], 6, 18, 0.4); gl2.position.set(a[0], 0, -9.8); room.add(gl2);
      });
      scene.add(room);
      const roomFrom = new THREE.Vector3(), roomTo = new THREE.Vector3(), zoomEnd = new THREE.Vector3();

      // Camera path for the whole flight.
      const path = new THREE.CatmullRomCurve3([
        [0, 7, 70], [0, 6, 30], [0, 4.5, -40], [0, 4, -160], [0, 4.2, -300],
        [1.5, 5, -440], [-1.5, 5, -640], [1.5, 5, -840],
        [0, 9, -1000], [0, 26, -1100], [0, 42, -1158]
      ].map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal');
      const uAtZ = (z) => {
        let best = 0, bd = 1e9;
        for (let i = 0; i <= 600; i++) { const u = i / 600; const d = Math.abs(path.getPointAt(u).z - z); if (d < bd) { bd = d; best = u; } }
        return best;
      };
      const uCity = uAtZ(-300);
      const uStop = billZ.map((z) => uAtZ(z + BOFF));

      const S = { u: 0, pitch: 1, night: 0, sunY: T.sunStart, mode: 0, roomT: 0, type: 0, zoom: 0 };
      const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
      const tmpP = new THREE.Vector3(), tmpA = new THREE.Vector3(), look = new THREE.Vector3(), up = new THREE.Vector3(), aim = new THREE.Vector3();

      const render = () => {
        ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
        if (S.mode === 0) {
          path.getPointAt(Math.min(1, Math.max(0, S.u)), tmpP);
          path.getPointAt(Math.min(1, S.u + 0.015), tmpA);
          look.copy(tmpA);
          bills.forEach((b) => {
            const w = Math.exp(-Math.pow((tmpP.z - (b.position.z + BOFF - 2)) / 45, 2));
            aim.copy(b.position); aim.y -= billDrop;
            look.lerp(aim, w * billAim);
          });
          up.set(tmpP.x, tmpP.y + 260, tmpP.z - 480);
          look.lerp(up, S.pitch);
          look.x += ptr.x * 6; look.y += ptr.y * 4;
          camera.position.copy(tmpP);
          camera.lookAt(look);
        } else {
          const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          const fitD = portrait
            ? Math.max((SH / 2 + 1.3) / tanH, (SW / 2 + 0.5) / (tanH * camera.aspect))
            : Math.max((SH / 2 + 1.4) / tanH, (SW / 2 + 0.9) / (tanH * camera.aspect));
          roomTo.set(RX, SY - (portrait ? 0.1 : 0.45), SZ + fitD);
          roomFrom.set(RX, SY - 0.1, SZ + fitD + 7);
          zoomEnd.copy(curWorld); zoomEnd.z += 0.18;
          tmpP.copy(roomFrom).lerp(roomTo, S.roomT).lerp(zoomEnd, S.zoom);
          look.set(RX, SY - 0.6, SZ).lerp(curWorld, S.zoom);
          coolKeys();
          look.x += ptr.x * 0.4 * (1 - S.zoom); look.y += ptr.y * 0.3 * (1 - S.zoom);
          camera.position.copy(tmpP);
          camera.lookAt(look);
        }
        sky.position.copy(camera.position);
        stars.position.copy(camera.position);
        sunG.position.set(camera.position.x, S.sunY, camera.position.z - 1400);
        skyMat.uniforms.uNight.value = S.night;
        scene.fog.color.copy(fogA).lerp(fogB, S.night);
        const n = Math.floor(S.type * totalChars);
        if (n !== typed) { typed = n; drawTerm(n); }
        renderer.render(scene, camera);
      };

      let last = performance.now();
      this._tick = () => {
        const now = performance.now();
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const r = story.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const a = tg.attributes.position;
        for (let i = 0; i < trN; i++) {
          let z = a.getZ(i) + tv[i] * dt;
          if (z < -1160) z = -340; if (z > -340) z = -1160;
          a.setZ(i, z);
        }
        a.needsUpdate = true;
        starMat.opacity = 0.75 + Math.sin(now * 0.0015) * 0.15;
        render();
      };
      g.ticker.add(this._tick);

      this._onResize = () => {
        const w = stage.clientWidth, h = stage.clientHeight;
        // Turning a phone sideways needs a different layout, so rebuild the scene once it settles.
        if ((window.innerWidth < window.innerHeight) !== portrait) {
          clearTimeout(this._flip);
          this._flip = setTimeout(() => this.restart(), 250);
        }
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w / h < 1 ? 74 : 55;
        camera.updateProjectionMatrix();
      };
      this._onResize();
      window.addEventListener('resize', this._onResize);
      if (!mobile) {
        this._onPointer = (e) => { ptr.tx = (e.clientX / window.innerWidth - 0.5) * 2; ptr.ty = -(e.clientY / window.innerHeight - 0.5) * 2; };
        window.addEventListener('pointermove', this._onPointer);
      }

      this.mm = g.matchMedia();
      this.mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Every project adds 2 timeline units; the rest of the story moves along with it.
        const D = (billZ.length - 3) * 2.0;
        story.style.height = 'calc(100vh + ' + Math.round((18.3 + D) * (mobile ? 680 : 790)) + 'px)';
        if (fb) fb.style.display = 'none';
        g.set('.lg', { transformOrigin: '79.1% 33.7%' });
        g.set('.hint', { xPercent: -50, x: 0 });

        const tl = g.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: story, start: 'top top', end: 'bottom bottom', scrub: mobile ? 0.8 : 1.2,
            onUpdate: (self) => {
              const t = self.progress * tl.duration();
              const c = t < 1.2 ? 0 : t < 4.9 ? 1 : t < 11.1 + D ? 2 : t < 16.3 + D ? 3 : 4;
              if (c !== ((this.state && this.state.chap) || 0)) this.setState({ chap: c });
            }
          }
        });
        this._tl = tl;
        tl.addLabel('about', 1.8).addLabel('p1', 6.15).addLabel('skills', 14.2 + D);
        const show = (sel, at, len) => {
          tl.fromTo(sel, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3 }, at)
            .to(sel, { autoAlpha: 0, y: -24, duration: 0.25 }, at + len)
            .set(sel, { pointerEvents: 'auto' }, at + 0.1)
            .set(sel, { pointerEvents: 'none' }, at + len);
        };

        // 1. dive through the sun dot of the logo, down to the horizon
        tl.to('.hero .copy, .hero .hint, .hero .uta', { autoAlpha: 0, y: -20, duration: 0.35 }, 0)
          .set('.hero', { pointerEvents: 'none' }, 0.3)
          .to('.hero .lg', { scale: 38, ease: 'power3.in', duration: 1.1 }, 0)
          .to('.hero .lg', { autoAlpha: 0, duration: 0.25 }, 0.85)
          .fromTo('.flash-s', { opacity: 0 }, { opacity: 0.8, duration: 0.15 }, 0.9)
          .to('.flash-s', { opacity: 0, duration: 0.5 }, 1.05)
          .to(S, { pitch: 0, ease: 'power2.inOut', duration: 1.5 }, 0.35)
          .to(S, { u: uCity, ease: 'power1.inOut', duration: 4.4 }, 0.5);

        // 2. About, in three scenes over the grid; the sun sets (dark) or rises (light)
        show('.a1', 1.4, 0.95);
        show('.a2', 2.55, 0.95);
        show('.a3', 3.7, 0.95);
        tl.to(S, { sunY: T.sunEnd, ease: T.nightEnd ? 'power1.in' : 'power1.out', duration: 2.2 }, 2.6)
          .to(S, { night: T.nightEnd, duration: 2.0 }, 2.9);

        // 3. Projects: stop at each billboard
        tl.addLabel('work', 4.9);
        uStop.forEach((u, i) => {
          const at = 4.9 + i * 2.0;
          tl.to(S, { u: u, ease: 'power2.inOut', duration: 1.1 }, at);
          show('.p' + (i + 1), at + 0.9, 0.95);
        });
        show('.more', 10.95 + D, 0.75);

        // 4. Skills: rise to the tower window and land in the terminal room
        tl.to(S, { u: 1, ease: 'power2.in', duration: 1.6 }, 11.1 + D)
          .fromTo('.flash-c', { opacity: 0 }, { opacity: 0.9, duration: 0.15 }, 12.55 + D)
          .to('.flash-c', { opacity: 0, duration: 0.45 }, 12.7 + D)
          .set(S, { mode: 1 }, 12.65 + D)
          .to(S, { roomT: 1, ease: 'power2.out', duration: 1.1 }, 12.65 + D)
          .to(S, { type: 1, duration: 1.4 }, 12.9 + D);

        // 5. Contact: dive into the cursor, which turns out to be the sun of the logo
        tl.to(S, { zoom: 1, ease: 'power3.in', duration: 1 }, 15.4 + D)
          .fromTo('.flash-s', { opacity: 0 }, { opacity: 0.9, duration: 0.12, immediateRender: false }, 16.25 + D)
          .to('.flash-s', { opacity: 0, duration: 0.45 }, 16.4 + D)
          .set(S, { mode: 0, u: 0, pitch: 1, sunY: T.sunStart, night: 0 }, 16.35 + D)
          .to('.end', { autoAlpha: 1, duration: 0.25 }, 16.35 + D)
          .fromTo('.end .lg', { scale: 38 }, { scale: 1, ease: 'power3.out', duration: 1.2, immediateRender: false }, 16.35 + D)
          .fromTo('.end .copy, .end .uta, .end .hint', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 17.3 + D)
          .to({}, { duration: 0.6 }, 17.7 + D);

        this._onPast = ST.create({ trigger: '#contact', start: 'top 60%', onEnter: () => this.setState({ chap: 4 }), onLeaveBack: () => this.setState({ chap: 3 }) });
        return () => {
          story.style.height = '';
          if (fb) fb.style.display = '';
        };
      });
      render();
      requestAnimationFrame(() => canvas.classList.add('ready'));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => app.init());
  else app.init();
})();
