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
  title: string;
  tagline: string;
  status: string;
  year: string;
  context: string;        // one-line honest framing (collab / team / academic)
  summary: string;        // short card blurb
  stack: string[];
  links: ProjectLink[];
  featured: boolean;
  accent: 'amber' | 'spark';
}

export const projects: Project[] = [
  {
    slug: 'treaxe',
    index: '01',
    title: 'TreAxe',
    tagline: 'From first lead to final payment: the operating system for small construction firms.',
    status: 'Live in production',
    year: '2025—',
    context: 'Co-built with Barrat Mohammad — co-owned codebase. Not a solo project.',
    summary:
      'A production construction-operations platform — ~42 screens spanning CRM, estimating with e-signatures, scheduling, procurement, field docs, invoicing and a client portal. Multi-tenant, row-level-secured, continuously deployed.',
    stack: [
      'React', 'Vite', 'TypeScript', 'Tailwind CSS',
      'Supabase (Postgres + RLS)', 'Edge Functions (Deno)',
      'Stripe', 'Gmail API', 'Playwright',
    ],
    links: [
      { label: 'Live product', href: 'https://www.treaxe.io', kind: 'primary', note: 'treaxe.io' },
      // Demo credentials surfaced in the page body, not just here.
      { label: 'Repo (private, co-owned)', href: 'https://github.com/qufeiz/TreAxe', kind: 'secondary' },
    ],
    featured: true,
    accent: 'amber',
  },
  {
    slug: 'fredgpt',
    index: '02',
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
    links: [
      // No public code repo for FredGPT (client/academic). Demo is the video on its page.
      { label: 'Watch the demo', href: '#demo', kind: 'primary' },
    ],
    featured: true,
    accent: 'spark',
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
