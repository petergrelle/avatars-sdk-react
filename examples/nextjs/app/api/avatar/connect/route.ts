import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    // 1. Look up the PIN in the database
    const response = await fetch(`${supabaseUrl}/rest/v1/access_codes?pin=eq.${pin}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const data = await response.json();

    // 2. Check if the PIN exists at all
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Invalid Passcode' }, { status: 401 });
    }

    const codeRecord = data[0];

    // 3. Check if they have run out of uses
    if (codeRecord.uses_remaining <= 0) {
      return NextResponse.json({ error: 'This passcode has run out of uses.' }, { status: 403 });
    }

    // 4. Do the math: subtract 1 from their remaining uses
    const newUsesCount = codeRecord.uses_remaining - 1;

    // 5. Update the database with the new countdown number
    await fetch(`${supabaseUrl}/rest/v1/access_codes?id=eq.${codeRecord.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ uses_remaining: newUsesCount })
    });

    // 6. Let them in!
    return NextResponse.json({ success: true, remaining: newUsesCount });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
