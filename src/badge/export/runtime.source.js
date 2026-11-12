/*
 * Source of the profile modal's only JavaScript: open on click, close on a
 * backdrop click, and fill the GitHub activity grid from the public API.
 * Escape and the close button come from the native <dialog>.
 *
 * `__C__` is the badge class prefix, filled in by generateHtml. Minified by
 * `npm run build:runtime` into runtime.generated.ts — edit here, then run it.
 */
(function () {
  var s = document.currentScript, r = s && s.previousElementSibling;
  if (!r || !r.classList.contains("__C__")) r = document.querySelector(".__C__");
  if (!r) return;
  var b = r.querySelector("[aria-haspopup=dialog]"), d = r.querySelector(".__C____dlg");
  if (!b || !d || !d.showModal || r.hasAttribute("data-js")) return;
  /* Same snippet pasted twice: give this copy its own dialog id. */
  var id = d.id, n = document.querySelectorAll('[id="' + id + '"]').length;
  if (n > 1) { id += "-" + n; d.id = id; b.setAttribute("aria-controls", id); }
  r.setAttribute("data-js", "");
  var g = d.querySelector(".__C____gh"), D = 864e5, W = 12;
  /* Drawn open (the editor's profile stage): fill the activity right away. */
  if (d.open && g) setTimeout(load);

  b.addEventListener("click", function () {
    if (d.open) return;
    d.showModal();
    if (g && !g.hasAttribute("data-st")) load();
  });
  /* A click on the dialog box itself, not its content, is the backdrop. */
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });

  function today() { var t = new Date(); return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()); }
  /* W full weeks plus the current one, Sunday first, like GitHub's graph. */
  function first() { return today() - (W * 7 + new Date().getUTCDay()) * D; }

  function load() {
    var u = g.getAttribute("data-user"), k = "stampit-gh-" + u, c = null;
    g.setAttribute("data-st", "loading");
    try { c = JSON.parse(sessionStorage.getItem(k)); } catch (x) {}
    if (c && Date.now() - c.at < 18e5) { draw(c.days); return; }
    var days = {}, min = first();
    /* Public events, newest first: up to 3 pages of 100, until the window is covered. */
    function page(p) {
      return fetch("https://api.github.com/users/" + encodeURIComponent(u) + "/events/public?per_page=100&page=" + p, {
        headers: { Accept: "application/vnd.github+json" }
      }).then(function (res) {
        if (!res.ok) throw 0;
        return res.json();
      }).then(function (ev) {
        var old = false;
        ev.forEach(function (e) {
          var t = Date.parse(e.created_at);
          if (t < min) { old = true; return; }
          var key = e.created_at.slice(0, 10);
          days[key] = (days[key] || 0) + 1;
        });
        if (ev.length === 100 && !old && p < 3) return page(p + 1);
      });
    }
    page(1).then(function () {
      try { sessionStorage.setItem(k, JSON.stringify({ at: Date.now(), days: days })); } catch (x) {}
      draw(days);
    }, function () { g.setAttribute("data-st", "error"); });
  }

  function draw(days) {
    var h = "", total = 0, end = today();
    for (var t = first(); t <= end; t += D) {
      var key = new Date(t).toISOString().slice(0, 10), v = days[key] || 0;
      total += v;
      h += '<i data-l="' + (v ? v < 2 ? 1 : v < 4 ? 2 : v < 7 ? 3 : 4 : 0) + '" title="' + v + " · " + key + '"></i>';
    }
    var gr = g.querySelector(".__C____gr");
    gr.innerHTML = h;
    gr.setAttribute("aria-label", gr.getAttribute("aria-label").split(":")[0] + ": " + total + " public events in the last 12 weeks");
    g.setAttribute("data-st", "ok");
  }
})();
