'use client';

import { Product } from 'lib/shopify/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ProductListProps {
  products: Product[];
  initialLimit?: number; // If provided, only this many products will show initially
}

export default function ProductList({ products, initialLimit }: ProductListProps) {
  // If an initial limit is provided, show only that many products until "View All" is clicked.
  const [showAll, setShowAll] = useState(false);
  const limit = initialLimit || products.length;
  const displayedProducts = showAll ? products : products.slice(0, limit);

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {displayedProducts.map((product) => {
          const firstImage = product.images?.[0];
          return (
            <Link
              key={product.handle}
              href={`/product/${product.handle}`}
              className="block overflow-hidden rounded p-4 transition" // Removed border and shadow classes
            >
              <div className="relative mb-3 aspect-square w-full">
                {firstImage?.url ? (
                  <Image
                    src={firstImage.url}
                    alt={firstImage.altText ?? product.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    No Image
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="mb-1 text-sm font-medium">{product.title}</p>
                <p className="text-sm">
                  $
                  {parseFloat(product.priceRange?.minVariantPrice?.amount || '0').toFixed(0)}{' '}
                  {product.priceRange?.minVariantPrice?.currencyCode}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {products.length > limit && !showAll && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            View All
          </button>
        </div>
      )}
    </>
  );
}
