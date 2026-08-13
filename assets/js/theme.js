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

    // Mobile nav
    var header = document.querySelector(".site-header");
    var navToggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (header && navToggle && nav) {
      function setNavOpen(open) {
        header.classList.toggle("is-nav-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.classList.toggle("nav-open", open);
      }

      navToggle.addEventListener("click", function () {
        setNavOpen(!header.classList.contains("is-nav-open"));
      });

      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          setNavOpen(false);
        });
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setNavOpen(false);
      });

      window.addEventListener("resize", function () {
        if (window.matchMedia("(min-width: 769px)").matches) setNavOpen(false);
      });
    }
  });
})();
