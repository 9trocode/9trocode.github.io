(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".talk-slide"));
  if (!slides.length) return;

  var body = document.body;
  var progress = document.getElementById("talk-progress");
  var hud = document.getElementById("talk-hud");
  var presentBtn = document.getElementById("talk-present-toggle");
  var notesBtn = document.getElementById("talk-notes-toggle");
  var prevBtn = document.getElementById("talk-prev");
  var nextBtn = document.getElementById("talk-next");
  var exitBtn = document.getElementById("talk-exit");

  var index = 0;
  var notesOn = false;

  function clamp(i) {
    return Math.max(0, Math.min(slides.length - 1, i));
  }

  function isPresenting() {
    return body.classList.contains("is-presenting");
  }

  function syncHash() {
    var id = slides[index] && slides[index].id;
    if (id) {
      history.replaceState(null, "", "#" + id);
    }
  }

  function show(i, opts) {
    index = clamp(i);
    slides.forEach(function (slide, n) {
      var on = n === index;
      slide.classList.toggle("is-active", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
      if (on && isPresenting()) {
        slide.scrollIntoView({ block: "start", behavior: (opts && opts.instant) ? "auto" : "smooth" });
      }
    });
    if (progress) {
      progress.textContent = index + 1 + " / " + slides.length;
    }
    syncHash();
  }

  function enterPresent() {
    body.classList.add("is-presenting");
    if (hud) hud.hidden = false;
    if (presentBtn) presentBtn.textContent = "Browse";
    show(index, { instant: true });
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
    } catch (e) {}
  }

  function exitPresent() {
    body.classList.remove("is-presenting");
    if (hud) hud.hidden = true;
    if (presentBtn) presentBtn.textContent = "Present";
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    } catch (e) {}
  }

  function togglePresent() {
    if (isPresenting()) exitPresent();
    else enterPresent();
  }

  function toggleNotes() {
    notesOn = !notesOn;
    body.classList.toggle("show-notes", notesOn);
    if (notesBtn) {
      notesBtn.setAttribute("aria-pressed", notesOn ? "true" : "false");
    }
  }

  function next() {
    show(index + 1);
  }

  function prev() {
    show(index - 1);
  }

  // Start from hash if present
  var hash = (location.hash || "").replace(/^#/, "");
  if (hash) {
    var fromHash = slides.findIndex(function (s) {
      return s.id === hash;
    });
    if (fromHash >= 0) index = fromHash;
  }

  // Browse mode: all slides visible; present mode: one at a time
  slides.forEach(function (slide, n) {
    slide.classList.toggle("is-active", n === index);
  });
  if (progress) progress.textContent = index + 1 + " / " + slides.length;

  if (presentBtn) presentBtn.addEventListener("click", togglePresent);
  if (notesBtn) notesBtn.addEventListener("click", toggleNotes);
  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (exitBtn) exitBtn.addEventListener("click", exitPresent);

  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      toggleNotes();
      return;
    }

    if (e.key === "p" || e.key === "P" || e.key === "f" || e.key === "F") {
      e.preventDefault();
      togglePresent();
      return;
    }

    if (e.key === "Escape" && isPresenting()) {
      e.preventDefault();
      exitPresent();
      return;
    }

    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!isPresenting()) enterPresent();
      next();
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "Backspace") {
      e.preventDefault();
      if (!isPresenting()) enterPresent();
      prev();
    }
  });

  // Deep-link ?present=1
  var params = new URLSearchParams(location.search);
  if (params.get("present") === "1") {
    enterPresent();
  }
})();
