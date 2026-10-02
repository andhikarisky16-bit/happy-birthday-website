/* =========================================================
   HAPPY BIRTHDAY SURPRISE — script.js
   Alur: opening → surat → wish → kue → langit malam → kado
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     ⬇⬇  KONFIGURASI  ⬇⬇
     ========================================================= */
  const CONFIG = {
    letterTitle: "Happy Birthday ✨",   // judul yang di-typing di surat
    skyTitle: "HAPPY BIRTHDAY",         // judul cinematic di langit malam
    dodgesNeeded: 4                     // berapa kali kado berhasil menghindar
  };
  /* ========================================================= */

  /* ---------- util ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const CONFETTI_COLORS = ["#ff9ec4", "#c9a7ff", "#ffd980", "#ffd6a5", "#a8e6cf", "#ffb3d0", "#f7e3ac"];
  const HEART_COLORS = ["#ff7fae", "#ff9ec4", "#f78fb8", "#e88bb5"];

  let stageTimers = [];
  function after(ms, fn) {
    const id = setTimeout(fn, ms);
    stageTimers.push(id);
    return id;
  }
  function clearStageTimers() {
    stageTimers.forEach(clearTimeout);
    stageTimers = [];
  }

  /* ---------- partikel / ledakan ---------- */
  function spawnParticle(type, x, y, opts) {
    const el = document.createElement("div");
    el.className = "particle " + type;
    const angle = opts.angle;
    const dist = opts.dist;
    el.style.setProperty("--tx", (Math.cos(angle) * dist).toFixed(1) + "px");
    el.style.setProperty("--ty", (Math.sin(angle) * dist - (opts.lift || 0)).toFixed(1) + "px");
    el.style.setProperty("--rot", randInt(-320, 320) + "deg");
    el.style.setProperty("--ft", rand(opts.minDur || 0.9, opts.maxDur || 1.7).toFixed(2) + "s");
    el.style.setProperty("--fs", randInt(opts.fsMin || 13, opts.fsMax || 20) + "px");
    if (opts.color) el.style.setProperty("--c", opts.color);
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    const ttl = (parseFloat(el.style.getPropertyValue("--ft")) || 1.4) * 1000 + 250;
    setTimeout(() => el.remove(), ttl);
  }

  const PARTICLE_SETS = {
    hearts:   { cls: "p-heart",   chance: 0, count: 8,  dist: [60, 150], lift: 40 },
    sparks:   { cls: "p-spark",   chance: 0, count: 14, dist: [50, 160], lift: 20 },
    stars:    { cls: "p-star",    chance: 0, count: 10, dist: [60, 170], lift: 30 },
    confetti: { cls: "p-confetti", chance: 0, count: 30, dist: [80, 240], lift: 60 },
    petals:   { cls: "p-petal",   chance: 0, count: 12, dist: [60, 180], lift: 50 },
    bubbles:  { cls: "p-bubble",  chance: 0, count: 8,  dist: [50, 140], lift: 70 }
  };

  /**
   * burst(x, y, { hearts, sparks, stars, confetti, petals, bubbles, spread })
   * spread: sudut lebar ledakan (default full circle)
   */
  function burst(x, y, spec) {
    const scale = reduceMotion ? 0.35 : 1;
    const spread = spec.spread != null ? spec.spread : Math.PI * 2;
    const baseAngle = spec.angle != null ? spec.angle : 0;

    Object.keys(PARTICLE_SETS).forEach((key) => {
      const n = spec[key];
      if (!n) return;
      const set = PARTICLE_SETS[key];
      const total = Math.max(1, Math.round(n * scale));
      for (let i = 0; i < total; i++) {
        const a = baseAngle + (Math.random() - 0.5) * spread;
        spawnParticle(set.cls, x, y, {
          angle: a,
          dist: rand(set.dist[0], set.dist[1]) * (spec.range || 1),
          lift: set.lift,
          color: pick(CONFETTI_COLORS),
          fsMin: 12,
          fsMax: 22
        });
      }
    });
  }

  function burstAtElement(el, spec) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, spec);
  }

  function burstHearts(el, count) {
    burstAtElement(el, { hearts: count || 8, sparks: 10 });
  }

  /* ---------- dekorasi yang dibangkitkan JS ---------- */
  function fillStars(container, count, opts) {
    if (!container) return;
    const o = opts || {};
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement("i");
      s.style.left = rand(2, 97).toFixed(2) + "%";
      s.style.top = rand(3, 96).toFixed(2) + "%";
      s.style.setProperty("--s", randInt(o.minSize || 2, o.maxSize || 4) + "px");
      s.style.setProperty("--sd", rand(0, o.maxDelay || 2.2).toFixed(2) + "s");
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }

  function fillFloaters(container, count, cls, cfg) {
    if (!container) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement("i");
      if (cls) s.className = cls;
      s.style.left = rand(0, 96).toFixed(2) + "%";
      s.style.setProperty("--s", randInt(cfg.minSize, cfg.maxSize) + "px");
      s.style.setProperty("--t", rand(cfg.minT, cfg.maxT).toFixed(1) + "s");
      s.style.setProperty("--dl", rand(0, cfg.maxDelay).toFixed(1) + "s");
      s.style.setProperty("--dx", rand(-70, 70).toFixed(0) + "px");
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }

  function buildDecor() {
    fillStars($("#openingStars"), reduceMotion ? 16 : 34, { maxSize: 4, maxDelay: 2 });
    fillFloaters($("#ambient"), reduceMotion ? 0 : 16, null, { minSize: 4, maxSize: 9, minT: 14, maxT: 26, maxDelay: 12 });
    fillFloaters($("#petalRain"), reduceMotion ? 0 : 9, null, { minSize: 10, maxSize: 15, minT: 11, maxT: 20, maxDelay: 9 });
    fillFloaters($("#wishMotes"), reduceMotion ? 0 : 11, null, { minSize: 4, maxSize: 7, minT: 10, maxT: 18, maxDelay: 8 });
    fillFloaters($("#calmMotes"), reduceMotion ? 0 : 13, null, { minSize: 4, maxSize: 8, minT: 13, maxT: 22, maxDelay: 10 });
    fillStars($("#stars"), reduceMotion ? 40 : 130, { minSize: 1, maxSize: 3, maxDelay: 2.6 });

    // sprinkle kue
    $$("[data-sprinkles]").forEach((box) => {
      const n = 16;
      for (let i = 0; i < n; i++) {
        const sp = document.createElement("span");
        sp.className = "sprinkle";
        sp.style.left = rand(6, 90).toFixed(1) + "%";
        sp.style.top = rand(24, 88).toFixed(1) + "%";
        sp.style.setProperty("--r", randInt(-70, 70) + "deg");
        sp.style.setProperty("--c", pick(CONFETTI_COLORS));
        box.appendChild(sp);
      }
    });
  }

  /* ---------- mesin stage ---------- */
  const stages = $$(".stage");
  const dots = $$(".progress .dot");
  let current = 0;
  const onEnter = {};
  const onLeave = {};

  function stageKey(i) {
    return stages[i] ? stages[i].dataset.key : "";
  }

  function goTo(index) {
    if (index < 0 || index >= stages.length || index === current) return;
    clearStageTimers();

    const prev = current;
    if (typeof onLeave[stageKey(prev)] === "function") onLeave[stageKey(prev)]();

    stages[prev].classList.remove("is-active");
    stages[index].classList.add("is-active");
    document.body.dataset.stage = stageKey(index);
    current = index;

    dots.forEach((d, i) => d.classList.toggle("is-on", i === index));

    if (typeof onEnter[stageKey(index)] === "function") {
      // beri waktu transisi mulai
      after(60, () => onEnter[stageKey(index)]());
    }
  }

  function isCurrent(key) {
    return stageKey(current) === key;
  }

  /* ---------- 1. OPENING ---------- */
  function initOpening() {
    $("#startBtn").addEventListener("click", () => {
      const btn = $("#startBtn");
      btn.style.transform = "scale(0.94)";
      burstAtElement(btn, { sparks: 18, stars: 10, hearts: 6 });
      after(320, () => {
        btn.style.transform = "";
        goTo(1);
      });
    });
  }

  /* ---------- 2. BIRTHDAY LETTER ---------- */
  function initLetter() {
    const scene = $(".envelope-scene");
    const envelope = $("#envelope");
    const card = $("#letterCard");
    const title = $("#letterTitle");
    const hint = $("#envHint");
    const nextBtn = $("#letterNext");
    const lines = $$(".letter-line");
    const sign = $("#letterSign");
    let opened = false;

    async function typeText(el, text, speed) {
      el.textContent = "";
      el.classList.add("is-typing");
      for (let i = 0; i < text.length; i++) {
        if (!isCurrent("letter")) {
          el.classList.remove("is-typing");
          return false;
        }
        el.textContent += text[i];
        await wait(reduceMotion ? 0 : speed + rand(-20, 40));
      }
      el.classList.remove("is-typing");
      return true;
    }

    async function revealLetter() {
      const ok = await typeText(title, CONFIG.letterTitle, 78);
      if (!ok) return;
      for (let i = 0; i < lines.length; i++) {
        await wait(reduceMotion ? 0 : 420);
        if (!isCurrent("letter")) return;
        lines[i].classList.add("is-in");
      }
      await wait(reduceMotion ? 0 : 500);
      if (!isCurrent("letter")) return;
      sign.classList.add("is-in");
      hint.textContent = "surat ini hangat, persis untukmu 💌";
      hint.classList.add("is-pop");
      nextBtn.classList.remove("is-hidden");
    }

    function openEnvelope() {
      if (opened || !isCurrent("letter")) return;
      opened = true;
      envelope.classList.add("is-open");
      burstAtElement(envelope, { hearts: 9, sparks: 16, stars: 8 });
      hint.textContent = "eh, ada sesuatu di dalamnya...";
      hint.classList.add("is-pop");

      after(reduceMotion ? 200 : 950, () => {
        scene.classList.add("is-reading");
        scene.style.transform = "";
        card.setAttribute("aria-hidden", "false");
        envelope.setAttribute("aria-hidden", "true");
        hint.classList.add("is-hidden");
        burstAtElement(card, { sparks: 14, hearts: 6 });
        after(reduceMotion ? 150 : 750, revealLetter);
      });
    }

    envelope.addEventListener("click", openEnvelope);
    envelope.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEnvelope();
      }
    });

    // reaksi kursor: amplop sedikit menoleh saat didekati
    if (finePointer && !reduceMotion) {
      const stage = $("#stage-letter");
      stage.addEventListener("pointermove", (e) => {
        if (opened) return;
        const r = scene.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const dist = Math.hypot(px, py);
        if (dist > 0.9) {
          scene.style.transform = "";
          return;
        }
        scene.style.transform =
          "perspective(1100px) rotateX(" + (-py * 8).toFixed(2) + "deg) rotateY(" + (px * 10).toFixed(2) + "deg)";
      });
      stage.addEventListener("pointerleave", () => {
        scene.style.transform = "";
      });
    }

    nextBtn.addEventListener("click", () => goTo(2));
  }

  /* ---------- 3. MAKE A WISH ---------- */
  function initWish() {
    const stage = $("#stage-wish");
    const garden = $("#garden");
    const wishBtn = $("#wishBtn");
    const wishNext = $("#wishNext");
    const hint = $("#wishHint");
    let bloomed = false;

    function popHint(text) {
      hint.textContent = text;
      hint.classList.remove("is-pop");
      void hint.offsetWidth;
      hint.classList.add("is-pop");
    }

    wishBtn.addEventListener("click", () => {
      if (bloomed) return;
      bloomed = true;
      wishBtn.disabled = true;
      wishBtn.classList.add("is-hidden");
      popHint("tunggu sebentar... bunga sedang mekar 🌸");

      const flowers = $$(".flower", garden);
      flowers.forEach((f, i) => {
        after(240 + i * 300, () => {
          f.classList.add("is-bloom");
          burstAtElement($(".head", f), { sparks: 9, petals: 5, stars: 4 });
        });
      });

      after(360, () => stage.classList.add("is-bloomed"));

      after(240 + flowers.length * 300 + 800, () => {
        if (!isCurrent("wish")) return;
        popHint("semoga keinginanmu segera menjadi nyata ✨");
        wishNext.classList.remove("is-hidden");
        burstAtElement(garden, { hearts: 7, sparks: 14, petals: 10 });
      });
    });

    wishNext.addEventListener("click", () => goTo(3));
  }

  /* ---------- 4. BIRTHDAY CAKE ---------- */
  function initCake() {
    const stage = $("#stage-cake");
    const cake = $("#cake");
    const blowBtn = $("#blowBtn");
    const cakeNext = $("#cakeNext");
    const hint = $("#cakeHint");
    const candles = $$("[data-candle]");
    let blown = false;

    function popHint(text) {
      hint.textContent = text;
      hint.classList.remove("is-pop");
      void hint.offsetWidth;
      hint.classList.add("is-pop");
    }

    function blow() {
      if (blown || !isCurrent("cake")) return;
      blown = true;
      cake.classList.add("is-blown");
      stage.classList.add("is-blown");
      blowBtn.classList.add("is-hidden");
      popHint("hufft... permintaanmu terkirim 🌟");

      candles.forEach((c, i) => {
        after(340 + i * 140, () => {
          burstAtElement($(".flame", c), { sparks: 10, stars: 5, confetti: 6 });
        });
      });

      after(1250, () => {
        burstAtElement(cake, { confetti: 34, hearts: 14, stars: 12, sparks: 16, bubbles: 8 });
      });

      after(2200, () => {
        if (!isCurrent("cake")) return;
        popHint("happy birthday, semoga tahunmu manis seperti kue ini 🎂");
        cakeNext.classList.remove("is-hidden");
      });
    }

    blowBtn.addEventListener("click", blow);
    candles.forEach((c) => c.addEventListener("click", blow));
    cakeNext.addEventListener("click", () => goTo(4));
  }

  /* ---------- 5. NIGHT SKY ---------- */
  function initSky() {
    const title = $("#hbTitle");
    const shootWrap = $("#shootings");
    const nextBtn = $("#skyNext");
    let shootTimer = null;

    function buildTitle() {
      title.textContent = "";
      const text = CONFIG.skyTitle;
      let idx = 0;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const s = document.createElement("span");
        s.textContent = ch === " " ? "\u00A0" : ch;
        s.style.setProperty("--ld", (0.5 + idx * 0.085).toFixed(3) + "s");
        title.appendChild(s);
        idx++;
      }
    }

    function spawnShooting() {
      const s = document.createElement("div");
      s.className = "shooting";
      s.style.left = rand(30, 84).toFixed(1) + "%";
      s.style.top = rand(8, 44).toFixed(1) + "%";
      shootWrap.appendChild(s);
      setTimeout(() => s.remove(), 1800);
    }

    onEnter.sky = function () {
      buildTitle();
      if (reduceMotion) return;
      spawnShooting();
      after(1400, spawnShooting);
      shootTimer = setInterval(() => {
        if (isCurrent("sky")) spawnShooting();
      }, 3200);
    };

    onLeave.sky = function () {
      if (shootTimer) {
        clearInterval(shootTimer);
        shootTimer = null;
      }
    };

    nextBtn.addEventListener("click", () => goTo(5));
  }

  /* ---------- 6. FINAL GIFT ---------- */
  function initGift() {
    const arena = $("#giftArena");
    const move = $("#giftMove");
    const box = $("#giftBox");
    const tease = $("#tease");
    const hint = $("#arenaHint");
    const copy = $("#giftCopy");
    const finale = $("#finale");
    const replay = $("#replayBtn");

    const state = {
      x: 0, y: 0, tx: 0, ty: 0,
      dodges: 0, caught: false, opened: false,
      lastFlee: 0, lastDodge: 0
    };
    const messages = ["Hehe 😝", "Almost!", "Try again!", "Not yet! 😂", "Catch me! 🙈", "So close! ✨", "Belum kena! 😜"];
    let msgIdx = 0;
    let rafId = null;

    function bounds() {
      const r = arena.getBoundingClientRect();
      const hw = move.offsetWidth / 2 + 12;
      const hh = move.offsetHeight / 2 + 12;
      return {
        x: Math.max(20, r.width / 2 - hw),
        y: Math.max(20, r.height / 2 - hh)
      };
    }

    function tick() {
      const ease = reduceMotion ? 1 : state.caught ? 0.07 : 0.11;
      state.x += (state.tx - state.x) * ease;
      state.y += (state.ty - state.y) * ease;
      move.style.transform =
        "translate3d(" + state.x.toFixed(2) + "px," + state.y.toFixed(2) + "px,0)";
      rafId = requestAnimationFrame(tick);
    }

    function showTease(text, stay) {
      const r = arena.getBoundingClientRect();
      tease.style.left = (r.width / 2 + state.x) + "px";
      tease.style.top = (r.height / 2 + state.y - 74) + "px";
      tease.textContent = text;
      tease.classList.remove("is-show", "is-stay");
      void tease.offsetWidth;
      tease.classList.add(stay ? "is-stay" : "is-show");
    }

    function dodge() {
      const now = performance.now();
      if (now - state.lastDodge < 240) return;
      state.lastDodge = now;

      const b = bounds();
      let nx = 0, ny = 0, tries = 0;
      do {
        nx = rand(-b.x, b.x);
        ny = rand(-b.y, b.y);
        tries++;
      } while (Math.hypot(nx - state.x, ny - state.y) < Math.min(150, b.x * 0.8) && tries < 30);

      state.tx = clamp(nx, -b.x, b.x);
      state.ty = clamp(ny, -b.y, b.y);
      state.dodges++;

      move.classList.remove("is-dodging");
      void move.offsetWidth;
      move.classList.add("is-dodging");
      burstAtElement(box, { sparks: 8, stars: 4 });

      if (state.dodges >= CONFIG.dodgesNeeded && !state.caught) {
        state.caught = true;
        move.classList.add("is-caught");
        state.tx = 0;
        state.ty = 0;
        after(760, () => {
          if (!state.opened) showTease("Okay okay... you got me! 💗", true);
        });
        hint.textContent = "sekarang klik kadonya untuk membuka 🎁";
        hint.classList.remove("is-gone");
      } else {
        showTease(messages[msgIdx % messages.length]);
        msgIdx++;
        if (state.dodges === 1) hint.textContent = "kejar, hampir! 🎁";
      }
    }

    function openGift() {
      if (state.opened) return;
      state.opened = true;
      box.classList.add("is-open");
      tease.classList.remove("is-show", "is-stay");
      hint.classList.add("is-gone");
      move.classList.remove("is-dodging");

      const r = box.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      burst(cx, cy, { confetti: 46, hearts: 22, sparks: 26, petals: 18, stars: 14, bubbles: 10, range: 1.35 });

      after(650, () => {
        burst(cx, cy, { confetti: 28, hearts: 16, sparks: 20, petals: 12, range: 1.15 });
      });

      after(1500, () => {
        copy.classList.add("is-gone");
        finale.classList.add("is-shown");
        finale.setAttribute("aria-hidden", "false");
        const drops = reduceMotion ? 8 : 30;
        for (let i = 0; i < drops; i++) {
          after(rand(200, 1900), () => {
            burst(rand(window.innerWidth * 0.08, window.innerWidth * 0.92),
                  rand(window.innerHeight * 0.15, window.innerHeight * 0.8),
                  { confetti: 3, hearts: 2, sparks: 2, petals: 2 });
          });
        }
      });
    }

    box.addEventListener("pointerdown", (e) => {
      if (state.opened) return;
      e.preventDefault();
      if (state.caught) openGift();
      else dodge();
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (state.opened) return;
        if (state.caught) openGift();
        else dodge();
      }
    });

    // kado menghindar pelan saat kursor mendekat (desktop)
    arena.addEventListener("pointermove", (e) => {
      if (state.caught || state.opened || e.pointerType !== "mouse" || reduceMotion) return;
      const r = arena.getBoundingClientRect();
      const px = e.clientX - (r.left + r.width / 2);
      const py = e.clientY - (r.top + r.height / 2);
      const dx = state.x - px;
      const dy = state.y - py;
      const dist = Math.hypot(dx, dy);
      const now = performance.now();
      const radius = 165;
      if (dist < radius && now - state.lastFlee > 300) {
        state.lastFlee = now;
        const b = bounds();
        const push = radius - dist + 95;
        const ux = dist > 0.01 ? dx / dist : (Math.random() - 0.5);
        const uy = dist > 0.01 ? dy / dist : (Math.random() - 0.5);
        state.tx = clamp(state.x + ux * push, -b.x, b.x);
        state.ty = clamp(state.y + uy * push, -b.y, b.y);
      }
    });

    window.addEventListener("resize", () => {
      const b = bounds();
      state.tx = clamp(state.tx, -b.x, b.x);
      state.ty = clamp(state.ty, -b.y, b.y);
    });

    replay.addEventListener("click", () => window.location.reload());

    onEnter.gift = function () {
      const b = bounds();
      state.tx = clamp(state.tx, -b.x, b.x);
      state.ty = clamp(state.ty, -b.y, b.y);
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    onLeave.gift = function () {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }

  /* ---------- kursor sparkle (desktop) ---------- */
  function initCursorSpark() {
    if (!finePointer || reduceMotion) return;
    const el = $("#cursorSpark");
    if (!el) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let lastSpawn = 0;

    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("is-on");
      const now = performance.now();
      if (now - lastSpawn > 150) {
        lastSpawn = now;
        spawnParticle("p-spark", tx, ty, {
          angle: rand(0, Math.PI * 2),
          dist: rand(14, 40),
          lift: 8,
          minDur: 0.5,
          maxDur: 0.9,
          fsMin: 8,
          fsMax: 13,
          color: "#ffd9ec"
        });
      }
    }, { passive: true });

    document.addEventListener("pointerleave", () => el.classList.remove("is-on"));

    (function loop() {
      x += (tx - x) * 0.24;
      y += (ty - y) * 0.24;
      el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- init ---------- */
  function init() {
    buildDecor();
    initOpening();
    initLetter();
    initWish();
    initCake();
    initSky();
    initGift();
    initCursorSpark();
    document.body.dataset.stage = stageKey(0);
    dots.forEach((d, i) => d.classList.toggle("is-on", i === 0));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
