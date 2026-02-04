import { getHelloRetailRecommendations } from 'services/zitac/helloretail/loadRecoms';
import { getHelloRetailTrackingId } from 'utils/helloRetailTracking';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recomBoxId = searchParams.get('recomBoxId');

    if (!recomBoxId) {
      return NextResponse.json({ error: 'recomBoxId is required' }, { status: 400 });
    }

    const trackingUserId = await getHelloRetailTrackingId();
    const response = await getHelloRetailRecommendations([{ key: recomBoxId }], trackingUserId);
    const products = response.responses?.[0]?.products || [];

    if (!response.success || products.length === 0) {
      return NextResponse.json({ products: [] });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error loading HelloRetail recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to load recommendations' },
      { status: 500 }
    );
  }
}

