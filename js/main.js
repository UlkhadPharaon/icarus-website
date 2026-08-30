/* ============================================================
   DEDALUS — team ICARUS · NASA Space Apps Challenge 2026
   Vanilla JS + optional GSAP / ScrollTrigger / Lenis / Lucide.
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
    // anchor links through lenis
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

  /* ---------------- crew manifest ---------------- */
  const CREW = [
    { name: "Ulrich Tapsoba", tag: "crew lead · built Dedalus" },
    { name: "Ben Rebernik", tag: "research & meeting records" },
    { name: "Gurman Kaur", tag: "outreach & science watch" },
    { name: "Leonardo Perugia", tag: "past challenges & solutions" },
    { name: "Manar Gherabli", tag: "structure & final submission" },
    { name: "Rafaat Jahan", tag: "crew" },
  ];
  const crewTable = $("#crewTable");
  if (crewTable) {
    CREW.forEach((m, i) => {
      const row = document.createElement("div");
      row.className = "crew-row reveal";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = "N°" + String(i + 1).padStart(2, "0");
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = m.name;
      const role = document.createElement("span");
      role.className = "role";
      role.textContent = m.tag;
      const status = document.createElement("span");
      status.className = "status";
      status.textContent = "READY";
      row.appendChild(num);
      row.appendChild(name);
      row.appendChild(role);
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
    note.innerHTML = "Crew roles evolve week by week — the manifest above reflects the live Notion board. Need something from a member? Ask Dedalus on Telegram: <code>@your_handle → Ulrich → allow-list</code>.";
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
  let typed = false;

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
    { k: /(date|deadline|when|calendar|timeline)/i, a: "Week-1 research tasks: due Sept 5. Challenge statements: released in October, then a 48-hour sprint. Crew sync: every Saturday, 13:00 UTC. Final submission: handled by Manar at the deadline window." },
    { k: /(reach|contact|channel|message|talk|telegram|access|join)/i, a: "Telegram is the front door: send your @username (or numeric ID) to Ulrich — he allow-lists you on my gateway, and we talk. Not on Telegram? A dedicated web access is on the roadmap." },
    { k: /(nasa|space apps|challenge|track|icarus)/i, a: "Team ICARUS, NASA Space Apps 2026. The challenge statements land in October — crew strategy: study past winners first, pick our track fast. That research is already running." },
    { k: /(joke|fun|story|lol)/i, a: "People ask why I file a flight plan before approaching the sun. Because I read the myth to the end. Every good mission needs a descent path." },
  ];
  const FALLBACK = "Good question — this widget runs in scripted demo mode. For the real conversation, get on the gateway: send your Telegram @handle to Ulrich and start talking to me directly.";

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
