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
          className="block p-4 hover:shadow transition" // Removed the 'border' class
        >
          <img
            src={product.featuredImage?.url}
            alt={product.title}
            className="mb-2 h-48 w-full object-cover"
          />
          <h2 className="mt-2 text-lg font-semibold">{product.title}</h2>
          {product.priceRange?.minVariantPrice?.amount ? (
            <p className="mt-1 text-base font-medium text-gray-700">
              {Number(product.priceRange.minVariantPrice.amount).toLocaleString(undefined, {
                style: 'currency',
                currency: product.priceRange.minVariantPrice.currencyCode,
              })}
            </p>
          ) : (
            <p className="mt-1 text-base font-medium text-gray-700">Price not available</p>
          )}
        </Link>
      ))}
    </div>
  );
}
