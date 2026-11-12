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
  var g = d.querySelector(".__C____gh"), D = 864e5;
  /* Drawn open (the editor's profile stage): fill the activity right away. */
  if (d.open && g) setTimeout(load);

  b.addEventListener("click", function () {
    if (d.open) return;
    d.showModal();
    if (g && !g.hasAttribute("data-st")) load();
  });
  /* A click on the dialog box itself, not its content, is the backdrop. */
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });

  /* The year of contributions, as GitHub's profile shows it, through Stampit's /api/github. */
  function load() {
    var u = g.getAttribute("data-user"), k = "stampit-gh2-" + u, c = null;
    g.setAttribute("data-st", "loading");
    try { c = JSON.parse(sessionStorage.getItem(k)); } catch (x) {}
    if (c && Date.now() - c.at < 18e5) { draw(c.d); return; }
    fetch(g.getAttribute("data-api") + "/api/github?user=" + encodeURIComponent(u)).then(function (res) {
      if (!res.ok) throw 0;
      return res.json();
    }).then(function (data) {
      try { sessionStorage.setItem(k, JSON.stringify({ at: Date.now(), d: data })); } catch (x) {}
      draw(data);
    }, function () { g.setAttribute("data-st", "error"); });
  }

  /* One brick per day, Sunday-first columns: the levels are GitHub's own (0–4). */
  function draw(data) {
    var h = "", s = data.levels, t = Date.parse(data.start), gr = g.querySelector(".__C____gr");
    for (var i = 0; i < s.length; i++) h += '<i data-l="' + s.charAt(i) + '" title="' + new Date(t + i * D).toISOString().slice(0, 10) + '"></i>';
    gr.innerHTML = h;
    if (data.total != null) gr.setAttribute("aria-label", gr.getAttribute("aria-label").split(":")[0] + ": " + data.total + " contributions in the last year");
    g.setAttribute("data-st", "ok");
  }
})();
