import { NextResponse } from 'next/server';
import { getProductCategories } from '@/lib/games/queries';

export const revalidate = 60;

export async function GET() {
  try {
    const categories = await getProductCategories();
    return NextResponse.json(
      { success: true, categories },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error', categories: [] },
      { status: 500 }
    );
  }
}
