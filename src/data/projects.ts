// Case-study data. Sourced faithfully from the provided case-study.md files.
// Honesty rules: both are collaborations — never imply sole authorship.
// FredGPT: no client-confidential specifics, no budget/cost numbers, no internal
// deployment URLs (cloudfront/lambda endpoints), no public repo link.

export interface ProjectLink {
  label: string;
  href: string;
  kind: 'primary' | 'secondary';
  note?: string;
}

export interface Project {
  slug: string;
  index: string;          // ledger index, e.g. "01"
  order: number;          // sort order within /work (ascending; lower = earlier)
  title: string;
  tagline: string;
  status: string;
  year: string;
  context: string;        // one-line honest framing (collab / team / academic)
  summary: string;        // short card blurb
  stack: string[];
  // Cross-cutting taxonomy. Surfaced as chips on the index + case pages and used
  // to cross-link articles to projects (an article tagged with a project's slug
  // surfaces in that project's "Related writing" block). See src/content/SCHEMA.md.
  tags: string[];
  links: ProjectLink[];
  featured: boolean;
  accent: 'amber' | 'spark';
}

export const projects: Project[] = [
  {
    slug: 'treaxe',
    index: '01',
    order: 1,
    title: 'TreAxe',
    tagline: 'From first lead to final payment: the operating system for small construction firms.',
    status: 'Live in production',
    year: '2025—',
    context: 'Co-built with a collaborator — co-owned codebase. Not a solo project.',
    summary:
      'A production construction-operations platform — ~42 screens spanning CRM, estimating with e-signatures, scheduling, procurement, field docs, invoicing and a client portal. Multi-tenant, row-level-secured, continuously deployed.',
    stack: [
      'React', 'Vite', 'TypeScript', 'Tailwind CSS',
      'Supabase (Postgres + RLS)', 'Edge Functions (Deno)',
      'Stripe', 'Gmail API', 'Playwright',
    ],
    // Topical taxonomy + the project's own slug (`treaxe`) so articles tagged
    // `treaxe` surface in this project's "Related writing".
    tags: ['saas', 'full-stack', 'production', 'multi-tenant', 'payments'],
    links: [
      { label: 'Live demo', href: 'https://treaxe-demo.vercel.app', kind: 'primary', note: 'treaxe-demo.vercel.app' },
      // Demo credentials surfaced in the page body, not just here.
      { label: 'Repo (private, co-owned)', href: 'https://github.com/qufeiz/TreAxe', kind: 'secondary' },
    ],
    featured: true,
    accent: 'amber',
  },
  {
    slug: 'nucleus',
    index: '02',
    order: 2,
    title: 'Nucleus',
    tagline: 'Ask your documents and your data in plain English — get an answer with a citation on every fact.',
    status: 'Client work · shipped',
    year: '2026',
    context: 'Real client engagement (freelance contract) — built and delivered solo. Demo runs on synthetic sample data, not the client’s real records.',
    summary:
      'An AI business assistant that answers questions over uploaded documents AND structured data in one cited reply — contracts, maintenance, case files. Supabase auth with per-user document isolation and admin kick-out, Gemini File Search for retrieval, a swappable answer model, English + Hebrew. One Next.js app on Vercel.',
    stack: [
      'Next.js (App Router)', 'TypeScript', 'React', 'Tailwind CSS',
      'Supabase (auth + Postgres)', 'Google Gemini File Search',
      'DeepSeek / Gemini (swappable)', 'Vercel',
    ],
    tags: ['ai', 'rag', 'genai', 'client-work', 'full-stack'],
    links: [
      { label: 'Live demo', href: 'https://nucleus-woad.vercel.app/', kind: 'primary', note: 'nucleus-woad.vercel.app (public landing; sign-in needs demo logins, on request)' },
    ],
    featured: true,
    accent: 'spark',
  },
  {
    slug: 'fredgpt',
    index: '03',
    order: 3,
    title: 'FredGPT',
    tagline: 'Ask the Federal Reserve a question in plain English — get a charted, cited, source-traceable answer.',
    status: 'Graduate practicum',
    year: 'Fall 2025',
    context: 'CMU 14-798 graduate practicum — team project for an industry client in the economic-data space.',
    summary:
      'An agentic GenAI platform that unifies fragmented Federal Reserve sources (FRED, FRASER, the Fed corpus) behind one chat interface, fusing live time series with policy history into grounded, source-cited answers.',
    stack: [
      'TypeScript', 'Node.js', 'Express', 'React',
      'LangGraph / LangChain', 'AWS Bedrock', 'Amazon OpenSearch',
      'ECS Fargate', 'Lambda', 'Docker',
    ],
    tags: ['ai', 'agents', 'rag', 'genai', 'academic'],
    links: [
      // No public code repo for FredGPT (client/academic). Demo is the video on its page.
      { label: 'Watch the demo', href: '#demo', kind: 'primary' },
    ],
    featured: true,
    accent: 'spark',
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

// Scale-ready ordering for the /work index: featured first, then by `order`
// (ascending). Built to read cleanly at 2 projects and at 50 — the home page
// shows only the top `featuredProjects`, so total count never bloats it.
export const sortedProjects = (): Project[] =>
  [...projects].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order,
  );

// Home-page curation: the top few featured projects (curated, fixed size).
export const featuredProjects = (n = 3): Project[] =>
  sortedProjects()
    .filter((p) => p.featured)
    .slice(0, n);
