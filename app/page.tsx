// app/page.tsx

import ProductList from 'components/ProductList';
import { getProducts } from 'lib/shopify';
import ChartSection from './ChartSection';

export default async function HomePage() {
  // 1) Fetch products on the server side
  const products = await getProducts({});
  if (!products || products.length === 0) {
    return <p className="p-6 text-center">No products found.</p>;
  }

  return (
    <main className="mx-auto max-w-7xl p-4">
      {/* Chart Section */}
      <ChartSection />

      {/* Spacing and title */}
      <h2 className="mt-8 mb-6 text-2xl font-bold">All Products</h2>

      {/* Use the reusable ProductList component with an initial limit (for example, 8 products) */}
      <ProductList products={products} initialLimit={8} />
    </main>
  );
}
