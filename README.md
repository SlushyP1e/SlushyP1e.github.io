# slushypie.com

SlushyPie's personal landing page. Flat neutral gray, one flat pastel-pink
accent, soft rounded cards. Made with love ♡

Static HTML/CSS/JS. No build step, no frameworks.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The landing page. Fully self-contained (its CSS and JS are inline). |
| `gif.html` | GIF gallery. Reads its list from the `GIF_FILES` array at the top of its script. |
| `gif/` | The actual gif files. |
| `vrcosc/` | VRCOSC Pulse preset downloads, driven by `vrcosc/manifest.json`. |
| `theme.css` | Shared styles for the two sub-pages only. |

Everything else in the root is favicons and mascot images.

## Editing

- **Landing page text/links/colors** — everything is in `index.html`. There is
  an editing guide comment at the top of its `<style>` block, and each section
  of the body is labeled (Hero, About, Discord, Store, Elsewhere, Final CTA).
- **Colors** — one set of CSS variables at the top of `index.html` for the
  landing page, and a matching set at the top of `theme.css` for the sub-pages.
- **Add a gif** — drop the file in `gif/` and add its filename to `GIF_FILES`
  in `gif.html`.
- **Add a VRCOSC preset** — add the file under `vrcosc/` and list it in
  `vrcosc/manifest.json`.

The hero has a small toggle (desktop only) to switch between the left-aligned
layout (default) and a centered one; the choice is saved to `localStorage`.

External runtime deps (loaded by the browser): Google Fonts and
[lucide](https://lucide.dev) icons via unpkg.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
