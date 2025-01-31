// app/page.tsx
import { getProducts } from 'lib/shopify';
import Image from 'next/image';
import Link from 'next/link';
import ChartSection from './ChartSection';

export default async function HomePage() {
  // 1) Fetch products on the server side
  const products = await getProducts({});
  if (!products || products.length === 0) {
    return <p className="p-6 text-center">No products found.</p>;
  }

  return (
    <main className="mx-auto max-w-7xl p-4">

      {/* 2) Render the client-side chart section */}
      <ChartSection />

      <hr className="my-8" />
      <Link
      href="/Study-1"
      className="mb-8 inline-block rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      More Healthcare Insurance Data
    </Link>

      {/* 3) Display products in a 3-column grid */}
      <h2 className="mb-6 text-2xl font-bold">All Products</h2>
      <div className="grid grid-cols-3 gap-6">
        {products.map((product) => {
          const firstImage = product.images?.[0];
          return (
            <Link
              key={product.handle}
              href={`/product/${product.handle}`}
              className="block overflow-hidden rounded border p-4 shadow-sm transition hover:shadow-md"
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
              <h3 className="mb-1 font-medium">{product.title}</h3>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
