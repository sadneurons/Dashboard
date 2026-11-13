export type WidgetMeta = {
  title: string;
  category: string;
  keywords: string[];
  size?: 'normal' | 'wide';
  order?: number;
};

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

/** Checks a widget's exported `meta`, failing the build with the file's name if it is malformed. */
export function validateMeta(file: string, meta: unknown): WidgetMeta {
  const fail = (problem: string): never => {
    throw new Error(`Widget ${file}: ${problem}`);
  };
  if (typeof meta !== 'object' || meta === null) {
    return fail('must export a `meta` object (title, category, keywords)');
  }
  const m = meta as Record<string, unknown>;
  if (!isText(m.title)) fail('meta.title must be a non-empty string');
  if (!isText(m.category)) fail('meta.category must be a non-empty string');
  if (!Array.isArray(m.keywords) || !m.keywords.every((k) => typeof k === 'string')) {
    fail('meta.keywords must be a list of strings');
  }
  if (m.size !== undefined && m.size !== 'normal' && m.size !== 'wide') {
    fail('meta.size must be "normal" or "wide"');
  }
  if (m.order !== undefined && typeof m.order !== 'number') {
    fail('meta.order must be a number');
  }
  return meta as WidgetMeta;
}

export function categoriesOf(metas: WidgetMeta[]): string[] {
  return [...new Set(metas.map((m) => m.category))].sort((a, b) => a.localeCompare(b));
}

export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The colour slot for a category: its position in the alphabetical category list, wrapping at `count`. */
export function hueOf(category: string, categories: string[], count: number): number {
  return Math.max(categories.indexOf(category), 0) % count;
}
