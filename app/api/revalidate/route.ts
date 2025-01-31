// app/api/revalidate/route.ts

import { revalidate } from 'lib/shopify';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 13 route handler to process Shopify webhooks for revalidation.
 */
export async function POST(req: NextRequest) {
  // We'll just pass the request to our revalidate function in lib/shopify
  return revalidate(req);
}

// (Optional) If Shopify tries GET requests or you want to handle other methods, you can do so
export async function GET() {
  return NextResponse.json({ message: 'Use POST only' });
}
