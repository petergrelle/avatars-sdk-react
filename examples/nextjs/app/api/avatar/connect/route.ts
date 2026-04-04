import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

const client = new RunwayML();

export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    if (!avatarId) {
      return NextResponse.json({ error: 'Missing avatarId' }, { status: 400 });
    }

    // 1. Create the session
    const { id: sessionId } = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'custom', avatarId },
    });

    // 2. Poll Runway until the video feed is ready (up to 30 seconds)
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const session = await client.realtimeSessions.retrieve(sessionId);
      
      if (session.status === 'READY') {
        return NextResponse.json({
          sessionId: session.id,
          sessionKey: session.sessionKey,
        });
      }
      
      // Wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({ error: 'Session connection timed out' }, { status: 504 });

  } catch (error: any) {
    console.error('Runway API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
