(function () {
  "use strict";

  var body = document.body;
  var storageKey = "talk-unlock:" + (body.getAttribute("data-talk-id") || "deck");
  var expectedKey = body.getAttribute("data-speaker-key") || "";
  var presentBtn = document.getElementById("talk-present-toggle");
  var progress = document.getElementById("talk-progress");
  var hud = document.getElementById("talk-hud");
  var prevBtn = document.getElementById("talk-prev");
  var nextBtn = document.getElementById("talk-next");
  var exitBtn = document.getElementById("talk-exit");
  var unlockForm = document.getElementById("talk-unlock-form");
  var unlockInput = document.getElementById("talk-unlock-input");
  var unlockHint = document.getElementById("talk-unlock-hint");
  var lockPanel = document.getElementById("talk-lock-panel");
  var mount = document.getElementById("talk-deck-mount");
  var template = document.getElementById("talk-speaker-deck");

  var slides = [];
  var index = 0;
  var bound = false;

  function clamp(i) {
    return Math.max(0, Math.min(slides.length - 1, i));
  }

  function isPresenting() {
    return body.classList.contains("is-presenting");
  }

  function syncHash() {
    var id = slides[index] && slides[index].id;
    if (id) history.replaceState(null, "", "#" + id);
  }

  function collectSlides() {
    slides = Array.prototype.slice.call(document.querySelectorAll(".talk-slide"));
  }

  function show(i, opts) {
    if (!slides.length) return;
    index = clamp(i);
    slides.forEach(function (slide, n) {
      var on = n === index;
      slide.classList.toggle("is-active", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
      if (on && isPresenting()) {
        slide.scrollIntoView({
          block: "start",
          behavior: opts && opts.instant ? "auto" : "smooth",
        });
      }
    });
    if (progress) progress.textContent = index + 1 + " / " + slides.length;
    syncHash();
  }

  function enterPresent() {
    if (!slides.length) return;
    body.classList.add("is-presenting");
    if (hud) hud.hidden = false;
    if (presentBtn) {
      presentBtn.hidden = false;
      presentBtn.textContent = "Browse";
    }
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

  function next() {
    show(index + 1);
  }

  function prev() {
    show(index - 1);
  }

  function bindControls() {
    if (bound) return;
    bound = true;

    if (presentBtn) presentBtn.addEventListener("click", togglePresent);
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);
    if (exitBtn) exitBtn.addEventListener("click", exitPresent);

    document.addEventListener("keydown", function (e) {
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      if (!slides.length) return;

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
  }

  function startDeck() {
    collectSlides();
    if (!slides.length) return;

    var hash = (location.hash || "").replace(/^#/, "");
    if (hash) {
      var fromHash = slides.findIndex(function (s) {
        return s.id === hash;
      });
      if (fromHash >= 0) index = fromHash;
    }

    slides.forEach(function (slide, n) {
      slide.classList.toggle("is-active", n === index);
    });
    if (progress) progress.textContent = index + 1 + " / " + slides.length;
    bindControls();

    if (new URLSearchParams(location.search).get("present") === "1") {
      enterPresent();
    }
  }

  function unlockSpeaker() {
    if (!template || !mount) return false;

    mount.innerHTML = "";
    mount.appendChild(template.content.cloneNode(true));
    mount.hidden = false;

    if (lockPanel) lockPanel.hidden = true;
    body.classList.remove("talk-locked");
    if (presentBtn) presentBtn.hidden = false;

    try {
      sessionStorage.setItem(storageKey, "1");
    } catch (e) {}

    startDeck();
    return true;
  }

  function keyMatches(value) {
    return expectedKey && value && value.trim() === expectedKey;
  }

  function tryUnlock(value) {
    if (!keyMatches(value)) {
      if (unlockHint) unlockHint.hidden = false;
      return false;
    }
    if (unlockHint) unlockHint.hidden = true;
    unlockSpeaker();
    return true;
  }

  // Already unlocked this session
  try {
    if (body.classList.contains("talk-locked") && sessionStorage.getItem(storageKey) === "1") {
      unlockSpeaker();
      return;
    }
  } catch (e) {}

  // ?key= unlock
  var params = new URLSearchParams(location.search);
  var qKey = params.get("key");
  if (body.classList.contains("talk-locked") && qKey) {
    if (tryUnlock(qKey)) {
      // Drop key from URL so it isn't left in the bar / screenshots
      params.delete("key");
      var next = location.pathname + (params.toString() ? "?" + params.toString() : "") + location.hash;
      history.replaceState(null, "", next);
      return;
    }
  }

  if (unlockForm) {
    unlockForm.addEventListener("submit", function (e) {
      e.preventDefault();
      tryUnlock(unlockInput ? unlockInput.value : "");
    });
  }

  // Public / already-open deck
  if (!body.classList.contains("talk-locked")) {
    startDeck();
  }
})();
