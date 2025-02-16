// app/shop/page.tsx

import { getCollectionProducts, getCollections } from 'lib/shopify';
import Image from 'next/image';
import Link from 'next/link';

export default async function ShopPage() {
  // 1) Fetch all collections from Shopify
  const allCollections = await getCollections();

  // 2) Define the collections you want to query
  const targetCollectionTitles = ['T-Shirt', 'Sweatshirts'];

  // 3) Filter collections by title
  const relevantCollections = allCollections.filter((collection) =>
    targetCollectionTitles.includes(collection.title)
  );

  if (!relevantCollections.length) {
    return <p className="p-6 text-center">No relevant collections found.</p>;
  }

  // 4) For each collection, fetch its products
  const collectionsData = [];
  for (const coll of relevantCollections) {
    const products = await getCollectionProducts({ collection: coll.handle });
    collectionsData.push({
      title: coll.title,
      handle: coll.handle,
      description: coll.description,
      products,
    });
  }

  return (
    <main className="mx-auto max-w-7xl p-4">

      {collectionsData.map((coll) => (
        <section key={coll.handle} className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">{coll.title}</h2>
          {coll.description ? (
            <p className="mb-4 text-sm text-neutral-600">{coll.description}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {coll.products?.length ? (
              coll.products.map((product) => {
                const firstImage = product.images?.[0];
                return (
                    <Link
                    key={product.handle}
                    href={`/product/${product.handle}`}
                    className="block overflow-hidden rounded p-4 transition"
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
                    {product.priceRange?.minVariantPrice?.amount ? (
                      <p className="text-sm font-medium text-gray-700">
                        {Number(product.priceRange.minVariantPrice.amount).toLocaleString(undefined, {
                          style: 'currency',
                          currency: product.priceRange.minVariantPrice.currencyCode,
                        })}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-gray-700">Price not available</p>
                    )}
                  </Link>
                  
                );
              })
            ) : (
              <p>No products found in {coll.title}.</p>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
