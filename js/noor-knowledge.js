/*
 * Noor's knowledge base: answers to the questions international travellers ask most.
 * Used by the chatbot on the homepage (index.html, function localNoorAnswer).
 *
 * HOW TO EDIT: each topic has
 *   id      a short name
 *   when    a pattern of words that trigger it (regular expression, lower case)
 *   answer  the reply (text, or a function that can tailor the reply to the question)
 *   strong  true = checked before tour/price matching (for questions that mention a tour
 *           but are really about something else, e.g. "is lunch included in the Hunza tour?")
 *
 * Facts only Past Enlighten can confirm (deposit, cancellation, permits arranged, hotel level…)
 * are NOT invented here: Noor says the team confirms them in writing and offers WhatsApp.
 * When the team sends those details, replace the TEAM_CONFIRMS wording with the real policy.
 */
(function () {
  'use strict';
  var P = function () { return (window.PE_PRICES && window.PE_PRICES.tours) || {}; };
  var usd = function (n) { return 'US$' + Number(n).toLocaleString('en-US'); };
  var tour = function (id) { var t = P()[id]; return t ? t.name + ' (' + t.duration + ', ' + usd(t.solo) + ' solo)' : id; };
  var TEAM = 'Our team confirms this in writing with your quote. Message us on WhatsApp (+92 334 4770455) and we\'ll reply, usually the same day.';

  // Which region is the question about?
  function region(q) {
    if (/hunza|skardu|deosai|gilgit|fairy meadows|nanga|naran|kaghan|saif|babusar|swat|malam jabba|neelum|kashmir|north|mountain|valley|karakoram|kkh/.test(q)) return 'north';
    if (/bahawalpur|cholistan|desert|multan|harappa|south punjab/.test(q)) return 'south';
    if (/islamabad|rawalpindi/.test(q)) return 'islamabad';
    if (/lahore/.test(q)) return 'lahore';
    return '';
  }

  // "Tips" questions: advice, things to know, how to prepare (not tipping money)
  var TIPS_RE = /\b(tips?|advice|advise|things to know|need to know|should i know|know before|before (i|we) go|before going|before visiting|how to prepare|prepare for|preparation|recommendations?|suggestions?|what to expect|guide to|dos and don'?ts|precautions?)\b/;

  var K = [
    // ---------- greetings & small talk
    { id: 'greeting', when: /^\s*(hi|hello|hey|salam|assalam[ou\- ]*alaikum|aoa|good (morning|afternoon|evening))[\s!.,]*$/,
      answer: 'Wa alaikum assalam, and welcome! I\'m Noor, Past Enlighten\'s guide bot. I can help with tour prices, what\'s included, the best time to visit, visas, safety and planning your days in Pakistan. What would you like to know?' },
    { id: 'thanks', when: /^\s*(thanks|thank you|thx|shukriya|great|perfect|ok(ay)?|cool)[\s!.,]*$/,
      answer: 'You\'re welcome! If you\'d like to go ahead, you can book on the Book page or message our team on WhatsApp. Anything else I can help with?' },
    { id: 'who', when: /\b(who are you|are you (a )?(bot|robot|human|real)|your name)\b/,
      answer: 'I\'m Noor, the Past Enlighten chatbot. I answer common questions instantly. For anything personal to your trip, our human team (led by Bilawal, a Lahore-born guide) replies on WhatsApp at +92 334 4770455.' },

    // ---------- tour tips (Lahore, northern Pakistan & South Punjab)
    { id: 'tips_menu', strong: true, when: /^\s*(tour|travel|trip)?\s*tips\s*[?!.]*\s*$|\b(tour tips|travel tips|any tips|give me (some )?tips|tips please)\b/,
      actions: ['Lahore tips', 'Northern Pakistan tips', 'South Punjab tips', 'Talk to team on WhatsApp'],
      answer: function (q) {
        if (/lahore|north|hunza|skardu|fairy|naran|kaghan|swat|neelum|kashmir|gilgit|south|multan|harappa|bahawalpur|cholistan/.test(q)) return null;
        return 'Tour tips: which region are you visiting?\n• Lahore: mosques and dress code, the Walled City, Wagah, Sufi night, getting around\n• Northern Pakistan: seasons, mountain roads, altitude, cash, checkpoints, plus tips for Hunza, Skardu, Fairy Meadows, Naran, Swat and Neelum\n• South Punjab: desert heat, shrines in Multan, Harappa, Bahawalpur & Cholistan\nTap a region below, or ask, for example, "tips for Hunza".';
      } },

    // Destination-specific tips first, then the general region tips.
    { id: 'tips_hunza', strong: true, when: TIPS_RE, region: /\b(hunza|karimabad|attabad|passu|altit|baltit|nagar|gojal)\b/,
      answer: 'Hunza tips:\n• Base yourself in Karimabad: Baltit and Altit forts, cafés and the Duikar sunset viewpoint are all close.\n• Hunza is friendly and relaxed, but still dress modestly and ask before photographing people.\n• Try local food: apricots (fresh in summer, dried all year), walnut cake and chapshuro (a meat-filled bread).\n• Attabad Lake is cold even in summer, so bring a warm layer for the boat ride.\n• Carry cash: ATMs are few and sometimes empty.\n• Best months: April (apricot blossom) to October (autumn colours).\nOur ' + tour('N1') + ' covers all the highlights.' },
    { id: 'tips_skardu', strong: true, when: TIPS_RE, region: /\b(skardu|deosai|shigar|kachura|shangrila|sarfaranga|satpara|baltistan)\b/,
      answer: 'Skardu & Deosai tips:\n• Deosai is a high plateau (about 4,000 m) and is usually open only in summer (roughly June to September). Bring a warm jacket even in July.\n• The Deosai and cold-desert trips use 4x4 jeeps on rough tracks. Take motion-sickness tablets if you need them.\n• Sunscreen and sunglasses are essential: the high-altitude sun is strong.\n• Flights to Skardu are often cancelled by weather. Our tour goes by road, but allow a spare day if you plan to fly home.\n• Phone signal is weak outside Skardu town.\nOur ' + tour('N2') + ' includes Shangrila, Shigar Fort, the cold desert and Deosai.' },
    { id: 'tips_fairy', strong: true, when: TIPS_RE, region: /\b(fairy meadows?|nanga parbat|raikot|tattu|beyal)\b/,
      answer: 'Fairy Meadows tips:\n• The jeep track from Raikot Bridge to Tattu is narrow and dramatic, done with experienced local drivers.\n• From Tattu it\'s a hike of a few hours uphill to Fairy Meadows (about 3,300 m). Ponies can be hired if you prefer to ride.\n• Pack light: a small backpack, good walking shoes, a warm jacket and a torch (head torch).\n• Accommodation is simple wooden cottages, with limited electricity and almost no phone signal.\n• Nights are cold even in summer. The best months are roughly June to September.\nOur ' + tour('N3') + ' handles the jeep, trek and stay.' },
    { id: 'tips_naran', strong: true, when: TIPS_RE, region: /\b(naran|kaghan|saif|babusar|lulusar|swat|malam jabba|kalam)\b/,
      answer: function (q) {
        if (/swat|malam|kalam/.test(q)) return 'Swat tips:\n• Swat is a conservative area: dress modestly (long sleeves, covered legs, and a scarf for women) and ask before taking photos of people.\n• Don\'t miss the Swat Museum and the Buddhist stupa sites: they\'re the region\'s hidden treasure.\n• Malam Jabba has a chairlift with big views; in winter there\'s snow and skiing.\n• Summer weekends and Eid holidays get busy with domestic tourists, so travelling midweek is calmer.\nOur ' + tour('N-SWAT') + ' covers the highlights.';
        return 'Naran & Kaghan tips:\n• Lake Saif-ul-Malook is reached by a local jeep from Naran, so go early in the morning for calm water and fewer crowds.\n• Babusar Pass is usually open only in summer (roughly June to September or October) and is cold at the top.\n• The valley is very busy on summer weekends and Eid holidays, so midweek is quieter.\n• Bring warm layers, cash (few ATMs) and motion-sickness tablets for the mountain roads.\nOur ' + tour('N-NARAN') + ' includes the lake and Babusar (in season).';
      } },
    { id: 'tips_neelum', strong: true, when: TIPS_RE, region: /\b(neelum|kashmir|sharda|keran|arang kel|kel|azad kashmir|ajk|muzaffarabad)\b/,
      answer: 'Neelum Valley tips:\n• The valley runs along the Line of Control, so foreign visitors may need a permit (NOC) and will pass police checkpoints. Carry your passport, visa and copies. Our team checks the current rules for your dates.\n• Roads get rougher beyond Keran and Sharda, and landslides can close them after heavy rain.\n• Phone signal and ATMs are limited, so bring cash.\n• Arang Kel is reached by a short cable car and a steep walk up, so wear good shoes.\n• Best months: May to October.\nOur ' + tour('N-NEELUM') + ' covers Keran, Sharda and Arang Kel.' },
    { id: 'tips_north', strong: true, when: TIPS_RE, region: /\b(north|northern|mountains?|gilgit|baltistan|karakoram|kkh|valleys?|gb|himalaya\w*)\b/,
      answer: 'Tips for northern Pakistan:\n• Best time: April to October. High passes such as Babusar and Deosai usually open only in summer (roughly June to September).\n• Roads: mountain roads are long and winding, and landslides can cause delays, so keep a spare day in your plan. Take motion-sickness tablets if you need them.\n• Weather: pack warm layers and a jacket even in summer; the sun is strong, so bring sunscreen and sunglasses.\n• Altitude: go slowly, drink plenty of water and tell your guide if you feel unwell.\n• Money: carry enough cash in small notes, as ATMs are few outside Gilgit, Karimabad and Skardu.\n• Phone & power: signal is patchy and power cuts happen, so bring a power bank and download offline maps.\n• Checkpoints: foreigners may be asked to register at police checkpoints, so keep passport and visa copies handy.\n• Culture: people are very hospitable. Dress modestly, and ask before photographing people, especially women.\n• Crowds: summer weekends and Eid holidays are busy with domestic tourists.\nAsk me for tips on a specific place: Hunza, Skardu, Fairy Meadows, Naran, Swat or Neelum.' },
    { id: 'tips_multan', strong: true, when: TIPS_RE, region: /\b(multan|harappa|sahiwal)\b/,
      answer: 'Multan & Harappa tips:\n• Multan is the "City of Saints". At the shrines of Shah Rukn-e-Alam and Bahauddin Zakariya, remove your shoes, dress modestly, and women should cover their hair.\n• Visit shrines early in the morning or near sunset, when the courtyards are cooler and the light is beautiful.\n• Try Multani sohan halwa (a famous local sweet) and look for the city\'s blue-glazed pottery.\n• Harappa is an open archaeological site with little shade. Go early, bring water and a hat, and start at the museum for context.\n• Lahore to Multan is about 4 to 5 hours by motorway.\nOur ' + tour('S2') + ' covers Harappa and Multan.' },
    { id: 'tips_bahawalpur', strong: true, when: TIPS_RE, region: /\b(bahawalpur|cholistan|desert|noor mahal|darbar mahal|sadiq garh)\b/,
      answer: 'Bahawalpur & Cholistan tips:\n• Go between October and March: summers in the desert are extremely hot.\n• Desert days are sunny but winter nights are cold, so bring a warm layer, a hat, sunglasses and sunscreen.\n• Cholistan is explored by 4x4 over sand tracks; keep a scarf handy for dust.\n• The Cholistan Desert Jeep Rally (usually in February) makes the area lively but busy, so book early if your dates match.\n• Dress modestly; South Punjab is more traditional than the big cities.\n• Opening of the palaces to visitors can vary, so our team confirms what\'s accessible for your dates.\nOur ' + tour('S1') + ' covers the palaces and desert life.' },
    { id: 'tips_south', strong: true, when: TIPS_RE, region: /\b(south punjab|southern punjab|south|saraiki)\b/,
      answer: 'Tips for South Punjab:\n• Best time: October to March. From April to September it\'s extremely hot (often above 40°C), so sightsee early and late in the day.\n• Dress: the region is traditional, so wear loose clothes covering arms and legs; women should bring a scarf for shrines.\n• Sun: a wide hat, sunglasses, sunscreen and plenty of water are essential, especially at Harappa and in the Cholistan desert.\n• Shrines: shoes come off, so slip-on shoes are easiest. Visit early morning or at sunset.\n• Money: carry cash for small shops and tips, as cards are rarely accepted outside hotels.\n• Food: try Multani sohan halwa and local desert dishes; drink only bottled or treated water.\n• Language: Saraiki and Urdu are spoken; your guide translates.\nAsk me for tips on Multan & Harappa or Bahawalpur & Cholistan.' },
    { id: 'tips_lahore', strong: true, when: TIPS_RE, region: /\b(lahore|walled city|androon|punjab capital)\b/,
      answer: 'Lahore tips:\n• Best time: October to March. In summer, sightsee early morning and late afternoon.\n• Dress modestly; women should carry a scarf for mosques and shrines, and everyone removes shoes at prayer areas.\n• The Walled City is best explored on foot or by rickshaw early in the morning, before the bazaars get crowded.\n• The Wagah Border ceremony is before sunset, so leave Lahore early to get a seat.\n• Thursday night is Sufi night at Shah Jamal, with drumming and dhamal.\n• Carry small rupee notes; agree rickshaw fares before you ride (or use ride-hailing apps).\n• Drink bottled water and eat at busy, popular places.\nAsk me about food, getting around, safety or useful Urdu phrases in Lahore.' },

    { id: 'sim', strong: true, when: /\b(sim|sim card|mobile data|internet|wifi|wi-fi|phone (work|network)|roaming|esim|network)\b/,
      answer: 'You can buy a local SIM card from a mobile network\'s official shop (bring your passport); your guide can help you get one. Big cities have good 4G. In the northern valleys, signal is weaker and some areas have none, so download offline maps before you go. Hotels usually have Wi-Fi, though it can be slow in the mountains.' },

    // ---------- reviews & booking terms
    { id: 'review', strong: true, when: /\b(leave|write|give|add|post|submit|share)\b.{0,20}\b(a )?(review|feedback|rating)\b|^\s*(review|reviews|feedback|rate (us|you))\s*[?!.]*\s*$|\b(i want to|can i|how (do|can) i) (review|rate)\b/,
      actions: ['Talk to team on WhatsApp'],
      answer: 'Thank you for travelling with us! I\'ve opened a short review form below: pick your stars, write a few words about your tour, and send. Our team reads every review.' },
    { id: 'terms', strong: true, when: /\b(booking terms|payment terms|terms and conditions|terms & conditions|booking conditions|booking policy|policies|policy|how does payment work|booking and payment)\b/,
      answer: function (q) {
        if (/cancel|refund|deposit|\bpay|airport|hotel|meal|change|reschedul|visa|permit|discount|child|kid/.test(q)) return null; // a specific term answers it
        var T = (window.PE_TERMS && window.PE_TERMS.terms) || {};
        var L = (window.PE_TERMS && window.PE_TERMS.labels) || {};
        var order = (window.PE_TERMS && window.PE_TERMS.order) || [];
        var lines = order.filter(function (k) { return T[k]; }).slice(0, 8).map(function (k) { return '• ' + (L[k] || k) + ': ' + T[k]; });
        return 'Our booking & payment terms:\n' + (lines.length ? lines.join('\n') + '\n' : '• Nothing is charged until you agree to a written quote.\n• Prices are per person in US dollars; groups pay less per person.\n') +
          'Full details are on the Booking & Payment page (booking-payment.html).';
      } },

    // ---------- booking, payment & policies (strong: may mention a tour name)
    { id: 'deposit', strong: true, when: /\b(deposit|advance payment|pay (in )?advance|upfront|up front|balance)\b/,
      answer: 'Whether a deposit is needed, and how much, depends on the tour and dates. ' + TEAM },
    { id: 'payment', strong: true, when: /\b(pay(ment)?s?|paying|credit card|debit card|card payment|pay by card|paypal|wise|bank transfer|transfer money|western union|how (do|can) i pay)\b/,
      answer: 'Payment: you don\'t pay anything until you\'ve agreed to a written quote. How you can pay from abroad (for example bank transfer or other options) and in which currency is ' + 'confirmed by our team with your quote. Message us on WhatsApp (+92 334 4770455) if you want to check a payment method first.' },
    { id: 'cancel', strong: true, when: /\b(cancel(l?ation|led|ling)?|refund|money back)\b/,
      answer: function (q) {
        if (/flight|plane|pia|airline/.test(q)) return null; // handled by "flight"
        return 'Cancellation and refunds: the exact policy is written in your quote before you pay, so you know it in advance. ' + TEAM;
      } },
    { id: 'change', strong: true, when: /\b(change|move|reschedul\w*|postpone|shift)\b.*\b(date|dates|day|booking|tour)\b/,
      answer: 'Need different dates? Just tell us as early as you can. We\'ll check availability and confirm any change in writing. ' + 'WhatsApp +92 334 4770455 is the quickest way.' },
    { id: 'howbook', strong: true, when: /\b(how (do|can|to) (i |we )?(book|reserve)|book(ing)? process|make a (booking|reservation)|want to book|i('d| would) like to book|reserve a tour)\b/,
      answer: 'Booking is easy:\n1. Send a request: use the Book page on this website, the "Book Now" button, or WhatsApp +92 334 4770455.\n2. We reply with availability and a written quote (price, pickup and what\'s included), usually the same day.\n3. You confirm only when you\'re happy. Nothing is charged before that.' },
    { id: 'advance', strong: true, when: /\b(how (far|long|early|soon) (in )?(advance|before|ahead)|book (in )?advance|last minute|short notice|how soon)\b/,
      answer: 'Lahore day tours can often be arranged at short notice, a few days ahead is usually fine. Northern and multi-day tours need more planning (drivers, hotels and sometimes permits), so book as early as you can, especially for April to October. Tell us your dates and we\'ll confirm what\'s possible.' },
    { id: 'pricecurrency', strong: true, when: /\b(price|prices|pricing)\b.*\b(usd|dollars?|pkr|rupees?|currency|euro|pounds?)\b|\b(usd|dollars?|currency)\b.*\b(price|prices)\b/,
      answer: 'Yes, all our prices are per person in US dollars (USD). The website shows the solo-traveller price; groups of 2 or more pay less per person. Tell me the tour and how many of you are going and I\'ll give you the exact price.' },
    { id: 'discount', strong: true, when: /\b(discounts?|student|special offers?|promo|coupon|cheaper|deals?|negotiat\w*|best price)\b/,
      answer: 'The prices on our website are for a solo traveller. Groups of 2 or more pay less per person, and children under 5 pay 50%. We don\'t list other fixed discounts (such as student rates); ask our team on WhatsApp and they\'ll tell you what\'s possible for your dates.' },

    // ---------- what's included (strong, per tour where possible)
    { id: 'meals', strong: true, when: /\b(lunch|dinner|breakfast|meals?|food included|is food)\b/,
      answer: function (q, t) {
        if (t && /days?\b/.test(t.duration) && /night/.test(t.duration)) return 'For the ' + t.name + ', which meals are included depends on the hotels and plan you choose. ' + TEAM;
        if (t) return 'Meals are not part of the ' + t.name + ' price. It includes: ' + t.includes.join(', ') + '. Your guide will happily take you to good local places to eat (you pay for your own food).';
        return 'Day tours in Lahore and Islamabad don\'t include meals, but your guide will take you to good local places to eat. For multi-day tours, which meals are included is confirmed in your written quote.';
      } },
    { id: 'pickup', strong: true, when: /\b(pick ?(me|us)? ?up|pickup|pick-up|collect (me|us)|drop ?off|meet(ing)? point|where (do|does) (it|the tour) start)\b/,
      answer: function (q) {
        if (/airport/.test(q)) return null; // handled by "airport"
        return 'Hotel pickup is included on our full-day and multi-day tours (Lahore, Islamabad, the north and South Punjab). The half-day Lahore walks and the night tour meet you at an agreed point in the old city; we can add a car pickup if you prefer. Tell us your hotel when you book.';
      } },
    { id: 'hotels', strong: true, when: /\b(hotels?|accommodation|stay|rooms?|where (do|will) (we|i) sleep|guest ?house)\b/,
      answer: function (q, t) {
        if (/pick|collect|drop/.test(q)) return null;
        if (t && !/night/.test(t.duration)) return 'The ' + t.name + ' is a day tour, so no overnight stay is included. Need help choosing a hotel in Lahore? Ask our team on WhatsApp.';
        return 'Multi-day tours include overnight stays along the route. The hotel standard (for example 3-star or a mountain guesthouse) and room type are confirmed in your written quote. If you want a particular level or a single room, tell us when you request your quote.';
      } },
    { id: 'tickets', strong: true, when: /\b(entry|entrance|ticket|tickets|admission)\b/,
      answer: 'Yes. All our tour prices include entry tickets at the foreigner rate, so you won\'t pay at the gate for the sites on your itinerary.' },
    { id: 'airport', strong: true, when: /\b(airport|arriv(e|al|ing) (in|at)|land(ing)? in|flight (arrives|lands))\b/,
      answer: function (q) {
        if (/cancel|delay/.test(q)) return null;
        return 'Yes, we can arrange a pickup from Lahore or Islamabad airport, with a driver meeting you at arrivals. The airport transfer is priced separately; ' + 'share your flight details and our team will confirm the price in writing.';
      } },
    { id: 'transport', when: /\b(car|vehicle|transport|jeep|4x4|bus|van|drive|driving|driver)\b/,
      answer: 'Full-day and multi-day tours use a private air-conditioned car with a driver (fuel and parking included). Some mountain sections, such as the Fairy Meadows track or Deosai, use local 4x4 jeeps. Bigger groups get a larger vehicle.' },
    { id: 'flight', strong: true, when: /\b(flight|fly|plane|pia)\b.*\b(cancel\w*|delay\w*|weather)\b|\b(cancel\w*|delay\w*)\b.*\b(flight|plane)\b|\bdomestic flight/,
      answer: 'Flights to Skardu and Gilgit depend on mountain weather and are sometimes delayed or cancelled. Our northern tours travel by road in a private car from Islamabad, so you aren\'t relying on those flights. If you plan to fly one way, our team will explain the backup plan in your quote.' },
    { id: 'tips', strong: true, when: /\b(tipping|gratuity|tip (the|my|our|a) (guide|driver|staff)|how much (to|should (i|we)) tip|should (i|we) tip|cash for tips|tips? for (the )?(guide|driver)s?|do (i|we|people) tip|is tipping)\b/,
      answer: 'Tipping isn\'t required, but it is appreciated for good service by guides and drivers. Carry some small rupee notes. There\'s no fixed amount: give what you feel the day was worth.' },
    { id: 'whatincluded', strong: true, when: /\b(what('s| is)? included|what does (the )?(price|tour) include|inclusions?|is everything included)\b/,
      answer: function (q, t) {
        if (t) return t.name + ' (' + t.duration + ') includes: ' + t.includes.join(', ') + '. Not included: meals (on day tours), tips and personal expenses.';
        return 'All tours include an English-speaking guide and entry tickets at the foreigner rate. Full-day and multi-day tours also include a private AC car with driver, fuel, parking and hotel pickup. Half-day Lahore walks include a local expert guide, tickets, shoe baskets at mosques and water. Ask me about a specific tour to see its full list.';
      } },

    // ---------- guide & group
    { id: 'guidelang', strong: true, when: /\b(guide|guides)\b.*\b(english|speak|language)\b|\b(speak|speaks) english\b|\benglish.speaking\b/,
      answer: 'Yes. Your guide speaks English, and all our tours include an English-speaking guide. Past Enlighten is led by Bilawal, a guide born and raised in Lahore\'s Walled City. Need another language? Ask our team.' },
    { id: 'femaleguide', strong: true, when: /\b(female|woman|women|lady|ladies)\b.*\bguide\b|\bguide\b.*\b(female|woman|lady)\b/,
      answer: 'If you\'d prefer a female guide, please ask when you book. Our team will tell you if one is available for your dates.' },
    { id: 'whoguide', when: /\b(who is (the|your|my) guide|bilawal|about (the )?guide|your guides?)\b/,
      answer: 'Past Enlighten is run by Bilawal, a guide born and raised in Lahore\'s Walled City, with a team of local guides and drivers for the north. You can read more on the "About Guide" page.' },
    { id: 'groupsize', strong: true, when: /\b(how many (people|travell?ers|persons)|group size|maximum|max(imum)? (people|group)|minimum)\b/,
      answer: 'There\'s no minimum: you can travel solo. Private tours work for couples, families and bigger groups (we use a larger vehicle). For a large group, tell us the number and we\'ll confirm the arrangements and your group price.' },
    { id: 'private', strong: true, when: /\b(private|shared|join(ing)? (a )?group|other (people|travell?ers|tourists)|just (us|me)|small group|group tour)\b/,
      answer: 'Every tour can be private (just you and your companions) and many can also run as a small shared group. The prices on the website are for a private tour with one traveller; more people means a lower price per person.' },
    { id: 'kids', strong: true, when: /\b(kids?|children|child|baby|babies|infant|toddler|family|families)\b/,
      answer: function (q) {
        if (/\b(how much|price|prices|cost|costs)\b/.test(q)) return null;
        return 'Families are very welcome! Children under 5 pay 50% of the adult price. Tell us the children\'s ages and we\'ll plan an easier pace, rest stops and car seats if needed. Good family picks: the Lahore Walled City & Rangila Rickshaw tour, Islamabad\'s city tour, and Naran or Swat in summer.';
      } },
    { id: 'solo', when: /\b(solo|alone|on my own|by myself|single travell?er)\b/,
      answer: 'Solo travellers are very welcome, and the prices on the website are for one person. Your guide stays with you throughout, which makes getting around easy and comfortable.' },
    { id: 'access', when: /\b(wheelchair|disab\w*|mobility|elderly|senior|walk(ing)? a lot|stairs|steps|fitness|fit enough)\b/,
      answer: 'Tell us about any mobility needs and we\'ll adapt the plan. Many Lahore sites have uneven floors and steps, and some northern trips involve walking at altitude. Fairy Meadows needs a hike of a few hours. Our team will suggest the most comfortable option.' },

    // ---------- visas, permits, health, phone, safety
    { id: 'visa', strong: true, when: /\b(visa|e-?visa|passport|immigration|entry requirements?)\b/,
      answer: 'Most visitors need a visa for Pakistan. Many nationalities can apply online through Pakistan\'s official online visa system (visa.nadra.gov.pk). Requirements differ by passport, so check the official site or your nearest Pakistani embassy. If you need a tour confirmation letter for your application, ask our team.' },
    { id: 'permit', strong: true, when: /\b(permit|noc|no objection|restricted|checkpost|check ?point|police escort|escort)\b/,
      answer: 'Some areas close to the Line of Control (for example parts of Neelum Valley in Kashmir) can need a permit (NOC) for foreign visitors, and some routes have police checkpoints where your passport is registered. The rules change, so our team checks the current requirements for your dates and tells you what\'s needed. Keep your passport and visa copies handy.' },
    { id: 'health', strong: true, when: /\b(vaccin\w*|injection|jab|malaria|health|doctor|medicine|insurance|sick|hospital)\b/,
      answer: function (q) {
        if (/altitude/.test(q)) return null;
        return 'For vaccinations and health advice, please check with your doctor or a travel clinic a few weeks before you travel, and get travel insurance that covers medical care (and mountain areas if you\'re going north). Drink bottled or treated water. In an emergency in Punjab, dial Rescue 1122.';
      } },
    { id: 'altitude', when: /\b(altitude|high altitude|breath\w*|oxygen|elevation|how high)\b/,
      answer: 'Some northern places are high: Deosai is about 4,000 m (13,000 ft) and Fairy Meadows about 3,300 m. Go slowly, drink plenty of water and tell your guide if you feel unwell. Our itineraries go up gradually. If you have heart or lung conditions, check with your doctor first.' },
    { id: 'safefemale', strong: true, when: /\b(female|woman|women|girl|lady)\b.*\b(safe|travel\w*|alone|solo)\b|\b(safe|solo)\b.*\b(female|woman|women|girl|lady)\b/,
      answer: 'Many women travel in Pakistan, solo and in groups. On a private tour your guide stays with you throughout. Helpful tips: dress modestly (loose clothes covering shoulders and legs, and a scarf for mosques), and agree photos before taking pictures of people. Ask our team if you\'d prefer a female guide. Always check your government\'s latest travel advice too.' },
    { id: 'safe', strong: true, when: /\b(safe|safety|danger\w*|secure|security|risk\w*|terror\w*)\b/,
      answer: function (q) {
        var r = region(q);
        var base = 'Thousands of international travellers visit Pakistan every year. Always check your own government\'s latest travel advice before you book and before you go.';
        if (r === 'north') return base + ' In the north, the main concerns are mountain roads and weather, so we use experienced local drivers and keep plans flexible.';
        return base + ' On a private tour your guide plans routes and stays with you throughout. In busy bazaars keep valuables secure, and use pre-arranged transport after dark.';
      } },
    { id: 'alcohol', when: /\b(alcohol|beer|wine|drink(ing)? alcohol|bar|bars|nightlife)\b/,
      answer: 'Pakistan is a Muslim-majority country and alcohol isn\'t openly sold or drunk in public; some upmarket hotels have permit rooms for foreign guests. Nightlife here means food streets, Sufi music nights and late-evening bazaars, which we can show you!' },
    { id: 'veg', when: /\b(vegetarian|vegan|halal|allerg\w*|gluten|diet\w*)\b/,
      answer: 'All meat in Pakistan is halal. Vegetarian food is easy to find: daal (lentils), chana (chickpeas), sabzi (vegetables), paratha and fresh naan. Vegan and allergy needs are possible, so tell your guide and they\'ll help you order.' },

    // ---------- seasons & weather (by region)
    { id: 'season', strong: true, when: /\b(best time|when (should|to|is the best time to) (i |we )?(go|visit|travel|come)|best (month|season)|which month|good (month|time)|weather|temperature|season|(january|february|march|april|may|june|july|august|september|october|november|december)|winter|summer|spring|autumn|snow|cold|hot|monsoon|rain)\b/,
      answer: function (q) {
        if (/\b(how much|price|prices|cost|costs)\b/.test(q)) return null;
        var r = region(q);
        var north = 'Northern Pakistan (Hunza, Skardu, Naran, Swat, Neelum, Fairy Meadows): best from April to October. May–June brings blossom and green valleys, and September–October has clear skies and autumn colours. High places like Babusar Pass and Deosai usually open only in summer (roughly June to September), and winter brings snow and road closures.';
        var lahore = 'Lahore and Islamabad: best from October to March, when days are mild and good for walking. April to June is very hot, July–August is monsoon season, and December–January can be foggy or smoggy in the mornings.';
        var south = 'South Punjab (Bahawalpur, Cholistan, Multan): best from October to March; summers are extremely hot.';
        var monthMatch = q.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/);
        if (monthMatch) {
          var m = ['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(monthMatch[1]);
          var northOk = m >= 3 && m <= 9, lahoreOk = m >= 9 || m <= 2;
          var cap = monthMatch[1].charAt(0).toUpperCase() + monthMatch[1].slice(1);
          var out = cap + ': ' + (lahoreOk ? 'a good time for Lahore, Islamabad and South Punjab. ' : 'hot in Lahore and the south, so sightsee early or late in the day. ') +
            (northOk ? 'Also a good time for the northern valleys.' : 'In the north it\'s cold, and some high roads and lakes may be closed by snow.');
          return out;
        }
        if (r === 'north') return north;
        if (r === 'south') return south;
        if (r === 'lahore' || r === 'islamabad') return lahore;
        return lahore + '\n\n' + north + '\n\n' + south;
      } },
    { id: 'pack', when: /\b(pack|packing|bring|what (to|should i) (wear|bring|pack)|clothes|clothing|luggage|shoes)\b/,
      answer: function (q) {
        if (/mosque|shrine|temple/.test(q)) return null;
        return 'What to pack:\n• Modest, loose clothes covering shoulders and knees (and a scarf for women, for mosques)\n• Comfortable walking shoes, easy to slip off at mosques\n• For the north: warm layers and a jacket even in summer, as evenings are cold; sunscreen and sunglasses\n• Power bank, small rupee notes, a reusable water bottle\n• Copies of your passport and visa';
      } },

    // ---------- distances & travel times
    { id: 'distance', strong: true, when: /\b(how (long|far)|distance|hours? (drive|by road)|travel time|get (from|to)|reach)\b/,
      answer: function (q, t) {
        if (t && /\b(tour|trip|package|itinerary)\b/.test(q) && !/\b(drive|road|from)\b/.test(q)) return t.name + ' is ' + t.duration + ', starting from ' + t.start + '. Price: ' + usd(t.solo) + ' per person for a solo traveller (less per person for groups).';
        if (/lahore/.test(q) && /islamabad/.test(q)) return 'Lahore to Islamabad is about 4 to 5 hours by motorway. We can include this transfer in a combined trip.';
        if (/hunza|gilgit|skardu/.test(q)) return 'From Islamabad to Hunza, Gilgit or Skardu is a long mountain drive, normally split over 2 days with an overnight stop, which is why our northern tours start in Islamabad. The scenery along the Karakoram Highway is part of the trip!';
        if (/naran|swat/.test(q)) return 'Naran and Swat are each roughly half a day to a day\'s drive from Islamabad, which is built into the 3–4 day tours.';
        return null;
      } },

    // ---------- trip planning & itineraries
    { id: 'plan2lahore', when: /\b(2|two|3|three|one|1)\s*(days?|nights?)\b.*\blahore\b|\blahore\b.*\b(2|two|3|three|one|1)\s*(days?|nights?)\b|\bday in lahore\b/,
      answer: function (q) {
        var one = /\b(one|1)\s*day\b|\bday in lahore\b/.test(q) && !/\b(2|two|3|three)\b/.test(q);
        if (one) return 'One day in Lahore? Take the ' + tour('L1') + ': Lahore Fort, Badshahi Mosque, the Walled City and the Wagah Border flag ceremony in one day, with pickup and drop-off.';
        return 'A great 2 to 3 days in Lahore:\n• Day 1: ' + tour('L1') + ', with the Fort, Badshahi Mosque and the Wagah Border ceremony.\n• Day 2: ' + tour('L2') + ' in the morning, and the ' + tour('L4') + ' at night (the Shah Jamal drumming is traditionally on Thursday nights, so ask us for the date).\n• Day 3 (optional): ' + tour('L6') + ' or the ' + tour('L3') + ', then shopping on the ' + tour('L5') + '.\nGroups of 2 or more pay less per person.';
      } },
    { id: 'combine', when: /\b(combine|combination|both|together|\d+\s*days? (in|for|trip)|(10|ten|7|seven|14|fourteen|two weeks|one week|a week|week)\b.*\b(pakistan|trip|days|itinerary))\b|\bitinerary for\b/,
      answer: function (q) {
        if (/lahore/.test(q) && /(hunza|north|skardu)/.test(q) || /\b(10|ten|two weeks|14)\b/.test(q))
          return 'A 10-day Lahore + north idea:\n• Days 1–2: Lahore (' + tour('L1') + ', and the Walled City walk)\n• Day 3: drive Lahore → Islamabad (about 4–5 hours), with an evening in the capital\n• Days 4–8: ' + tour('N1') + '\n• Day 9: ' + tour('I1') + '\n• Day 10: departure from Islamabad\nWe can adjust it to your dates. Send us your plan on WhatsApp for a written quote (groups pay less per person).';
        if (/\b(7|seven|one week|a week)\b/.test(q))
          return 'One week idea: 2 days in Lahore (' + tour('L1') + ' and the Walled City walk), then the ' + tour('N-NARAN') + ' or ' + tour('N-SWAT') + ' from Islamabad. In winter, swap the north for Lahore + ' + tour('S1') + '.';
        return null;
      } },
    { id: 'photo', strong: true, when: /\b(photo\w*|camera|instagram|drone|pictures?|sunrise|sunset)\b/,
      answer: function (q) {
        if (/drone/.test(q)) return 'Drones need permission in Pakistan and are often not allowed near forts, mosques, borders or the Line of Control, so please don\'t bring one without checking with our team first.';
        return 'For photography we recommend:\n• Lahore Walled City early in the morning: soft light and quiet lanes (Heritage Walk or Rickshaw tour)\n• Badshahi Mosque and Wazir Khan Mosque, with their tilework and courtyards\n• Hunza: Passu Cones, Attabad Lake and the Duikar sunset\n• Skardu & Deosai, and Fairy Meadows with Nanga Parbat\nPlease ask before photographing people, especially women. Your guide can help.';
      } },
    { id: 'firsttime', strong: true, when: /\b(first.?time|first visit|never been|which tour (is )?(best|should|do you recommend)|recommend (a|me|us)? ?(tour|trip)|best tour|most popular|must.?do)\b/,
      answer: 'First time in Pakistan? Our most popular combination:\n• Lahore: ' + 'the Lahore Full Day Heritage Tour (Lahore Fort, Badshahi Mosque, the Walled City and the Wagah Border ceremony).\n• North (April–October): the Hunza Valley Tour, with forts, Attabad Lake and the Passu Cones.\nShort on time? The half-day Lahore Fort & Walled City walk is a wonderful introduction. Ask me the price of any of them.' },
    { id: 'trek', when: /\b(hik\w*|trek\w*|walk(ing)? tour|adventure|climb\w*|camping)\b/,
      answer: 'For hiking: the ' + tour('N3') + ' includes the trek up to Fairy Meadows with views of Nanga Parbat. Hunza also has easy walks, like Duikar, the Hussaini bridge and Borith Lake (' + tour('N1') + '). For a gentler walk, try the ' + tour('L-WALK') + ' in Lahore.' },
    { id: 'foodtour', strong: true, when: /\b(food tours?|food walks?|street food tours?|eat(ing)? tours?|cooking class|culinary|foodie)\b/,
      answer: 'We don\'t run a separate food tour yet, but food is part of the experience: the Lahore Full Day tour passes Fort Road Food Street, and your guide will happily take you to the best local spots for nihari, kebabs, halwa puri and lassi (you pay for your own food). We can also plan a custom evening food walk. Just ask on WhatsApp.' },
    { id: 'honeymoon', when: /\b(honeymoon|romantic|anniversary|couple(s)? trip|wedding)\b/,
      answer: 'For couples we love Hunza (' + tour('N1') + '), Skardu & Deosai, and Neelum Valley in Kashmir: quiet valleys, lakes and big mountain views. Every tour is private, so the pace is yours. Couples pay less per person than a solo traveller.' },
    { id: 'spiritual', when: /\b(sufi|qawwali|dhamal|shrine|spiritual|mystic|dervish)\b/,
      answer: 'For Sufi culture: the ' + tour('L4') + ' takes you to Shah Jamal for dhol drumming and dhamal (traditionally on Thursday nights). For qawwali, Data Darbar and other shrines hold sessions on some evenings. Ask us for the best night during your stay. The ' + tour('S2') + ' visits Multan\'s famous Sufi shrines.' },
    { id: 'buddhist', when: /\b(buddh\w*|gandhara|stupa|monaster\w*|taxila)\b/,
      answer: 'For Buddhist heritage, go to Swat: the ' + tour('N-SWAT') + ' visits the Swat Museum and the Butkara Buddhist stupa from the ancient Gandhara civilisation. The Lahore Museum (on the ' + tour('L3') + ') also has famous Gandhara sculptures.' },
    { id: 'history', when: /\b(history|historical|heritage|mughal|ancient|ruins|archaeolog\w*|buddhist|gandhara|indus|unesco)\b/,
      answer: 'History lovers: Lahore\'s Mughal monuments (Lahore Fort, Badshahi Mosque, Shalimar Gardens), the Mughal tombs at Shahdara, the Indus Valley ruins of Harappa (' + tour('S2') + '), Swat\'s Buddhist heritage (' + tour('N-SWAT') + ') and the ancient Sharda site in Neelum Valley.' },
    { id: 'custom', strong: true, when: /\b(custom\w*|tailor\w*|personal\w*|my own (itinerary|plan|tour)|design (my|a) (trip|tour)|flexible|private itinerary)\b/,
      answer: 'Yes, we love custom trips! Use the "Build Your Custom Tour Plan" section on this page: choose your starting city, places, days, vehicle and group size, and send it to us on WhatsApp. We\'ll reply with a written quote.' },
    { id: 'shopping', when: /\b(shopping|souvenirs?|buy|bazaar|market|khussa|carpet|handicraft)\b/,
      answer: 'Shopping: the ' + tour('L5') + ' covers Anarkali Bazaar, Liberty Market and more, and a local helps you find khussa shoes, fabrics and crafts at fair prices. Bargaining is normal in bazaars, but not in malls.' },
    { id: 'wagah', when: /\b(wagah|border ceremony|flag ceremony|flag lowering)\b/,
      answer: 'The Wagah Border flag-lowering ceremony is included in the ' + tour('L1') + '. It happens every evening before sunset (the time changes with the season), and your guide gets you there in good time for a seat.' },

    // ---------- money & contact
    { id: 'currency', when: /\b(currency|rupees?|pkr|exchange|atm|cash|usd cash|dollars cash|money changer)\b/,
      answer: 'Pakistan uses the rupee (PKR). ATMs are common in cities, and US dollars, euros and pounds can be exchanged at banks and licensed money changers (your guide can show you one). Carry cash for bazaars and small shops. Our tour prices are quoted in US dollars.' },
    { id: 'contact', when: /\b(contact|phone number|whatsapp|email|call you|talk to (a )?(human|person|someone)|office|address|where are you (located|based))\b/,
      answer: 'You can reach Past Enlighten on WhatsApp at +92 334 4770455, or by email at infopastenlighten@gmail.com. Our base is on Fort Road in Lahore\'s Walled City. We usually reply the same day (Pakistan time, UTC+5).' },
    { id: 'languages', when: /\b(what language|languages? (do|are) (they|people|spoken)|do people speak english|speak urdu)\b/,
      answer: 'Urdu is the national language and Punjabi is widely spoken in Lahore. English is common in hotels, shops and among younger people in cities, and your guide translates everything else. Learning "Assalam-o-Alaikum" (hello) and "Shukriya" (thank you) goes a long way!' }
  ];


  // ---- Use the booking terms the team saved in the admin dashboard (window.PE_TERMS, loaded by js/pe-backend.js)
  var TERM_KEYS = { deposit: ['deposit', 'balance'], payment: ['payment_methods', 'balance', 'deposit'], cancel: ['cancellation', 'our_cancellation'],
    change: ['date_changes'], airport: ['airport_pickup'], hotels: ['hotels'], meals: ['meals'], femaleguide: ['female_guide'],
    groupsize: ['group_size'], discount: ['discounts'], visa: ['visa_letter'], permit: ['permits'], kids: ['children'], flight: ['our_cancellation'] };
  var PENDING = /written quote|in writing|ask when you book|team will tell you|ask our team on whatsapp/i;
  function withTerms(id, answer) {
    var T = window.PE_TERMS && window.PE_TERMS.terms, L = (window.PE_TERMS && window.PE_TERMS.labels) || {};
    var keys = TERM_KEYS[id];
    if (!T || !keys || !answer) return answer;
    var lines = keys.filter(function (k) { return T[k] && answer.indexOf(T[k]) < 0; }).map(function (k) { return (L[k] || k) + ': ' + T[k]; });
    if (!lines.length) return answer;
    var link = '\nFull details: Booking & Payment page (booking-payment.html).';
    // The general answer only said "the team confirms it": replace it with the real terms
    if (PENDING.test(answer) && !/day tour|meals are not part/i.test(answer)) return lines.join('\n') + link;
    return answer + '\n\n' + lines.join('\n') + link;
  }

  window.NOOR_KNOWLEDGE = K;
  window.noorWithTerms = withTerms;
  window.NOOR_TEAM_CONFIRMS = TEAM;
  window.noorRegion = region;
})();
