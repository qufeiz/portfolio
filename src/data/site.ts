// Owner identity. Real fields pulled from `gh api users/qufeiz` (2026-06).
// Where GitHub returned null, we use a clearly-marked TODO rather than inventing.
export const site = {
  // GitHub `name` returned "Qufeiii" — looks like a handle, not a legal/display name.
  // {{TODO: confirm preferred display name}}
  name: 'Qufeiii',
  handle: 'qufeiz',
  // HYBRID positioning (copy-only): a personal portfolio that ALSO reads as an
  // AI-native studio — the person stays front and center; "studio" is an additive
  // layer, not a faceless-agency replacement. `role` is the one-line positioning;
  // `tagline` is FIRST-PERSON and points to the case studies below as the proof.
  role: 'Engineer · AI-native software studio',
  tagline: "I design, build, and ship custom software and automations for clients — real products, in production, not slideware. The proof is in the case studies below.",
  // GitHub `location` was null.
  location: '', // optional — set e.g. 'Pittsburgh, PA'; UI hides this when empty
  email: 'qufeizzz@gmail.com',
  github: 'https://github.com/qufeiz',
  // GitHub `blog` field:
  blog: 'https://qufeiz.github.io',
  // GitHub `twitter_username` was null → omitted from socials below.
  socials: [
    { label: 'GitHub', href: 'https://github.com/qufeiz', handle: '@qufeiz' },
    { label: 'Email', href: 'mailto:qufeizzz@gmail.com', handle: 'qufeizzz@gmail.com' },
    { label: 'Site', href: 'https://qufeiz.github.io', handle: 'qufeiz.github.io' },
    // {{TODO: add LinkedIn / X / other socials if the owner wants them}}
  ],
};

// The writing section's display name. It lives HERE, in one place, so renaming
// the section to "Blog" (or anything else) later is a one-word swap — nav,
// home section, /writing index, and article back-links all read from this.
// (The route /writing and the `articles` collection name are stable internals.)
export const WRITING_SECTION = 'Writing';

// The `category` taxonomy for articles — the primary browse axis on /writing.
// Ordering here drives the filter rail order (agent systems first = the thesis).
// `value` matches the Zod enum in src/content.config.ts. Adding a category =
// add a value here AND to that enum.
export const CATEGORIES = [
  { value: 'agent-systems', label: 'Agent systems' },
  { value: 'projects', label: 'Projects' },
  { value: 'life', label: 'Life' },
  { value: 'essays', label: 'Essays' },
] as const;

export type ArticleCategory = (typeof CATEGORIES)[number]['value'];

/** Display label for a category value (falls back to the raw value). */
export const categoryLabel = (v: string): string =>
  CATEGORIES.find((c) => c.value === v)?.label ?? v;
