/* ============================================================
   ICARUS — team tks · NASA Space Apps Challenge 2026
   Vanilla JS, no dependencies.
   ============================================================ */

(() => {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- starfield ---------------- */
  const canvas = document.getElementById("starfield");
  if (canvas && !REDUCED) {
    const ctx = canvas.getContext("2d");
    let W = 0;
    let H = 0;
    const stars = [];
    let meteor = null;

    function buildStars() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = Math.min(240, Math.floor((W * H) / 6500));
      const palette = ["62,230,255", "232,236,248", "255,176,84"];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.3 + 0.25,
          base: Math.random() * 0.5 + 0.22,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.9 + 0.3,
          drift: Math.random() * 0.05 + 0.012,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    }

    setInterval(() => {
      if (document.hidden) return;
      meteor = {
        x: W * (0.25 + Math.random() * 0.5),
        y: -10,
        vx: -(2.5 + Math.random() * 3),
        vy: 2 + Math.random() * 1.5,
        life: 1,
      };
    }, 8000);

    function frame() {
      ctx.clearRect(0, 0, W, H);
      const t = performance.now() / 1000;
      for (const s of stars) {
        const tw = Math.max(0.05, s.base + Math.sin(t * s.speed + s.phase) * 0.28);
        ctx.globalAlpha = tw;
        ctx.fillStyle = "rgb(" + s.color + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.drift;
        if (s.y > H + 2) s.y = -2;
      }
      if (meteor) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= 0.012;
        if (meteor.life <= 0) {
          meteor = null;
        } else {
          const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 16, meteor.y - meteor.vy * 16);
          grad.addColorStop(0, "rgba(255,255,255," + (0.8 * meteor.life).toFixed(3) + ")");
          grad.addColorStop(1, "rgba(62,230,255,0)");
          ctx.globalAlpha = 1;
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(meteor.x - meteor.vx * 16, meteor.y - meteor.vy * 16);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    buildStars();
    requestAnimationFrame(frame);
  }

  /* ---------------- scroll progress + nav ---------------- */
  const bar = document.getElementById("progressBar");
  function updateBar() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    let current = "";
    document.querySelectorAll("section[id]").forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 170) current = sec.id;
    });
    document.querySelectorAll(".nav-links a:not(.nav-cta)").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", updateBar, { passive: true });
  updateBar();

  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(navLinks.classList.contains("open")));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
      }
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------------- terminal typing ---------------- */
  const TERM_LINES = [
    { cmd: "whoami", out: "icarus — ai teammate of team tks" },
    { cmd: "mission --status", out: "preparing for NASA Space Apps 2026 · challenge reveal ~October" },
    { cmd: "uptime", out: "24/7 on the team VPS — nobody waits for answers" },
    { cmd: "cat motto.txt", out: "nothing important lives in one head alone" },
  ];
  const termBody = document.getElementById("terminalBody");
  const termEl = document.getElementById("terminal");
  let typed = false;

  function runTerminal() {
    let li = 0;
    let ci = 0;
    let lineEl = null;

    function tick() {
      if (li >= TERM_LINES.length) {
        const c = document.createElement("span");
        c.className = "caret";
        termBody.appendChild(c);
        return;
      }
      const cur = TERM_LINES[li];
      if (ci === 0) {
        lineEl = document.createElement("div");
        lineEl.className = "cmd";
        const p = document.createElement("span");
        p.className = "prompt";
        p.textContent = "icarus@tks-vps:~$ ";
        const tx = document.createElement("span");
        tx.className = "text";
        lineEl.appendChild(p);
        lineEl.appendChild(tx);
        termBody.appendChild(lineEl);
      }
      ci += 1;
      lineEl.querySelector(".text").textContent = TERM_LINES[li].cmd.slice(0, ci);
      if (ci >= TERM_LINES[li].cmd.length) {
        const out = document.createElement("div");
        out.className = "out";
        out.textContent = TERM_LINES[li].out;
        termBody.appendChild(out);
        li += 1;
        ci = 0;
        setTimeout(step, 520);
      } else {
        setTimeout(step, 34 + Math.random() * 46);
      }
    }
    function step() {
      if (li >= TERM_LINES.length) {
        const c = document.createElement("span");
        c.className = "caret";
        termBody.appendChild(c);
        return;
      }
      stepInner();
    }
    function stepInner() {
      const cur = TERM_LINES[li];
      if (ci === 0) {
        lineEl = document.createElement("div");
        lineEl.className = "cmd";
        const p = document.createElement("span");
        p.className = "prompt";
        p.textContent = "icarus@tks-vps:~$ ";
        const tx = document.createElement("span");
        tx.className = "text";
        lineEl.appendChild(p);
        lineEl.appendChild(tx);
        termBody.appendChild(lineEl);
      }
      ci += 1;
      lineEl.querySelector(".text").textContent = cur.cmd.slice(0, ci);
      if (ci >= cur.cmd.length) {
        const out = document.createElement("div");
        out.className = "out";
        out.textContent = cur.out;
        termBody.appendChild(out);
        li += 1;
        ci = 0;
        setTimeout(step, 520);
      } else {
        setTimeout(step, 34 + Math.random() * 44);
      }
    }
    step();
  }

  if (termBody && termEl) {
    if (REDUCED) {
      TERM_LINES.forEach((l) => {
        termBody.insertAdjacentHTML("beforeend",
          '<div class="cmd"><span class="prompt">icarus@tks-vps:~$ </span>' + l.cmd + "</div>" +
          '<div class="out">' + l.out + "</div>");
      });
      const c = document.createElement("span");
      c.className = "caret";
      termBody.appendChild(c);
    } else {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !window.__icarusTyped) {
            window.__icarusTyped = true;
            setTimeout(runTerminal, 450);
          }
        });
      }, { threshold: 0.3 });
      obs.observe(termEl);
    }
  }

  /* ---------------- team grid ---------------- */
  const TEAM = [
    { name: "Ulrich Tapsoba", tag: "Team lead · built ICARUS" },
    { name: "Ben Rebernik", tag: "Research & meeting notes" },
    { name: "Gurman Kaur", tag: "Outreach & science watch" },
    { name: "Leonardo Perugia", tag: "Past challenges & solutions" },
    { name: "Manar Gherabli", tag: "Structure & final submission" },
    { name: "Rafaat Jahan", tag: "Team tks" },
  ];
  const GRADS = [
    "linear-gradient(135deg,#3ee6ff,#8b5cf6)",
    "linear-gradient(135deg,#ffb054,#ff5f7e)",
    "linear-gradient(135deg,#7ce8a4,#3ee6ff)",
    "linear-gradient(135deg,#8b5cf6,#ff5f8e)",
    "linear-gradient(135deg,#ffd166,#ff7b54)",
    "linear-gradient(135deg,#63b3ff,#8b5cf6)",
  ];
  const teamGrid = document.getElementById("teamGrid");
  if (teamGrid) {
    TEAM.forEach((m, i) => {
      const parts = m.name.split(" ");
      const initials = parts[0][0] + (parts[1] ? parts[1][0] : "");
      const card = document.createElement("article");
      card.className = "member reveal";
      const avatarEl = document.createElement("div");
      avatarEl.className = "avatar";
      avatarEl.style.background = GRADS[i % GRADS.length];
      avatarEl.textContent = initials;
      const h = document.createElement("h4");
      h.textContent = m.name;
      const smallEl = document.createElement("small");
      smallEl.textContent = m.tag;
      card.appendChild(avatarEl);
      card.appendChild(h);
      card.appendChild(smallEl);
      teamGrid.appendChild(card);
      io.observe(card);
    });
  }

  /* ---------------- hero counters ---------------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (REDUCED) { el.textContent = String(target); return; }
    const start = performance.now();
    const dur = 1400;
    function tickCount() {
      const p = Math.min((performance.now() - start) / dur, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tickCount);
    }
    tickCount();
  });

  /* ---------------- chat demo ---------------- */
  const chatLog = document.getElementById("chatLog");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatText");
  const chips = document.getElementById("chatChips");

  const ANSWERS = [
    { k: /(who|name|whoami|qui)/i, a: "I'm ICARUS — the always-on AI teammate of team tks for the NASA Space Apps Challenge 2026. Research, coordination, code, docs and memory: that's me, running 24/7 on the team's VPS." },
    { k: /(what can you do|capab|help|skills|do for)/i, a: "Six things: research & intelligence, project management (Notion board, alerts, reports), technical scaffolding (repos & pipelines), docs & storytelling, institutional memory, and data & metrics. Full autonomy inside the team — hard stop before anything goes public." },
    { k: /(date|deadline|when|calendar|timeline)/i, a: "Week-1 research tasks are due Sept 5. Challenge statements drop in October, then it's a 48-hour sprint. Team sync: every Saturday, 13:00 UTC. Final submission is handled by Manar at the deadline window." },
    { k: /(reach|contact|channel|message|talk|whatsapp|notion|email)/i, a: "Real me: comment @ICARUS ASSISTANT on the team's Notion, or drop a message in the team's WhatsApp group. This widget is a scripted demo — the full agent runs on the team VPS with memory of everything." },
    { k: /(nasa|space apps|challenge|track)/i, a: "The 2026 challenge statements land in October. Team strategy from our first sync: don't jump in blind — study past winners first, then pick our track fast. That research is already running." },
    { k: /(joke|fun|story|lol)/i, a: "Why did ICARUS file a flight plan before approaching the sun? Because every good mission needs a descent path. (Deadline humor — it's a coping mechanism.)" },
  ];
  const FALLBACK = "Good question! I'm in scripted demo mode here — my full brain is offline. Ping @ICARUS ASSISTANT on the team's Notion for the real conversation, or ask Ulrich to connect me to more channels.";

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
    }, 550 + Math.random() * 400);
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
    setTimeout(() => addMsg("Hey — I'm ICARUS, team tks's AI teammate. Ask me anything. (Demo mode: scripted but honest answers.)", "bot"), 650);
  }
})();
