# Dashboard

A personal dashboard of links, calculators and reference material, published
at <https://sadneurons.github.io/Dashboard/>.

The site is public. It must never contain identifiable patient data.

## Run it locally

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev       # http://localhost:4321/Dashboard/
bun run test      # unit tests
bun run ci        # tests, type-check and production build, as the deploy runs them
```

## Add a widget

Create one file in `src/widgets/`. It appears on the page automatically.

```astro
---
import type { WidgetMeta } from '../lib/widgets';

export const meta: WidgetMeta = {
  title: 'My widget',
  category: 'Utilities',      // a new name creates a new category tab
  keywords: ['words', 'the search box should match'],
  // size: 'wide',            // optional: span two columns
  // order: 3,                // optional: lower numbers come first
};
---

<p>Widget content.</p>
```

For a calculator, put the maths in a plain function in `src/lib/` with a test
beside it, and import it from a `<script>` in the widget (see
`src/widgets/Bmi.astro` and `src/lib/bmi.ts`). A failing test blocks the
deploy.

## Edit the links

Edit `src/data/links.yaml`. Each link needs a `label` and an `http(s)` `url`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and
publishes the site. One-time setup on GitHub: Settings → Pages → Source →
**GitHub Actions**.
