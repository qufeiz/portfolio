// TreAxe product screenshots — captured from the real, logged-in app (seeded demo data).
// `src` is RELATIVE (no leading slash); the gallery prefixes import.meta.env.BASE_URL
// so it resolves under the /portfolio/ subpath.

export interface TreaxeShot {
  src: string;
  alt: string;
  caption?: string;
}

export const treaxeShots: TreaxeShot[] = [
  { src: 'treaxe/01-dashboard.png', alt: 'TreAxe role-aware dashboard', caption: 'Role-aware dashboard with AI-surfaced project risks and live metrics' },
  { src: 'treaxe/07-proposal.png', alt: 'Auto-generated client proposal', caption: 'One click turns an estimate into a professional client proposal — scope, itemized costs, totals, payment schedule, signatures' },
  { src: 'treaxe/02-leads.png', alt: 'TreAxe leads pipeline', caption: 'Lead-to-contract CRM, as a drag-and-drop pipeline' },
  { src: 'treaxe/03-estimates.png', alt: 'TreAxe estimates', caption: 'Estimating & bids — line items, statuses, win-rate' },
  { src: 'treaxe/04-invoices.png', alt: 'TreAxe invoices', caption: 'Invoicing with balance & aging tracking' },
  { src: 'treaxe/05-projects.png', alt: 'TreAxe projects', caption: 'Project tracking across the full job lifecycle' },
  { src: 'treaxe/06-landing.png', alt: 'TreAxe marketing site', caption: 'treaxe.io — the live product marketing site' },
  { src: 'treaxe/08-proposal-app.png', alt: 'Proposal generator in the app', caption: 'The proposal/PDF generator inside the app' },
];
