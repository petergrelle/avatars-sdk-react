import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

const client = new RunwayML();

export async function POST(req: Request) {
  try {
    const { avatarId, customAvatarId } = await req.json();
    const id = customAvatarId || avatarId;

    if (!id) {
      return NextResponse.json({ error: 'Missing avatarId' }, { status: 400 });
    }

    const { id: sessionId } = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'custom', avatarId: id },
    });

    // Poll until the session is ready
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const session = await client.realtimeSessions.retrieve(sessionId);
      if (session.status === 'READY') {
        return NextResponse.json({ sessionId, sessionKey: session.sessionKey });
      }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }

    return NextResponse.json({ error: 'Session creation timed out' }, { status: 504 });

  } catch (error: any) {
    console.error('Runway API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
