# engine/tools

Five commands. Every one takes paths relative to the repo root, and every one carries a
full usage block at the top of its own file.

One-time setup:

```bash
npm install
npx playwright install chromium
```

## The loop

| Tool | What it does | Run it |
|---|---|---|
| `build-book.mjs` | Wraps your pages in a cover, a copyright page, a contents with real page numbers, a divider per part and an alphabetical index, then writes `book.html`. Driven entirely by `book.json`. | `node engine/tools/build-book.mjs books/<slug>` |
| `check.mjs` | **The gate.** Opens the book in a real browser, waits for the fonts, and measures how far each page runs past the bottom edge. Must read `0 mm`. Also catches broken images and a stylesheet that never loaded. Exits 1 on failure. | `node engine/tools/check.mjs books/<slug>/book.html` |
| `shot.mjs` | One PNG per page, at 2x, so 11px labels are readable. | `node engine/tools/shot.mjs books/<slug>/book.html [out-dir]` |
| `export.mjs` | Deterministic PDF via headless Chrome. Obeys `@page { size:B5; margin:0 }` and prints backgrounds, so the PDF is a 1:1 capture of the screen. | `node engine/tools/export.mjs books/<slug>/book.html [out.pdf]` |

The canonical order: **build, check until every page is 0 mm, shot and READ them,
export.**

`check.mjs` proves a page fits. It cannot see overlap, a clipped label, a squashed row, a
photo cropped through its subject, or a diagram that says the wrong thing. Only the PNGs
show those. Always look.

## Images

| Tool | What it does | Run it |
|---|---|---|
| `gen-image.mjs` | A text prompt into a photograph, for pages whose subject is physical. Two providers: `agy` (default, the Antigravity CLI on your Google account, no key and no per-image charge) and `gemini` (the metered API, needs `GEMINI_API_KEY`). | `node engine/tools/gen-image.mjs "<prompt>" out.jpg --aspect 16:9` |

```bash
node engine/tools/gen-image.mjs --check    # is agy installed, signed in, driver model current?
```

**Diagrams are never generated as images.** They are written as inline SVG, so they stay
text: editable one word at a time, sharp at any size, free, and never spelled wrong.

The prompt rules, and the shared style sentence that makes one book's photos look like
one book, are in `.claude/skills/block/references/photo-blocks.md`.

## Flags worth knowing

```
build-book.mjs  --edition <name>     build a subset listed under "editions" in book.json
                --out <file>         write somewhere other than book.html

gen-image.mjs   --check              verify the CLI before you rely on it
                --provider gemini    the metered fallback
                --aspect 16:9        16:9 suits the page's photo band
                --prompt-file p.txt  keep the prompt in a file, next to the image
                --ref style.jpg      up to 3 reference images, to hold a style
```

Environment, all optional, in a repo-root `.env`: `AGY_BIN`, `AGY_DRIVER_MODEL`,
`GEMINI_API_KEY`. The engine builds books with none of them.
