import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/access_codes?pin=eq.${pin}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Invalid Passcode' }, { status: 401 });
    }

    const codeRecord = data[0];

    if (codeRecord.is_used) {
      return NextResponse.json({ error: 'Passcode has already been used' }, { status: 403 });
    }

    await fetch(`${supabaseUrl}/rest/v1/access_codes?id=eq.${codeRecord.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ is_used: true })
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
