import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

const client = new RunwayML();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const targetId = body.customAvatarId || body.avatarId;

    if (!targetId) {
        return NextResponse.json({ error: 'Missing Avatar ID' }, { status: 400 });
    }

    // The correct SDK method and payload structure for live video
    const session = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { 
        type: 'custom', 
        avatarId: targetId 
      }
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
