(function () {
  var STORAGE_KEY = "nitrocode-theme";

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function currentTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {}
    return systemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f3efe6" : "#0c0b0a");
    }
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    var iframe = document.querySelector("iframe.giscus-frame");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: { theme: theme === "dark" ? "dark" : "light" },
          },
        },
        "https://giscus.app"
      );
    }
  }

  applyTheme(currentTheme());

  function toggle() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {}
    applyTheme(next);
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(currentTheme());
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggle);

    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: light)")
        .addEventListener("change", function () {
          try {
            if (!localStorage.getItem(STORAGE_KEY)) applyTheme(systemTheme());
          } catch (e) {
            applyTheme(systemTheme());
          }
        });
    }
  });
})();
