/* ==========================================================================
   SPRINGS ESTATE — main.js
   Vanilla ES2020 module: navigation, motion, filtering, gallery, forms.
   No build step required.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Utilities
     ---------------------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  /** Build an Unsplash URL at a target width. */
  const img = (id, w, q) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w || 1400}&q=${q || 80}`;

  /** Build a responsive srcset for an Unsplash image id. */
  const srcset = (id, widths) =>
    (widths || [640, 1024, 1600, 2200]).map((w) => `${img(id, w)} ${w}w`).join(", ");

  const money = (n) =>
    n >= 1e6
      ? "$" + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 2).replace(/\.?0+$/, "") + "M"
      : "$" + n.toLocaleString("en-US");

  const num = (n) => Number(n).toLocaleString("en-US");

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const params = () => new URLSearchParams(window.location.search);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     Icon set (inline SVG, 1.4px stroke, editorial weight)
     ---------------------------------------------------------------------- */
  const ICON = {
    arrow: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowUR: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 11L11 3M5 3h6v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevL: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M11 3L5 9l6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevR: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M7 3l6 6-6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bed: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 18v-8m0 3h18v5m0-5v-2.5A2.5 2.5 0 0 0 18.5 8H12v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="13" r="1.6" stroke="currentColor" stroke-width="1.2"/></svg>',
    bath: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM7 12V6.5A2.5 2.5 0 0 1 9.5 4c1.2 0 2 .8 2.2 1.8M8 19l-1 2m10-2 1 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    area: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="1.2"/><path d="M4 9h16M9 4v16" stroke="currentColor" stroke-width="1.2"/></svg>',
    layers: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M3 13l9 5 9-5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    wine: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3h8l-.6 6a3.4 3.4 0 0 1-6.8 0L8 3ZM12 15v5m-3 1h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    smart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="1.2"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    lift: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3" width="14" height="18" stroke="currentColor" stroke-width="1.2"/><path d="M12 3v18M9 8l-1.5 1.5L6 8m9 8 1.5-1.5L18 16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pool: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 17c1.6 0 2.4 1 4 1s2.4-1 4-1 2.4 1 4 1 2.4-1 4-1M3 21c1.6 0 2.4 1 4 1s2.4-1 4-1 2.4 1 4 1 2.4-1 4-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M7 18V5h6a3 3 0 0 1 0 6H7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    kitchen: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10h16M6 10V6h12v4M5 10v9h14v-9M10 6V3m4 3V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    garden: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21V9m0 0c0-3 2.5-5 6-5 0 3.5-2.5 5-6 5Zm0 4c0-2.5-2-4.5-5-4.5C7 12.5 9 14.5 12 15Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    spa: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20c0-4 3-7 7-7 0 4-3 7-7 7Zm0 0c0-4-3-7-7-7 0 4 3 7 7 7Zm0 0c-2.2-2-3.5-4.5-3.5-7S9.8 8 12 6c2.2 2 3.5 4.5 3.5 7S14.2 18 12 20Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    plane: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.5 13.5 3 11l1.5-2 6.5 1L15 5.5A2 2 0 1 1 18 8l-4.5 4 1 6.5-2 1.5-2.5-7.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    dining: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11M17 3c-1.5 1-2 2.5-2 4s.5 3 2 3.5V21" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    golf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v13M12 3l6 2-6 2M8 21h8a4 4 0 0 0-4-4 4 4 0 0 0-4 4Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    beach: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.2"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    health: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="1.5" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.2"/><rect x="1.5" y="9" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="9" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.2"/></svg>',
    list: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    expand: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 2H2v4M10 14h4v-4M2 6l4.5-4.5M14 10l-4.5 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tour: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2Z" stroke="currentColor" stroke-width="1.2"/><path d="M2 8h12M8 2c1.7 1.7 2.5 3.8 2.5 6S9.7 12.3 8 14c-1.7-1.7-2.5-3.8-2.5-6S6.3 3.7 8 2Z" stroke="currentColor" stroke-width="1.2"/></svg>',
    play: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M6 4.5l8 4.5-8 4.5v-9Z" fill="currentColor"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8m0 0 3-3m-3 3L5 7M3 13h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.5 2 7 5 5.8 6.4a8 8 0 0 0 3.8 3.8L11 9l3 1.5V13c0 .6-.5 1-1 1A11 11 0 0 1 2 3c0-.6.5-1 1-1h2.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" stroke="currentColor" stroke-width="1.2"/><path d="m2 4.5 6 4.5 6-4.5" stroke="currentColor" stroke-width="1.2"/></svg>',
    whatsapp: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.8a6.2 6.2 0 0 0-5.3 9.4L1.8 14.2l3.1-.8A6.2 6.2 0 1 0 8 1.8Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M5.8 5.6c0 2 1.6 3.6 3.6 3.6l.8-1-1.3-.7-.7.5c-.6-.3-1.1-.8-1.4-1.4l.5-.7L6.6 4.6l-.8 1Z" fill="currentColor"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 14s4.5-4 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 10 8 14 8 14Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="8" cy="6.4" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="10.5" stroke="currentColor" stroke-width="1.2"/><path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    ig: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="3" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2.6" stroke="currentColor" stroke-width="1.2"/><circle cx="11.4" cy="4.6" r=".9" fill="currentColor"/></svg>',
    li: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6v7M4 3.4v.1M7.5 13V9c0-1.7 3-1.9 3 0v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    yt: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="4" width="12" height="8" rx="2.4" stroke="currentColor" stroke-width="1.2"/><path d="M7 6.4l3 1.6-3 1.6V6.4Z" fill="currentColor"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v5.5c0 4-3 7.2-7 9.5-4-2.3-7-5.5-7-9.5V6l7-3Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    leaf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19c0-8 5-13 14-13 0 9-5 14-14 13Zm3-2c2-3 4.5-5 8-6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sun: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8m10.6 10.6 1.8 1.8m0-14.2-1.8 1.8M6.7 17.3l-1.8 1.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    gem: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h10l4 6-9 12L3 9l4-6Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M3 9h18M9.5 3 8 9l4 12 4-12-1.5-6" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    key: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="4" stroke="currentColor" stroke-width="1.2"/><path d="m11 11 8 8m-3-3 2-2m-5-1 2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  };

  /* ----------------------------------------------------------------------
     Agents
     ---------------------------------------------------------------------- */
  const AGENTS = {
    a1: {
      name: "Isabella Marchetti",
      role: "Principal Broker · Coastal Collection",
      phone: "+1 (310) 555 0142",
      email: "isabella@springsestate.com",
      photo: img("photo-1573496359142-b8d87734a5a2", 200, 80),
    },
    a2: {
      name: "Julian Ashworth",
      role: "Director · Architectural Estates",
      phone: "+1 (310) 555 0177",
      email: "julian@springsestate.com",
      photo: img("photo-1560250097-0b93528c311a", 200, 80),
    },
    a3: {
      name: "Naomi Reyes",
      role: "Private Client Advisor · Off-Market",
      phone: "+1 (310) 555 0193",
      email: "naomi@springsestate.com",
      photo: img("photo-1580489944761-15a19d654956", 200, 80),
    },
  };

  /* ----------------------------------------------------------------------
     Property catalogue
     ---------------------------------------------------------------------- */
  const P = (o) => o;

  const PROPERTIES = [
    P({
      id: "serena-cliff",
      name: "Villa Serena",
      subtitle: "Cliffside Modernist Residence",
      location: "Serena Cliff, Point Dume",
      city: "Malibu, California",
      price: 24500000,
      beds: 6, baths: 7, sqft: 11200, lot: "2.4 acres", year: 2023,
      status: "available", view: "ocean", type: "villa", levels: 3,
      featured: true,
      coords: [34.0017, -118.8067],
      tags: ["Infinity Edge Pool", "Private Beach Access", "Wine Cellar"],
      blurb:
        "A cantilevered composition of travertine and glass suspended above the Pacific, Villa Serena frames the horizon from every principal room.",
      story:
        "Conceived as a single gesture toward the water, Villa Serena steps down the cliff in three measured terraces. Board-formed concrete anchors the base; above, floor-to-ceiling glazing dissolves the boundary between salon and sea. A 22-metre infinity pool reads as an extension of the horizon line, while a submerged lounge and cedar sauna complete the wellness level.",
      images: [
        "photo-1613490493576-7fde63acd811",
        "photo-1600585154340-be6161a56a0c",
        "photo-1600607687939-ce8a6c25118c",
        "photo-1540541338287-41700207dee6",
        "photo-1600210492486-724fe5c67fb0",
        "photo-1512917774080-9991f1c4c750",
      ],
      interior: [
        ["Wine Cellar", "Temperature-controlled, 2,400-bottle cellar with tasting salon."],
        ["Smart Home Automation", "Crestron control for climate, shade, light and security."],
        ["Private Elevator", "Glass-cabin lift serving all three levels and the pool deck."],
        ["Chef's Kitchen", "Gaggenau suite, quartzite island, concealed scullery."],
      ],
      exterior: [
        ["Infinity Pool", "22 m heated infinity edge with submerged sun ledge."],
        ["Outdoor Kitchen", "Stone-clad summer kitchen with wood-fired oven."],
        ["Landscaped Gardens", "Native coastal planting by Marta Vane, 1.1 acres."],
        ["Guest Pavilion", "Detached two-bedroom pavilion with private terrace."],
      ],
      plans: {
        "Level 1": { area: "4,180 sq ft", rooms: "Salon · Kitchen · Dining · Study", ceiling: "3.6 m", svg: "l1" },
        "Level 2": { area: "3,940 sq ft", rooms: "Primary Suite · 3 Bedrooms · Lounge", ceiling: "3.2 m", svg: "l2" },
        "Rooftop Terrace": { area: "3,080 sq ft", rooms: "Pool Deck · Wellness · Sunset Bar", ceiling: "Open", svg: "l3" },
      },
      agent: "a1",
    }),
    P({
      id: "azura-penthouse",
      name: "Azura Penthouse",
      subtitle: "Sky Residence with Panoramic Terrace",
      location: "Azure Tower, Wilshire Corridor",
      city: "Los Angeles, California",
      price: 18750000,
      beds: 4, baths: 5, sqft: 7640, lot: "Full floor", year: 2022,
      status: "available", view: "city", type: "penthouse", levels: 1,
      featured: true,
      coords: [34.0635, -118.4432],
      tags: ["360° Terrace", "Private Elevator", "Concierge"],
      blurb:
        "The entire thirty-first floor, wrapped in a 1,200 sq ft terrace with 360-degree views from the Pacific to the Hollywood Hills.",
      story:
        "Azura Penthouse occupies a single uninterrupted floorplate. Bronze-framed glazing wraps the perimeter, drawing downtown, ocean and hills into one continuous panorama. Interiors by Halden Studio pair honed limestone with smoked oak; the primary suite opens onto a private garden terrace planted with mature olives.",
      images: [
        "photo-1600607687939-ce8a6c25118c",
        "photo-1600566753086-00f18fb6b3ea",
        "photo-1615529182904-14819c35db37",
        "photo-1600585154526-990dced4db0d",
        "photo-1571003123894-1f0594d2b5d9",
        "photo-1600489000022-c2086d79f9d4",
      ],
      interior: [
        ["Private Elevator", "Direct-to-residence lift with biometric entry."],
        ["Wine Wall", "Glass-fronted 1,200-bottle display and service bar."],
        ["Smart Home Automation", "Whole-floor lighting scenes and motorised drapery."],
        ["Media Lounge", "Dolby Atmos screening room with acoustic panelling."],
      ],
      exterior: [
        ["360° Terrace", "1,200 sq ft with fire table and outdoor kitchen."],
        ["Plunge Pool", "Heated terrace-edge pool with city outlook."],
        ["Sky Garden", "Mature olive and cycad planting with irrigation."],
        ["Concierge", "24-hour doorman, valet and resident-only spa."],
      ],
      plans: {
        "Level 1": { area: "7,640 sq ft", rooms: "Great Room · 4 Suites · Study", ceiling: "3.4 m", svg: "l1" },
        "Terrace": { area: "1,200 sq ft", rooms: "Pool · Dining · Lounge", ceiling: "Open", svg: "l3" },
        "Level 2": { area: "—", rooms: "Not applicable", ceiling: "—", svg: "l2" },
      },
      agent: "a2",
    }),
    P({
      id: "oakridge-manor",
      name: "Oakridge Manor",
      subtitle: "Golf-Front Georgian Estate",
      location: "Oakridge Country Club",
      city: "Montecito, California",
      price: 32900000,
      beds: 7, baths: 9, sqft: 15400, lot: "4.8 acres", year: 2019,
      status: "under-contract", view: "golf", type: "estate", levels: 2,
      featured: true,
      coords: [34.4214, -119.6321],
      tags: ["Golf Frontage", "Tennis Court", "Guest House"],
      blurb:
        "A restrained Georgian elevation set against four acres of parterre gardens, with 300 feet of direct frontage on the championship course.",
      story:
        "Oakridge Manor reinterprets the classical English country house for a Mediterranean climate. Symmetrical wings flank a double-height orangery; the formal gardens, laid out on an axis with the fourteenth green, descend through box parterres to a rose amphitheatre. A separate guest house and staff cottage complete the compound.",
      images: [
        "photo-1580587771525-78b9dba3b914",
        "photo-1568605114967-8130f3a36994",
        "photo-1570129477492-45c003edd2be",
        "photo-1600047509807-ba8f99d2cdde",
        "photo-1600585152220-90363fe7e115",
        "photo-1584622650111-993a426fbf0a",
      ],
      interior: [
        ["Library", "Panelled library with hidden bar and fireplace."],
        ["Wine Cellar", "Brick-vaulted cellar for 3,000 bottles."],
        ["Chef's Kitchen", "La Cornue range, butler's pantry, breakfast room."],
        ["Smart Home Automation", "Integrated audio, climate and gate control."],
      ],
      exterior: [
        ["Tennis Court", "North-south court with pavilion and viewing terrace."],
        ["Landscaped Gardens", "Formal parterres, rose amphitheatre, orchard."],
        ["Outdoor Kitchen", "Loggia kitchen with pizza oven and bar."],
        ["Guest House", "Two-bedroom guest house with private garden."],
      ],
      plans: {
        "Level 1": { area: "8,900 sq ft", rooms: "Formal Rooms · Kitchen · Library", ceiling: "4.1 m", svg: "l1" },
        "Level 2": { area: "6,500 sq ft", rooms: "Primary Suite · 5 Bedrooms", ceiling: "3.5 m", svg: "l2" },
        "Rooftop Terrace": { area: "—", rooms: "Not applicable", ceiling: "—", svg: "l3" },
      },
      agent: "a3",
    }),
    P({
      id: "casa-lumen",
      name: "Casa Lumen",
      subtitle: "Light-Filled Courtyard Villa",
      location: "Las Palmas, Palm Springs",
      city: "Palm Springs, California",
      price: 9850000,
      beds: 5, baths: 5, sqft: 6200, lot: "0.9 acres", year: 2021,
      status: "available", view: "mountain", type: "villa", levels: 1,
      featured: false,
      coords: [33.8303, -116.5453],
      tags: ["Mountain Views", "Courtyard", "Desert Garden"],
      blurb:
        "A single-storey courtyard house oriented to Mount San Jacinto, where every room borrows light from a planted internal garden.",
      story:
        "Casa Lumen is organised around a central courtyard, a strategy that keeps the desert sun at bay while flooding the interior with reflected light. Terrazzo floors run continuously from inside to out; a deep colonnade shades the living wing. The pool terrace faces the mountain at the exact angle of the winter solstice sunset.",
      images: [
        "photo-1512917774080-9991f1c4c750",
        "photo-1600573472550-8090b5e0745e",
        "photo-1556909212-d5b604d0c90d",
        "photo-1502005229762-cf1b2da7c5d6",
        "photo-1600566753190-17f0baa2a6c3",
        "photo-1523217582562-09d0def993a6",
      ],
      interior: [
        ["Chef's Kitchen", "Stainless suite with courtyard servery window."],
        ["Smart Home Automation", "Climate zoning and automated shade control."],
        ["Gallery Hall", "Skylit corridor designed for a private collection."],
        ["Guest Suite", "Detached casita with kitchenette."],
      ],
      exterior: [
        ["Courtyard", "Planted atrium with reflecting pool."],
        ["Infinity Pool", "15 m pool oriented to the mountain ridge."],
        ["Desert Garden", "Drought-adapted planting, drip irrigated."],
        ["Outdoor Kitchen", "Shaded terrace kitchen with grill island."],
      ],
      plans: {
        "Level 1": { area: "6,200 sq ft", rooms: "Courtyard · Great Room · 5 Suites", ceiling: "3.3 m", svg: "l1" },
        "Level 2": { area: "—", rooms: "Not applicable", ceiling: "—", svg: "l2" },
        "Rooftop Terrace": { area: "900 sq ft", rooms: "Observatory Deck", ceiling: "Open", svg: "l3" },
      },
      agent: "a1",
    }),
    P({
      id: "maison-verde",
      name: "Maison Verde",
      subtitle: "Sustainable Hillside Retreat",
      location: "Torrey Pines Reserve",
      city: "La Jolla, California",
      price: 14200000,
      beds: 5, baths: 6, sqft: 8100, lot: "1.6 acres", year: 2024,
      status: "available", view: "ocean", type: "residence", levels: 2,
      featured: true,
      coords: [32.9228, -117.2534],
      tags: ["Net-Zero", "Solar Array", "Ocean Views"],
      blurb:
        "A net-zero residence above the Torrey Pines reserve, clad in charred cedar with a 48 kW solar roof and rainwater cisterns.",
      story:
        "Maison Verde was built to a passive-house standard and produces more energy than it consumes. Cross-laminated timber frames a double-height living volume; rammed-earth walls hold thermal mass. Rainwater is harvested from the butterfly roof and stored in two 30,000-litre cisterns that irrigate the restored coastal sage.",
      images: [
        "photo-1600596542815-ffad4c1539a9",
        "photo-1616486338812-3dadae4b4ace",
        "photo-1600585154340-be6161a56a0c",
        "photo-1616594039964-ae9021a400a0",
        "photo-1449844908441-8829872d2607",
        "photo-1600210492493-0946911123ea",
      ],
      interior: [
        ["Smart Home Automation", "Energy-aware automation with battery reserve."],
        ["Wine Cellar", "Earth-sheltered cellar at constant 13°C."],
        ["Chef's Kitchen", "Induction suite with regenerative ventilation."],
        ["Wellness Suite", "Cedar sauna, cold plunge and treatment room."],
      ],
      exterior: [
        ["Solar Roof", "48 kW array with 60 kWh battery storage."],
        ["Landscaped Gardens", "Restored coastal sage, drip irrigated."],
        ["Infinity Pool", "Salt-water pool with solar thermal heating."],
        ["Rainwater Cisterns", "60,000 L harvest and filtration system."],
      ],
      plans: {
        "Level 1": { area: "4,600 sq ft", rooms: "Living · Kitchen · Wellness", ceiling: "3.8 m", svg: "l1" },
        "Level 2": { area: "3,500 sq ft", rooms: "Primary Suite · 4 Bedrooms", ceiling: "3.1 m", svg: "l2" },
        "Rooftop Terrace": { area: "1,400 sq ft", rooms: "Green Roof · Solar Deck", ceiling: "Open", svg: "l3" },
      },
      agent: "a2",
    }),
    P({
      id: "the-cypress",
      name: "The Cypress",
      subtitle: "Garden Estate with Orchard",
      location: "Cypress Hollow, Napa Valley",
      city: "Napa, California",
      price: 21600000,
      beds: 6, baths: 7, sqft: 9800, lot: "12 acres", year: 2020,
      status: "available", view: "garden", type: "estate", levels: 2,
      featured: false,
      coords: [38.2975, -122.2869],
      tags: ["Vineyard", "Olive Grove", "Guest Barn"],
      blurb:
        "Twelve acres of vineyard and olive grove surrounding a stone-and-timber house with a working crush pad and cellar.",
      story:
        "The Cypress is a working estate as much as a home. Four acres of Cabernet and two of olive trees feed a purpose-built crush pad and cellar cut into the hillside. The residence itself is quietly traditional: fieldstone, reclaimed oak, and a 20-metre pool set among lavender.",
      images: [
        "photo-1583608205776-bfd35f0d9f83",
        "photo-1512915922686-57c11dde9b6b",
        "photo-1600585154526-990dced4db0d",
        "photo-1600566753086-00f18fb6b3ea",
        "photo-1568605114967-8130f3a36994",
        "photo-1584622650111-993a426fbf0a",
      ],
      interior: [
        ["Wine Cellar", "Hillside cellar with crush pad and barrel room."],
        ["Library", "Reclaimed-oak library with reading gallery."],
        ["Chef's Kitchen", "Farmhouse kitchen with La Cornue range."],
        ["Smart Home Automation", "Estate-wide lighting and irrigation control."],
      ],
      exterior: [
        ["Vineyard", "4 acres Cabernet Sauvignon, 2 acres olive."],
        ["Landscaped Gardens", "Lavender parterres and kitchen garden."],
        ["Pool Terrace", "20 m pool with stone loggia."],
        ["Guest Barn", "Converted barn with two suites and studio."],
      ],
      plans: {
        "Level 1": { area: "5,700 sq ft", rooms: "Great Room · Kitchen · Cellar", ceiling: "3.7 m", svg: "l1" },
        "Level 2": { area: "4,100 sq ft", rooms: "Primary Suite · 5 Bedrooms", ceiling: "3.0 m", svg: "l2" },
        "Rooftop Terrace": { area: "—", rooms: "Not applicable", ceiling: "—", svg: "l3" },
      },
      agent: "a3",
    }),
    P({
      id: "sable-house",
      name: "Sable House",
      subtitle: "Dark Minimalist Waterfront",
      location: "Bayshore Marina",
      city: "Newport Beach, California",
      price: 17400000,
      beds: 4, baths: 5, sqft: 6900, lot: "0.4 acres", year: 2023,
      status: "under-contract", view: "ocean", type: "villa", levels: 2,
      featured: false,
      coords: [33.6067, -117.9295],
      tags: ["Private Dock", "Bay Front", "Rooftop Deck"],
      blurb:
        "A monolithic black volume on the bay, with a 60-foot private dock and a rooftop deck that catches the evening light.",
      story:
        "Sable House is deliberately mute from the street, its charred-ash façade opening only to the water. Sliding walls of glass retract entirely, merging the living room with a teak deck and the bay beyond. A private dock accommodates a 60-foot vessel with shore power.",
      images: [
        "photo-1600585154340-be6161a56a0c",
        "photo-1600210492486-724fe5c67fb0",
        "photo-1540541338287-41700207dee6",
        "photo-1600607687939-ce8a6c25118c",
        "photo-1600573472550-8090b5e0745e",
        "photo-1571003123894-1f0594d2b5d9",
      ],
      interior: [
        ["Private Elevator", "Two-stop lift to the rooftop deck."],
        ["Wine Cellar", "Glass cellar wall with 900-bottle capacity."],
        ["Smart Home Automation", "Marine-grade systems and dock monitoring."],
        ["Chef's Kitchen", "Concealed kitchen with teak island."],
      ],
      exterior: [
        ["Private Dock", "60 ft berth with power, water and lift."],
        ["Rooftop Deck", "Sunset deck with spa and fire trough."],
        ["Infinity Pool", "12 m pool cantilevered over the bay."],
        ["Outdoor Kitchen", "Waterfront kitchen with teppanyaki grill."],
      ],
      plans: {
        "Level 1": { area: "3,900 sq ft", rooms: "Living · Kitchen · Dock Room", ceiling: "3.6 m", svg: "l1" },
        "Level 2": { area: "3,000 sq ft", rooms: "Primary Suite · 3 Bedrooms", ceiling: "3.1 m", svg: "l2" },
        "Rooftop Terrace": { area: "1,600 sq ft", rooms: "Spa · Deck · Bar", ceiling: "Open", svg: "l3" },
      },
      agent: "a1",
    }),
    P({
      id: "aria-residences",
      name: "Aria Residence 12",
      subtitle: "Beachfront Tower Residence",
      location: "Aria Tower, Ocean Avenue",
      city: "Santa Monica, California",
      price: 12900000,
      beds: 3, baths: 4, sqft: 5400, lot: "Half floor", year: 2022,
      status: "available", view: "ocean", type: "residence", levels: 1,
      featured: false,
      coords: [34.0141, -118.4965],
      tags: ["Beachfront", "Concierge", "Spa Access"],
      blurb:
        "A half-floor beachfront residence with a 60-foot glass frontage and full resort amenities below.",
      story:
        "Aria Residence 12 offers the amenity of a resort with the privacy of a house. The living volume runs the full ocean frontage, framed by a single 60-foot span of glass. Residents enjoy a spa, lap pool, screening room and a dedicated concierge team.",
      images: [
        "photo-1600566753190-17f0baa2a6c3",
        "photo-1615529182904-14819c35db37",
        "photo-1584622650111-993a426fbf0a",
        "photo-1600489000022-c2086d79f9d4",
        "photo-1556909212-d5b604d0c90d",
        "photo-1600585152220-90363fe7e115",
      ],
      interior: [
        ["Private Elevator", "Secure lift with private lobby."],
        ["Smart Home Automation", "Residence and amenity booking control."],
        ["Chef's Kitchen", "Bulthaup suite with wine column."],
        ["Screening Room", "Resident cinema with Dolby Atmos."],
      ],
      exterior: [
        ["Beach Frontage", "Direct beach access and boardwalk."],
        ["Lap Pool", "25 m residents' pool and sun deck."],
        ["Concierge", "24-hour concierge, valet and porterage."],
        ["Spa", "Hammam, sauna and treatment suites."],
      ],
      plans: {
        "Level 1": { area: "5,400 sq ft", rooms: "Great Room · 3 Suites · Study", ceiling: "3.2 m", svg: "l1" },
        "Level 2": { area: "—", rooms: "Not applicable", ceiling: "—", svg: "l2" },
        "Rooftop Terrace": { area: "800 sq ft", rooms: "Resident Sky Deck", ceiling: "Open", svg: "l3" },
      },
      agent: "a2",
    }),
    P({
      id: "stonewell-farm",
      name: "Stonewell Farm",
      subtitle: "Restored Colonial Farmstead",
      location: "Stonewell Valley",
      city: "Sonoma, California",
      price: 11250000,
      beds: 5, baths: 6, sqft: 7400, lot: "18 acres", year: 2018,
      status: "sold", view: "garden", type: "estate", levels: 2,
      featured: false,
      coords: [38.2919, -122.4580],
      tags: ["Historic", "Orchard", "Barn"],
      blurb:
        "An 1890s farmstead restored over four years, set in eighteen acres of orchard and meadow.",
      story:
        "Stonewell Farm pairs a faithfully restored 1890s farmhouse with a discreet contemporary wing. Original Douglas fir beams were salvaged and re-milled; a new glazed kitchen opens to a walled potager. The timber barn now holds a guest loft and workshop.",
      images: [
        "photo-1570129477492-45c003edd2be",
        "photo-1568605114967-8130f3a36994",
        "photo-1600047509807-ba8f99d2cdde",
        "photo-1583608205776-bfd35f0d9f83",
        "photo-1616486338812-3dadae4b4ace",
        "photo-1512915922686-57c11dde9b6b",
      ],
      interior: [
        ["Library", "Original panelling with restored fireplace."],
        ["Chef's Kitchen", "Glazed garden kitchen with Aga range."],
        ["Wine Cellar", "Stone cellar for 1,500 bottles."],
        ["Guest Loft", "Barn loft with two bedrooms and bath."],
      ],
      exterior: [
        ["Orchard", "Heritage apple and pear, 3 acres."],
        ["Landscaped Gardens", "Walled potager and rose walk."],
        ["Pool Terrace", "18 m pool with stone terrace."],
        ["Barn", "Timber barn with workshop and stabling."],
      ],
      plans: {
        "Level 1": { area: "4,200 sq ft", rooms: "Parlour · Kitchen · Library", ceiling: "3.2 m", svg: "l1" },
        "Level 2": { area: "3,200 sq ft", rooms: "Primary Suite · 4 Bedrooms", ceiling: "2.9 m", svg: "l2" },
        "Rooftop Terrace": { area: "—", rooms: "Not applicable", ceiling: "—", svg: "l3" },
      },
      agent: "a3",
    }),
    P({
      id: "lumen-terraces",
      name: "Lumen Terraces",
      subtitle: "Terraced Hillside Villa",
      location: "Ridgecrest, Beverly Hills",
      city: "Beverly Hills, California",
      price: 28900000,
      beds: 6, baths: 8, sqft: 12400, lot: "1.9 acres", year: 2024,
      status: "available", view: "city", type: "villa", levels: 3,
      featured: false,
      coords: [34.0900, -118.4065],
      tags: ["City Views", "Wellness Level", "Cinema"],
      blurb:
        "Three terraced levels cut into the ridge, each opening to the city skyline across a 30-metre water line.",
      story:
        "Lumen Terraces descends the ridge in three bands of glass and stone. A 30-metre water line runs the length of the main level, spilling to a lower terrace. Below, a wellness floor holds a hammam, gym and 12-seat cinema; above, the primary suite occupies its own wing with a private garden.",
      images: [
        "photo-1600607687939-ce8a6c25118c",
        "photo-1600585154340-be6161a56a0c",
        "photo-1600210492486-724fe5c67fb0",
        "photo-1512917774080-9991f1c4c750",
        "photo-1600566753086-00f18fb6b3ea",
        "photo-1616594039964-ae9021a400a0",
      ],
      interior: [
        ["Wellness Level", "Hammam, gym, cryo and treatment rooms."],
        ["Wine Cellar", "Double-height cellar and tasting gallery."],
        ["Private Elevator", "Glass lift to all three terraces."],
        ["Cinema", "12-seat Dolby Atmos screening room."],
      ],
      exterior: [
        ["Infinity Pool", "30 m water line with city outlook."],
        ["Rooftop Terrace", "Sky garden with outdoor cinema wall."],
        ["Landscaped Gardens", "Terraced Mediterranean planting."],
        ["Outdoor Kitchen", "Two summer kitchens across terraces."],
      ],
      plans: {
        "Level 1": { area: "5,100 sq ft", rooms: "Great Room · Kitchen · Wellness", ceiling: "3.9 m", svg: "l1" },
        "Level 2": { area: "4,600 sq ft", rooms: "Primary Wing · 4 Bedrooms", ceiling: "3.3 m", svg: "l2" },
        "Rooftop Terrace": { area: "2,700 sq ft", rooms: "Sky Garden · Cinema Wall", ceiling: "Open", svg: "l3" },
      },
      agent: "a1",
    }),
  ];

  const byId = (id) => PROPERTIES.find((p) => p.id === id) || null;

  /* ----------------------------------------------------------------------
     Filter + sort taxonomy
     ---------------------------------------------------------------------- */
  const VIEWS = {
    ocean: "Ocean",
    mountain: "Mountain",
    golf: "Golf",
    garden: "Garden",
    city: "City",
  };

  const TYPES = {
    villa: "Villa",
    estate: "Estate",
    penthouse: "Penthouse",
    residence: "Residence",
  };

  const STATUSES = {
    available: "Available",
    "under-contract": "Under Contract",
    sold: "Sold",
  };

  const PRICE_BRACKETS = [
    { key: "all", label: "Any price", test: () => true },
    { key: "0-12", label: "Under $12M", test: (p) => p.price < 12e6 },
    { key: "12-20", label: "$12M – $20M", test: (p) => p.price >= 12e6 && p.price < 20e6 },
    { key: "20-30", label: "$20M – $30M", test: (p) => p.price >= 20e6 && p.price < 30e6 },
    { key: "30+", label: "$30M and above", test: (p) => p.price >= 30e6 },
  ];

  const SORTS = {
    featured: {
      label: "Featured first",
      fn: (a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price,
    },
    "price-desc": { label: "Price · high to low", fn: (a, b) => b.price - a.price },
    "price-asc": { label: "Price · low to high", fn: (a, b) => a.price - b.price },
    "sqft-desc": { label: "Largest first", fn: (a, b) => b.sqft - a.sqft },
    "beds-desc": { label: "Most bedrooms", fn: (a, b) => b.beds - a.beds },
    newest: { label: "Newest first", fn: (a, b) => b.year - a.year },
  };

  /** Apply a filter state object to the catalogue. */
  function filterProperties(state) {
    const bracket = PRICE_BRACKETS.find((b) => b.key === state.price) || PRICE_BRACKETS[0];
    return PROPERTIES.filter((p) => {
      if (state.status && state.status !== "all" && p.status !== state.status) return false;
      if (state.view && state.view !== "all" && p.view !== state.view) return false;
      if (state.type && state.type !== "all" && p.type !== state.type) return false;
      if (state.beds && state.beds !== "all" && p.beds < Number(state.beds)) return false;
      if (state.sqft && state.sqft !== "all" && p.sqft < Number(state.sqft)) return false;
      if (!bracket.test(p)) return false;
      return true;
    });
  }

  /* ----------------------------------------------------------------------
     Shared partials: header / drawer / footer
     ---------------------------------------------------------------------- */
  const NAV = [
    { href: "index.html", label: "Home" },
    { href: "residences.html", label: "Residences" },
    { href: "lifestyle.html", label: "Lifestyle" },
    { href: "property-detail.html", label: "Architecture" },
    { href: "contact.html", label: "Inquire" },
  ];

  const brandMark = () => `
    <svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" stroke="currentColor" stroke-width="1"/>
      <path d="M20 7v26M7 20h26" stroke="currentColor" stroke-width="1"/>
      <path d="M12.5 12.5 27.5 27.5M27.5 12.5 12.5 27.5" stroke="currentColor" stroke-width="1" opacity=".55"/>
      <circle cx="20" cy="20" r="5.5" stroke="currentColor" stroke-width="1"/>
    </svg>`;

  function brandHTML(extraClass) {
    return `
      <a class="brand ${extraClass || ""}" href="index.html" aria-label="Springs Estate — home">
        ${brandMark()}
        <span class="brand__text">
          <span class="brand__name">Springs Estate</span>
          <span class="brand__sub">Architectural Residences</span>
        </span>
      </a>`;
  }

  function mountHeader() {
    const host = $("#site-header");
    if (!host) return;

    const current = document.body.dataset.page || "";
    const links = NAV.map(
      (n) =>
        `<a class="nav__link ${n.href === current ? "is-active" : ""}" href="${n.href}">${n.label}</a>`
    ).join("");

    host.className = "header";
    host.innerHTML = `
      <div class="header__inner">
        ${brandHTML()}
        <nav class="nav" aria-label="Primary">${links}</nav>
        <a class="btn btn--ghost-light btn--sm header__cta" href="contact.html">Schedule a Private Tour</a>
        <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-drawer">
          <span></span><span></span><span></span>
        </button>
      </div>`;

    const drawer = document.createElement("div");
    drawer.id = "site-drawer";
    drawer.className = "drawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = `
      <nav class="drawer__nav" aria-label="Mobile">
        ${NAV.map(
          (n, i) => `
          <a class="drawer__link" href="${n.href}" style="transition-delay:${0.06 * i + 0.12}s">
            <i>0${i + 1}</i><span>${n.label}</span>
          </a>`
        ).join("")}
      </nav>
      <div class="drawer__foot">
        <a class="btn btn--gold btn--block" href="contact.html">Schedule a Private Tour</a>
        <div class="drawer__meta">
          <p class="tiny" style="color:rgba(249,248,246,.5);margin:0 0 .5rem">Private Client Desk</p>
          <p style="margin:0"><a href="tel:+13105550142">+1 (310) 555 0142</a><br><a href="mailto:private@springsestate.com">private@springsestate.com</a></p>
        </div>
      </div>`;
    document.body.appendChild(drawer);

    const burger = $(".burger", host);
    const open = () => {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Close menu");
      document.body.classList.add("is-locked");
      scrollLock(true);
    };
    const close = () => {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("is-locked");
      scrollLock(false);
    };

    on(burger, "click", () =>
      drawer.classList.contains("is-open") ? close() : open()
    );
    $$(".drawer__link, .drawer__foot a", drawer).forEach((a) => on(a, "click", close));
    on(document, "keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024 && drawer.classList.contains("is-open")) close();
    });
  }

  function mountFooter() {
    const host = $("#site-footer");
    if (!host) return;

    host.className = "footer";
    host.innerHTML = `
      <div class="shell">
        <div class="footer__top">
          <div class="footer__brand">
            ${brandHTML()}
            <p>Representing architecturally significant residences and private estates across the California coast since 2004.</p>
            <div class="footer__social" style="margin-top:1.75rem">
              <a href="#" aria-label="Instagram">${ICON.ig}</a>
              <a href="#" aria-label="LinkedIn">${ICON.li}</a>
              <a href="#" aria-label="YouTube">${ICON.yt}</a>
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <div class="footer__links">
              <a href="residences.html">All Residences</a>
              <a href="residences.html?status=available">Available Now</a>
              <a href="residences.html?view=ocean">Ocean Frontage</a>
              <a href="lifestyle.html">Lifestyle & Surroundings</a>
              <a href="property-detail.html">Architecture</a>
            </div>
          </div>
          <div>
            <h5>Private Office</h5>
            <div class="footer__links">
              <a href="contact.html">Schedule a Private Tour</a>
              <a href="contact.html">Off-Market Enquiries</a>
              <a href="contact.html">Private Client Desk</a>
              <a href="tel:+13105550142">+1 (310) 555 0142</a>
              <a href="mailto:private@springsestate.com">private@springsestate.com</a>
            </div>
          </div>
          <div>
            <h5>The Springs Letter</h5>
            <p style="margin:0 0 1rem;color:rgba(249,248,246,.6);font-weight:300;font-size:.9rem">
              New listings and off-market releases, delivered monthly.
            </p>
            <form class="footer__form" data-newsletter novalidate>
              <label class="field field--dark">
                <span>Email address</span>
                <input class="input" type="email" name="email" placeholder="you@example.com" required>
              </label>
              <button class="btn btn--gold btn--block btn--sm" type="submit">Subscribe</button>
              <p class="tiny" data-newsletter-msg style="margin:0;color:rgba(249,248,246,.5);min-height:1.2em"></p>
            </form>
          </div>
        </div>
        <div class="footer__bottom">
          <p style="margin:0">© ${new Date().getFullYear()} Springs Estate. All rights reserved.</p>
          <p style="margin:0">DRE #01987654 · Privacy Policy · Terms of Sale · Accessibility</p>
        </div>
      </div>`;

    $$("[data-newsletter]", host).forEach((form) =>
      on(form, "submit", (e) => {
        e.preventDefault();
        const input = $("input", form);
        const msg = $("[data-newsletter-msg]", form);
        if (!input.checkValidity()) {
          msg.textContent = "Please enter a valid email address.";
          msg.style.color = "#e0a0a0";
          input.focus();
          return;
        }
        msg.textContent = "Thank you — please confirm via the email we sent.";
        msg.style.color = "rgba(249,248,246,.75)";
        form.reset();
      })
    );
  }

  /* ----------------------------------------------------------------------
     Scroll: Lenis smooth scroll + GSAP reveals + header state
     ---------------------------------------------------------------------- */
  let lenis = null;

  function scrollLock(locked) {
    if (lenis) locked ? lenis.stop() : lenis.start();
  }

  function initSmoothScroll() {
    if (reduceMotion) return;
    const L = window.Lenis;
    if (!L) return;
    lenis = new L({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }
  }

  let revealObserver = null;

  function initReveals() {
    const items = $$("[data-reveal]:not(.is-in)");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
      );
    }
    items.forEach((el) => revealObserver.observe(el));
  }

  function initParallax() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    const { gsap } = window;
    gsap.registerPlugin(window.ScrollTrigger);

    $$("[data-parallax]").forEach((el) => {
      const depth = Number(el.dataset.parallax) || 14;
      gsap.fromTo(
        el,
        { yPercent: -depth },
        {
          yPercent: depth,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });

    $$("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = prefix + Math.round(obj.v).toLocaleString("en-US") + suffix;
        },
      });
    });
  }

  function initHeaderState() {
    const header = $(".header");
    const bar = $(".filterbar");
    if (!header) return;
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle("is-stuck", y > 60);
      if (bar) {
        bar.style.top = header.classList.contains("is-stuck")
          ? getComputedStyle(document.documentElement).getPropertyValue("--header-h").trim()
          : "";
      }
      const goingDown = y > last && y > 320;
      header.classList.toggle("is-hidden", goingDown && !$(".drawer.is-open"));
      last = y;
      ticking = false;
    };

    on(
      window,
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  function initAccordions() {
    $$(".accordion").forEach((acc) => {
      $$(".acc-item", acc).forEach((item, i) => {
        const trigger = $(".acc-trigger", item);
        const panel = $(".acc-panel", item);
        if (!trigger || !panel) return;
        if (i === 0) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          panel.style.height = "auto";
        } else {
          trigger.setAttribute("aria-expanded", "false");
        }
        on(trigger, "click", () => {
          const isOpen = item.classList.contains("is-open");
          $$(".acc-item", acc).forEach((other) => {
            if (other === item) return;
            other.classList.remove("is-open");
            const p = $(".acc-panel", other);
            const t = $(".acc-trigger", other);
            if (p) p.style.height = "0px";
            if (t) t.setAttribute("aria-expanded", "false");
          });
          item.classList.toggle("is-open", !isOpen);
          trigger.setAttribute("aria-expanded", String(!isOpen));
          panel.style.height = isOpen ? "0px" : panel.scrollHeight + "px";
        });
      });
    });
    window.addEventListener("resize", () => {
      $$(".acc-item.is-open .acc-panel").forEach((p) => (p.style.height = p.scrollHeight + "px"));
    });
  }

  /* ----------------------------------------------------------------------
     Cards
     ---------------------------------------------------------------------- */
  function specsHTML(p) {
    return `<li>${p.beds} Beds</li><li>${p.baths} Baths</li><li>${num(p.sqft)} sq ft</li>`;
  }

  function statusBadge(p) {
    if (p.status === "sold") return '<span class="badge badge--sold">Sold</span>';
    if (p.status === "under-contract")
      return '<span class="badge badge--emerald">Under Contract</span>';
    return '<span class="badge">Available</span>';
  }

  function cardHTML(p, opts) {
    const o = opts || {};
    return `
      <article class="card" data-reveal ${o.delay ? `data-reveal-delay="${o.delay}"` : ""}>
        <a href="property-detail.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}, ${esc(p.city)}">
          <div class="card__media">
            <img src="${img(p.images[0], 1100)}" srcset="${srcset(p.images[0])}"
                 sizes="(max-width: 780px) 100vw, 50vw" alt="${esc(p.name)} — ${esc(p.subtitle)}"
                 loading="lazy" decoding="async">
            <div class="card__badges">
              ${statusBadge(p)}
              ${p.featured ? '<span class="badge badge--gold">Signature</span>' : ""}
            </div>
            <ul class="card__specs">${specsHTML(p)}</ul>
            <span class="card__price">${money(p.price)}</span>
          </div>
          <div class="card__body">
            <div>
              <h3 class="card__title">${esc(p.name)}</h3>
              <p class="card__loc">${esc(p.location)} · ${esc(p.city.split(",")[0])}</p>
            </div>
            <span class="card__arrow">${ICON.arrowUR}</span>
          </div>
        </a>
      </article>`;
  }

  function rowHTML(p, i) {
    return `
      <article class="row" data-reveal ${i ? `data-reveal-delay="${Math.min(i, 4)}"` : ""}>
        <a class="row__media" href="property-detail.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}">
          <img src="${img(p.images[0], 700)}" alt="${esc(p.name)}" loading="lazy" decoding="async">
        </a>
        <div class="row__info">
          <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.9rem">
            ${statusBadge(p)}
            <span class="badge badge--dark">${esc(VIEWS[p.view] || p.view)} View</span>
          </div>
          <h3><a href="property-detail.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
          <p class="row__loc">${esc(p.location)} · ${esc(p.city)}</p>
          <ul class="row__specs">
            <li><b>${p.beds}</b> Beds</li>
            <li><b>${p.baths}</b> Baths</li>
            <li><b>${num(p.sqft)}</b> sq ft</li>
            <li><b>${esc(p.lot)}</b> Lot</li>
            <li><b>${p.year}</b> Built</li>
          </ul>
        </div>
        <div class="row__aside">
          <span class="row__price">${money(p.price)}</span>
          <a class="btn btn--solid btn--sm" href="property-detail.html?id=${encodeURIComponent(p.id)}">View Residence</a>
        </div>
      </article>`;
  }

  /* ----------------------------------------------------------------------
     Residences catalogue page
     ---------------------------------------------------------------------- */
  const FILTER_DEFAULTS = {
    status: "all",
    price: "all",
    beds: "all",
    sqft: "all",
    view: "all",
    type: "all",
    sort: "featured",
  };

  function optionList(map, allLabel) {
    return (
      `<option value="all">${allLabel}</option>` +
      Object.keys(map)
        .map((k) => `<option value="${k}">${map[k]}</option>`)
        .join("")
    );
  }

  function initResidences() {
    const host = $("#results");
    if (!host) return;

    const form = $("#filters");
    const state = Object.assign({}, FILTER_DEFAULTS);

    // Seed from the query string so deep links work (e.g. ?status=available&view=ocean).
    const qp = params();
    Object.keys(FILTER_DEFAULTS).forEach((k) => {
      if (qp.has(k)) state[k] = qp.get(k);
    });

    const controls = {
      status: $("#f-status"),
      price: $("#f-price"),
      beds: $("#f-beds"),
      sqft: $("#f-sqft"),
      view: $("#f-view"),
      type: $("#f-type"),
      sort: $("#f-sort"),
    };

    let layout = qp.get("layout") === "list" ? "list" : "grid";

    // Reflect seeded state into the controls.
    Object.keys(controls).forEach((k) => {
      const el = controls[k];
      if (!el) return;
      if ($$("option", el).some((o) => o.value === state[k])) el.value = state[k];
    });

    const meta = $("#results-meta");
    const chips = $("#active-chips");

    const LABELS = {
      status: (v) => "Status: " + (STATUSES[v] || v),
      price: (v) => (PRICE_BRACKETS.find((b) => b.key === v) || {}).label || v,
      beds: (v) => v + "+ bedrooms",
      sqft: (v) => v + "+ sq ft",
      view: (v) => (VIEWS[v] || v) + " view",
      type: (v) => TYPES[v] || v,
      sort: (v) => (SORTS[v] || {}).label || v,
    };

    function renderChips() {
      if (!chips) return;
      const active = Object.keys(state).filter(
        (k) => k !== "sort" && state[k] && state[k] !== "all"
      );
      if (!active.length) {
        chips.innerHTML = "";
        chips.style.display = "none";
        return;
      }
      chips.style.display = "flex";
      chips.innerHTML =
        active
          .map(
            (k) =>
              `<span class="chip">${esc(LABELS[k] ? LABELS[k](state[k]) : state[k])}
                 <button type="button" data-clear="${k}" aria-label="Remove filter">${ICON.close}</button>
               </span>`
          )
          .join("") +
        `<button class="chip chip--clear" type="button" data-clear="all">Clear all</button>`;

      $$("[data-clear]", chips).forEach((btn) =>
        on(btn, "click", () => {
          const key = btn.dataset.clear;
          if (key === "all") {
            Object.assign(state, FILTER_DEFAULTS);
            Object.keys(controls).forEach((k) => {
              if (controls[k]) controls[k].value = state[k];
            });
          } else {
            state[key] = "all";
            if (controls[key]) controls[key].value = "all";
          }
          render();
        })
      );
    }

    function render() {
      const list = filterProperties(state).sort(SORTS[state.sort].fn);

      if (meta) {
        meta.innerHTML = `
          <span><b style="color:var(--charcoal);font-weight:600">${list.length}</b> residence${list.length === 1 ? "" : "s"} shown${
          state.status !== "all" ? "" : " of " + PROPERTIES.length
        }</span>
          <span>Sorted by ${esc(SORTS[state.sort].label)}</span>`;
      }

      if (!list.length) {
        host.className = "results results--grid";
        host.innerHTML = `
          <div class="empty">
            <span class="eyebrow">No matches</span>
            <h3 style="margin-top:1rem">Nothing matches this brief</h3>
            <p class="body-muted" style="margin:.75rem auto 2rem;max-width:46ch">
              Adjust your filters, or speak with the private client desk about off-market opportunities.
            </p>
            <button class="btn btn--solid" type="button" data-clear="all">Reset filters</button>
          </div>`;
        on($("[data-clear]", host), "click", () => {
          Object.assign(state, FILTER_DEFAULTS);
          Object.keys(controls).forEach((k) => {
            if (controls[k]) controls[k].value = state[k];
          });
          render();
        });
        renderChips();
        return;
      }

      if (layout === "list") {
        host.className = "results results--list";
        host.innerHTML = list.map(rowHTML).join("");
      } else {
        host.className = "results results--grid";
        host.innerHTML = list
          .map((p, i) => cardHTML(p, { delay: (i % 2) + 1 }))
          .join("");
      }

      // Newly injected nodes need to be observed for reveal animations.
      initReveals();
      renderChips();
    }

    on(form, "submit", (e) => e.preventDefault());

    Object.keys(controls).forEach((k) => {
      on(controls[k], "change", () => {
        state[k] = controls[k].value;
        render();
      });
    });

    $$("[data-layout]").forEach((btn) =>
      on(btn, "click", () => {
        layout = btn.dataset.layout;
        $$("[data-layout]").forEach((b) => b.classList.toggle("is-active", b === btn));
        $$("[data-layout]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === btn))
        );
        render();
      })
    );
    $$("[data-layout]").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.layout === layout)
    );

    render();
  }

  /* ----------------------------------------------------------------------
     Landing page
     ---------------------------------------------------------------------- */
  function initHero() {
    const el = $(".hero-swiper");
    if (!el || !window.Swiper) return;

    const slides = $$(".hero__slide", el).length;
    const counter = $("[data-hero-count]");
    const pad = (n) => String(n).padStart(2, "0");

    const swiper = new window.Swiper(el, {
      loop: slides > 1,
      speed: 1100,
      effect: "fade",
      fadeEffect: { crossFade: true },
      autoplay: slides > 1 ? { delay: 6500, disableOnInteraction: false } : false,
      allowTouchMove: true,
      navigation: false,
      on: {
        init(sw) {
          update(sw.realIndex);
        },
        slideChange(sw) {
          update(sw.realIndex);
        },
      },
    });

    function update(i) {
      if (counter) counter.textContent = `${pad(i + 1)} / ${pad(slides)}`;
      // Replay the slow pan on the active slide.
      const active = $(".swiper-slide-active img", el);
      if (active) {
        active.style.animation = "none";
        void active.offsetWidth;
        active.style.animation = "";
      }
    }

    on($("[data-hero-prev]"), "click", () => swiper.slidePrev());
    on($("[data-hero-next]"), "click", () => swiper.slideNext());
  }

  function initQuickSearch() {
    const form = $("#quick-search");
    if (!form) return;
    on(form, "submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const q = new URLSearchParams();
      ["beds", "price", "view", "sqft"].forEach((k) => {
        const v = data.get(k);
        if (v && v !== "all") q.set(k, v);
      });
      window.location.href = "residences.html" + (q.toString() ? "?" + q.toString() : "");
    });
  }

  function initFeatured() {
    const host = $("#featured");
    if (!host) return;
    const list = PROPERTIES.filter((p) => p.featured).slice(0, 3);
    host.innerHTML = list
      .map(
        (p, i) => `
      <article class="feature ${i % 2 ? "feature--flip" : ""}">
        <div class="feature__media" data-reveal="zoom">
          <span class="feature__index">0${i + 1}</span>
          <a href="property-detail.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}">
            <img src="${img(p.images[0], 1500)}" srcset="${srcset(p.images[0])}"
                 sizes="(max-width: 1024px) 100vw, 60vw" alt="${esc(p.name)}"
                 loading="lazy" decoding="async">
          </a>
        </div>
        <div class="feature__body" data-reveal="right">
          <span class="eyebrow">${esc(VIEWS[p.view] || p.view)} Collection · ${esc(p.city.split(",")[0])}</span>
          <h3 class="h2">${esc(p.name)}</h3>
          <p class="lede" style="font-size:1.02rem">${esc(p.blurb)}</p>
          <ul class="feature__specs">
            <li><b>${p.beds}</b> Beds</li>
            <li><b>${p.baths}</b> Baths</li>
            <li><b>${num(p.sqft)}</b> sq ft</li>
            <li><b>${esc(p.lot)}</b></li>
          </ul>
          <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
            <a class="btn btn--solid" href="property-detail.html?id=${encodeURIComponent(p.id)}">View Residence</a>
            <span class="detail-price" style="font-size:1.5rem">${money(p.price)}</span>
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  function initLandingGrid() {
    const host = $("#estate-grid");
    if (!host) return;
    host.innerHTML = PROPERTIES.filter((p) => p.status !== "sold")
      .slice(0, 4)
      .map((p, i) => cardHTML(p, { delay: (i % 2) + 1 }))
      .join("");
  }

  /* ----------------------------------------------------------------------
     Map (Leaflet)
     ---------------------------------------------------------------------- */
  const PLACES = [
    { name: "Private Jet Terminal", cat: "air", coords: [34.0151, -118.4517], note: "8 min by car" },
    { name: "Onyx — Fine Dining", cat: "dining", coords: [34.0207, -118.4940], note: "12 min" },
    { name: "Oakridge Golf Club", cat: "golf", coords: [34.4214, -119.6321], note: "Members only" },
    { name: "Sable Beach Club", cat: "beach", coords: [34.0089, -118.8100], note: "Private access" },
    { name: "Torrey Pines Reserve", cat: "nature", coords: [32.9228, -117.2534], note: "Coastal trails" },
    { name: "Serena Wellness Spa", cat: "wellness", coords: [34.0240, -118.5010], note: "Resident rates" },
  ];

  const CAT_COLOR = {
    air: "#1f3a2b",
    dining: "#d4af37",
    golf: "#6f6b64",
    beach: "#2a6b8f",
    nature: "#4a7c59",
    wellness: "#8a5a7a",
  };

  function initMap() {
    const el = $("#map");
    if (!el || !window.L) return;

    const map = window.L.map(el, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    }).setView([34.0522, -118.5], 9);

    window.L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    const bounds = [];

    PROPERTIES.forEach((p) => {
      const marker = window.L.circleMarker(p.coords, {
        radius: 7,
        color: "#ffffff",
        weight: 1.5,
        fillColor: p.status === "sold" ? "#6f6b64" : "#1a1a1a",
        fillOpacity: 1,
      }).addTo(map);
      marker.bindPopup(
        `<b>${esc(p.name)}</b>${esc(p.location)}<br>${money(p.price)} · ${p.beds} bd · ${num(p.sqft)} sq ft<br>
         <a href="property-detail.html?id=${encodeURIComponent(p.id)}" style="color:#d4af37">View residence →</a>`
      );
      bounds.push(p.coords);
    });

    PLACES.forEach((pl) => {
      const color = CAT_COLOR[pl.cat] || "#d4af37";
      window.L.marker(pl.coords, {
        icon: window.L.divIcon({
          className: "",
          html: `<span class="pin" style="background:${color}"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 18],
          popupAnchor: [0, -18],
        }),
      })
        .addTo(map)
        .bindPopup(`<b>${esc(pl.name)}</b>${esc(pl.note)}`);
      bounds.push(pl.coords);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [50, 50] });

    // Click-to-activate scroll zoom keeps the page scroll usable.
    on(el, "click", () => map.scrollWheelZoom.enable());
    on(el, "mouseleave", () => map.scrollWheelZoom.disable());
  }

  /* ----------------------------------------------------------------------
     Property detail page
     ---------------------------------------------------------------------- */
  function initGallery(p) {
    const el = $(".gallery-swiper");
    if (!el || !window.Swiper) return;

    const wrap = $(".gallery-swiper .swiper-wrapper", el);
    if (wrap) {
      wrap.innerHTML = p.images
        .map(
          (id, i) => `
        <div class="swiper-slide">
          <img src="${img(id, 1900)}" srcset="${srcset(id)}"
               sizes="100vw" alt="${esc(p.name)} — view ${i + 1}"
               ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        </div>`
        )
        .join("");
    }

    const counter = $("[data-gallery-count]");
    const pad = (n) => String(n).padStart(2, "0");

    const swiper = new window.Swiper(el, {
      slidesPerView: 1,
      speed: 900,
      grabCursor: true,
      keyboard: { enabled: true },
      pagination: { el: $("[data-gallery-pagination]"), clickable: true },
      on: {
        init(sw) {
          if (counter) counter.textContent = `${pad(sw.realIndex + 1)} / ${pad(p.images.length)}`;
        },
        slideChange(sw) {
          if (counter) counter.textContent = `${pad(sw.realIndex + 1)} / ${pad(p.images.length)}`;
        },
      },
    });

    on($("[data-gallery-prev]"), "click", () => swiper.slidePrev());
    on($("[data-gallery-next]"), "click", () => swiper.slideNext());

    // Lightbox
    const lb = $("#lightbox");
    const grid = $("[data-lightbox-grid]", lb);
    if (grid) {
      grid.innerHTML = p.images
        .map(
          (id, i) => `
        <button type="button" data-index="${i}" aria-label="Open image ${i + 1}">
          <img src="${img(id, 520)}" alt="${esc(p.name)} thumbnail ${i + 1}" loading="lazy">
        </button>`
        )
        .join("");
      $$("[data-index]", grid).forEach((btn) =>
        on(btn, "click", () => {
          closeModal(lb);
          swiper.slideTo(Number(btn.dataset.index));
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
        })
      );
    }

    on($("[data-open-lightbox]"), "click", () => openModal(lb));
  }

  function planSVG(kind) {
    // Schematic, not-to-scale line drawings — one per level.
    const common = 'fill="none" stroke="#1a1a1a" stroke-width="1.2" vector-effect="non-scaling-stroke"';
    const soft = 'fill="none" stroke="#1a1a1a" stroke-width="0.8" opacity=".5" vector-effect="non-scaling-stroke"';
    if (kind === "l2") {
      return `
      <svg viewBox="0 0 400 300" role="img" aria-label="Level 2 floor plan">
        <rect x="20" y="20" width="360" height="260" ${common}/>
        <rect x="30" y="30" width="150" height="110" ${soft}/>
        <rect x="190" y="30" width="180" height="110" ${soft}/>
        <rect x="30" y="150" width="110" height="120" ${soft}/>
        <rect x="150" y="150" width="110" height="120" ${soft}/>
        <rect x="270" y="150" width="100" height="120" ${soft}/>
        <text x="40" y="52" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">PRIMARY SUITE</text>
        <text x="200" y="52" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">LOUNGE</text>
        <text x="40" y="172" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">BED 2</text>
        <text x="160" y="172" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">BED 3</text>
        <text x="280" y="172" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">BED 4</text>
      </svg>`;
    }
    if (kind === "l3") {
      return `
      <svg viewBox="0 0 400 300" role="img" aria-label="Rooftop terrace plan">
        <rect x="20" y="20" width="360" height="260" ${common}/>
        <rect x="45" y="55" width="150" height="90" rx="4" ${soft}/>
        <circle cx="285" cy="90" r="46" ${soft}/>
        <rect x="45" y="180" width="310" height="70" ${soft}/>
        <text x="55" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">INFINITY POOL</text>
        <text x="255" y="94" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">WELLNESS</text>
        <text x="55" y="220" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">SUNSET BAR · LOUNGE</text>
      </svg>`;
    }
    return `
      <svg viewBox="0 0 400 300" role="img" aria-label="Level 1 floor plan">
        <rect x="20" y="20" width="360" height="260" ${common}/>
        <rect x="30" y="30" width="190" height="150" ${soft}/>
        <rect x="230" y="30" width="140" height="90" ${soft}/>
        <rect x="230" y="130" width="140" height="50" ${soft}/>
        <rect x="30" y="190" width="120" height="80" ${soft}/>
        <rect x="160" y="190" width="210" height="80" ${soft}/>
        <text x="42" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">GREAT ROOM</text>
        <text x="240" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">KITCHEN</text>
        <text x="240" y="158" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">PANTRY</text>
        <text x="42" y="218" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">STUDY</text>
        <text x="172" y="218" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#6f6b64" letter-spacing="1">TERRACE</text>
      </svg>`;
  }

  function initPlans(p) {
    const host = $("#plans");
    if (!host) return;
    const names = Object.keys(p.plans);

    host.innerHTML = `
      <div class="plans__tabs" role="tablist">
        ${names
          .map(
            (n, i) => `
          <button class="plan-tab ${i === 0 ? "is-active" : ""}" role="tab"
                  aria-selected="${i === 0}" data-plan="${esc(n)}">${esc(n)}</button>`
          )
          .join("")}
      </div>
      ${names
        .map((n, i) => {
          const d = p.plans[n];
          return `
        <div class="plan-panel ${i === 0 ? "is-active" : ""}" data-panel="${esc(n)}" role="tabpanel">
          <div class="plan-visual">${planSVG(d.svg)}</div>
          <div class="plan-info">
            <span class="eyebrow">${esc(n)}</span>
            <h3 class="h3">${esc(p.name)} · ${esc(n)}</h3>
            <dl>
              <div><dt>Floor area</dt><dd>${esc(d.area)}</dd></div>
              <div><dt>Programme</dt><dd>${esc(d.rooms)}</dd></div>
              <div><dt>Ceiling height</dt><dd>${esc(d.ceiling)}</dd></div>
              <div><dt>Drawing set</dt><dd>Rev C · ${p.year}</dd></div>
            </dl>
            <a class="btn btn--solid" href="#" data-download-plan="${esc(n)}">
              ${ICON.download} Download PDF Plan
            </a>
            <p class="tiny" style="color:var(--grey);margin:0">High-resolution PDF · A1 sheet · 4.2 MB</p>
          </div>
        </div>`;
        })
        .join("")}`;

    $$("[data-plan]", host).forEach((tab) =>
      on(tab, "click", () => {
        const name = tab.dataset.plan;
        $$("[data-plan]", host).forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        $$("[data-panel]", host).forEach((pnl) =>
          pnl.classList.toggle("is-active", pnl.dataset.panel === name)
        );
      })
    );

    $$("[data-download-plan]", host).forEach((a) =>
      on(a, "click", (e) => {
        e.preventDefault();
        downloadPlanPDF(p, a.dataset.downloadPlan);
      })
    );
  }

  /** Generate a branded, print-ready plan sheet and trigger a download. */
  function downloadPlanPDF(p, level) {
    const d = p.plans[level] || {};
    const doc = `<!doctype html><html><head><meta charset="utf-8">
      <title>${esc(p.name)} — ${esc(level)} — Springs Estate</title>
      <style>
        @page { size: A1 landscape; margin: 24mm; }
        body { font-family: Georgia, serif; color:#1a1a1a; margin:0; }
        h1 { font-size: 42px; font-weight:400; margin:0 0 6px; letter-spacing:-.5px; }
        .sub { font-family: Arial, sans-serif; font-size: 11px; letter-spacing:.24em;
               text-transform:uppercase; color:#b6912a; margin-bottom:28px; }
        .bar { border-top:1px solid #1a1a1a; margin:18px 0 22px; }
        table { border-collapse:collapse; font-family:Arial,sans-serif; font-size:12px; width:100%; }
        td { padding:9px 0; border-bottom:1px solid #ddd; }
        td:last-child { text-align:right; font-weight:bold; }
        .foot { margin-top:40px; font-family:Arial,sans-serif; font-size:10px; color:#6f6b64; letter-spacing:.12em; }
        svg { max-width: 100%; height: auto; margin-top: 20px; border:1px solid #ddd; }
      </style></head><body>
      <div class="sub">Springs Estate · Architectural Drawings</div>
      <h1>${esc(p.name)} — ${esc(level)}</h1>
      <div>${esc(p.location)} · ${esc(p.city)}</div>
      <div class="bar"></div>
      <table>
        <tr><td>Floor area</td><td>${esc(d.area || "—")}</td></tr>
        <tr><td>Programme</td><td>${esc(d.rooms || "—")}</td></tr>
        <tr><td>Ceiling height</td><td>${esc(d.ceiling || "—")}</td></tr>
        <tr><td>Bedrooms / Bathrooms</td><td>${p.beds} / ${p.baths}</td></tr>
        <tr><td>Total internal area</td><td>${num(p.sqft)} sq ft</td></tr>
        <tr><td>Site</td><td>${esc(p.lot)}</td></tr>
        <tr><td>Drawing revision</td><td>Rev C · ${p.year}</td></tr>
      </table>
      ${planSVG(d.svg)}
      <p class="foot">Schematic drawing — not to scale. Not for construction.
        © ${new Date().getFullYear()} Springs Estate. All rights reserved.</p>
      <script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script>
      </body></html>`;

    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      // Pop-up blocked — fall back to a direct download of the sheet.
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.id}-${level.replace(/\s+/g, "-").toLowerCase()}-floor-plan.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function initBooking(p) {
    const agent = AGENTS[p.agent] || AGENTS.a1;
    const host = $("#booking");
    if (!host) return;

    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const min = iso(today);
    const suggested = iso(new Date(today.getTime() + 3 * 864e5));

    host.innerHTML = `
      <div class="booking__head">
        <div>
          <span class="eyebrow">Private Viewing</span>
          <h3 class="h4" style="margin-top:.5rem">Request an appointment</h3>
        </div>
        <span class="badge badge--gold">${esc(STATUSES[p.status] || p.status)}</span>
      </div>
      <form class="booking__body" id="booking-form" novalidate>
        <label class="field">
          <span>Preferred date</span>
          <input class="input" type="date" name="date" min="${min}" value="${suggested}" required>
        </label>
        <label class="field">
          <span>Preferred time</span>
          <select class="select" name="time">
            <option>Morning · 9–12</option>
            <option selected>Afternoon · 12–16</option>
            <option>Golden hour · 16–18</option>
            <option>Evening · 18–20</option>
          </select>
        </label>
        <div class="field">
          <span>Preferred contact</span>
          <div class="contact-prefs">
            <label class="pref"><input type="radio" name="contact" value="WhatsApp" checked>${ICON.whatsapp} WhatsApp</label>
            <label class="pref"><input type="radio" name="contact" value="Email">${ICON.mail} Email</label>
            <label class="pref"><input type="radio" name="contact" value="Phone">${ICON.phone} Phone</label>
          </div>
        </div>
        <label class="field">
          <span>Full name</span>
          <input class="input" type="text" name="name" placeholder="Your name" required>
        </label>
        <label class="field">
          <span>Email</span>
          <input class="input" type="email" name="email" placeholder="you@example.com" required>
        </label>
        <label class="field">
          <span>Phone / WhatsApp</span>
          <input class="input" type="tel" name="phone" placeholder="+1 ...">
        </label>
        <label class="field">
          <span>Notes for the agent</span>
          <textarea class="textarea" name="notes" placeholder="Anything we should know before your visit?"></textarea>
        </label>
        <button class="btn btn--solid btn--block" type="submit">${ICON.calendar} Request Viewing</button>
        <p class="tiny" data-booking-msg style="margin:0;color:var(--grey);min-height:1.2em"></p>
      </form>
      <div class="booking__agent">
        <img src="${agent.photo}" alt="${esc(agent.name)}" loading="lazy">
        <div>
          <b>${esc(agent.name)}</b>
          <span>${esc(agent.role)}</span>
          <div style="margin-top:.6rem;display:flex;gap:.75rem;font-size:.72rem">
            <a href="tel:${agent.phone.replace(/[^\d+]/g, "")}" style="color:var(--gold-deep)">Call</a>
            <a href="mailto:${agent.email}" style="color:var(--gold-deep)">Email</a>
            <a href="https://wa.me/${agent.phone.replace(/[^\d]/g, "")}" target="_blank" rel="noopener" style="color:var(--gold-deep)">WhatsApp</a>
          </div>
        </div>
      </div>`;

    const form = $("#booking-form", host);
    on(form, "submit", (e) => {
      e.preventDefault();
      const msg = $("[data-booking-msg]", form);
      if (!form.checkValidity()) {
        msg.textContent = "Please complete the required fields.";
        msg.style.color = "#a33";
        const first = $(":invalid", form);
        if (first) first.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      msg.textContent = `Thank you, ${data.name.split(" ")[0] || ""}. ${agent.name} will confirm your viewing by ${data.contact.toLowerCase()}.`;
      msg.style.color = "var(--emerald)";
      form.reset();
    });
  }

  function initDetailFeatures(p) {
    const host = $("#feature-grid");
    if (!host) return;

    const card = (icon, title, items) => `
      <div class="featcard" data-reveal>
        <span class="featcard__ico">${icon}</span>
        <h4>${esc(title)}</h4>
        <ul>${items.map((it) => `<li><b style="color:var(--charcoal);font-weight:600">${esc(it[0])}</b> — ${esc(it[1])}</li>`).join("")}</ul>
      </div>`;

    host.innerHTML = [
      card(ICON.wine, "Interior Amenities", p.interior),
      card(ICON.garden, "Exterior Highlights", p.exterior),
      card(ICON.shield, "Technology & Security", [
        ["Smart Home Automation", "Crestron or Lutron control of lighting, climate and shade."],
        ["Security", "24/7 monitored perimeter, biometric entry, safe room."],
        ["Connectivity", "Cat-6A backbone with whole-house Wi-Fi 6E mesh."],
        ["Acoustics", "Independent acoustic isolation between principal rooms."],
      ]),
      card(ICON.leaf, "Sustainability", [
        ["Envelope", "Passive-house-standard airtightness and triple glazing."],
        ["Energy", "Solar array with battery reserve and heat-pump HVAC."],
        ["Water", "Rainwater harvesting and drought-tolerant planting."],
        ["Materials", "FSC timber, low-carbon concrete, locally quarried stone."],
      ]),
    ].join("");
  }

  function initDetail() {
    const qp = params();
    const id = qp.get("id");
    const p = byId(id) || PROPERTIES[0];

    document.title = `${p.name} — ${p.city} | Springs Estate`;

    const set = (sel, html) => {
      const el = $(sel);
      if (el) el.innerHTML = html;
    };

    set("#detail-breadcrumb", `
      <a href="index.html">Home</a><span>/</span>
      <a href="residences.html">Residences</a><span>/</span>
      <span style="opacity:1;color:var(--gold)">${esc(p.name)}</span>`);

    set("#detail-title", esc(p.name));
    set("#detail-subtitle", esc(p.subtitle));
    set("#detail-location", esc(p.location) + " · " + esc(p.city));
    set("#detail-price", money(p.price));
    set("#detail-status", statusBadge(p));

    set("#detail-specs", `
      <div class="spec"><span>Bedrooms</span><b>${p.beds}</b></div>
      <div class="spec"><span>Bathrooms</span><b>${p.baths}</b></div>
      <div class="spec"><span>Interior</span><b>${num(p.sqft)} sq ft</b></div>
      <div class="spec"><span>Site</span><b>${esc(p.lot)}</b></div>
      <div class="spec"><span>View</span><b>${esc(VIEWS[p.view] || p.view)}</b></div>
      <div class="spec"><span>Built</span><b>${p.year}</b></div>`);

    set("#detail-story", `<p class="lede">${esc(p.blurb)}</p><p class="body-muted">${esc(p.story)}</p>`);

    set("#detail-tags", p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join(""));

    initGallery(p);
    initDetailFeatures(p);
    initPlans(p);
    initBooking(p);

    // 360° tour + video
    const tour = $("#tour-frame");
    if (tour) {
      const startTour = () => {
        tour.innerHTML = `<iframe title="360-degree virtual tour of ${esc(p.name)}"
          src="https://my.matterport.com/show/?m=SxQL3iGyoDo&play=1&brand=0&mls=1&title=0"
          allow="fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy"></iframe>`;
      };
      on($("[data-start-tour]", tour), "click", startTour);
    }
    const vid = $("#video-frame");
    if (vid) {
      on($("[data-start-video]", vid), "click", () => {
        vid.innerHTML = `<video controls autoplay playsinline
          poster="${img(p.images[1], 1600)}">
          <source src="https://videos.pexels.com/video-files/7578540/7578540-hd_1920_1080_30fps.mp4" type="video/mp4">
          Your browser does not support embedded video.
        </video>`;
      });
    }

    // "Similar residences"
    const similar = $("#similar");
    if (similar) {
      const list = PROPERTIES.filter((x) => x.id !== p.id)
        .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
        .slice(0, 3);
      similar.innerHTML = list.map((x, i) => cardHTML(x, { delay: i + 1 })).join("");
    }
  }

  /* ----------------------------------------------------------------------
     Modals
     ---------------------------------------------------------------------- */
  function openModal(el) {
    if (!el) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    scrollLock(true);
    const focusable = $("[data-autofocus]", el) || $("button, a, input", el);
    if (focusable) setTimeout(() => focusable.focus(), 80);
  }

  function closeModal(el) {
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    if (!$(".modal.is-open")) {
      document.body.classList.remove("is-locked");
      scrollLock(false);
    }
  }

  function initModals() {
    $$(".modal").forEach((modal) => {
      on(modal, "click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
      $$("[data-close]", modal).forEach((btn) => on(btn, "click", () => closeModal(modal)));
    });
    on(document, "keydown", (e) => {
      if (e.key === "Escape") $$(".modal.is-open").forEach(closeModal);
    });
  }

  /* ----------------------------------------------------------------------
     Multi-step inquiry form (contact page)
     ---------------------------------------------------------------------- */
  function initInquiryForm() {
    const form = $("#inquiry-form");
    if (!form) return;

    const steps = $$(".formstep", form);
    const indicators = $$(".steps .step");
    const progress = $("[data-progress]", form);
    const back = $("[data-back]", form);
    const next = $("[data-next]", form);
    const submit = $("[data-submit]", form);
    const success = $("#inquiry-success");
    let index = 0;

    function validateStep(step) {
      let ok = true;
      $$("input, select, textarea", step).forEach((el) => {
        if (!el.checkValidity()) {
          ok = false;
          el.classList.add("is-invalid");
        } else {
          el.classList.remove("is-invalid");
        }
      });
      if (!ok) {
        const first = $(":invalid", step);
        if (first) {
          first.focus({ preventScroll: false });
          first.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return ok;
    }

    function show(i) {
      index = clamp(i, 0, steps.length - 1);
      steps.forEach((s, n) => s.classList.toggle("is-active", n === index));
      indicators.forEach((ind, n) => {
        ind.classList.toggle("is-active", n === index);
        ind.classList.toggle("is-done", n < index);
      });
      if (progress) progress.textContent = `Step ${index + 1} of ${steps.length}`;
      if (back) back.style.visibility = index === 0 ? "hidden" : "visible";
      if (next) next.style.display = index === steps.length - 1 ? "none" : "inline-flex";
      if (submit) submit.style.display = index === steps.length - 1 ? "inline-flex" : "none";
      if (index === steps.length - 1) buildReview();
      const card = $(".formcard");
      if (card) {
        const top = card.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }

    function buildReview() {
      const host = $("#review-list", form);
      if (!host) return;
      const d = new FormData(form);
      const get = (k) => (d.get(k) || "—").toString();
      const budgets = d.getAll("budget").join(", ") || "—";
      const prefs = d.getAll("pref").join(", ") || "—";
      const timeline = get("timeline");
      const rows = [
        ["Name", get("name")],
        ["Email", get("email")],
        ["Phone / WhatsApp", get("phone")],
        ["Residence of interest", get("residence")],
        ["Property type", d.getAll("ptype").join(", ") || "—"],
        ["Bedrooms", get("beds") + "+"],
        ["Budget", budgets],
        ["Purchase timeline", timeline],
        ["View preference", d.getAll("view").join(", ") || "—"],
        ["Preferred contact", prefs],
        ["Notes", get("notes")],
      ];
      host.innerHTML = rows
        .map(
          ([k, v]) =>
            `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`
        )
        .join("");
    }

    on(next, "click", () => {
      if (!validateStep(steps[index])) return;
      show(index + 1);
    });
    on(back, "click", () => show(index - 1));

    $$(".choice input", form).forEach((input) =>
      on(input, "change", () => {
        // Single-select groups behave like radios; multi-select like checkboxes.
        const group = input.name;
        if (input.dataset.single !== "true") return;
        $$(`input[name="${group}"]`, form).forEach((other) => {
          if (other !== input) other.checked = false;
        });
      })
    );

    on(form, "submit", (e) => {
      e.preventDefault();
      for (let i = 0; i < steps.length; i++) {
        if (!validateStep(steps[i])) {
          show(i);
          return;
        }
      }
      const ref = "SE-" + Date.now().toString(36).toUpperCase().slice(-6);
      if (success) {
        const refEl = $("[data-ref]", success);
        if (refEl) refEl.textContent = ref;
        form.style.display = "none";
        const stepsBar = $(".steps");
        if (stepsBar) stepsBar.style.display = "none";
        success.classList.add("is-active");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    show(0);
  }

  function initContactSidebar() {
    const host = $("#contact-aside");
    if (!host) return;
    host.innerHTML = `
      <div class="infocard" data-reveal="right">
        <span class="eyebrow eyebrow--light">Private Client Desk</span>
        <h3 class="h3">Speak with an advisor</h3>
        <ul class="info-list">
          <li>
            <span>Telephone</span>
            <b><a href="tel:+13105550142">+1 (310) 555 0142</a></b>
          </li>
          <li>
            <span>Email</span>
            <b><a href="mailto:private@springsestate.com">private@springsestate.com</a></b>
          </li>
          <li>
            <span>WhatsApp</span>
            <b><a href="https://wa.me/13105550142" target="_blank" rel="noopener">Message the desk</a></b>
          </li>
          <li>
            <span>Private office</span>
            <b>1180 Coast Highway, Malibu</b>
          </li>
        </ul>
        <div class="hours">
          <div><span>Monday – Friday</span><b>9:00 – 19:00</b></div>
          <div><span>Saturday</span><b>10:00 – 17:00</b></div>
          <div><span>Sunday</span><b>By appointment</b></div>
        </div>
      </div>
      <div style="border:1px solid var(--line);padding:clamp(1.5rem,3vw,2rem);background:var(--white)" data-reveal="right" data-reveal-delay="1">
        <span class="featcard__ico">${ICON.shield}</span>
        <h4 style="margin:.9rem 0 .6rem">Discretion assured</h4>
        <p class="body-muted" style="margin:0;font-size:.92rem">
          All enquiries are handled under strict confidentiality. Off-market and
          pre-launch listings are released only under NDA to qualified buyers.
        </p>
      </div>`;
  }

  /* ----------------------------------------------------------------------
     Lifestyle page content
     ---------------------------------------------------------------------- */
  function initLifestyle() {
    const host = $("#lifestyle-tiles");
    if (host) {
      const tiles = [
        {
          tag: "Wellness",
          title: "Spa & Longevity",
          text: "Resident access to a hammam, cold plunge and clinical-grade recovery suite, five minutes from the gate.",
          img: "photo-1544161515-4ab6ce6db874",
          wide: true,
        },
        {
          tag: "Dining",
          title: "Chef's Table",
          text: "Two Michelin-starred kitchens within a ten-minute drive.",
          img: "photo-1414235077428-338989a2e8c0",
        },
        {
          tag: "Nature",
          title: "Coastal Reserve",
          text: "1,200 acres of protected headland and coastal trails.",
          img: "photo-1502005229762-cf1b2da7c5d6",
        },
        {
          tag: "Sport",
          title: "Championship Golf",
          text: "Two private courses with reciprocal member privileges.",
          img: "photo-1587174486073-ae5e5cff23aa",
        },
        {
          tag: "Culture",
          title: "Arts & Galleries",
          text: "A curated calendar of private views and collector dinners.",
          img: "photo-1554907984-15263bfd63bd",
        },
        {
          tag: "Travel",
          title: "Private Aviation",
          text: "Eight minutes to the executive jet terminal, door to door.",
          img: "photo-1436491865332-7a61a109cc05",
          wide: true,
        },
      ];
      host.innerHTML = tiles
        .map(
          (t) => `
        <article class="tile ${t.wide ? "tile--wide" : ""}" data-reveal="zoom">
          <img src="${img(t.img, 1200)}" alt="${esc(t.title)}" loading="lazy" decoding="async">
          <div class="tile__body">
            <span class="tile__tag">${esc(t.tag)}</span>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.text)}</p>
          </div>
        </article>`
        )
        .join("");
    }

    const am = $("#lifestyle-amenities");
    if (am) {
      const items = [
        [ICON.spa, "Wellness Pavilion", "Hammam, cryotherapy, movement studio and 25 m lap pool."],
        [ICON.dining, "Private Dining", "In-residence chef service and cellar pairings on request."],
        [ICON.plane, "Private Aviation", "Executive terminal with customs clearance on arrival."],
        [ICON.golf, "Golf & Racquet", "Two courses and a racquet club within the estate network."],
        [ICON.beach, "Beach Club", "Members' clubhouse, cabanas and boat valet."],
        [ICON.health, "Concierge Health", "Resident physician and 24-hour clinical concierge."],
      ];
      am.innerHTML = items
        .map(
          (it) => `
        <div class="amenity" data-reveal>
          <span class="amenity__ico">${it[0]}</span>
          <h4>${esc(it[1])}</h4>
          <p>${esc(it[2])}</p>
        </div>`
        )
        .join("");
    }

    // Verify the extra lifestyle imagery exists; fall back gracefully.
    $$("#lifestyle-tiles img").forEach((im) =>
      on(im, "error", () => {
        im.src = img("photo-1600585154340-be6161a56a0c", 1200);
      })
    );
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function boot() {
    mountHeader();
    mountFooter();
    initModals();
    initHeaderState();
    initSmoothScroll();
    initParallax();
    initAccordions();

    const page = document.body.dataset.page;
    if (page === "home") {
      initHero();
      initQuickSearch();
      initFeatured();
      initLandingGrid();
      initMap();
    } else if (page === "residences") {
      initResidences();
    } else if (page === "detail") {
      initDetail();
    } else if (page === "lifestyle") {
      initLifestyle();
      initMap();
    } else if (page === "contact") {
      initInquiryForm();
      initContactSidebar();
    }

    initReveals();

    // Refresh ScrollTrigger once fonts and images have settled.
    window.addEventListener("load", () => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Exposed for debugging / console inspection.
  window.SpringsEstate = { PROPERTIES, filterProperties, byId, AGENTS, VIEWS, TYPES, STATUSES };
})();
