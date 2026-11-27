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
        if (e.target.closest('[data-replay]')) { window.scrollTo({ top: 0, behavior: 'auto' }); return; }
        if (e.target.closest('[data-sound]')) { this.toggleSound(); return; }
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
      // Music pauses while the tab is hidden.
      document.addEventListener('visibilitychange', () => {
        if (!this._music || !this._snd) return;
        if (document.hidden) this._music.pause(); else this._music.start();
      });
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

    toggleSound() {
      this._snd = !this._snd;
      document.querySelectorAll('[data-sound]').forEach((b) => b.setAttribute('aria-pressed', String(this._snd)));
      const m = this.music();
      if (this._snd) m.start(); else m.stop();
    },

    // A quiet synthwave pad made in the browser (no audio file): Am, F, C, G, four seconds each.
    music() {
      if (this._music) return this._music;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this._music = { start() {}, stop() {}, pause() {} }; return this._music; }
      const ac = new AC();
      const master = ac.createGain(); master.gain.value = 0;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.7;
      lp.connect(master); master.connect(ac.destination);
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.07;
      const lfoAmt = ac.createGain(); lfoAmt.gain.value = 350;
      lfo.connect(lfoAmt); lfoAmt.connect(lp.frequency); lfo.start();
      const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
      const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
      let step = 0, next = 0, timer = null, off = null;
      const play = (t) => {
        const ch = chords[step++ % chords.length];
        ch.concat([ch[0] - 12]).forEach((m, i) => {
          const bass = i === 3;
          [-7, 7].forEach((det) => {
            const o = ac.createOscillator(); o.type = bass ? 'sine' : 'sawtooth';
            o.frequency.value = hz(m); o.detune.value = det;
            const g = ac.createGain();
            const peak = bass ? 0.45 : 0.2;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 1.4);
            g.gain.setValueAtTime(peak, t + 3.6); g.gain.linearRampToValueAtTime(0, t + 5.2);
            o.connect(g); g.connect(lp); o.start(t); o.stop(t + 5.3);
          });
        });
      };
      const schedule = () => { while (next < ac.currentTime + 0.6) { play(next); next += 4; } };
      const fade = (to, s) => {
        const now = ac.currentTime;
        master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(to, now + s);
      };
      this._music = {
        start() {
          clearTimeout(off);
          ac.resume();
          if (!timer) { next = Math.max(next, ac.currentTime + 0.05); schedule(); timer = setInterval(schedule, 250); }
          fade(0.07, 1.5);
        },
        stop() {
          fade(0, 0.8);
          clearTimeout(off);
          off = setTimeout(() => { clearInterval(timer); timer = null; ac.suspend(); }, 900);
        },
        pause() { this.stop(); }
      };
      return this._music;
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

      // A soft horizontal streak (bright on the right), used for meteors and the plane's contrail.
      const streakTex = (() => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 16;
        const x = c.getContext('2d');
        const gr = x.createLinearGradient(0, 0, 256, 0);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.85, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,1)');
        x.fillStyle = gr; x.fillRect(0, 0, 256, 16);
        const v = x.createLinearGradient(0, 0, 0, 16);
        v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
        x.globalCompositeOperation = 'destination-out'; x.fillStyle = v; x.fillRect(0, 0, 256, 16);
        return new THREE.CanvasTexture(c);
      })();
      // A long soft stripe that fades at both ends, laid flat on the ground for reflections.
      const stripeTex = (() => {
        const c = document.createElement('canvas');
        c.width = 32; c.height = 256;
        const x = c.getContext('2d');
        const gr = x.createLinearGradient(0, 0, 0, 256);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = gr; x.fillRect(0, 0, 32, 256);
        const h = x.createLinearGradient(0, 0, 32, 0);
        h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)');
        x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 32, 256);
        return new THREE.CanvasTexture(c);
      })();
      const fwd = new THREE.Vector3(), rgt = new THREE.Vector3(), upv = new THREE.Vector3();

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

      // Shooting stars (dark mode): now and then a streak crosses the sky ahead of the camera.
      const meteors = [];
      if (T.stars) {
        for (let i = 0; i < 2; i++) {
          const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, color: 0xffe9fb, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
          m.scale.set(150, 3.4, 1);
          scene.add(m);
          meteors.push({ s: m, t: 0, wait: 2 + i * 4 + rnd() * 3, life: 0.9, pos: new THREE.Vector3(), dir: new THREE.Vector3() });
        }
      }
      const updMeteors = (dt) => {
        meteors.forEach((m) => {
          if (m.t <= 0) {
            m.wait -= dt;
            m.s.material.opacity = 0;
            if (m.wait > 0 || S.mode !== 0) return;
            // Start somewhere high in front of the camera and fall down and sideways.
            camera.getWorldDirection(fwd);
            rgt.setFromMatrixColumn(camera.matrixWorld, 0); upv.setFromMatrixColumn(camera.matrixWorld, 1);
            const side = rnd() < 0.5 ? -1 : 1;
            m.pos.copy(camera.position).addScaledVector(fwd, 700).addScaledVector(rgt, side * (60 + rnd() * 260)).addScaledVector(upv, 120 + rnd() * 170);
            if (m.pos.y < camera.position.y + 80) m.pos.y = camera.position.y + 80 + rnd() * 120;
            m.dir.copy(rgt).multiplyScalar(-side * 0.85).addScaledVector(upv, -0.5).normalize();
            m.s.material.rotation = Math.atan2(-0.5, -side * 0.85);
            m.t = m.life;
          }
          m.t -= dt;
          const k = 1 - m.t / m.life;
          m.s.position.copy(m.pos).addScaledVector(m.dir, k * 520);
          m.s.material.opacity = Math.sin(Math.min(1, k) * Math.PI);
          if (m.t <= 0) { m.s.material.opacity = 0; m.wait = 3 + rnd() * 6; }
        });
      };

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

      // A plane drawing a contrail across the sky (light mode).
      let plane = null;
      if (T.clouds) {
        const pc = document.createElement('canvas'); pc.width = 64; pc.height = 32;
        const px = pc.getContext('2d');
        px.fillStyle = '#3a4a7a';
        px.fillRect(10, 14, 46, 4); // body
        px.beginPath(); px.moveTo(30, 16); px.lineTo(22, 2); px.lineTo(28, 2); px.lineTo(40, 16); px.fill(); // wing
        px.beginPath(); px.moveTo(30, 16); px.lineTo(22, 30); px.lineTo(28, 30); px.lineTo(40, 16); px.fill();
        px.beginPath(); px.moveTo(10, 16); px.lineTo(6, 8); px.lineTo(10, 8); px.lineTo(16, 16); px.fill(); // tail
        const body = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, depthWrite: false, fog: false }));
        body.scale.set(16, 8, 1);
        const trail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: streakTex, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
        scene.add(body); scene.add(trail);
        plane = { body: body, trail: trail, t: 4 };
      }
      const updPlane = (dt) => {
        if (!plane) return;
        plane.t += dt;
        const span = 26, k = (plane.t % span) / span;
        const show = S.mode === 0;
        plane.body.visible = plane.trail.visible = show;
        if (!show) return;
        // The sky moves with the camera, so the plane is placed relative to it.
        const hx = -460 + k * 920, hy = 300 + k * 40, hz = -620;
        plane.body.position.set(camera.position.x + hx, hy, camera.position.z + hz);
        const L = Math.min(380, k * 920);
        plane.trail.scale.set(Math.max(0.01, L), 3.2, 1);
        plane.trail.position.set(camera.position.x + hx - 10 - L / 2, hy - 0.4 - (L / 920) * 20, camera.position.z + hz - 1);
        plane.trail.rotation.z = Math.atan2(40, 920);
        plane.trail.material.opacity = 0.8 * Math.min(1, (1 - k) * 6);
      };

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

      // Sunlight reflected on the grid floor, a long stripe running toward the sun.
      const glint = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
        map: stripeTex, color: T.stars ? 0xff6aa8 : 0xffc98a, transparent: true, opacity: 0, depthWrite: false, fog: false,
        blending: T.stars ? THREE.AdditiveBlending : THREE.NormalBlending
      }));
      glint.rotation.x = -Math.PI / 2;
      glint.scale.set(34, 900, 1);
      glint.renderOrder = 1;
      scene.add(glint);

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
      const billEls = Array.from(document.querySelectorAll('.panel[data-bill]'));
      const billData = billEls.map((el) => el.dataset.bill.split('|'));
      // A sign can show a picture of the project (data-bill-img) instead of big text.
      const billImg = billEls.map((el) => el.dataset.billImg || '');
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

      // Dust drifting past the camera, so the flight feels fast. It wraps around the camera as it moves.
      const dustN = mobile ? 90 : 200;
      const dp = new Float32Array(dustN * 3);
      for (let i = 0; i < dustN; i++) { dp[i * 3] = (rnd() - 0.5) * 28; dp[i * 3 + 1] = 1 + rnd() * 12; dp[i * 3 + 2] = 70 - rnd() * 90; }
      const dgeo = new THREE.BufferGeometry();
      dgeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
      const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({
        size: 0.14, map: glowTex, color: T.stars ? 0xffc2ec : 0x7f95d6, transparent: true, opacity: T.stars ? 0.8 : 0.55, depthWrite: false,
        blending: T.stars ? THREE.AdditiveBlending : THREE.NormalBlending
      }));
      scene.add(dust);
      const wrapAround = (arr, n, c, bx, y0, y1, zf, zb) => {
        for (let i = 0; i < n; i++) {
          const o = i * 3;
          if (arr[o + 2] - c.z > zf) arr[o + 2] -= zf - zb; else if (arr[o + 2] - c.z < zb) arr[o + 2] += zf - zb;
          if (arr[o] - c.x > bx) arr[o] -= bx * 2; else if (arr[o] - c.x < -bx) arr[o] += bx * 2;
          if (arr[o + 1] - c.y > y1) arr[o + 1] -= y1 - y0; else if (arr[o + 1] - c.y < y0) arr[o + 1] += y1 - y0;
        }
      };

      // Rain over the city at night (dark mode).
      let rain = null;
      if (T.stars) {
        const rainN = mobile ? 260 : 600;
        const rp = new Float32Array(rainN * 6);
        for (let i = 0; i < rainN; i++) {
          const x = (rnd() - 0.5) * 60, y = rnd() * 40, z = -330 - rnd() * 80;
          rp.set([x, y, z, x + 0.15, y - 1.8, z], i * 6);
        }
        const rgeo = new THREE.BufferGeometry();
        rgeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
        rain = new THREE.LineSegments(rgeo, new THREE.LineBasicMaterial({ color: 0xa9b8ff, transparent: true, opacity: 0, depthWrite: false }));
        rain.userData.n = rainN;
        scene.add(rain);

        // Wet road: neon colour smeared on the ground between the towers.
        const wet = new THREE.Group();
        for (let z = -340; z > -1130; z -= 14 + rnd() * 18) {
          const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
            map: stripeTex, color: rnd() < 0.5 ? 0x00e5ff : 0xff2e97, transparent: true, opacity: 0.16 + rnd() * 0.14, depthWrite: false, blending: THREE.AdditiveBlending
          }));
          m.rotation.x = -Math.PI / 2;
          m.scale.set(1.4 + rnd() * 2.2, 18 + rnd() * 26, 1);
          m.position.set((rnd() < 0.5 ? -1 : 1) * (1.5 + rnd() * 9), 0.12, z);
          wet.add(m);
        }
        scene.add(wet);
      }
      const rainAt = (cz) => smooth(-260, -380, cz) * (1 - smooth(-1080, -1150, cz));
      const updRain = (dt) => {
        if (!rain) return;
        const a = rain.geometry.attributes.position.array;
        const n = rain.userData.n;
        const c = camera.position;
        for (let i = 0; i < n; i++) {
          const o = i * 6;
          a[o + 1] -= 70 * dt; a[o + 4] -= 70 * dt;
          if (a[o + 1] - c.y < -10) { const y = c.y + 30 + Math.random() * 6; a[o + 1] = y; a[o + 4] = y - 1.8; }
          if (a[o + 2] - c.z > 6) { const z = a[o + 2] - 86; a[o + 2] = z; a[o + 5] = z; } else if (a[o + 2] - c.z < -80) { const z = a[o + 2] + 86; a[o + 2] = z; a[o + 5] = z; }
          if (a[o] - c.x > 30) { a[o] -= 60; a[o + 3] -= 60; } else if (a[o] - c.x < -30) { a[o] += 60; a[o + 3] += 60; }
        }
        rain.geometry.attributes.position.needsUpdate = true;
        rain.visible = S.mode === 0;
        rain.material.opacity = 0.55 * rainAt(c.z);
      };

      // Birds over the city (light mode): small flocks flapping across the avenue.
      let birds = null;
      if (T.clouds) {
        const flocks = [[-430, 36], [-640, 44], [-880, 40]];
        const perFlock = 5;
        const bn = flocks.length * perFlock;
        const bp = new Float32Array(bn * 12);
        const bgeo = new THREE.BufferGeometry();
        bgeo.setAttribute('position', new THREE.BufferAttribute(bp, 3));
        birds = new THREE.LineSegments(bgeo, new THREE.LineBasicMaterial({ color: 0x3a4a7a }));
        birds.userData = { flocks: flocks, per: perFlock, off: Array.from({ length: bn }, () => [rnd() * 6 - 3, rnd() * 3, rnd() * 4 - 2, rnd() * 6]) };
        birds.frustumCulled = false;
        scene.add(birds);
      }
      let clock = 0;
      const updBirds = () => {
        if (!birds) return;
        const u = birds.userData, a = birds.geometry.attributes.position.array;
        u.flocks.forEach((f, fi) => {
          const cx = -70 + (((clock * 4 + fi * 47) % 140) + 140) % 140;
          for (let j = 0; j < u.per; j++) {
            const i = fi * u.per + j, o = u.off[i], b = i * 12;
            const x = cx - j * 2.2 + o[0], y = f[1] + o[1] + (j % 2) * 1.2, z = f[0] + o[2];
            const flap = Math.sin(clock * 9 + o[3]) * 0.55;
            a.set([x - 0.9, y + flap, z, x, y, z, x, y, z, x + 0.9, y + flap, z], b);
          }
        });
        birds.geometry.attributes.position.needsUpdate = true;
        birds.visible = S.mode === 0;
      };

      // Three project billboards.
      const billTex = [];
      const billPics = [];
      const drawBill = (i) => {
        const c = billTex[i].image;
        const x = c.getContext('2d');
        x.setTransform(2, 0, 0, 2, 0, 0);
        const col = T.billCols[i % 2];
        x.clearRect(0, 0, 512, 320);
        x.fillStyle = T.billBg; x.fillRect(0, 0, 512, 320);
        const words = billData[i] || ['PROJECT', '0' + (i + 1)];
        const pic = billPics[i];
        if (pic && pic.complete && pic.naturalWidth) {
          // Picture fills the sign; a dark band at the top keeps the label readable.
          const ar = 496 / 304, ir = pic.naturalWidth / pic.naturalHeight;
          let sw = pic.naturalWidth, sh = pic.naturalHeight, sx = 0, sy = 0;
          if (ir > ar) { sw = sh * ar; sx = (pic.naturalWidth - sw) / 2; } else { sh = sw / ar; sy = (pic.naturalHeight - sh) / 2; }
          x.drawImage(pic, sx, sy, sw, sh, 8, 8, 496, 304);
          const band = x.createLinearGradient(0, 8, 0, 118);
          band.addColorStop(0, 'rgba(8,6,28,0.96)'); band.addColorStop(0.6, 'rgba(8,6,28,0.82)'); band.addColorStop(1, 'rgba(8,6,28,0)');
          x.fillStyle = band; x.fillRect(8, 8, 496, 110);
          x.fillStyle = col; x.font = '500 18px "JetBrains Mono", monospace';
          x.fillText('PROJECT 0' + (i + 1), 28, 46);
          x.fillStyle = '#f6e9ff'; x.font = '700 34px "Space Grotesk", sans-serif';
          x.fillText(words[0] + (words[1] ? '  ·  ' + words[1] : ''), 28, 86);
          x.strokeStyle = col; x.lineWidth = 6; x.strokeRect(8, 8, 496, 304);
          billTex[i].needsUpdate = true;
          return;
        }
        x.fillStyle = T.billLine;
        for (let y = 0; y < 320; y += 4) x.fillRect(0, y, 512, 1);
        x.strokeStyle = col; x.lineWidth = 6; x.strokeRect(8, 8, 496, 304);
        x.fillStyle = col; x.font = '500 24px "JetBrains Mono", monospace';
        x.fillText('PROJECT 0' + (i + 1), 36, 64);
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
        const c = document.createElement('canvas'); c.width = 1024; c.height = 640;
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        billTex.push(t);
        if (billImg[i]) {
          const pic = new Image();
          pic.decoding = 'async';
          pic.onload = () => { if (this.scene === scene) drawBill(i); };
          pic.src = billImg[i];
          billPics[i] = pic;
        }
        drawBill(i);
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

      // Certificate frame on the back wall (wide screens), from the first credential in the list.
      if (!portrait && creds.length) {
        const fc = document.createElement('canvas'); fc.width = 512; fc.height = 512;
        const fx = fc.getContext('2d');
        fx.fillStyle = R.wall === 0x07051a ? '#0d0a24' : '#ffffff'; fx.fillRect(0, 0, 512, 512);
        const hex = (r) => { fx.beginPath(); for (let k = 0; k < 6; k++) { const an = Math.PI / 6 + k * Math.PI / 3; fx[k ? 'lineTo' : 'moveTo'](256 + r * Math.cos(an), 210 + r * Math.sin(an)); } fx.closePath(); };
        const hg = fx.createLinearGradient(0, 80, 0, 340);
        hg.addColorStop(0, '#ffd23f'); hg.addColorStop(1, '#ff2e97');
        hex(140); fx.fillStyle = hg; fx.fill();
        hex(118); fx.fillStyle = '#14123a'; fx.fill();
        fx.textAlign = 'center'; fx.fillStyle = '#f6e9ff';
        fx.font = '700 30px "Space Grotesk", sans-serif'; fx.fillText('CERTIFIED', 256, 200);
        fx.font = '500 20px "JetBrains Mono", monospace'; fx.fillStyle = '#ffd23f'; fx.fillText(creds[0].issued || '', 256, 238);
        fx.fillStyle = R.wall === 0x07051a ? '#f6e9ff' : '#14123a'; fx.font = '700 28px "Space Grotesk", sans-serif';
        fx.fillText(creds[0].name || '', 256, 420);
        const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace;
        const frame = new THREE.Group();
        frame.add(new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.6, 0.12), new THREE.MeshBasicMaterial({ color: R.bezel })));
        const art = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: ft }));
        art.position.z = 0.07; frame.add(art);
        const fe = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.6, 3.6, 0.12)), new THREE.LineBasicMaterial({ color: R.accent }));
        frame.add(fe);
        frame.position.set(9.7, 2.9, -14.85);
        room.add(frame);
      }

      // Sticky notes on the right edge of the monitor, clear of the terminal text.
      [['ship small', '#ffe066', SY + SH / 2 - 0.35, 0.1], ['read the logs', '#ff9ad5', SY + SH / 2 - 1.35, -0.08]].forEach((n) => {
        const nc = document.createElement('canvas'); nc.width = 256; nc.height = 256;
        const nx = nc.getContext('2d');
        nx.fillStyle = n[1]; nx.fillRect(0, 0, 256, 256);
        nx.fillStyle = 'rgba(0,0,0,0.08)'; nx.fillRect(0, 0, 256, 34);
        nx.fillStyle = '#2a1f4a'; nx.font = '700 40px "Space Grotesk", sans-serif'; nx.textAlign = 'center';
        const parts = n[0].split(' ');
        parts.forEach((w, k) => nx.fillText(w, 128, 120 + k * 50 - (parts.length - 1) * 25));
        const nt = new THREE.CanvasTexture(nc); nt.colorSpace = THREE.SRGBColorSpace;
        // On a tall screen the monitor fills the width, so the notes sit just inside its right edge.
        const ns = portrait ? 0.7 : 0.85;
        const note = new THREE.Mesh(new THREE.PlaneGeometry(ns, ns), new THREE.MeshBasicMaterial({ map: nt }));
        note.position.set(portrait ? SW / 2 - 0.28 : SW / 2 + 0.12, n[2], SZ + 0.04);
        note.rotation.z = n[3];
        room.add(note);
      });

      // A small plant on the desk (light mode).
      if (T.clouds) {
        const plant = new THREE.Group();
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.55, 20), new THREE.MeshBasicMaterial({ color: 0xff8fb1 }));
        pot.position.y = 0.28; plant.add(pot);
        const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.04, 20), new THREE.MeshBasicMaterial({ color: 0x5a4a3a }));
        soil.position.y = 0.54; plant.add(soil);
        const leafG = new THREE.SphereGeometry(0.5, 10, 8);
        [[0, 0.12, 0x3fbf7f], [1.1, 0.25, 0x2fa86c], [2.2, 0.18, 0x4fd18f], [3.3, 0.3, 0x2fa86c], [4.4, 0.15, 0x3fbf7f], [5.5, 0.22, 0x4fd18f]].forEach((l) => {
          const leaf = new THREE.Mesh(leafG, new THREE.MeshBasicMaterial({ color: l[2] }));
          leaf.scale.set(0.16, 0.62 + l[1], 0.08);
          leaf.position.set(Math.cos(l[0]) * 0.12, 0.95 + l[1] * 0.3, Math.sin(l[0]) * 0.12);
          leaf.rotation.set(Math.sin(l[0]) * 0.45, 0, Math.cos(l[0]) * 0.45);
          plant.add(leaf);
        });
        plant.position.set(portrait ? 1.9 : 6.0, DY + 0.15, portrait ? -6.6 : -6.5);
        room.add(plant);
      }

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
        glint.position.set(camera.position.x, 0.2, camera.position.z - 470);
        glint.visible = S.mode === 0;
        glint.material.opacity = (T.stars ? 0.45 : 0.3) * smooth(-40, 60, S.sunY) * (1 - S.night * 0.85) * (1 - smooth(-300, -420, camera.position.z));
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
        clock += dt;
        render();
        // Effects that follow the camera are updated after it has moved.
        wrapAround(dp, dustN, camera.position, 14, -3, 10, 6, -84);
        for (let i = 0; i < dustN; i++) dp[i * 3 + 1] += Math.sin(now * 0.0007 + i) * 0.004;
        dgeo.attributes.position.needsUpdate = true;
        dust.visible = S.mode === 0;
        updMeteors(dt); updPlane(dt); updRain(dt); updBirds();
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
          .set('.end', { pointerEvents: 'auto' }, 17.4 + D)
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
