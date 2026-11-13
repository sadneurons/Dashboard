# Dashboard Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static Astro dashboard with a searchable, categorised widget grid, two starter widgets (links, BMI), and an Actions deploy to GitHub Pages.

**Architecture:** Each widget is one `.astro` file in `src/widgets/` exporting a `meta` object; the index page discovers them with `import.meta.glob` and wraps each in a card carrying its search text and category as data attributes. One small client script filters cards by search text and category. Calculator maths and search matching are pure functions in `src/lib/`, unit tested.

**Tech Stack:** Astro 7.4.x (static output), TypeScript, Bun 1.4 (package manager and local runtime), Vitest 5, `yaml` 2.x.

**Spec:** `docs/superpowers/specs/2026-11-13-dashboard-foundation-design.md`

## Global Constraints

- `site: 'https://sadneurons.github.io'`, `base: '/Dashboard'`. Every internal URL and asset goes through `import.meta.env.BASE_URL`; no root-absolute paths.
- Astro 7 requires Node >= 22.23.4 and this machine has 22.22.1, so every local Astro and Vitest command runs under Bun's runtime: `bun --bun astro ...`, `bun --bun vitest ...`. Package scripts encode this.
- Astro 7 is recent. Before using an API from memory, check it against the installed package's docs/types.
- No UI framework integration. Interactive widgets use a plain `<script>` in their component.
- No network requests from any widget. No patient data anywhere.
- `localStorage` access is always wrapped in try/catch; the page works without it.
- No commits or pushes unless the owner asks.

## Review Focus

1. **Blank, zero, negative or non-numeric BMI inputs** show no result rather than `NaN` or `Infinity`. Test in Task 1.
2. **Search with no matches** shows a "No matches" message rather than a blank page. Check in Task 4.
3. **Search and category combine**: a card shows only if it passes both. Check in Task 4.
4. **Base path**: the built HTML references assets under `/Dashboard/`. Check in Task 5.
5. **A widget file with missing or malformed `meta`** fails the build with a message naming the file, rather than rendering a broken card. Test in Task 2.

---

### Task 1: Project scaffold and pure functions

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/lib/bmi.ts`, `src/lib/bmi.test.ts`, `src/lib/search.ts`, `src/lib/search.test.ts`
- Delete: `index.html` (empty; Astro generates it)

**Interfaces — Produces:**
- `bmi(weightKg: number, heightCm: number): number | null` — rounded to 1 dp; `null` unless both are finite and > 0.
- `bmiCategory(value: number): 'Underweight' | 'Healthy weight' | 'Overweight' | 'Obese'` — boundaries 18.5, 25, 30 (lower bound inclusive).
- `matches(query: string, text: string): boolean` — case-insensitive; every whitespace-separated term in `query` must appear in `text`; empty query matches everything.
- Scripts: `dev`, `build`, `preview`, `test` (`bun --bun vitest run`).

- [ ] **Step 1:** Create `package.json` (private, `"type": "module"`, scripts above) and install with `bun add astro yaml` and `bun add -d vitest typescript @astrojs/check`. Write `astro.config.mjs` with the `site` and `base` values, `tsconfig.json` extending `astro/tsconfigs/strict`, and `.gitignore` (`node_modules`, `dist`, `.astro`).
- [ ] **Step 2:** Write failing tests.

```ts
// bmi.test.ts
expect(bmi(70, 170)).toBe(24.2)
expect(bmi(0, 170)).toBeNull()
expect(bmi(70, 0)).toBeNull()
expect(bmi(-70, 170)).toBeNull()
expect(bmi(NaN, 170)).toBeNull()
expect(bmiCategory(18.4)).toBe('Underweight')
expect(bmiCategory(18.5)).toBe('Healthy weight')
expect(bmiCategory(24.9)).toBe('Healthy weight')
expect(bmiCategory(25)).toBe('Overweight')
expect(bmiCategory(30)).toBe('Obese')

