function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  hours = hours.toString().padStart(2, "0");
  minutes = minutes.toString().padStart(2, "0");
  seconds = seconds.toString().padStart(2, "0");

  document.getElementById("time").textContent = `${hours}:${minutes}:${seconds}`;

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const dateStr = now.toLocaleDateString("en-US", options);
  document.getElementById("date").textContent = dateStr;
}

// Theme handling
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
    });
  }
}

// Start
initThemeSwitcher();
setInterval(updateClock, 1000);
updateClock();
