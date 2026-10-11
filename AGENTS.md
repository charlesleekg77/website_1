# Springs Estate — repository notes

Ultra-luxury real estate / architectural portfolio site. Originally briefed as a
Next.js (App Router) project, but delivered as a **zero-build static site** using
HTML + CDN React-era libraries, because the sandbox has no package registry
access. There is no `npm install`, no bundler, and no build step.

## Run it

```bash
python3 -m http.server 12000 --bind 0.0.0.0
```

Then open `index.html`. Files are served verbatim — edit and reload, no rebuild.

## File map

| File | Purpose |
|---|---|
| `index.html` | Landing: hero slider, quick search, curated estates, philosophy, map |
| `residences.html` | Catalogue: sticky filter bar, grid/list switcher, sort |
| `property-detail.html` | Detail: gallery, tour/video, features, floor plans, booking sidebar |
| `lifestyle.html` | Storytelling layout, tiles, amenities, map |
| `contact.html` | 4-step inquiry form with review + NDA/privacy consent |
| `style.css` | Entire design system (single file, section-numbered) |
| `main.js` | All behaviour (single IIFE). Header/footer are injected from here |

## Key conventions

- **Every page** must set `<body data-page="…">`. `main.js` boots per-page
  behaviour by switching on that value (`home` / `residences` / `detail` /
  `lifestyle` / `contact`).
- **Header, drawer and footer are generated in `main.js`** (`mountHeader`,
  `mountFooter`) and injected into `#site-header` / `#site-footer`. Edit the
  nav in the `NAV` array, not in each HTML file.
- **Property catalogue lives in `main.js`** as the `PROPERTIES` array; filters
  read from the `VIEWS` / `TYPES` / `STATUSES` / `PRICE_BRACKETS` / `SORTS`
  taxonomy maps. Add a residence there and it appears everywhere automatically.
- **Deep links**: `residences.html?status=available&view=ocean&layout=list` and
  `property-detail.html?id=<property-id>`. Filter state also accepts the same
  keys as the quick-search bar on the landing page.
- **Tailwind** is loaded from the CDN with `corePlugins.preflight = false` so it
  only supplies utilities and never overrides the design system. All real
  styling is in `style.css`.
- **Scroll motion**: Lenis (smooth scroll) + GSAP/ScrollTrigger (parallax,
  counters) + an IntersectionObserver for `[data-reveal]` fades. All of it
  no-ops under `prefers-reduced-motion`.

## Gotchas

- `downloadPlanPDF()` (in `main.js`) generates a print-ready plan sheet client
  side and opens the print dialog — it does not ship real PDF binaries.
- The 360° tour embeds a public Matterport demo; the video uses a Pexels CDN
  file. Both are illustrative placeholders.
- Imagery is hot-linked from Unsplash. Verified IDs are in `main.js`; there is
  an `on("error")` fallback on the lifestyle tiles only.
- Map tiles come from CARTO / OpenStreetMap via Leaflet.