// search.test.ts
expect(matches('', 'anything')).toBe(true)
expect(matches('  ', 'anything')).toBe(true)
expect(matches('BMI', 'bmi calculator')).toBe(true)
expect(matches('calc bmi', 'bmi calculator')).toBe(true)
expect(matches('bmi renal', 'bmi calculator')).toBe(false)
```

- [ ] **Step 3:** Run `bun run test`; expect failures for missing modules.
- [ ] **Step 4:** Implement both modules.
- [ ] **Step 5:** Run `bun run test`; expect all pass.

### Task 2: Widget registry

**Files:**
- Create: `src/lib/widgets.ts`, `src/lib/widgets.test.ts`

**Interfaces — Produces:**
- `type WidgetMeta = { title: string; category: string; keywords: string[]; size?: 'normal' | 'wide'; order?: number }`
- `validateMeta(file: string, meta: unknown): WidgetMeta` — throws `Error` whose message includes `file` when `title` or `category` is missing/empty or `keywords` is not a string array.
- `categoriesOf(metas: WidgetMeta[]): string[]` — unique, alphabetical.
- `slug(text: string): string` — lower-case, non-alphanumerics to `-`.

- [ ] **Step 1:** Write failing tests: valid meta round-trips; `validateMeta('Foo.astro', {})` throws matching `/Foo\.astro/`; missing `category` throws; `keywords: 'x'` throws; `categoriesOf` dedupes and sorts; `slug('Clinical Info')` is `'clinical-info'`.
- [ ] **Step 2:** Run tests, expect fail. **Step 3:** Implement. **Step 4:** Run tests, expect pass.

### Task 3: Layout, shell components and starter widgets

**Files:**
- Create: `src/layouts/Base.astro`, `src/styles/global.css`
- Create: `src/components/WidgetCard.astro`, `SearchBox.astro`, `CategoryNav.astro`, `ThemeToggle.astro`
- Create: `src/widgets/Links.astro`, `src/widgets/Bmi.astro`, `src/data/links.yaml`
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: `validateMeta`, `categoriesOf`, `slug`, `bmi`, `bmiCategory`.
- Produces (DOM contract for Task 4):
  - Each card: `<section class="card" data-widget data-category="<slug>" data-search="<title + category + keywords, lower-case>">`.
  - Each link in the links widget: `<li data-link data-search="<label + group, lower-case>">`; each group wrapper has `data-link-group`.
  - Search input `#search`; category buttons `button[data-category-filter="<slug | all>"]` with `aria-pressed`; empty-state element `#no-matches` with `hidden`; theme toggle `#theme-toggle`.

- [ ] **Step 1:** Each widget exports `export const meta: WidgetMeta` from its frontmatter. `index.astro` loads `import.meta.glob('../widgets/*.astro', { eager: true })`, validates each `meta`, sorts by `order` then `title`, and renders each default export inside `WidgetCard`.
- [ ] **Step 2:** `links.yaml` is a list of `{ group, links: [{ label, url }] }`, loaded with a `?raw` import and the `yaml` package. Seed with two groups of clearly placeholder public links (Clinical: NICE CKS, BNF, SNOMED CT Browser; General: GitHub, MDN). Links open in a new tab with `rel="noopener noreferrer"`.
- [ ] **Step 3:** `Bmi.astro`: height (cm) and weight (kg) number inputs, an `<output aria-live="polite">` showing value and category, blank when `bmi()` returns `null`. Its `<script>` imports from `src/lib/bmi`.
- [ ] **Step 4:** `Base.astro`: html shell, `lang="en-GB"`, viewport meta, title "Dashboard", and an inline head script that applies a stored theme before first paint. `global.css`: colour tokens on `:root`, dark values under `prefers-color-scheme` and under `[data-theme]` overrides, responsive grid (`repeat(auto-fill, minmax(18rem, 1fr))`, `wide` spans two columns where there is room, one column on narrow screens), visible focus styles.
- [ ] **Step 5:** Verify with `bun run build` (expect success, `dist/index.html` present) and `bunx --bun astro check` (expect 0 errors).

### Task 4: Client behaviour

**Files:**
- Create: `src/scripts/dashboard.ts` (imported by a `<script>` in `index.astro`)

**Interfaces — Consumes:** `matches`; the DOM contract from Task 3.

- [ ] **Step 1:** Filtering: a card is visible when its category passes and (its own `data-search` matches the query, or it contains at least one matching `[data-link]`). Inside the links widget, when the card's own text does not match, only matching links and non-empty groups show; when the query is empty everything shows. `#no-matches` is shown when no card is visible.
- [ ] **Step 2:** `/` focuses `#search` unless focus is already in an input; `Escape` in the search box clears it.
- [ ] **Step 3:** Category buttons set `aria-pressed`; the selected category is stored under `dashboard:category` and restored on load, falling back to `all` if the stored slug no longer exists.
- [ ] **Step 4:** Theme toggle cycles light/dark, sets `data-theme` on `<html>`, stores under `dashboard:theme`.
- [ ] **Step 5:** Verify in a real browser against `bun run preview` (see Task 5).

### Task 5: Deploy workflow and end-to-end check

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1:** Read the README of `withastro/action` at its current major (v6) and confirm its inputs for Node version and package manager detection. Write the workflow: on push to `main` and `workflow_dispatch`; permissions `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`; a build job that checks out, runs the unit tests with Bun, then runs `withastro/action` with a Node version >= 22.23.4; a deploy job using `actions/deploy-pages`. Tests failing must stop the build job.
- [ ] **Step 2:** `README.md`: how to run locally, how to add a widget (one file with `meta`), how to edit links, and the one-time Pages setting (Settings → Pages → Source: GitHub Actions).
- [ ] **Step 3:** Run `bun run test` and `bun run build`. Confirm `dist/index.html` references assets under `/Dashboard/` (grep for `href="/Dashboard/` or `src="/Dashboard/`) and contains no root-absolute asset paths outside it.
- [ ] **Step 4:** Start `bun run preview`, open `/Dashboard/` in a headless browser and check: both cards render; typing `bnf` leaves only the Links card with only the BNF link; typing `zzzz` shows "No matches"; selecting Calculators hides Links; BMI 70 kg / 170 cm shows 24.2 Healthy weight; clearing height blanks the result; the theme toggle changes `data-theme`; no console errors; layout at 375 px wide is one column with no horizontal scroll.
