import { getProducts } from 'lib/shopify';
import Image from 'next/image';
import Link from 'next/link';

// async function fetchStockData() {
//   // 1. Query your backend, external API, or local JSON for stock data
//   //    This is just an example. Replace with your real data fetching logic.
//   return [
//     { date: '2023-01-01', price: 100 },
//     { date: '2023-01-02', price: 101 },
//     { date: '2023-01-03', price: 98 },
//     { date: '2023-01-04', price: 105 },
//     // ... more data points
//   ];
// }

export default async function HomePage() {
  // Fetch all products (up to 100) via the Storefront API
  const products = await getProducts({});
  console.log('PRODUCTS LENGTH:', products.length);

  // If there are no products, show a fallback
  if (!products || products.length === 0) {
    return <p className="p-6 text-center">No products found.</p>;
  }

  return (
    <main className="mx-auto max-w-7xl p-4">
      <h1 className="mb-6 text-2xl font-bold">All Products</h1>

      {/* Grid with 3 columns, creating multiple rows as needed */}
      <div className="grid grid-cols-4 gap-6">
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

              <h2 className="mb-1 font-medium">{product.title}</h2>
              {/* Optional: display product price */}
              {product.priceRange?.minVariantPrice?.amount && (
                <p className="text-sm text-neutral-700">
                  ${product.priceRange.minVariantPrice.amount}{' '}
                  {product.priceRange.minVariantPrice.currencyCode}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
