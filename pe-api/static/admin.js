// Ask before destructive actions (forms marked with data-confirm).
document.addEventListener('submit', function (e) {
  var msg = e.target.getAttribute('data-confirm');
  if (msg && !window.confirm(msg)) e.preventDefault();
});

// ---- Tours & blog editors (no inline scripts: the admin's security policy blocks them)
(function () {
  var site = document.querySelector('[data-site-url]');
  function siteUrl(p) {
    if (!p) return '';
    if (/^https?:/.test(p)) return p;
    var base = (site && site.getAttribute('data-site-url')) || '';
    return base + p;
  }
  // Photo picker: clicking a thumbnail fills the address box and shows a preview
  document.querySelectorAll('.picker').forEach(function (box) {
    var input = box.querySelector('[data-image-input]'), prev = box.querySelector('[data-preview]'), file = box.querySelector('[data-file-preview]');
    function show(src) { if (!prev) return; prev.hidden = !src; if (src) prev.src = src; }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]'); if (!b) return;
      input.value = b.getAttribute('data-pick'); if (file) file.value = ''; show(b.querySelector('img').src);
      box.querySelectorAll('.pick').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
    input.addEventListener('change', function () { show(siteUrl(input.value.trim())); });
    if (file) file.addEventListener('change', function () {
      var f = file.files && file.files[0]; if (f) show(URL.createObjectURL(f));
    });
  });
  // Web address name preview from the title / tour name
  var src = document.querySelector('[data-slug-source]'), slug = document.querySelector('[data-slug]');
  if (src && slug) {
    var touched = !!slug.value;
    slug.addEventListener('input', function () { touched = true; });
    src.addEventListener('input', function () {
      if (!touched) slug.value = src.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    });
  }
  // Article: formatting buttons and preview
  var body = document.querySelector('[data-body]'), pane = document.querySelector('[data-preview-pane]');
  document.querySelectorAll('[data-md]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!body) return;
      var k = b.getAttribute('data-md'), s = body.selectionStart, e = body.selectionEnd, v = body.value, sel = v.slice(s, e), ins;
      if (k === 'link') ins = '[' + (sel || 'link text') + '](https://)';
      else if (k === 'image') ins = '\n![' + (sel || 'photo description') + '](photo address)\n';
      else if (b.hasAttribute('data-wrap')) ins = k + (sel || 'bold text') + k;
      else { var ls = v.lastIndexOf('\n', s - 1) + 1; body.setRangeText(k, ls, ls, 'end'); body.focus(); return; }
      body.setRangeText(ins, s, e, 'end'); body.focus();
    });
  });
  document.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var preview = b.getAttribute('data-tab') === 'preview';
      if (preview && window.PEMarkdown) pane.innerHTML = PEMarkdown.render(body.value, { base: (site && site.getAttribute('data-site-url')) || '' });
      pane.hidden = !preview; body.hidden = preview;
      document.querySelectorAll('[data-tab]').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
  });
  document.querySelectorAll('[data-copy]').forEach(function (i) { i.addEventListener('focus', function () { i.select(); }); });
})();
