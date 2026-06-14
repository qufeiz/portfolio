// TreAxe product screenshots — the project's own official product shots, captured
// from the real, logged-in app (figures shown are seeded demo data).
// `src` is RELATIVE (no leading slash); the gallery prefixes import.meta.env.BASE_URL
// so it resolves under the /portfolio/ subpath.
//
// Order leads with the two key selling points: the AI assistant answering a real
// question, and turning an estimate into a professional client proposal.

export interface TreaxeShot {
  src: string;
  alt: string;
  caption?: string;
}

export const treaxeShots: TreaxeShot[] = [
  {
    src: 'treaxe/ai-assistant-estimates.png',
    alt: 'TreAxe AI assistant answering a question about estimate values',
    caption: 'AI assistant, answering: asked what the estimates are worth, it reads the data and replies with each estimate and the combined total (seeded demo data)',
  },
  {
    src: 'treaxe/proposal.png',
    alt: 'Auto-generated professional client proposal',
    caption: 'One click turns an estimate into a professional client proposal — scope of work, itemized costs, totals, payment schedule, and signatures',
  },
  {
    src: 'treaxe/ai-assistant-chat.png',
    alt: 'TreAxe AI assistant chat',
    caption: 'The AI assistant is always one keystroke away — ask in plain English and it pulls from your live estimates, invoices, tasks and logs',
  },
  {
    src: 'treaxe/dashboard.png',
    alt: 'TreAxe role-aware dashboard',
    caption: 'Role-aware dashboard with AI-detected project risks and live metrics (seeded demo data)',
  },
  {
    src: 'treaxe/leads.png',
    alt: 'TreAxe leads pipeline',
    caption: 'Lead-to-contract CRM as a drag-and-drop pipeline, with weighted forecast and win rate',
  },
  {
    src: 'treaxe/estimates.png',
    alt: 'TreAxe estimates',
    caption: 'Estimating & bids — line items, statuses, and win-rate across projects',
  },
  {
    src: 'treaxe/invoices.png',
    alt: 'TreAxe invoices',
    caption: 'Invoicing with balance and AR aging tracking',
  },
  {
    src: 'treaxe/project-overview.png',
    alt: 'TreAxe project overview',
    caption: 'Project tracking across the full job lifecycle — budget, takeoff, daily logs and activity',
  },
  {
    src: 'treaxe/proposal-builder.png',
    alt: 'Proposal builder inside the TreAxe app',
    caption: 'The in-app proposal builder — scope, exclusions, and an auto-filled payment schedule that meets the real-proposal bar',
  },
];
