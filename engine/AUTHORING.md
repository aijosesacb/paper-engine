# The engine — a strict B5 canvas

A small system so that a book written with an AI prints and exports **exactly** as it
looks on screen. There is no builder UI. The canvas is the guarantee: you author inside
a fixed frame, you see the real page, and you export it 1:1.

## The one rule

> Every page is a rigid **176 x 250 mm** box (ISO B5), and the **same CSS drives screen
> and print**. No print-only font swap, no width swap, no image resize. Print just drops
> the on-screen chrome and gives each page its own sheet.

That is why "save as PDF" matches the screen. Adding an `@media print` rule that changes
a size is exactly what makes layout drift, and it is the one thing this engine exists to
prevent.

The second half of the rule: the box **clips**. Content that is too tall does not reflow
onto a second page, shoving everything after it down. It overflows the box, and both the
on-screen badge and `check.mjs` shout about it while you are still writing.

## Files

| File | What it is |
|---|---|
| `sheet.css` | The page frame: the rigid `.sheet` box, the screen "desk", the overflow badge, and the print rules. Shared by every book. Do not edit it to fix one page. |
| `sizes/b5.css` | The B5 trim (`data-size="b5"`). Another size is one more file like this one. |
| `themes/studio.css` | The look: everything under `.sheet.bb`. Copy it and change the tokens to make your own. |
| `fonts/` | Self-hosted woff2 (Space Grotesk, Inter, JetBrains Mono) plus `fonts.css`. The theme imports these instead of a font CDN, so a build is deterministic and works offline. |
| `sheet-tools.js` | Screen-only overflow detector: a red outline and an "N mm over" badge while you edit. `check.mjs` is the authoritative version. |
| `tools/` | The commands. See `tools/README.md`. |

## A page

```html
<html lang="en" data-size="b5">
<head>
  <link rel="stylesheet" href="../../engine/sheet.css">
  <link rel="stylesheet" href="../../engine/sizes/b5.css">
  <link rel="stylesheet" href="../../engine/themes/studio.css">
</head>
<body>
  <main class="deck">
    <section class="sheet bb"> ... one concept ... </section>
    <section class="sheet bb"> ... another ... </section>
  </main>
  <script src="../../engine/sheet-tools.js"></script>
</body>
</html>
```

Books live **two folders deep**, at `books/<slug>/`, so `../../engine/…` is always
correct. Change the depth and every page loses its stylesheet. That failure looks like
plain unstyled text, and it can still measure zero overflow, which is why `check.mjs`
tests for it separately.

Geometry comes from three tokens, so a new trim is one small file and nothing else
changes:

```css
--page-w    page width
--page-h    page height
--page-pad  the safe margin, which lives INSIDE the box
```

## Two kinds of book

Both are the same engine. The difference is only what `book.json` says.

**The interior is a pool.** `books/<slug>/<slug>.html` holds every page you have written,
as `<section class="sheet bb">` blocks. `book.json` decides which of them are in the book
and in what order, matching them **by each page's `<h1 class="title">`**.

That means reordering a book is a JSON edit, never HTML surgery, and an edition (a free
subset, say) is just another list of titles.

## Preview while you write

Open the interior file in Chrome or Edge. The page on the desk **is** the B5 sheet. If a
page is too tall it gets a red outline and a badge telling you by how much. Trim until
the badge disappears, or run `checkSheets()` in the console to re-check.

## The loop

```bash
node engine/tools/build-book.mjs books/<slug>            # -> book.html
node engine/tools/check.mjs      books/<slug>/book.html  # every page 0 mm
node engine/tools/shot.mjs       books/<slug>/book.html  # then LOOK
node engine/tools/export.mjs     books/<slug>/book.html  # -> book.pdf
```

`check.mjs` catches vertical overflow, broken images, and a missing stylesheet. Only the
PNGs catch clipped SVG labels, squashed rows, a photo cropped through its subject, and a
diagram that says the wrong thing. Do both, every time.

## Export by hand

The CSS already makes the browser dialog correct, if you prefer it:
`Ctrl/Cmd + P` then **Save as PDF**, with margins **None**, scale **100**, and background
graphics **on**. `export.mjs` is the version of that which cannot be got wrong.
