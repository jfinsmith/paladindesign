// ---------------------------------------------------------------------------
// Contact form delivery endpoint (Formspree)
// ---------------------------------------------------------------------------
const FORM_ENDPOINT = "https://formspree.io/f/meagewyz";

document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---- Mobile menu ----------------------------------------------------------
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
function closeNav() {
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", (e) => { if (e.target.closest("a")) closeNav(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

// ---- Footer year ----------------------------------------------------------
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Scroll progress bar --------------------------------------------------
const bar = document.getElementById("progress-bar");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
}
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

// ---- Scroll reveal --------------------------------------------------------
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => {
    // Stagger siblings inside grids
    const siblings = el.parentElement.querySelectorAll(":scope > .reveal");
    if (siblings.length > 2) el.style.setProperty("--d", (Array.prototype.indexOf.call(siblings, el) % 4) * 80 + "ms");
    io.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// ---- Rotating headline word -----------------------------------------------
const word = document.getElementById("rotator-word");
const words = ["websites.", "apps.", "dashboards.", "AI tools.", "brands."];
if (word && !reduceMotion) {
  let i = 0;
  setInterval(() => {
    word.classList.add("out");
    setTimeout(() => {
      i = (i + 1) % words.length;
      word.textContent = words[i];
      word.classList.remove("out");
    }, 350);
  }, 2400);
}

// ---- Card spotlight + tilt (mouse only) -----------------------------------
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".spot").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = "rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg) translateY(-4px)";
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// ---- Logo follows the mouse (desktop only) ---------------------------------
const logoInner = document.querySelector(".logo-inner");
const hero = document.querySelector(".hero");
if (logoInner && hero && finePointer && !reduceMotion) {
  hero.addEventListener("pointermove", (e) => {
    const r = logoInner.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
    const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
    logoInner.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
    logoInner.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
  });
  hero.addEventListener("pointerleave", () => {
    logoInner.style.setProperty("--ry", "0deg");
    logoInner.style.setProperty("--rx", "0deg");
  });
}

// ---- Hero starfield --------------------------------------------------------
(function starfield() {
  const canvas = document.getElementById("stars");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const colors = ["#f6f2ea", "#ffb04a", "#5ad1ff"];
  let stars = [], w = 0, h = 0, raf = 0, visible = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(140, Math.round((w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      v: Math.random() * 0.12 + 0.03,
      p: Math.random() * Math.PI * 2,
      c: colors[Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2],
    }));
    draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.globalAlpha = 0.35 + 0.45 * Math.sin(t / 900 + s.p);
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function tick(t) {
    for (const s of stars) {
      s.y -= s.v;
      if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
    }
    draw(t);
    if (visible) raf = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  if (reduceMotion) return;
  // Pause when the hero is off screen
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(tick);
  }).observe(canvas);
})();

// ---- Contact form ---------------------------------------------------------
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = form.querySelector('button[type="submit"]');

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = "form-status" + (kind ? " " + kind : "");
}

form.addEventListener("input", (e) => e.target.classList.remove("invalid"));

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let firstBad = null;
  form.querySelectorAll("[required], input[type=email]").forEach((el) => {
    const bad = !el.checkValidity();
    el.classList.toggle("invalid", bad);
    if (bad && !firstBad) firstBad = el;
  });
  if (firstBad) {
    setStatus("Please fill in your name, a valid email and a few project details.", "err");
    firstBad.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  if (data._gotcha) return; // bot filled the hidden field

  submitBtn.disabled = true;
  setStatus("Sending…");
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Bad response: " + res.status);
    form.reset();
    setStatus("Thanks — your message is on its way. You'll hear back soon.", "ok");
  } catch (err) {
    setStatus("Something went wrong sending your message. Please try again in a moment.", "err");
  } finally {
    submitBtn.disabled = false;
  }
});
