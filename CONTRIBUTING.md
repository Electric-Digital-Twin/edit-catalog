# Contributing a dataset to EDiT

Thank you for adding to the EDiT data commons. Every dataset in the catalog is a single
small JSON file describing one dataset — what it is, who owns it, its licence, and how to
reach it. Adding a dataset means adding one such file. This guide assumes you have never
done this before and explains each step.

There are two ways in, depending on who you are.

---

## If you are a member of the Electric-Digital-Twin organisation

You can add a file directly.

**Easiest — in the browser:**
1. Open the [`datasets/`](datasets) folder in this repository.
2. Open `_TEMPLATE.json`, copy its contents.
3. Click **Add file -> Create new file**. Name it `your-dataset-slug.json`
   (lowercase, words separated by hyphens, e.g. `lv-feeder-pv-2026.json`).
4. Paste the template and fill it in (see **Filling in the record** below).
5. Scroll down, write a short commit message, and click **Commit changes**.

That's it. Within a minute or two the catalog is re-validated and the website updates.

---

## If you are an external contributor

You don't have write access to this repository (that's intentional — it keeps the live
catalog safe). Instead you propose your addition with a **pull request**, abbreviated **PR**.
A pull request is a request that the project maintainers *pull* your change into the project.
It is a proposal: nothing changes in the catalog until a maintainer reviews and accepts it.

Here is the whole flow. You only need a free GitHub account.

### 1. Fork the repository
A **fork** is your own personal copy of this repository. You can change anything in your fork
without affecting the original.
- Click **Fork** (top-right of this repository's page) and confirm. You now have a copy at
  `github.com/your-username/edit-catalog`.

### 2. Add your dataset file
In *your fork*:
1. Open the `datasets/` folder.
2. Open `_TEMPLATE.json` and copy it.
3. Click **Add file -> Create new file**, name it `your-dataset-slug.json`, paste, and fill
   it in (see below).
4. Commit the new file to your fork.

### 3. Open the pull request
- Go back to your fork's main page. GitHub usually shows a banner offering to
  **Compare & pull request** — click it. (If not: click **Contribute -> Open pull request**.)
- Give it a short title like `Add dataset: LV feeder PV traces` and a sentence of description.
- Click **Create pull request**.

### 4. Wait for the automatic check
As soon as your PR opens, an automatic check validates your file against the catalog schema.
- A **green check** means your record is valid.
- A **red X** means something needs fixing. Click **Details** to see exactly which field and
  why — then edit the file in your fork and commit again; the check re-runs automatically.

### 5. A maintainer reviews and merges
A maintainer looks over your PR and merges it. Once merged, your dataset is part of the
catalog and appears on the website automatically. Done.

---

## Filling in the record

Start from `_TEMPLATE.json`. Most fields are plain description. A few have rules, because the
catalog validates every record automatically and will reject anything that breaks them. The
rules exist so the catalog stays consistent and trustworthy as it grows.

**`id`** — a unique identifier. Its prefix must match the dataset's tier:
- `edit:` if EDiT hosts the data itself,
- `link:` if EDiT only points to an external source,
- `contrib:` for a contributed dataset.

  The part after the colon is a lowercase, hyphenated slug, e.g. `contrib:lv-feeder-pv-2026`.

**`tier`** — one of `house` (EDiT hosts it), `linked` (EDiT links to it), or
`contributed`. This must agree with your `id` prefix.

**`license`** — must be a recognised **SPDX licence identifier**
(see https://spdx.org/licenses/), for example `CC-BY-4.0`, `CC-BY-NC-4.0`, `MIT`, or
`Apache-2.0`. If you are *linking* to an external source whose terms are proprietary or not
in the SPDX list, use `LicenseRef-EXTERNAL` and write the actual terms in plain words in
`distribution.note`. House and contributed datasets must use a real SPDX identifier — the
external placeholder is not allowed for data we host.

  If you are unsure which licence applies, ask the data's owner before contributing. The
  licence is the single most important field: it tells everyone what they may and may not do
  with the data.

  **Linked sources with pricing or tiers:** when a linked source charges for access or has
  several access tiers, do **not** write specific prices, quotas or tier sizes into the record —
  they go stale. Instead describe the *shape* of the access model (e.g. "a free academic tier
  with limits, paid tiers for full or commercial access") and link to the source's own pricing
  or licensing page for the current details. Always surface any restriction that would affect a
  typical EDiT user — for example, a free tier that forbids funded research.

**`distribution.access`** — `direct` if the data can be downloaded straight from the endpoint,
or `link-only` if it sits behind a registration wall or another site you don't control.
A `direct` record must include an `endpoint` URL.

**`distribution.loader`** — a small code snippet that loads the data in one step (handy for the
playground). Provide one only if the data really can be loaded directly; otherwise set it to
`null`. Linked sources are almost always `null`.

**`variables`** — describe the contents. For data you understand well, list the fields with
their units. For a linked source you don't fully control, a single sentence pointing to the
source's own documentation is fine.

Everything else (`title`, `description`, `themes`, `spatialCoverage`, `temporalResolution`,
`updateFrequency`, `submittedBy`, `added`) is descriptive — fill it in as accurately as you can.

---

## Check your work before submitting (optional)

If you are comfortable with a terminal, you can validate locally before opening a PR:

    pip install jsonschema
    python3 validate.py

It lists every record as `ok` or `FAIL`, and for a failure it names the exact field and
reason. If it passes locally, it will pass in the automatic check too.

---

## A note on what you're contributing

Please only add datasets you have the right to share or link to, and describe them honestly —
especially the licence and the access terms. The catalog is a shared, public, national
resource; its value depends on every record being accurate and properly attributed.

---

# Contributing a code project to EDiT

Alongside datasets, EDiT catalogs **code** — applications, prototypes, libraries, thesis
codebases, teaching repositories and models. This is an **inclusive index, not a curated
gate**: low-maturity work is welcome. The `maturity` field tells visitors what to expect
(`concept`, `experimental`, `beta`, `stable`, `archived`), so an honest "experimental" label
is far better than overstating readiness.

Code records live in `projects/`, one JSON file each, validated against
`schema/project.schema.json`. The contribution flow is identical to datasets: org members add
a file directly; external contributors fork and open a pull request.

Start from `projects/_TEMPLATE.json`. Field rules the validator enforces:

- **`id`** — namespaced `proj:` followed by a lowercase hyphenated slug.
- **`kind`** — one of `application`, `prototype`, `library`, `thesis`, `teaching`, `model`, `tool`.
- **`maturity`** — one of `concept`, `experimental`, `beta`, `stable`, `archived`. Be honest;
  low maturity is fine.
- **`license`** — an SPDX identifier for the code. Two special values: use `LicenseRef-NONE`
  for code published with **no licence stated** (which means all rights reserved by default —
  flagging it warns users they cannot reuse it freely), or `LicenseRef-EXTERNAL` for an unusual
  licence described in `notes`.
- **`repository`** — the source-code URL.
- **`consumesDatasets`** (optional) — ids of EDiT datasets the project uses, e.g.
  `link:fingrid-open-data`, creating a cross-link between the code and data catalogs.

Everything else (`languages`, `themes`, `demoUrl`, `notes`) is descriptive.
