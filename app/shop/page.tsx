// app/shop/page.tsx
import ProductList from 'components/ProductList';
import { getProducts } from 'lib/shopify';

export default async function ShopPage() {
  // Fetch all products
  const products = await getProducts({});

  if (!products || products.length === 0) {
    return <p className="p-6 text-center">No products found.</p>;
  }

  return (
    <main className="mx-auto max-w-7xl p-4">
      <h1 className="mb-6 text-3xl font-bold">Shop</h1>
      <ProductList products={products} initialLimit={8} />
    </main>
  );
}
