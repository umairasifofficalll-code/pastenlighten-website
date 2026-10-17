/* Past Enlighten: dark theme switch shared by every page (same setting as the homepage). */
(function () {
  'use strict';
  var KEY = 'pe_dark', root = document.documentElement, btn = null;
  function stored() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function label() {
    if (!btn) return;
    var on = root.classList.contains('dark-mode');
    btn.innerHTML = on ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>' : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', on ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('aria-pressed', String(on));
    btn.title = on ? 'Light theme' : 'Dark theme';
  }
  function apply(on) { root.classList.toggle('dark-mode', on); label(); }
  apply(stored());

  function addButton() {
    if (document.getElementById('darkModeBtn') || document.getElementById('peThemeBtn')) return;
    btn = document.createElement('button');
    btn.id = 'peThemeBtn'; btn.type = 'button'; btn.className = 'dark-toggle';
    btn.addEventListener('click', function () {
      var on = !root.classList.contains('dark-mode');
      apply(on);
      try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    });
    document.body.appendChild(btn);
    label();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton); else addButton();
  // Follow changes made in another tab (storage events only fire in the *other* tabs)
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(e.newValue === '1'); });
})();
