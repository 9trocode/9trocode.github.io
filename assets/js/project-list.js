(function () {
  var list = document.getElementById("project-list");
  var btn = document.getElementById("project-list-toggle");
  if (!list || !btn) return;

  var items = list.querySelectorAll(".project");
  var preview = parseInt(list.getAttribute("data-preview") || "4", 10);
  if (!preview || preview < 1) preview = 4;

  var hidden = items.length - preview;
  if (hidden <= 0) {
    btn.hidden = true;
    return;
  }

  btn.hidden = false;
  btn.textContent = "Show more (+" + hidden + ")";

  btn.addEventListener("click", function () {
    var open = list.classList.toggle("is-expanded");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "Show less" : "Show more (+" + hidden + ")";
  });
})();
