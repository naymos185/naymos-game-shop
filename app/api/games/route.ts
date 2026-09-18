import { NextResponse } from 'next/server';
import { getActiveGames } from '@/lib/games/queries';

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const games = await getActiveGames();
    const filtered =
      category && category !== 'all'
        ? games.filter(
            (g) =>
              g.product_category_id === category ||
              g.product_category?.slug === category ||
              g.product_category?.id === category
          )
        : games;

    return NextResponse.json(
      { success: true, games: filtered },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error', games: [] },
      { status: 500 }
    );
  }
}
