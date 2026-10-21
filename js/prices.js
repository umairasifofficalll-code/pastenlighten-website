/*
 * Past Enlighten: authoritative Noor chatbot prices, per person, USD.
 * Source: Noor-Price-List-International.xlsx (21 Oct 2026).
 * Keep all tiers in sync with the pricing workbook. Prices are public.
 * Private tiers: solo, 2 travellers, 3–4, 5–8, 9+; shared is per person.
 */
window.PE_PRICES = {
  updated: '2026-10-21',
  currency: 'USD',
  childPolicy: 'Children under 5 pay 50% of the adult price.',
  groupNote: 'Use the exact per-person price for the requested party-size tier. Never show unrelated tiers unless the user asks to compare. For an unspecified party size, ask how many travellers or show solo starting price only if the user asks for a starting price.',
  pricingRules: ['Prices are per person in USD.','For solo or one traveller, return only the solo price for matching tours.','If a city or region is specified, return only tours matching that city or region.','Private tiers: 1=solo; 2=twoTraveller; 3–4=threeToFour; 5–8=fiveToEight; 9+=ninePlus.','Use the exact tier price; never interpolate or guess.','Use shared prices only when shared/small-group is requested.','If a price is missing, say the team will provide a written quote.','For total cost, multiply the matching per-person price by party size and label both amounts.','Do not mix tours, locations, or tiers unless comparison is explicitly requested.'],
  tours: {
  "L-WALK": {
    "name": "Lahore Fort & Walled City Heritage Walk",
    "region": "Lahore",
    "duration": "Half day, 3–4 hours",
    "start": "Lahore",
    "solo": 70,
    "prices": { "solo": 70, "twoTraveller": 55, "threeToFour": 45, "fiveToEight": 40, "ninePlus": 35, "shared": 40 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "all entry tickets",
      "local expert guide",
      "shoe basket",
      "water bottle"
    ]
  },
  "L1": {
    "name": "Lahore Full Day Heritage Tour (incl. Wagah Border)",
    "region": "Lahore",
    "duration": "Full day, 8–9 hours",
    "start": "Lahore",
    "solo": 135,
    "prices": { "solo": 135, "twoTraveller": 120, "threeToFour": 110, "fiveToEight": 100, "ninePlus": 90, "shared": 100 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup in Lahore"
    ]
  },
  "L2": {
    "name": "Walled City & Rangila Rickshaw",
    "region": "Lahore",
    "duration": "Half day, 4–5 hours",
    "start": "Lahore",
    "solo": 85,
    "prices": { "solo": 85, "twoTraveller": 70, "threeToFour": 65, "fiveToEight": 50, "ninePlus": 45, "shared": 50 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "all entry tickets",
      "local expert guide",
      "shoe basket",
      "water bottle",
      "Rangila Rickshaw ride"
    ]
  },
  "L3": {
    "name": "Museums & Fort Tour",
    "region": "Lahore",
    "duration": "Half day, 4–5 hours",
    "start": "Lahore",
    "solo": 70,
    "prices": { "solo": 70, "twoTraveller": 55, "threeToFour": 45, "fiveToEight": 40, "ninePlus": 35, "shared": 40 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "all entry tickets",
      "local expert guide",
      "shoe basket",
      "water bottle"
    ]
  },
  "L4": {
    "name": "Night Sufi Shrine Tour",
    "region": "Lahore",
    "duration": "Night, from about 9:50 pm",
    "start": "Lahore",
    "solo": 40,
    "prices": { "solo": 40, "twoTraveller": 30, "threeToFour": 25, "fiveToEight": 25, "ninePlus": 20, "shared": 25 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "all entry tickets",
      "local expert guide",
      "shoe basket",
      "water bottle"
    ]
  },
  "L5": {
    "name": "Lahore Shopping & Bazaars Tour",
    "region": "Lahore",
    "duration": "Evening, 3–4 hours",
    "start": "Lahore",
    "solo": 40,
    "prices": { "solo": 40, "twoTraveller": 30, "threeToFour": 25, "fiveToEight": 25, "ninePlus": 20, "shared": 25 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "all entry tickets",
      "local expert guide",
      "shoe basket",
      "water bottle"
    ]
  },
  "L6": {
    "name": "Shahdara Complex: Tombs of Jahangir & Noor Jahan",
    "region": "Lahore",
    "duration": "Morning or evening, 3–4 hours",
    "start": "Lahore",
    "solo": 50,
    "prices": { "solo": 50, "twoTraveller": 40, "threeToFour": 40, "fiveToEight": 35, "ninePlus": 30, "shared": 35 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "all entry tickets",
      "local expert guide",
      "shoe basket",
      "water bottle"
    ]
  },
  "L7": {
    "name": "Sheikhupura Fort & Hiran Minar Excursion",
    "region": "Lahore",
    "duration": "Full day",
    "start": "Lahore",
    "solo": 195,
    "prices": { "solo": 195, "twoTraveller": 165, "threeToFour": 145, "fiveToEight": 135, "ninePlus": 120, "shared": 135 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup in Lahore"
    ]
  },
  "I1": {
    "name": "Islamabad & Rawalpindi Full Day City Tour",
    "region": "Islamabad",
    "duration": "Full day",
    "start": "Islamabad",
    "solo": 145,
    "prices": { "solo": 145, "twoTraveller": 130, "threeToFour": 120, "fiveToEight": 110, "ninePlus": 100, "shared": 110 },
    "entryTickets": true,
    "singleSupplement": false,
    "season": "Oct–Mar",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup in Islamabad"
    ]
  },
  "N-NARAN": {
    "name": "Naran Kaghan & Lake Saif-ul-Malook",
    "region": "Northern Pakistan",
    "duration": "4 days / 3 nights",
    "start": "Islamabad",
    "solo": 1045,
    "prices": { "solo": 1045, "twoTraveller": 925, "threeToFour": 775, "fiveToEight": 695, "ninePlus": 625, "shared": 695 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "April–Oct",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "N-SWAT": {
    "name": "Swat Valley & Malam Jabba",
    "region": "Northern Pakistan",
    "duration": "3 days / 2 nights",
    "start": "Islamabad",
    "solo": 945,
    "prices": { "solo": 945, "twoTraveller": 895, "threeToFour": 695, "fiveToEight": 625, "ninePlus": 545, "shared": 625 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "April–Oct",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "N-NEELUM": {
    "name": "Neelum Valley & Sharda (Kashmir)",
    "region": "Northern Pakistan",
    "duration": "5 days / 4 nights",
    "start": "Islamabad",
    "solo": 1495,
    "prices": { "solo": 1495, "twoTraveller": 1295, "threeToFour": 1095, "fiveToEight": 965, "ninePlus": 895, "shared": 965 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "April–Oct",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "N1": {
    "name": "Hunza Valley Tour",
    "region": "Northern Pakistan",
    "duration": "5 days / 4 nights",
    "start": "Islamabad",
    "solo": 1980,
    "prices": { "solo": 1980, "twoTraveller": 1695, "threeToFour": 1450, "fiveToEight": 1290, "ninePlus": 1095, "shared": 1290 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "April–Oct",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "N2": {
    "name": "Skardu & Deosai Tour",
    "region": "Northern Pakistan",
    "duration": "6 days / 5 nights",
    "start": "Islamabad",
    "solo": 2690,
    "prices": { "solo": 2690, "twoTraveller": 2290, "threeToFour": 1790, "fiveToEight": 1625, "ninePlus": 1375, "shared": 1625 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "April–Oct",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "N3": {
    "name": "Fairy Meadows & Nanga Parbat Base Camp",
    "region": "Northern Pakistan",
    "duration": "4 days / 3 nights",
    "start": "Islamabad",
    "solo": 1925,
    "prices": { "solo": 1925, "twoTraveller": 1545, "threeToFour": 1245, "fiveToEight": 1125, "ninePlus": 825, "shared": 1125 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "April–Oct",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "N5": {
    "name": "Grand Northern Pakistan Tour",
    "region": "Northern Pakistan",
    "duration": "16 days / 15 nights",
    "start": "Islamabad",
    "solo": 4290,
    "prices": { "solo": 4290, "twoTraveller": 3290, "threeToFour": 2720, "fiveToEight": 2390, "ninePlus": 1790, "shared": 2390 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "April–Oct",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "S1": {
    "name": "Bahawalpur & Cholistan Desert",
    "region": "South Punjab",
    "duration": "4 days / 3 nights",
    "start": "Lahore",
    "solo": 1045,
    "prices": { "solo": 1045, "twoTraveller": 825, "threeToFour": 695, "fiveToEight": 565, "ninePlus": 495, "shared": 565 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "Oct–Mar",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  },
  "S2": {
    "name": "Lahore – Harappa – Multan",
    "region": "South Punjab",
    "duration": "3 days / 2 nights",
    "start": "Lahore",
    "solo": 865,
    "prices": { "solo": 865, "twoTraveller": 645, "threeToFour": 565, "fiveToEight": 545, "ninePlus": 415, "shared": 545 },
    "entryTickets": true,
    "singleSupplement": true,
    "season": "Oct–Mar",
    "includes": [
      "English-speaking guide",
      "private AC car with driver",
      "fuel",
      "parking",
      "all entry tickets (foreigner rate)",
      "hotel pickup"
    ]
  }
}
};
window.PE_PRICE = function (id) { var t = window.PE_PRICES.tours[id]; return t ? 'US

// Fill any element marked data-pe-price="TOUR_ID" with the current solo price
(function () {
  function fill() {
    var els = document.querySelectorAll('[data-pe-price]');
    for (var i = 0; i < els.length; i++) { var v = window.PE_PRICE(els[i].getAttribute('data-pe-price')); if (v) els[i].textContent = v; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
 + t.solo.toLocaleString('en-US') : ''; };
window.PE_PRICE_FOR_PARTY = function (id, partySize, shared) {
  var t = window.PE_PRICES.tours[id];
  if (!t || !t.prices || !Number.isFinite(Number(partySize)) || Number(partySize) < 1) return null;
  var n = Number(partySize), key = shared ? 'shared' : n === 1 ? 'solo' : n === 2 ? 'twoTraveller' : n <= 4 ? 'threeToFour' : n <= 8 ? 'fiveToEight' : 'ninePlus';
  var price = t.prices[key];
  return Number.isFinite(price) ? price : null;
};

// Fill any element marked data-pe-price="TOUR_ID" with the current solo price
(function () {
  function fill() {
    var els = document.querySelectorAll('[data-pe-price]');
    for (var i = 0; i < els.length; i++) { var v = window.PE_PRICE(els[i].getAttribute('data-pe-price')); if (v) els[i].textContent = v; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
