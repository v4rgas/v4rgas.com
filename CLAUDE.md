# v4rgas.com

Static site with build-time templating. Must stay under 14KB.

## Partials System

Partials use `{{> partial-name}}` syntax, processed at build time by `build.js`.

```
src/partials/
├── head-common.html   # meta, favicon, stylesheet link
├── social-icons.html  # CV, GitHub, LinkedIn icons
└── footer.html        # contact section
```

To add a new partial: create `src/partials/name.html`, use `{{> name}}` in HTML.

## CSS Variables

Design tokens in `src/style.css` at `:root`:

- `--color-bg`, `--color-text`, `--color-text-muted`, `--color-hover`
- `--font-family`
- `--max-width`
- `--space-sm`, `--space-md`, `--space-lg`
- `--icon-size`

## Build

```bash
npm run build
```

Outputs minified files to root. CSS is inlined into index.html.
