import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/admin/settings';

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json({ success: true, settings });
}
