/** True when every whitespace-separated term of `query` appears in `text`, ignoring case. */
export function matches(query: string, text: string): boolean {
  const haystack = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}
