

console.log('next.config.js - Shopify domain:', process.env.SHOPIFY_STORE_DOMAIN)
console.log('next.config.js - Shopify token:', process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN)
console.log('next.config.js - Shopify version:', process.env.SHOPIFY_STORE_API_VERSION)


export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**'
      }
    ]
  }
};
