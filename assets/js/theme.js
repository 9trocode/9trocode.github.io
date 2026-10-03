(function () {
  var isTalk =
    document.body && document.body.classList.contains("talk-page");
  var STORAGE_KEY = isTalk ? "nitrocode-talk-theme" : "nitrocode-theme";
  var DEFAULT_THEME = isTalk ? "light" : "dark";

  function currentTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {}
    return DEFAULT_THEME;
  }

  function themeButtons() {
    // Site nav uses .theme-toggle; talk chrome uses .js-theme-toggle.
    // Comma selector returns each element once even if it matches both.
    return document.querySelectorAll(".js-theme-toggle, .theme-toggle");
  }

  function isIconToggle(btn) {
    return (
      btn.dataset.labelMode === "icon" ||
      btn.classList.contains("theme-toggle")
    );
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      var sysconf =
        document.body && document.body.classList.contains("talk-page--sysconf");
      var light = sysconf ? "#f3f3f3" : "#f3efe6";
      var dark = sysconf ? "#002c33" : "#0c0b0a";
      meta.setAttribute("content", theme === "light" ? light : dark);
    }
    var label = theme === "dark" ? "White mode" : "Dark mode";
    var aria =
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    themeButtons().forEach(function (btn) {
      btn.setAttribute("aria-label", aria);
      // Never wipe SVG moon/sun icons with text labels.
      if (!isIconToggle(btn)) {
        btn.textContent = label;
      }
    });
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
    themeButtons().forEach(function (btn) {
      btn.addEventListener("click", toggle);
    });

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
