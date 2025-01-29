// components/products-grid.tsx
import { Product } from 'lib/shopify/types'; // Adjust this import if you have custom types
import Link from 'next/link';

interface ProductsGridProps {
  products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  if (!products || !products.length) {
    return <p className="text-center">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.handle}`}
          className="block p-4 border hover:shadow transition"
        >
          <img
            src={product.featuredImage?.url}
            alt={product.title}
            className="mb-2 h-48 w-full object-cover"
          />
          <h2>{product.title}</h2>
          <p>
            {product.priceRange?.minVariantPrice?.amount}{' '}
            {product.priceRange?.minVariantPrice?.currencyCode}
          </p>
        </Link>
      ))}
    </div>
  );
}
