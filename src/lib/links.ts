import { parse } from 'yaml';

export type Link = { label: string; url: string };
export type LinkGroup = { group: string; links: Link[] };

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

/** Parses links.yaml, failing the build on anything that is not a labelled http(s) link. */
export function parseLinks(source: string): LinkGroup[] {
  const data: unknown = parse(source) ?? [];
  if (!Array.isArray(data)) throw new Error('links.yaml: expected a list of groups');
  return data.map((entry, index) => {
    const group: unknown = entry?.group;
    if (!isText(group)) throw new Error(`links.yaml: entry ${index + 1} needs a group name`);
    const links: unknown = entry.links ?? [];
    if (!Array.isArray(links)) throw new Error(`links.yaml: "${group}" links must be a list`);
    return {
      group,
      links: links.map((link) => {
        const label: unknown = link?.label;
        const url: unknown = link?.url;
        if (!isText(label)) throw new Error(`links.yaml: a link in "${group}" has no label`);
        if (!isText(url) || !/^https?:\/\//i.test(url)) {
          throw new Error(`links.yaml: "${label}" in "${group}" needs an http(s) url`);
        }
        return { label, url };
      }),
    };
  });
}
