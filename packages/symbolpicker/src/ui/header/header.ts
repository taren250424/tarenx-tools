import "./header.scss";

const THEME_KEY = "symbolpicker-theme";

export function init() {
  // The pre-paint script in index.html already resolved the theme and applied
  // the class, so read it back rather than resolving it a second time here.
  let isDarkMode = document.documentElement.classList.contains("dark");

  document.getElementById("theme-toggle-btn")!.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  });
}
