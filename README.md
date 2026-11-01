# slushypie.com

SlushyPie's personal landing page. A scrapbook on a dark desk: paper, tape,
and one pastel pink. Made with love ♡

Static HTML/CSS/JS. No build step, no frameworks.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The landing page. |
| `gif.html` | GIF gallery. Reads its list from the `GIFS` array at the top of its script. |
| `gif/` | The actual gif files (compressed with ffmpeg — keep new ones small!). |
| `photos/` | VRChat photos and the face tracker picture (webp, keep them small). |
| `theme.css` | The one stylesheet, shared by every page. |
| `site.js` | Shared script: footer year, Aussie clock, copy buttons and toast. |
| `wordmark.webp` | The SlushyPie logo, cropped from the banner. |
| `404.html` | Custom not-found page. Use absolute paths in it. |
| `robots.txt` / `sitemap.xml` | Search engine basics. Add new pages to the sitemap. |

Everything else in the root is favicons and mascot images.

## Editing

- **Landing page text/links** — everything is in `index.html`, and each section
  of the body is labeled (Hero, GIFs, About, Store, Discord, Elsewhere).
- **Colors and fonts** — the variables at the top of `theme.css`.
- **Add a gif** — drop the file in `gif/` and add its filename and pixel size to
  `GIFS` in `gif.html`.

External runtime deps (loaded by the browser): Google Fonts (from
`fonts.googleapis.com`).

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
