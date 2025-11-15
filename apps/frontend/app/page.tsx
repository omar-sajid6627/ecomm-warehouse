import { SWRConfig } from 'swr';
import { env } from '../lib/env';
import { HeroParallax } from '../components/HeroParallax';
import { ABHeadline } from '../components/ABHeadline';
import { ProductGrid } from '../components/ProductGrid';
import { LeadForm } from '../components/LeadForm';

export const metadata = {
  title: 'Eco-Friendly Water Bottle',
  description: 'Hydrate sustainably with performance bottles.',
};

async function fetchInitial() {
  const isServer = typeof window === 'undefined';
  const base = isServer ? (process.env.INTERNAL_API_URL || env.INTERNAL_API_URL) : env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${base}/products?page=1&limit=12`, { cache: 'no-store' });
  if (!res.ok) return { items: [], total: 0, page: 1, limit: 12 };
  return res.json();
}

export default async function Page() {
  const initial = await fetchInitial();
  const key = `/products?page=1&limit=12`;

  const onCTAClickScript = `document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });`;

  return (
    <SWRConfig value={{ fallback: { [key]: initial } }}>
      <div>
        <HeroParallax />
        <section className="container py-12">
          <ABHeadline />
          <p className="text-gray-600 mt-2">Bottles designed for sustainability and everyday performance.</p>
        </section>
        <section className="container py-12">
          <h3 className="text-xl font-semibold mb-4">Featured Products</h3>
          <ProductGrid initialKey={key} />
        </section>
        <section className="container py-12">
          <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
          <LeadForm />
        </section>
        <script dangerouslySetInnerHTML={{ __html: onCTAClickScript }} />
      </div>
    </SWRConfig>
  );
}
