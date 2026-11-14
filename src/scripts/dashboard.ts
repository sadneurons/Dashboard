import { matches } from '../lib/search';

const CATEGORY_KEY = 'dashboard:category';
const THEME_KEY = 'dashboard:theme';
const COLLAPSED_KEY = 'dashboard:collapsed';

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage is a convenience; the page works without it.
  }
};

const search = document.querySelector<HTMLInputElement>('#search');
const noMatches = document.querySelector<HTMLElement>('#no-matches');
const cards = [...document.querySelectorAll<HTMLElement>('[data-widget]')];
const filters = [...document.querySelectorAll<HTMLButtonElement>('[data-category-filter]')];

let category = 'all';

function apply(): void {
  const query = search?.value ?? '';
  // Collapsed cards open while searching, so a match is never hidden inside one.
  document.documentElement.toggleAttribute('data-searching', query.trim() !== '');
  let visible = 0;
  let elsewhere = 0;

  for (const card of cards) {
    const inCategory = category === 'all' || card.dataset.category === category;
    const cardMatches = matches(query, card.dataset.search ?? '');
    const items = [...card.querySelectorAll<HTMLElement>('[data-item]')];
    const matchingItems = items.filter((item) => matches(query, item.dataset.search ?? ''));

    // When the card itself matches, show all of it; otherwise narrow to its matching
    // items (links, table rows) and hide any group left empty.
    for (const item of items) item.hidden = !cardMatches && !matchingItems.includes(item);
    for (const group of card.querySelectorAll<HTMLElement>('[data-item-group]')) {
      group.hidden = !group.querySelector('[data-item]:not([hidden])');
    }

    const found = cardMatches || matchingItems.length > 0;
    const show = inCategory && found;
    card.hidden = !show;
    if (show) visible += 1;
    else if (found) elsewhere += 1;
  }

  if (noMatches) {
    noMatches.hidden = visible > 0;
    noMatches.textContent =
      elsewhere === 0
        ? 'Nothing matches. Clear the search or choose All.'
        : `Nothing matches here, but there ${elsewhere === 1 ? 'is 1 match in another category' : `are ${elsewhere} matches in other categories`}. Choose All to see ${elsewhere === 1 ? 'it' : 'them'}.`;
  }
}

function selectCategory(next: string): void {
  category = filters.some((button) => button.dataset.categoryFilter === next) ? next : 'all';
  for (const button of filters) {
    button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === category));
  }
  write(CATEGORY_KEY, category);
  apply();
}

for (const button of filters) {
  button.addEventListener('click', () => selectCategory(button.dataset.categoryFilter ?? 'all'));
}

search?.addEventListener('input', apply);
search?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && search.value !== '') {
    search.value = '';
    apply();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest('input, textarea, select, [contenteditable]')) return;
  event.preventDefault();
  search?.focus();
});

document.querySelector('#theme-toggle')?.addEventListener('click', () => {
  const root = document.documentElement;
  const current =
    root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  write(THEME_KEY, next);
});

function readCollapsed(): string[] {
  try {
    const stored: unknown = JSON.parse(read(COLLAPSED_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function setCollapsed(card: HTMLElement, collapsed: boolean): void {
  card.toggleAttribute('data-collapsed', collapsed);
  card.querySelector('[data-collapse]')?.setAttribute('aria-expanded', String(!collapsed));
}

const collapsed = new Set(readCollapsed());
for (const card of cards) {
  const id = card.dataset.widgetId ?? '';
  setCollapsed(card, collapsed.has(id));
  card.querySelector('[data-collapse]')?.addEventListener('click', () => {
    const next = !card.hasAttribute('data-collapsed');
    setCollapsed(card, next);
    if (next) collapsed.add(id);
    else collapsed.delete(id);
    write(COLLAPSED_KEY, JSON.stringify([...collapsed]));
  });
}

selectCategory(read(CATEGORY_KEY) ?? 'all');
