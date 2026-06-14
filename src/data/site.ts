// Owner identity. Real fields pulled from `gh api users/qufeiz` (2026-06).
// Where GitHub returned null, we use a clearly-marked TODO rather than inventing.
export const site = {
  // GitHub `name` returned "Qufeiii" — looks like a handle, not a legal/display name.
  // {{TODO: confirm preferred display name}}
  name: 'Qufeiii',
  handle: 'qufeiz',
  // GitHub `bio` was null → placeholder. Hero tagline below is derived from the
  // two real case studies (full-stack + AI), not invented credentials.
  role: 'Full-stack & AI engineer',
  tagline: 'I build real products that ship — from a construction operating system to an agentic system over Federal Reserve data.',
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
