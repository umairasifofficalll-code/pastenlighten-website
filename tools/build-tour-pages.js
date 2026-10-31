#!/usr/bin/env node
/*
 * Past Enlighten: build one page per tour (tours/<slug>.html).
 *
 * Run from the site root:   node tools/build-tour-pages.js
 *
 * Reads, without changing them:
 *   js/prices.js        names, durations, seasons, inclusions and price tiers (the price workbook copy)
 *   tours/index.html    each tour's slug, photo, summary and guide link (the All Tours cards)
 *   index.html          TOURS_DATA: highlights, history and special features (the itinerary pop-up)
 *
 * Prices on the generated pages are tagged with data-pe-price / data-pe-tier, so js/pe-catalog.js
 * keeps them in step with the admin dashboard without rebuilding. Re-run this script after adding
 * or renaming a tour, then add the new page to sitemap.xml.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---------------------------------------------------------------- load data
const ctx = { window: {}, document: { readyState: 'complete', addEventListener() {}, querySelectorAll() { return []; } } };
vm.createContext(ctx);
vm.runInContext(read('js/prices.js'), ctx);
const PRICES = ctx.window.PE_PRICES;

const home = read('index.html');
const start = home.indexOf('const TOURS_DATA = {') + 'const TOURS_DATA = '.length;
let depth = 0, end = start;
for (; end < home.length; end++) {
  if (home[end] === '{') depth++;
  else if (home[end] === '}' && --depth === 0) break;
}
const DETAILS = vm.runInNewContext('(' + home.slice(start, end + 1) + ')');
const DETAILS_KEY = { 'L-WALK': 'lahore', 'N-NARAN': 'naran', 'N-SWAT': 'swat', 'N-NEELUM': 'kashmir' };

const listing = read('tours/index.html');
const cards = [];
for (const m of listing.matchAll(/<article id="([^"]+)"[\s\S]*?<img src="\.\.\/([^"]+)"[\s\S]*?<h3[^>]*>([^<]*)<\/h3>\s*<p[^>]*>([^<]*)<\/p>[\s\S]*?data-pe-price="([^"]+)"([\s\S]*?)<\/article>/g)) {
  const guide = /href="\.\.\/([^"]+)"[^>]*>Read the guide/.exec(m[6]);
  const section = listing.lastIndexOf('<section id="', m.index);
  const region = /<section id="([^"]+)"/.exec(listing.slice(section))[1];
  cards.push({ slug: m[1], image: m[2], summary: m[4], id: m[5], guide: guide ? guide[1] : '', section: region });
}

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s == null ? '' : s)
  .replace(/&(?![a-z]+;|#x?[0-9a-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = (s) => String(s).replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&middot;/g, '·');
const usd = (n) => 'US$' + Number(n).toLocaleString('en-US');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const TIERS = [
  ['solo', 'Solo traveller'], ['twoTraveller', '2 travellers'], ['threeToFour', '3–4 travellers'],
  ['fiveToEight', '5–8 travellers'], ['ninePlus', '9 or more'], ['shared', 'Shared small group'],
];
const REGION_LABEL = { lahore: 'Lahore', islamabad: 'Islamabad', 'northern-pakistan': 'Northern Pakistan', 'south-punjab': 'South Punjab' };

function page(card) {
  const p = PRICES.tours[card.id];
  const d = DETAILS[DETAILS_KEY[card.id] || card.id] || {};
  const name = p.name;
  const regionName = REGION_LABEL[card.section] || p.region;
  const summary = text(card.summary);
  const big = card.image.replace(/-sm\.webp$/, '.webp');
  const url = 'https://pastenlighten.com/tours/' + card.slug + '.html';
  const title = name + ' | Private Tour from ' + p.start + ' | Past Enlighten';
  const desc = (summary + ' ' + cap(p.duration) + ', from ' + usd(p.solo) + ' per person. Book online or on WhatsApp.').slice(0, 300);
  const wa = 'https://wa.me/923344770455?text=' + encodeURIComponent("Hello Past Enlighten, I'd like to ask about the " + name + '.');
  const related = cards.filter((c) => c.section === card.section && c.id !== card.id).slice(0, 3);
  const about = [d.history, d.specialThings && ('Highlights include ' + d.specialThings.replace(/\.$/, '') + '.')].filter(Boolean);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name, description: summary, url,
    image: 'https://pastenlighten.com/' + big,
    touristType: 'Cultural and adventure travellers',
    itinerary: (d.highlights || []).map((h) => ({ '@type': 'TouristAttraction', name: h })),
    provider: { '@type': 'TravelAgency', name: 'Past Enlighten', url: 'https://pastenlighten.com/', telephone: '+92 334 4770455',
      address: { '@type': 'PostalAddress', streetAddress: 'Fort Road, Walled City', addressLocality: 'Lahore', addressCountry: 'PK' } },
    offers: { '@type': 'Offer', price: String(p.solo), priceCurrency: 'USD', url: 'https://pastenlighten.com/booking.html?tour=' + card.slug,
      availability: 'https://schema.org/InStock', description: 'Per person for a solo traveller; groups pay less per person.' },
  };
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pastenlighten.com/' },
      { '@type': 'ListItem', position: 2, name: 'All tours', item: 'https://pastenlighten.com/tours/index.html' },
      { '@type': 'ListItem', position: 3, name, item: url },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Past Enlighten">
  <meta property="og:title" content="${esc(name)} | Past Enlighten">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://pastenlighten.com/${big}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#061a14">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{brand:{950:'#061a14',900:'#0a261e',800:'#0f382c',700:'#164e3f',600:'#1e6b57',100:'#e5f3ee',50:'#f2f9f6'},accent:{gold:'#d97706',amber:'#f59e0b'}},fontFamily:{cinzel:['"Cinzel"','serif'],sans:['"Plus Jakarta Sans"','sans-serif']}}}}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>body{color:#1f2937;background:#faf8f5}.bg-brand-950{background-color:#061a14!important;color:#fff!important}</style>
  <link rel="icon" href="../favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32.png">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <script>try{if(localStorage.getItem("pe_dark")==="1")document.documentElement.classList.add("dark-mode")}catch(e){}</script>
  <link rel="stylesheet" href="../css/dark.css">
  <script src="../js/theme.js" defer></script>
  <script src="../js/prices.js?v=20261028-2" defer></script>
  <script src="../js/pe-catalog.js?v=20261031-1" defer></script>
  <link rel="stylesheet" href="../css/pe-3d.css?v=20261027-1">
  <script src="../js/pe-theme.js?v=20261027-1"></script>
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body class="font-sans antialiased">
  <header class="bg-white border-b border-stone-200 sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <a href="../index.html" class="flex items-center gap-2 font-cinzel text-lg sm:text-xl font-bold tracking-wider text-brand-900"><picture><source srcset="../images/logo-mark.webp" type="image/webp"><img src="../images/logo-mark.png" alt="" width="52" height="44" class="h-11 w-auto"></picture>Past Enlighten</a>
      <nav class="hidden md:flex gap-5 text-sm font-medium text-slate-700" aria-label="Main"><a href="../index.html" class="hover:text-brand-800">Home</a><a href="index.html" class="text-brand-800 font-bold border-b-2 border-brand-800">Tours</a><a href="../blog/index.html" class="hover:text-brand-800">Travel Blog</a><a href="../guide.html" class="hover:text-brand-800">About Guide</a><a href="../reviews.html" class="hover:text-brand-800">Reviews</a><a href="../booking.html" class="hover:text-brand-800">Book</a></nav>
      <a href="../booking.html?tour=${card.slug}" class="hidden sm:inline-flex items-center gap-2 bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-full"><i class="fa-solid fa-calendar-check text-amber-400"></i> Book this tour</a>
      <button id="menuBtn" class="md:hidden p-2 rounded-lg text-slate-700" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav"><i class="fa-solid fa-bars text-lg"></i></button>
    </div>
    <nav id="mobileNav" class="hidden md:hidden border-t border-stone-200 px-4 py-3 space-y-2 text-sm font-medium flex flex-col" aria-label="Mobile"><a href="../index.html" class="block">Home</a><a href="index.html" class="block font-bold text-brand-800">Tours</a><a href="../blog/index.html" class="block">Travel Blog</a><a href="../guide.html" class="block">About Guide</a><a href="../reviews.html" class="block">Reviews</a><a href="../booking.html" class="block">Book</a></nav>
  </header>
  <main data-pe-tour="${card.id}">
    <section class="bg-brand-950 text-white relative overflow-hidden">
      <img src="../${card.image}" srcset="../${card.image} 720w, ../${big} 1600w" sizes="100vw" alt="" aria-hidden="true" class="absolute inset-0 w-full h-full object-cover opacity-30" fetchpriority="high">
      <div class="absolute inset-0 bg-gradient-to-r from-[#061a14] via-[#061a14]/85 to-[#061a14]/40" aria-hidden="true"></div>
      <div class="relative max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <nav class="text-xs text-slate-300" aria-label="Breadcrumb"><a href="../index.html" class="underline">Home</a> / <a href="index.html#${card.section}" class="underline">${esc(regionName)} tours</a> / ${esc(name)}</nav>
        <p class="mt-4 text-amber-400 font-bold tracking-widest text-[11px] uppercase">Private tour &middot; ${esc(regionName)}</p>
        <h1 class="font-cinzel text-3xl sm:text-5xl font-extrabold leading-tight mt-2">${esc(name)}</h1>
        <p class="mt-3 max-w-2xl text-slate-200 leading-relaxed">${esc(summary)}</p>
        <ul class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
          <li><i class="fa-regular fa-clock text-amber-400 mr-1.5"></i>${esc(cap(p.duration))}</li>
          <li><i class="fa-solid fa-location-dot text-amber-400 mr-1.5"></i>Starts in ${esc(p.start)}</li>
          ${p.season ? `<li><i class="fa-regular fa-calendar text-amber-400 mr-1.5"></i>Best ${esc(p.season)}</li>` : ''}
          <li><i class="fa-solid fa-language text-amber-400 mr-1.5"></i>English &amp; Urdu guides</li>
        </ul>
      </div>
    </section>

    <div class="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <p id="peUnlisted" class="hidden rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">This tour isn't on our current list. Message us on WhatsApp and we'll suggest the closest option or plan it privately.</p>
        ${about.length ? `<section>
          <h2 class="font-cinzel text-2xl font-bold text-brand-900">About this tour</h2>
          ${about.map((a) => `<p class="mt-3 text-slate-700 leading-relaxed">${esc(a)}</p>`).join('\n          ')}
        </section>` : ''}
        ${(d.highlights || []).length ? `<section>
          <h2 class="font-cinzel text-2xl font-bold text-brand-900">What you'll see</h2>
          <ol class="mt-4 space-y-3">
            ${d.highlights.map((h, i) => `<li class="flex gap-3"><span class="flex-none w-7 h-7 rounded-full bg-brand-800 text-white text-sm font-bold grid place-items-center">${i + 1}</span><span class="pt-0.5 text-slate-700">${esc(h)}</span></li>`).join('\n            ')}
          </ol>
        </section>` : ''}
        <section>
          <h2 class="font-cinzel text-2xl font-bold text-brand-900">What's included</h2>
          <ul class="mt-4 grid sm:grid-cols-2 gap-2">
            ${p.includes.map((x) => `<li class="flex gap-2 text-slate-700"><i class="fa-solid fa-check text-emerald-600 mt-1"></i><span>${esc(cap(x))}</span></li>`).join('\n            ')}
          </ul>
          <p class="mt-4 text-sm text-slate-600">Not included: meals unless listed, personal expenses and tips. ${esc(PRICES.childPolicy || '')}</p>
        </section>
        <section>
          <h2 class="font-cinzel text-2xl font-bold text-brand-900">Good to know</h2>
          <ul class="mt-4 space-y-2 text-slate-700 list-disc pl-5">
            <li>Private for just you and your group by default${p.prices.shared != null ? ', or join a shared small group at the shared price' : ''}. Ask us to adjust the route or timing.</li>
            ${/Lahore|Islamabad|South Punjab/.test(p.region) ? '<li>Dress modestly for mosques and shrines (shoulders and knees covered); women may want a light scarf. Shoes come off inside.</li>' : '<li>Mountain roads can close for weather or landslides; we keep a flexible plan and tell you early about any change.</li>'}
            ${card.guide ? `<li>Read our free guide before you go: <a class="font-semibold text-brand-800 underline" href="../${card.guide}">travel tips for this trip</a>.</li>` : ''}
          </ul>
        </section>
      </div>

      <aside class="lg:sticky lg:top-24 self-start bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
        <p class="text-[11px] uppercase font-bold tracking-wide text-slate-500">Solo traveller</p>
        <p class="font-extrabold text-brand-900 text-3xl"><span data-pe-price="${card.id}">${usd(p.solo)}</span> <span class="text-sm font-semibold text-slate-500">per person</span></p>
        <p class="text-xs font-semibold text-emerald-700">Groups pay less per person</p>
        <table class="mt-4 w-full text-sm">
          <caption class="sr-only">Price per person by group size, in US dollars</caption>
          <tbody>
            ${TIERS.filter(([k]) => p.prices[k] != null).map(([k, label]) => `<tr class="border-t border-stone-100"><th scope="row" class="py-1.5 text-left font-medium text-slate-600">${label}</th><td class="py-1.5 text-right font-bold text-brand-900" data-pe-tier="${k}">${usd(p.prices[k])}</td></tr>`).join('\n            ')}
          </tbody>
        </table>
        <p class="mt-2 text-[11px] text-slate-500">Per person, in US$. Entry tickets included.</p>
        <a href="../booking.html?tour=${card.slug}" class="mt-4 w-full inline-flex justify-center items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white font-bold px-4 py-3 rounded-full"><i class="fa-solid fa-calendar-check text-amber-400"></i> Book this tour</a>
        <a href="${esc(wa)}" class="mt-2 w-full inline-flex justify-center items-center gap-2 border border-emerald-600 text-emerald-700 font-bold px-4 py-3 rounded-full hover:bg-emerald-50" rel="noopener" target="_blank"><i class="fa-brands fa-whatsapp"></i> Ask on WhatsApp</a>
      </aside>
    </div>

    ${related.length ? `<section class="max-w-6xl mx-auto px-4 pb-14">
      <h2 class="font-cinzel text-2xl font-bold text-brand-900">More ${esc(regionName)} tours</h2>
      <div class="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${related.map((r) => { const rp = PRICES.tours[r.id]; return `<a href="${r.slug}.html" class="block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition">
          <img src="../${r.image}" alt="" class="w-full aspect-[16/10] object-cover" loading="lazy" decoding="async">
          <span class="block p-4"><span class="block text-xs text-slate-500">${esc(cap(rp.duration))}</span><span class="block font-cinzel font-bold text-brand-900 mt-1">${esc(rp.name)}</span><span class="block mt-2 text-sm">From <span class="font-bold text-brand-900" data-pe-price="${r.id}">${usd(rp.solo)}</span> per person</span></span>
        </a>`; }).join('\n        ')}
      </div>
    </section>` : ''}
  </main>
  <footer class="bg-brand-950 text-slate-400 text-xs">
    <div class="max-w-6xl mx-auto px-4 py-6 flex flex-wrap justify-between gap-2"><span>&copy; 2026 Past Enlighten Tour Guides. All rights reserved.</span><span><a href="../privacy.html" class="underline">Privacy</a> &middot; Fort Road, Walled City, Lahore &middot; +92 334 4770455</span></div>
  </footer>
  <a href="${esc(wa)}" class="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-emerald-600 text-white grid place-items-center shadow-lg text-2xl" aria-label="Chat on WhatsApp" rel="noopener" target="_blank"><i class="fa-brands fa-whatsapp"></i></a>
  <script>
    document.getElementById('menuBtn').addEventListener('click',function(){var o=document.getElementById('mobileNav').classList.toggle('hidden')===false;this.setAttribute('aria-expanded',String(o));});
    // Keep the group-size prices in step with the admin dashboard (js/pe-catalog.js fires pe:catalog).
    document.addEventListener('pe:catalog',function(e){
      var id=document.querySelector('main').getAttribute('data-pe-tour'),t=e.detail&&e.detail.tours&&e.detail.tours[id];
      document.getElementById('peUnlisted').classList.toggle('hidden',!!t||!e.detail.live);
      if(!t||!t.prices)return;
      document.querySelectorAll('[data-pe-tier]').forEach(function(td){var v=t.prices[td.getAttribute('data-pe-tier')];if(v!=null&&isFinite(v))td.textContent='US$'+Number(v).toLocaleString('en-US');});
    });
  </script>
  <script src="../js/pe-3d.js?v=20261026-4" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- write
let n = 0;
for (const card of cards) {
  if (!PRICES.tours[card.id]) { console.warn('skip (no price):', card.id); continue; }
  fs.writeFileSync(path.join(ROOT, 'tours', card.slug + '.html'), page(card));
  n++;
}
console.log('Built ' + n + ' tour pages:', cards.map((c) => c.slug).join(', '));
