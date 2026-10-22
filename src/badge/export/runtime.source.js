/*
 * Source of the bubble menu's only JavaScript (§8.1): positioning, arrow
 * keys, focus. Opening, closing, outside click and Escape come from the
 * native `popover` API; a small fallback covers browsers without it.
 *
 * `__C__` is the badge class prefix and `__S__` the stagger in ms; both are
 * filled in by generateHtml. Minified by `npm run build:runtime` into
 * runtime.generated.ts — edit here, then run it.
 */
(function () {
  var s = document.currentScript, r = s && s.previousElementSibling;
  if (!r || !r.classList.contains("__C__")) r = document.querySelector(".__C__");
  if (!r) return;
  var b = r.querySelector(".__C____pill"), m = r.querySelector(".__C____menu");
  if (!b || !m || r.hasAttribute("data-js")) return;
  /* Same snippet pasted twice: give this copy its own menu id. */
  var id = m.id, n = document.querySelectorAll('[id="' + id + '"]').length;
  if (n > 1) { id += "-" + n; m.id = id; b.setAttribute("popovertarget", id); b.setAttribute("aria-controls", id); }
  r.setAttribute("data-js", "");
  var L = [].slice.call(m.querySelectorAll("a")), P = HTMLElement.prototype.hasOwnProperty("popover"), q = 0, o = false;
  var G = 8, O = 12, A = 8, E = 8, S = __S__;
  L.forEach(function (a) { a.tabIndex = -1; });
  function isOpen() { return P ? m.matches(":popover-open") : o; }
  function close() {
    if (!isOpen()) return;
    if (P) { try { m.hidePopover(); } catch (x) {} } else { m.classList.remove("is-open"); shut(); }
  }
  function place() {
    q = 0;
    if (!isOpen()) return;
    var z = m.currentCSSZoom || 1, p = b.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = innerHeight;
    if (p.bottom < 0 || p.top > vh || p.right < 0 || p.left > vw) { close(); return; }
    var li = [].slice.call(m.children), h = li.length ? li[0].offsetHeight * z : 0;
    var wd = function (e) { return e.offsetWidth * z; };
    var sum = function (row) { return row.reduce(function (t, e) { return t + wd(e); }, 0) + G * (row.length - 1); };
    /* One row if it fits, else 2 (more only if labels are very long), the longest nearest the badge. */
    var rows = [li], nr = 1;
    while (nr < li.length && rows.some(function (row) { return sum(row) > vw - 2 * E; })) {
      nr++; rows = [];
      for (var i = 0, k = Math.ceil(li.length / nr); i < li.length; i += k) rows.push(li.slice(i, i + k));
    }
    var H = rows.length * h + (rows.length - 1) * G + A, up = p.top - O >= H + 16;
    m.setAttribute("data-side", up ? "top" : "bottom");
    var cx = p.left + p.width / 2, cy = p.top + p.height / 2;
    rows.forEach(function (row, ri) {
      var x = Math.max(E, Math.min(cx - sum(row) / 2, vw - E - sum(row))), c = (row.length - 1) / 2;
      var y0 = up ? p.top - O - h - ri * (h + G) : p.bottom + O + ri * (h + G);
      row.forEach(function (e, i) {
        var w = wd(e), t = c ? (i - c) / c : 0, y = y0 + (up ? -1 : 1) * A * (1 - t * t);
        e.style.left = x / z + "px"; e.style.top = y / z + "px";
        e.style.setProperty("--dx", (cx - x - w / 2) / z + "px");
        e.style.setProperty("--dy", (cy - y - h / 2) / z + "px");
        e.style.setProperty("--d", (Math.floor(Math.abs(i - c)) + ri) * S + "ms");
        x += w + G;
      });
    });
  }
  function later() { if (!q) q = requestAnimationFrame(place); }
  function start() {
    o = true; b.setAttribute("aria-expanded", "true");
    L.forEach(function (a) { a.removeAttribute("tabindex"); });
    /* Lay out at the start state, flush styles, then flip: the transition runs. */
    place(); void m.offsetWidth; m.setAttribute("data-open", "");
    if (L[0]) L[0].focus({ preventScroll: true });
    addEventListener("scroll", later, true); addEventListener("resize", later);
  }
  function shut() {
    o = false; m.removeAttribute("data-open"); b.setAttribute("aria-expanded", "false");
    L.forEach(function (a) { a.tabIndex = -1; });
    removeEventListener("scroll", later, true); removeEventListener("resize", later);
  }
  if (P) {
    m.addEventListener("beforetoggle", function (e) { if (e.newState === "closed") shut(); });
    m.addEventListener("toggle", function (e) { if (e.newState === "open" && !o) start(); });
  } else {
    b.addEventListener("click", function () { if (o) close(); else { m.classList.add("is-open"); start(); } });
    document.addEventListener("pointerdown", function (e) { if (o && !r.contains(e.target)) close(); });
  }
  m.addEventListener("keydown", function (e) {
    var i = L.indexOf(document.activeElement), k = e.key, c = L.length, j = -1;
    if (k === "ArrowRight" || k === "ArrowDown") j = (i + 1) % c;
    else if (k === "ArrowLeft" || k === "ArrowUp") j = (i - 1 + c) % c;
    else if (k === "Home") j = 0;
    else if (k === "End") j = c - 1;
    else if (k === "Escape") { e.preventDefault(); close(); b.focus(); return; }
    else if (k === "Tab") { close(); b.focus(); if (e.shiftKey) e.preventDefault(); return; }
    if (j >= 0) { e.preventDefault(); L[j].focus(); }
  });
  if (!P) r.addEventListener("keydown", function (e) { if (e.key === "Escape" && o) { close(); b.focus(); } });
  m.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) setTimeout(close, 0); });
})();
