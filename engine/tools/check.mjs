/* ==========================================================================
   check.mjs  -  the gate. Overflow + broken images, as a command.
   --------------------------------------------------------------------------
   Every page is a rigid box that clips. This opens the book in a real browser,
   waits for the fonts, and measures how far past the bottom edge each page's
   content runs. A page is not done until it reads 0 mm here.

   Usage:  node engine/tools/check.mjs <book.html>

   Exit code is 1 if any page overflows or any image failed to load, so it
   works in a script or a CI job.

   What it CANNOT see: overlap, clipped SVG labels, a squashed row, an
   unstyled page from a wrong link depth, or a diagram that says the wrong
   thing. Those only show in the PNGs. Always run shot.mjs and look.
   ========================================================================== */
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node engine/tools/check.mjs <book.html>');
  process.exit(1);
}
const abs = path.resolve(input);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(abs).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const rows = await page.evaluate(() =>
    [...document.querySelectorAll('.sheet')].map((el, i) => ({
      page: i + 1,
      title: (el.querySelector('.title')?.textContent || el.className.replace('sheet', '').trim() || '—').slice(0, 34),
      overMm: Math.max(0, Math.round((el.scrollHeight - el.clientHeight) / 96 * 25.4)),
    })));

  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.getAttribute('src')));

  // A page that lost its stylesheet (wrong ../ depth) renders as unstyled text and can
  // still measure 0 mm. The frame sets a fixed width, so "no fixed width" means no CSS.
  const unstyled = await page.evaluate(() => {
    const s = document.querySelector('.sheet');
    return !s || Math.round(s.getBoundingClientRect().width) < 200;
  });

  console.table(rows);
  const over = rows.filter((r) => r.overMm > 0);
  console.log('pages:', rows.length);
  console.log('overflowing:', over.length ? over.map((r) => `${r.page} (+${r.overMm}mm)`).join(', ') : 'none ✓');
  console.log('broken images:', broken.length ? broken.join(', ') : 'none ✓');
  if (unstyled) console.log('STYLESHEET: not applied ✗  — check the ../../engine/ link depth');

  if (over.length || broken.length || unstyled) {
    console.log('\nNOT READY. Fix the above, then run me again.');
    process.exitCode = 1;
  } else {
    console.log('\nAll pages fit. Now run shot.mjs and LOOK at them.');
  }
} finally {
  await browser.close();
}
