# Dashboard foundation: design

Date: 2026-11-13

## Intent

A personal dashboard opened daily, holding a deliberately mixed bag: useful
links, calculators, clinical reference information and links, SNOMED codes,
and small JavaScript utilities. It grows one widget at a time, so the
foundation's job is to make adding the next widget cheap and safe.

## Goals

- Adding a widget means adding one file, with no edits elsewhere.
- Everything on the page can be found by typing in one search box.
- A push to `main` publishes the site.
- Works well on a desktop browser and is usable on a phone.

## Non-goals

- No backend, accounts, or sync between devices.
- No widget catalogue up front. Widgets are added in later sessions.

## Anti-goals

- The site is public. It never holds identifiable patient data, and no
  widget sends what is typed into it anywhere.
- A broken widget must not take down the rest of the page.

## Constraints

- Hosted on GitHub Pages from `sadneurons/Dashboard`, so the site lives at
  `https://sadneurons.github.io/Dashboard/` and every internal URL must
  respect the `/Dashboard` base path.
- Deployed by a GitHub Action (chosen by the owner), with Pages' source set
  to "GitHub Actions" in the repository settings (owner will change this).
- Local machine has Node 22 and Bun but no npm, so Bun is the package
  manager.

## Approaches

1. **Plain HTML/CSS/JS, no build.** Simplest and longest-lived, but no
   component ecosystem. Recommended by Claude; declined by the owner.
2. **Astro with an Actions deploy. Chosen.** The owner chose "a framework
   with an Actions deploy"; picking Astro over React is Claude's call. The
   content is mostly static reference material, which Astro renders to
   plain HTML, and it ships JavaScript only for the widgets that need it.
   Any single widget can still use React, Svelte or Preact later.
3. **React + Vite.** Largest ecosystem, but ships a full app runtime for a
   page that is mostly links and tables.

## Design

**Stack (Claude's calls).** Astro, static output, TypeScript, Bun.
`astro.config.mjs` sets `site: https://sadneurons.github.io` and
`base: /Dashboard`. No UI framework integration at first: interactive
widgets use a plain `<script>` inside their Astro component. An integration
is added only when a widget needs it.

**Layout of the repo.**

```
src/
  pages/index.astro      the dashboard page
  layouts/Base.astro     html shell, theme, global styles
  components/            Shell pieces: WidgetCard, SearchBox, CategoryNav
  widgets/               one .astro file per widget
  data/links.yaml        the links list, edited as data
  lib/                   pure functions (calculator maths), unit tested
.github/workflows/deploy.yml
```

The root `index.html` (currently empty) is removed, since Astro generates
it at build time.

**Widget contract.** Each file in `src/widgets/` exports metadata next to
its markup: `title`, `category`, `keywords`, and an optional `size`
(normal or wide). The index page discovers widgets with `import.meta.glob`,
so a new file appears on the page with no registration step.

**Page.**

```
+----------------------------------------------------------+
| Dashboard            [ search everything...        ]  ◐  |
| All | Links | Calculators | Clinical | Utilities         |
+----------------------------------------------------------+
| +-- Links ---------+ +-- BMI ----------+ +-- ... ------+ |
| | Clinical         | | Height [   ] cm | |             | |
| |  NICE CKS  BNF   | | Weight [   ] kg | |             | |
| | General          | | BMI    24.2     | |             | |
| +------------------+ +-----------------+ +-------------+ |
+----------------------------------------------------------+
```

- Responsive card grid; one column on a phone.
- Search filters cards by title and keywords as you type, and also filters
  individual links inside the links widget. `/` focuses the search box.
- Category tabs come from the widgets' metadata, not a fixed list.
- Light and dark theme following the system setting, with a toggle whose
  choice is remembered in the browser.

**First widgets, to prove the structure.**

- *Links*: grouped links read from `links.yaml`, seeded with a few
  placeholders for the owner to replace.
- *BMI calculator*: a small interactive example whose maths lives in
  `src/lib/` with unit tests. Chosen by Claude as a stand-in; the pattern
  matters more than the calculator.

**Per-device state.** Theme and last-selected category are stored in
`localStorage`. Nothing else is persisted.

**Deploy.** `.github/workflows/deploy.yml` uses the official
`withastro/action` and `actions/deploy-pages` on push to `main`.

**Testing.** Vitest for the pure functions in `src/lib/`. The Action runs
the tests before building, so a failing calculator test blocks the deploy.
Clinical calculators added later follow the same rule.

## Left to the builder

- Visual styling details (typography, colour, spacing).
- Exact metadata mechanism for widgets (exported const or frontmatter).
- Exact versions, pinned at install time to the current stable releases.
