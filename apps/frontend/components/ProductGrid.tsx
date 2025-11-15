"use client";

import React from 'react';
import { ProductCard, ProductCardSkeleton, type Product } from './ProductCard';
import { useApiSWR } from '../hooks/useApiSWR';
import { Button } from './ui/Button';

export function ProductGrid({ initialKey }: { initialKey: string }) {
  const { data, error, mutate, isLoading } = useApiSWR<{ items: Product[] }>(initialKey, initialKey);

  if (error) {
    console.error('Product fetch failed', error);
    return (
      <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        We’re a bit busy—please retry.
        <div className="mt-3">
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!data || isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-live="polite">
        {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  const items = data.items ?? [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
