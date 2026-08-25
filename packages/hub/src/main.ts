import "../../shared/footer/site-footer.css";
import "./style.css";

// The tool list is prerendered into index.html at build time by the
// prerender-tool-list plugin in vite.config.ts.

const THEME_KEY = "hub-theme";

// The pre-paint script in index.html already resolved the theme and applied
// the class, so read it back rather than resolving it a second time here.
let isDarkMode = document.documentElement.classList.contains("dark");

document.getElementById("theme-toggle-btn")!.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.documentElement.classList.toggle("dark", isDarkMode);
  localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
});
