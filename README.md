# EDiT data catalog

**Elsystemets digitala tvilling** — a national, open data commons for analysing, monitoring,
optimising and controlling power grids. A work package in *Elflexibel industri* (led by RISE,
hosted at KTH, funded by Vinnova).

Every dataset in the commons is one JSON file in `datasets/`, validated against
`schema/dataset.schema.json`. Hosted, linked, and contributed data all use the **same** record;
they differ only in `tier`, `distribution.access`, and whether `distribution.loader` is present.

Live catalog: https://electric-digital-twin.github.io/edit-catalog/ *(after Pages is enabled)*

## Add a dataset
1. Copy `datasets/_TEMPLATE.json` to `datasets/<your-slug>.json`.
2. Fill it in:
   - `id` prefix must match the tier: `edit:` (house), `link:` (linked), `contrib:` (contributed).
     Slug is lowercase, hyphenated.
   - `license` must be an SPDX identifier. Linked external sources with proprietary terms use
     `LicenseRef-EXTERNAL` and put the human-readable terms in `distribution.note`.
   - `distribution.loader` carries a runnable load snippet for data we can serve directly;
     set it to `null` when one-click loading can't be guaranteed (typically linked sources).
3. Open a pull request. CI validates automatically and blocks the merge if the record is invalid.

## How it deploys
- `validate.py` checks every record against the schema, rejects duplicate ids, and writes
  `datasets/index.json` (the manifest the website reads).
- `.github/workflows/validate.yml` runs that check on every push and pull request.
- `.github/workflows/pages.yml` re-validates, rebuilds the manifest, and publishes the site
  to GitHub Pages on every push to `main`.
- `index.html` is the front-end: it reads the manifest and renders the browsable catalog.
  No build tools, no framework — plain static files.

## Validate locally
    pip install jsonschema
    python3 validate.py
    python3 -m http.server 8000   # then open http://localhost:8000
