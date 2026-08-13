(function () {
  var el = document.getElementById("hero-verb");
  if (!el) return;

  var words = (el.getAttribute("data-words") || "build,operate,ship")
    .split(",")
    .map(function (w) {
      return w.trim();
    })
    .filter(Boolean);

  if (!words.length) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Static italic word + solid underline - no carousel for reduced motion
  if (reduce) {
    el.textContent = words[0];
    el.classList.add("is-static");
    return;
  }

  var i = 0;
  var busy = false;
  var intervalMs = 3200;
  var outMs = 340;

  function tick() {
    if (busy || document.hidden) return;
    busy = true;
    el.classList.remove("is-in");
    el.classList.add("is-out");

    window.setTimeout(function () {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove("is-out");
      void el.offsetWidth;
      el.classList.add("is-in");
      busy = false;
    }, outMs);
  }

  window.setInterval(tick, intervalMs);
})();
