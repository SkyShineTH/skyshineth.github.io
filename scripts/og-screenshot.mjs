// Generate the Open Graph / social-preview cover at exactly 1200x630 (retina 2x).
//
//   1) npm i -D playwright   &&   npx playwright install chromium
//   2) Point it at a running site, then run:
//        node scripts/og-screenshot.mjs
//
// Defaults to the local Jekyll dev server. Override with env vars:
//   OG_URL=https://skyshine.online/  node scripts/og-screenshot.mjs
//   OG_OUT=assets/images/og-cover.png OG_THEME=dark node scripts/og-screenshot.mjs

import { chromium } from "playwright";

const URL = process.env.OG_URL || "http://127.0.0.1:4000/";
const OUT = process.env.OG_OUT || "assets/images/og-cover.png";
const THEME = process.env.OG_THEME || "dark"; // dark | light

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2, // -> 2400x1260 source, crisp on retina cards
});

// force the theme before first paint so the cover is deterministic
await context.addInitScript((theme) => {
  try { localStorage.setItem("skyshine-theme", theme); } catch (e) {}
}, THEME);

const page = await context.newPage();
await page.goto(URL, { waitUntil: "networkidle" });

// Frame the introduction as a standalone social card.
await page.addStyleTag({
  content: `
    .site-header, .hero-actions, .hero-social { display: none !important; }
    .hero { min-height: 630px !important; height: 630px !important; padding-block: 34px !important; }
    .hero-visual { height: auto !important; aspect-ratio: 6 / 5 !important; }
    .hero-visual * { animation: none !important; transition: none !important; }
    .reveal { opacity: 1 !important; transform: none !important; }
  `,
});

// Give web fonts a beat to settle.
await page.waitForTimeout(1600);

await page.screenshot({ path: OUT });
await browser.close();
console.log(`Saved ${OUT} (1200x630 @2x) from ${URL} [theme: ${THEME}]`);
