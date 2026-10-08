# Gallery media — Team Roboto RB/25

Drop your project photos and videos here and list them in `manifest.json`.
The gallery section (`#gallery`) renders them automatically — no code changes.

## How to add media

1. Copy your file into this folder, e.g. `run-02.jpg` or `arena-demo.mp4`.
2. Add an entry to `manifest.json`:

```json
[
  { "src": "run-02.jpg",  "type": "img",   "cap": "ARENA TEST RUN" },
  { "src": "arena-demo.mp4", "type": "video", "cap": "ARENA DEMO — FULL RUN" }
]
```

- `src` — the filename (URL-encoding handled automatically; avoid spaces).
- `type` — `"img"` for photos, `"video"` for clips (MP4 H.264 recommended).
- `cap` — the small label shown on the tile and in the lightbox.

## Notes

- If `manifest.json` is missing or unreadable, the gallery falls back to six
  built-in placeholder slots (4 photos + 2 videos) that show a "DROP FILE"
  card with the expected filename.
- Tiles open a terminal-styled lightbox; videos play with controls and audio.
- `_placeholder-photo.svg` / `_placeholder-video.svg` are optional themed
  stand-in images you can reference while a slot is still empty.
- Keep clips short (< 30 s) and under ~10 MB so the page stays fast; the
  browser only fetches video metadata until the tile is clicked.
