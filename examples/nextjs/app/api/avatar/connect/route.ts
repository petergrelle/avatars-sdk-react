import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

// The SDK automatically grabs your RUNWAYML_API_SECRET from Netlify
const client = new RunwayML();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Grabs the ID you typed into the basic tester box
    const targetId = body.customAvatarId || body.avatarId;

    if (!targetId) {
        return NextResponse.json({ error: 'Missing Avatar ID' }, { status: 400 });
    }

    // The official, secure way to create a Runway session
    const session = await client.avatars.sessions.create({
      avatarId: targetId
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionKey: session.sessionKey
    });
  } catch (error: any) {
    console.error('Runway connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
