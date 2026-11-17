/* Past Enlighten – Google reviews loader.
 * Live data (rating, review count, Google's most relevant reviews) comes from the Past Enlighten backend,
 * which fetches it from Google twice a day. The saved copy in data/google-reviews.json is always loaded too:
 * it keeps the older reviews on the page and is used on its own if the live data is not available.
 */
(function () {
  var LIVE = 'https://pastenlighten.com/pe-api/api/google-reviews';
  var SAVED = (document.currentScript && document.currentScript.dataset.saved) || 'data/google-reviews.json';

  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function key(name) { return String(name || '').trim().toLowerCase(); }

  function merge(live, saved) {
    var hasLive = !!(live && live.ok && live.count);
    if (!hasLive && !saved) return null;
    var base = saved || { source: 'Google', reviews: [] };
    if (!hasLive) return base;
    var seen = {};
    var reviews = (live.reviews || []).map(function (r) { seen[key(r.name)] = true; r.live = true; return r; });
    (base.reviews || []).forEach(function (r) { if (!seen[key(r.name)]) reviews.push(r); });
    return {
      source: 'Google',
      place: live.place || base.place,
      url: base.url || live.url,
      rating: live.rating != null ? live.rating : base.rating,
      count: Math.max(Number(live.count) || 0, Number(base.count) || 0),
      reviews: reviews,
      live: true,
      fetched: live.fetched
    };
  }

  window.PEGoogleReviews = {
    load: function () {
      return Promise.all([getJSON(LIVE), getJSON(SAVED)]).then(function (res) { return merge(res[0], res[1]); });
    }
  };
})();
