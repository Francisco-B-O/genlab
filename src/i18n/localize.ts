import type { Language } from './index';

const SUFFIX = /^(.*)_(es|en)$/;

/**
 * Deep-resolves bilingual fields. For every key `foo_es` / `foo_en`, the base
 * key `foo` is replaced by the variant matching `lang` (when present).
 * Base fields are written in English, so English needs no `_en` variant.
 * Suffixed keys are kept, so the result can be localized again.
 */
export function localize<T>(value: T, lang: Language): T {
  if (Array.isArray(value)) {
    return value.map(v => localize(v, lang)) as unknown as T;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }

  const src = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(src)) {
    out[key] = localize(v, lang);
  }
  for (const key of Object.keys(src)) {
    const match = SUFFIX.exec(key);
    if (match && match[2] === lang && src[key] !== undefined) {
      out[match[1]] = localize(src[key], lang);
    }
  }
  return out as T;
}

/** Replaces `{name}` placeholders in a translated string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
