const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Deterministic "chaos" so the layout feels alive but doesn't change every refresh.
function hashToFloat(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // [-1, 1]
  return ((h >>> 0) % 2000) / 1000 - 1;
}

function setChaosRotations() {
  $$(".reveal").forEach((el) => {
    const id = el.closest("section")?.id || el.getAttribute("data-chaos") || "card";
    const r = hashToFloat(id) * 1.25; // degrees
    el.style.setProperty("--hoverRot", `${r.toFixed(2)}deg`);
  });
}

function setupReveal() {
  const revealEls = $$("[data-reveal]");
  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    revealEls.forEach((el) => el.classList.add("isVisible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add("isVisible");
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  revealEls.forEach((el) => io.observe(el));
}

function setupScrollXP() {
  const fill = $("#xpFill");
  const levelEl = $("#xpLevel");
  const pctEl = $("#xpPct");
  if (!fill || !levelEl || !pctEl) return;

  const update = () => {
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const raw = maxScroll <= 0 ? 0 : window.scrollY / maxScroll;
    const pct = clamp(raw, 0, 1) * 100;
    fill.style.width = `${pct.toFixed(1)}%`;
    pctEl.textContent = `${Math.round(pct)}%`;

    const level = 1 + Math.floor(pct / 22);
    levelEl.textContent = `LEVEL ${clamp(level, 1, 6)}`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupNodeNavigation() {
  const nodes = $$("[data-node]");
  if (!nodes.length) return;

  const byId = new Map(nodes.map((n) => [n.getAttribute("data-node"), n]));

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      const id = node.getAttribute("data-node");
      if (!id) return;
      scrollToId(id);
    });
  });

  const sections = nodes
    .map((n) => n.getAttribute("data-node"))
    .filter(Boolean)
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      // Pick the most visible section.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
      if (!visible) return;
      const id = visible.target.id;
      nodes.forEach((n) => n.classList.toggle("isActive", n.getAttribute("data-node") === id));
    },
    { threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: "-10% 0px -60% 0px" }
  );

  sections.forEach((s) => io.observe(s));
}

function setupCursorOrb() {
  const orb = $(".cursor-orb");
  if (!orb) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let raf = null;

  const render = () => {
    raf = null;
    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;
  };

  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (raf == null) raf = window.requestAnimationFrame(render);
  }, { passive: true });
}

function init() {
  setChaosRotations();
  setupReveal();
  setupScrollXP();
  setupNodeNavigation();
  setupCursorOrb();
}

document.addEventListener("DOMContentLoaded", init);

