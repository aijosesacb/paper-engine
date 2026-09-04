# paper engine

**Write one page at a time. Get a real book.**

A page here is a rigid box, 176 by 250 millimetres, which is B5. The same CSS drives the
screen and the print, so what you are looking at is what comes out of the printer. You
write one concept per page, an AI lays it out and draws the diagram, and a command
wraps the pages in a cover, a contents, part dividers and an index and turns the whole
thing into a PDF.

There is no builder UI and nothing to sign up for. The canvas is the guarantee.

---

## What it makes

Ten pages from ten different subjects, all built by this engine, all in
[`books/showcase/`](books/showcase/):

| | | |
|---|---|---|
| **Resting meat** · cooking | **The bloom** · coffee | **Companion planting** · gardening |
| **Packing cubes** · travel | **Golden hour** · photography | **Progressive overload** · fitness |
| **Spaced repetition** · language | **The fork** · chess | **The emergency fund** · money |
| **Circuit breaker** · code | | |

Same page shape every time. Same colour meanings every time: indigo is the thing being
taught, teal is the good outcome, red is the mistake, amber is the thing worth
protecting. Learn them on page one and by page forty you are reading the picture before
you read the paragraph.

Build it yourself and look: `npm run build -- books/showcase`, then open `book.html`.

---

## Start

You need [Node](https://nodejs.org) 18 or newer. That is all.

```bash
git clone https://github.com/hassancs91/paper-engine
cd paper-engine
npm install
npx playwright install chromium      # the headless browser that measures and exports
```

Then build the showcase, to prove it works:

```bash
npm run build  -- books/showcase              # -> books/showcase/book.html
npm run check  -- books/showcase/book.html    # every page must read 0 mm
npm run shot   -- books/showcase/book.html    # one PNG per page. LOOK at them.
npm run export -- books/showcase/book.html    # -> books/showcase/book.pdf
```

## Your own book

```bash
cp -r books/starter books/my-book
mv books/my-book/starter.html books/my-book/my-book.html
```

Then, in that folder:

1. **`book.json`** — the title, your name, the site in the footer, and the running order.
2. **`VOICE.md`** — how your book sounds. Rewrite it. It is the file that decides whether
   your pages read like you or like a machine.
3. **`blocks.md`** — a line for each page you mean to write.

Now open the folder in Claude Code and say:

> make a block on **&lt;your topic&gt;**

The `/block` skill in `.claude/skills/block/` asks whether you have your own take on it
first, drafts the words in your voice and waits for your edits, then writes the page,
draws the diagram as SVG, and checks that it fits. Rebuild, and it is in the book.

No agent? Copy a `<section class="sheet bb">` out of the showcase and write it by hand.
Nothing here needs an AI. It is just faster with one.

---

## The loop, honestly

```
write a page  ->  build  ->  check  ->  LOOK  ->  export
```

- **`check` proves it fits.** Every page has to read `0 mm`. It also catches broken
  images and a stylesheet that failed to load.
- **`shot` is the part people skip.** The check cannot see overlap, a clipped label, a
  photo cropped through its subject, or a diagram that confidently says the wrong thing.
  Open the PNGs.
- **Only you can check the voice.** Whether this sounds like you, whether the diagram
  says what you meant, whether this is the page you wanted. No tool has an opinion about
  that, so read every page before you publish it.

If a page overflows, cut words. Never shrink the drawing to make room: that clips the
bottom of it and calls the problem solved.

---

## Diagrams are code

Every diagram in this repo is inline SVG that an AI wrote, in the page, as text.

That is not a purity thing, it is four practical wins. You can change one word without
regenerating anything. It prints sharp at any size, because it is vector. It costs
nothing. And the labels are never spelled wrong, which is the thing that gives away a
book nobody checked.

The vocabulary is small on purpose: cards, arrows, numbered badges, a key line, a dashed
boundary. The shape changes with the idea. A fork, a timeline, a before and after, a
tunnel. Full catalogue in
[`.claude/skills/block/references/diagram-system.md`](.claude/skills/block/references/diagram-system.md).

## Photos, when a picture teaches better

Some things are physical. A dish resting, a plant next to its companion, what neatly
packed actually looks like. You cannot draw those, and a diagram of them is worse than
nothing.

```bash
node engine/tools/gen-image.mjs --check
node engine/tools/gen-image.mjs "<prompt>" books/my-book/images/thing.jpg --aspect 16:9
```

The default provider is **agy**, the Antigravity CLI signed into your Google account. It
needs no API key and costs nothing per image, because it runs on a plan you already have.
Install the CLI, run `agy` once to sign in, then `--check`. If a driver model has been
retired, `--check` lists the current ones and you put one in `.env` as
`AGY_DRIVER_MODEL`.

No CLI? `--provider gemini` uses the Gemini image API with a `GEMINI_API_KEY` in `.env`.
Same prompts, metered.

Five of the ten showcase pages were made this way, and **every prompt is in
[`books/showcase/images/`](books/showcase/images/)** next to its photo, so you can see
exactly what produced each one. The rules that matter: no text in the image, say the
light and the angle and the background, and give every photo in one book the same style
sentence so it reads as a book instead of a mood board. Details in
[`photo-blocks.md`](.claude/skills/block/references/photo-blocks.md).

---

## One file, more than one book

`book.json` can carry editions:

```json
"editions": { "free": ["Resting meat", "The bloom", "Progressive overload"] }
```

```bash
npm run build -- books/showcase --edition free    # -> book-free.html
```

Same pages, a shorter book, no second copy to keep in sync. Write the page once and let
it be the page you sell, the post you publish, and the page in the free edition.

---

## What is where

```
engine/
  AUTHORING.md          the one rule, and how the canvas works
  sheet.css             the rigid page frame. read this one.
  sizes/b5.css          the trim. a new size is one file like it.
  themes/studio.css     the look. copy it and change the tokens.
  fonts/                self-hosted, so builds are offline and identical every time
  tools/                build-book, check, shot, export, gen-image
books/
  showcase/             the ten pages above
  starter/              copy this to begin
.claude/skills/block/   how an AI writes a page here: voice, diagrams, design rules
```

## The rules that keep it working

- **Never hand-edit `book.html`.** It is generated. Your work goes in the interior file.
- **Never add an `@media print` rule that changes a size, a font, or an image.** That is
  the one thing that makes a PDF stop matching the screen.
- **Books live two folders deep**, `books/<slug>/`, because every page links
  `../../engine/…`.
- **One concept per page.** If it needs two pages, it is two concepts.

---

## Licence

MIT for the engine. The fonts are SIL Open Font Licence and the showcase photographs are
public domain. **What you make with it is yours**: the licence covers this engine, not
your book, and you owe nothing on what you sell. See [LICENSE](LICENSE).

Built by Hasan Aboul Hasan for his own books, and opened up because the engine was never
the hard part. The hard part is reading every page.
