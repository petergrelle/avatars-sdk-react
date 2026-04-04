import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { customAvatarId } = await request.json();

    // The standard API call to Runway's servers
    const response = await fetch('https://api.runwayml.com/v1/avatars/connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAYML_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customAvatarId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Runway connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
