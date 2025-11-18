/* ============================================
   Digital Clock + Animated Canvas Background
   ============================================ */

/* ---------- Time & Date ---------- */
function updateClock() {
  const now = new Date();

  const two = (n) => String(n).padStart(2, "0");
  const hours = two(now.getHours());
  const minutes = two(now.getMinutes());
  const seconds = two(now.getSeconds());

  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");

  if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const dateStr = now.toLocaleDateString("en-US", options);
  if (dateEl) dateEl.textContent = dateStr;
}

/* ---------- Theme handling ---------- */
function setTheme(themeName) {
  document.body.className = `theme-${themeName}`;
  localStorage.setItem("clock-theme", themeName);

  const select = document.getElementById("themeSelect");
  if (select && select.value !== themeName) select.value = themeName;
}

function initThemeSwitcher() {
  const saved = localStorage.getItem("clock-theme") || "default";
  setTheme(saved);

  const select = document.getElementById("themeSelect");
  if (select) {
    select.value = saved;
    select.addEventListener("change", (e) => {
      setTheme(e.target.value);
      // Repaint canvas with new theme colors immediately
      const canvas = document.getElementById("clockCanvas");
      if (canvas && canvas._repaint) canvas._repaint();
    });
  }
}

/* ---------- Canvas Background ---------- */
function startCanvasAnimation() {
  const canvas = document.getElementById("clockCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fallback;
  }

  // Convert a CSS color to rgba with alpha (best-effort)
  function toRgba(color, alpha) {
    if (/rgba?\(/i.test(color)) {
      // rgb(...) -> convert to rgba(..., a)
      if (/^rgb\(/i.test(color)) {
        return color.replace(/^rgb\(/i, "rgba(").replace(/\)$/, `, ${alpha})`);
      }
      return color; // already rgba
    }
    // hex
    let r = 0, g = 255, b = 170; // neon fallback
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function gradientStops() {
    // Use accent + a complementary green to make it visible on all themes
    const accent = cssVar("--accent", "#7c5cff");
    return [toRgba(accent, 0.45), "rgba(34, 197, 94, 0.45)"];
  }

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  let t = 0;

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) {
      requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    // Theme-aware gradient wash (more visible)
    const [c1, c2] = gradientStops();
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Neon grid lines (clearly visible)
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1;
    ctx.strokeStyle = toRgba(cssVar("--accent", "#00ffaa"), 0.35);

    const step = 40;                  // grid spacing
    const offset = Math.sin(t) * 12;  // animated drift

    for (let x = (offset % step); x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = (offset % step); y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();

    t += 0.02;
    requestAnimationFrame(draw);
  }

  // Public repaint hook (called when theme changes)
  canvas._repaint = () => {
    // Force one immediate redraw to reflect new CSS vars
    draw();
  };

  // Boot
  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(canvas);
  requestAnimationFrame(draw);
}

/* ---------- Click pulse (optional visual feedback) ---------- */
function enableClickPulse() {
  const canvas = document.getElementById("clockCanvas");
  if (!canvas) return;

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(0, 255, 170, 0.35)";
    for (let r = 8; r <= 36; r += 7) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initThemeSwitcher();
  updateClock();
  setInterval(updateClock, 1000);

  startCanvasAnimation();
  enableClickPulse();
});
