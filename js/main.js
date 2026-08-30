/* ============================================================
   DEDALUS — team ICARUS · NASA Space Apps Challenge 2026
   Vanilla JS + optional GSAP / ScrollTrigger / Lenis / Lucide.
   Cinematic space scene: sun, parallax stars, nebulae, meteors.
   Every dependency is guarded: the site degrades gracefully.
   ============================================================ */

(() => {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------------- smooth scroll (Lenis, optional) ---------------- */
  if (window.Lenis && !REDUCED) {
    const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1 && $(id)) {
          e.preventDefault();
          lenis.scrollTo($(id), { offset: -70 });
          closeMenu();
        }
      });
    });
  }

  /* ---------------- progress bar + nav active ---------------- */
  const bar = $("#progressBar");
  function updateBar() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    let current = "";
    $$("section[id]").forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 170) current = sec.id;
    });
    $$(".nav-links a").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", updateBar, { passive: true });
  updateBar();

  /* ---------------- burger ---------------- */
  const burger = $("#navBurger");
  const navLinks = $("#navLinks");
  function closeMenu() {
    if (burger && navLinks) {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  }
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(navLinks.classList.contains("open")));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });
  }

  /* ---------------- reveals: GSAP if present, IO fallback ---------------- */
  const reveals = $$(".reveal");
  if (window.gsap && window.ScrollTrigger && !REDUCED) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    reveals.forEach((el) => {
      window.gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => {
      if (REDUCED) { el.classList.add("in"); } else { io.observe(el); }
    });
  }

  /* ================================================================
     SPACE SCENE — sun, stars, nebulae, meteors
     ================================================================ */
  const canvas = $("#spaceScene");
  if (canvas && !REDUCED && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let W = 0;
    let H = 0;
    const stars = [];
    const shots = [];
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let nextShot = 3;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars.length = 0;
      const count = Math.min(260, Math.round((W * H) / 8500));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: 0.25 + Math.random() * 0.75,
          r: 0.4 + Math.random() * 1.3,
          tw: 0.5 + Math.random() * 1.7,
          ph: Math.random() * Math.PI * 2,
          warm: Math.random() < 0.16,
        });
      }
    }

    function drawNebulae(t) {
      const blobs = [
        { x: 0.18, y: 0.22, r: 0.52, c: "52,86,190", a: 0.11, sp: 0.06 },
        { x: 0.86, y: 0.74, r: 0.46, c: "34,64,150", a: 0.09, sp: 0.045 },
        { x: 0.58, y: 0.08, r: 0.36, c: "190,96,40", a: 0.05, sp: 0.055 },
      ];
      blobs.forEach((b, i) => {
        const bx = (b.x + 0.035 * Math.sin(t * b.sp + i * 2.1)) * W;
        const by = (b.y + 0.035 * Math.cos(t * b.sp * 1.35 + i)) * H;
        const br = b.r * Math.min(W, H);
        const gr = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        gr.addColorStop(0, "rgba(" + b.c + "," + b.a + ")");
        gr.addColorStop(1, "rgba(" + b.c + ",0)");
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      });
    }

    function drawSun(t, prog) {
      const narrow = W < 780;
      const sx = (narrow ? 0.5 : 0.79) * W + (mouse.x - 0.5) * 16;
      const sy = (narrow ? 0.44 : 0.35) * H + prog * H * 0.24 + (mouse.y - 0.5) * 12;
      const sr = Math.min(W, H) * (0.125 + prog * 0.055) * (1 + 0.012 * Math.sin(t * 0.9));

      // outer glow
      const glow = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 4.4);
      glow.addColorStop(0, "rgba(255, 176, 84, 0.28)");
      glow.addColorStop(0.4, "rgba(255, 140, 60, 0.09)");
      glow.addColorStop(1, "rgba(255, 120, 40, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 4.4, 0, 7);
      ctx.fill();

      // rotating corona rays
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.05);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        const len = sr * (2.2 + 0.25 * Math.sin(t * 0.7 + i * 1.7));
        ctx.fillStyle = "rgba(255, 196, 120, " + (0.026 + 0.02 * Math.sin(t * 1.1 + i)) + ")";
        ctx.beginPath();
        ctx.moveTo(sr * 1.12, -sr * 0.16);
        ctx.lineTo(len, 0);
        ctx.lineTo(sr * 1.12, sr * 0.16);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // disc
      const disc = ctx.createRadialGradient(sx - sr * 0.25, sy - sr * 0.3, sr * 0.1, sx, sy, sr);
      disc.addColorStop(0, "#fff3d9");
      disc.addColorStop(0.55, "#ffc46e");
      disc.addColorStop(1, "#ff8a3c");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, 7);
      ctx.fill();
    }

    function drawStars(t, sc) {
      for (const s of stars) {
        const a = 0.3 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
        const py = (((s.y + t * 2.2 * s.z + sc * 0.2 * s.z) % H) + H) % H;
        const px = (((s.x + (mouse.x - 0.5) * 28 * s.z) % W) + W) % W;
        ctx.globalAlpha = Math.max(a * s.z, 0.04);
        ctx.fillStyle = s.warm ? "#ffd9a8" : "#dfe9ff";
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, 7);
        ctx.fill();
        if (s.r > 1.35) {
          ctx.globalAlpha *= 0.35;
          ctx.fillRect(px - s.r * 2.6, py - 0.4, s.r * 5.2, 0.8);
          ctx.fillRect(px - 0.4, py - s.r * 2.6, 0.8, s.r * 5.2);
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawShots(t, dt) {
      if (t > nextShot) {
        shots.push({
          x: W * (0.2 + Math.random() * 0.7),
          y: H * (Math.random() * 0.35),
          vx: -(5 + Math.random() * 4),
          vy: 2.2 + Math.random() * 1.6,
          life: 1,
        });
        nextShot = t + 4 + Math.random() * 7;
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const m = shots[i];
        m.x += m.vx * dt * 60;
        m.y += m.vy * dt * 60;
        m.life -= dt * 0.7;
        if (m.life <= 0 || m.x < -120 || m.y > H + 120) {
          shots.splice(i, 1);
          continue;
        }
        const tail = 90 * m.life;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail / 6, m.y - m.vy * tail / 6);
        grad.addColorStop(0, "rgba(255, 236, 200, " + 0.85 * m.life + ")");
        grad.addColorStop(1, "rgba(255, 236, 200, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * tail / 6, m.y - m.vy * tail / 6);
        ctx.stroke();
      }
    }

    let last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const sc = window.scrollY || 0;
      const max = Math.max(document.documentElement.scrollHeight - H, 1);
      const prog = Math.min(sc / max, 1);
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0a1230");
      bg.addColorStop(0.55, "#070c1a");
      bg.addColorStop(1, "#04060e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawNebulae(t);
      drawSun(t, prog);
      drawStars(t, sc);
      drawShots(t, dt);
    }

    window.addEventListener("resize", build);
    window.addEventListener("mousemove", (e) => {
      mouse.tx = e.clientX / Math.max(W, 1);
      mouse.ty = e.clientY / Math.max(H, 1);
    }, { passive: true });
    build();
    requestAnimationFrame(frame);
  }

  /* ---------------- crew manifest (names only — no published roles) ---------------- */
  const CREW = ["Ulrich Tapsoba", "Ben Rebernik", "Gurman Kaur", "Leonardo Perugia", "Manar Gherabli", "Rafaat Jahan"];
  const crewTable = $("#crewTable");
  if (crewTable) {
    CREW.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "crew-row reveal";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = "N°" + String(i + 1).padStart(2, "0");
      const nameEl = document.createElement("span");
      nameEl.className = "name";
      nameEl.textContent = name;
      const status = document.createElement("span");
      status.className = "status";
      status.textContent = "READY";
      row.appendChild(num);
      row.appendChild(nameEl);
      row.appendChild(status);
      crewTable.appendChild(row);
      if (window.gsap && window.ScrollTrigger && !REDUCED) {
        window.gsap.fromTo(row,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: i * 0.06, scrollTrigger: { trigger: row, start: "top 92%" } });
      } else {
        row.classList.add("in");
      }
    });
    const note = document.createElement("p");
    note.className = "crew-note";
    note.textContent = "Six names, one shared deadline. Work splits week by week on the crew's private board — reach any member through Dedalus on Telegram.";
    crewTable.appendChild(note);
    if (!(window.gsap && window.ScrollTrigger)) note.classList.add("in");
  }

  /* ---------------- mission log console ---------------- */
  const LOG_LINES = [
    { cmd: "dedalus --boot", out: "wings forged. agent online — 24/7." },
    { cmd: "dedalus memory --status", out: "PERSISTENT — 0 decisions lost since 2026-08-30" },
    { cmd: "dedalus crew --watch", out: "6 members · several time zones · 1 deadline" },
    { cmd: "dedalus notify --arm", out: "deadline watchers armed · saturday briefs scheduled" },
  ];
  const consoleBody = $("#consoleBody");
  const consoleEl = $(".console");

  function runLog() {
    let li = 0;
    let ci = 0;
    let lineEl = null;
    function done() {
      const c = document.createElement("span");
      c.className = "caret";
      consoleBody.appendChild(c);
    }
    function step() {
      if (li >= LOG_LINES.length) { done(); return; }
      const cur = LOG_LINES[li];
      if (ci === 0) {
        lineEl = document.createElement("div");
        lineEl.className = "cmd";
        const p = document.createElement("span");
        p.className = "prompt";
        p.textContent = "$ ";
        const tx = document.createElement("span");
        tx.className = "text";
        lineEl.appendChild(p);
        lineEl.appendChild(tx);
        consoleBody.appendChild(lineEl);
      }
      ci += 1;
      lineEl.querySelector(".text").textContent = cur.cmd.slice(0, ci);
      if (ci >= cur.cmd.length) {
        const out = document.createElement("div");
        out.className = "out";
        out.textContent = cur.out;
        consoleBody.appendChild(out);
        li += 1;
        ci = 0;
        setTimeout(step, 480);
      } else {
        setTimeout(step, 30 + Math.random() * 46);
      }
    }
    step();
  }

  if (consoleBody && consoleEl) {
    if (REDUCED) {
      LOG_LINES.forEach((l) => {
        consoleBody.insertAdjacentHTML("beforeend",
          '<div class="cmd"><span class="prompt">$ </span>' + l.cmd + "</div>" +
          '<div class="out">' + l.out + "</div>");
      });
      const c = document.createElement("span");
      c.className = "caret";
      consoleBody.appendChild(c);
    } else {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !window.__dedalusTyped) {
            window.__dedalusTyped = true;
            setTimeout(runLog, 350);
          }
        });
      }, { threshold: 0.3 });
      obs.observe(consoleEl);
    }
  }

  /* ---------------- demo chat ---------------- */
  const chatLog = $("#chatLog");
  const chatForm = $("#chatForm");
  const chatInput = $("#chatText");
  const chips = $("#chatChips");

  const ANSWERS = [
    { k: /(who|name|whoami|qui)/i, a: "Dedalus — the always-on agent of team ICARUS, flying crew for the NASA Space Apps Challenge 2026. Named after the one who built the wings: my job is handing this team everything it needs to fly." },
    { k: /(what can you do|capab|help|skills|do for)/i, a: "Six disciplines: research & intelligence, project management (Notion board, alerts, reports), technical scaffolding, docs & storytelling, institutional memory, and data & metrics. Full autonomy inside the team — hard stop before anything goes public." },
    { k: /(date|deadline|when|calendar|timeline)/i, a: "Week-1 research tasks: due Sept 5. Challenge statements: released in October, then a 48-hour sprint. Crew sync: every Saturday, 13:00 UTC. Final submission: handled at the deadline window." },
    { k: /(reach|contact|channel|message|talk|telegram|access|join)/i, a: "Telegram is the front door: send your @username (or numeric ID) to the admin — he allow-lists you on my gateway, and we talk. Not on Telegram? A dedicated web access is on the roadmap." },
    { k: /(nasa|space apps|challenge|track|icarus)/i, a: "Team ICARUS, NASA Space Apps 2026. The challenge statements land in October — crew strategy: study past winners first, pick our track fast. That research is already running." },
    { k: /(joke|fun|story|lol|sun)/i, a: "People ask why I file a flight plan before approaching the sun. Because I read the myth to the end. Every good mission needs a descent path." },
  ];
  const FALLBACK = "Good question — this widget runs in scripted demo mode. For the real conversation, get on the gateway: send your Telegram @handle to the admin and start talking to me directly.";

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg msg-" + (who === "user" ? "user" : "bot");
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
  }

  function reply(q) {
    setTimeout(() => {
      const hit = ANSWERS.find((a) => a.k.test(q));
      addMsg(hit ? hit.a : FALLBACK, "bot");
    }, 500 + Math.random() * 400);
  }

  function send(q) {
    if (!q.trim()) return;
    addMsg(q.trim(), "user");
    reply(q);
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      send(chatInput.value);
      chatInput.value = "";
    });
  }
  if (chips) {
    chips.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-q]");
      if (btn) send(btn.dataset.q);
    });
  }
  if (chatLog) {
    setTimeout(() => addMsg("dedalus online. demo mode — scripted answers, honest ones. try a chip below.", "bot"), 600);
  }

  /* ---------------- icons (Lucide, optional) ---------------- */
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
})();
