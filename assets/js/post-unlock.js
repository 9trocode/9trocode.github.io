(function () {
  "use strict";

  var article = document.querySelector("article.post-locked");
  if (!article) return;

  var expectedKey = article.getAttribute("data-speaker-key") || "";
  var storageKey = "post-unlock:" + (article.getAttribute("data-post-id") || "post");
  var form = document.getElementById("post-unlock-form");
  var input = document.getElementById("post-unlock-input");
  var hint = document.getElementById("post-unlock-hint");
  var panel = document.getElementById("post-lock-panel");
  var mount = document.getElementById("post-body-mount");
  var template = document.getElementById("post-locked-body");

  function unlock() {
    if (!template || !mount) return;
    mount.innerHTML = "";
    mount.appendChild(template.content.cloneNode(true));
    mount.hidden = false;
    if (panel) panel.hidden = true;
    article.classList.remove("post-locked");
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch (e) {}
  }

  function tryUnlock(value) {
    if (!expectedKey || !value || value.trim() !== expectedKey) {
      if (hint) hint.hidden = false;
      return false;
    }
    if (hint) hint.hidden = true;
    unlock();
    return true;
  }

  try {
    if (sessionStorage.getItem(storageKey) === "1") {
      unlock();
      return;
    }
  } catch (e) {}

  var params = new URLSearchParams(location.search);
  var qKey = params.get("key");
  if (qKey && tryUnlock(qKey)) {
    params.delete("key");
    var next = location.pathname + (params.toString() ? "?" + params.toString() : "") + location.hash;
    history.replaceState(null, "", next);
    return;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      tryUnlock(input ? input.value : "");
    });
  }
})();
