/*
 * Past Enlighten: tiny, safe Markdown renderer for blog posts written in the admin dashboard.
 * Supports: ## headings, paragraphs, - lists, 1. lists, | tables |, ![photo](src), **bold**, *italic*, [links](url).
 * Everything is HTML-escaped first, so text typed in the admin can never inject markup or scripts.
 * PEMarkdown.render(text, { base: '../' })  -> HTML string. base = path from the page to the site root.
 */
(function () {
  'use strict';
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function safeUrl(u, base) {
    u = String(u || '').trim();
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^#[\w-]*$/.test(u)) return u;
    if (/^[a-z0-9][\w./?=&%-]*$/i.test(u) && !/^[a-z][a-z0-9+.-]*:/i.test(u)) return (base || '') + u;   // site-relative path
    return '';
  }
  function inline(raw, base) {
    // links and images are found on the raw text, then each piece is escaped on its own
    var out = '', re = /(!?)\[([^\]\n]{0,300})\]\(([^)\s]{1,400})\)/g, last = 0, m;
    while ((m = re.exec(raw))) {
      out += fmt(raw.slice(last, m.index));
      var url = safeUrl(m[3], base);
      if (!url) out += fmt(m[0]);
      else if (m[1]) out += '<img src="' + esc(url) + '" alt="' + esc(m[2]) + '" loading="lazy" decoding="async" class="w-full rounded-2xl my-6">';
      else {
        var ext = /^https?:/i.test(url);
        out += '<a href="' + esc(url) + '" class="text-brand-800 font-semibold underline"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + fmt(m[2]) + '</a>';
      }
      last = re.lastIndex;
    }
    return out + fmt(raw.slice(last));
  }
  function fmt(s) {
    return esc(s).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');
  }
  function cells(line) { return line.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); }); }

  function render(md, opts) {
    var base = (opts && opts.base) || '';
    var L = String(md || '').replace(/\r\n?/g, '\n').split('\n'), html = [], i = 0;
    while (i < L.length) {
      var line = L[i], t = line.trim(), m;
      if (!t) { i++; continue; }
      if ((m = t.match(/^(#{1,4})\s+(.*)$/))) {
        var lvl = Math.min(4, Math.max(2, m[1].length));
        var cls = lvl === 2 ? 'font-cinzel text-2xl sm:text-3xl font-extrabold text-brand-900 mt-10 mb-3'
          : lvl === 3 ? 'font-cinzel text-xl font-bold text-brand-900 mt-8 mb-2' : 'font-bold text-brand-900 mt-6 mb-2';
        html.push('<h' + lvl + ' class="' + cls + '">' + inline(m[2], base) + '</h' + lvl + '>'); i++; continue;
      }
      if (/^\|/.test(t) && i + 1 < L.length && /^\|?\s*:?-{2,}/.test(L[i + 1].trim())) {
        var head = cells(t), rows = []; i += 2;
        while (i < L.length && /^\|/.test(L[i].trim())) { rows.push(cells(L[i])); i++; }
        html.push('<div class="overflow-x-auto my-5"><table class="w-full text-sm border border-stone-200 rounded-xl overflow-hidden"><thead class="bg-brand-50"><tr>' +
          head.map(function (c) { return '<th class="text-left p-3 font-bold text-brand-900">' + inline(c, base) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr class="border-t border-stone-200">' + r.map(function (c) { return '<td class="p-3 text-slate-700">' + inline(c, base) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table></div>');
        continue;
      }
      if (/^([-*]|\d+\.)\s+/.test(t)) {
        var ordered = /^\d+\./.test(t), items = [];
        while (i < L.length && /^([-*]|\d+\.)\s+/.test(L[i].trim())) { items.push(L[i].trim().replace(/^([-*]|\d+\.)\s+/, '')); i++; }
        html.push('<' + (ordered ? 'ol class="list-decimal' : 'ul class="list-disc') + ' pl-6 my-4 space-y-2 text-slate-700 leading-relaxed">' +
          items.map(function (x) { return '<li>' + inline(x, base) + '</li>'; }).join('') + '</' + (ordered ? 'ol' : 'ul') + '>');
        continue;
      }
      if ((m = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) { html.push(inline(t, base)); i++; continue; }
      var para = [];
      while (i < L.length && L[i].trim() && !/^(#{1,4}\s|[-*]\s|\d+\.\s|\|)/.test(L[i].trim())) { para.push(L[i].trim()); i++; }
      if (!para.length) { para.push(t); i++; }
      html.push('<p class="text-slate-700 leading-relaxed my-4">' + inline(para.join(' '), base) + '</p>');
    }
    return html.join('\n');
  }
  window.PEMarkdown = { render: render, safeUrl: safeUrl, esc: esc };
})();
