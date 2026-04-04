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

    const session = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'custom', avatarId: id },
    });

    // Poll until the session is READY and has a sessionKey
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      const status = await client.realtimeSessions.retrieve(session.id);
      if (status.status === 'READY') {
        return NextResponse.json({
          sessionId: status.id,
          sessionKey: status.sessionKey,
        });
      }
      if (status.status === 'FAILED') {
        return NextResponse.json(
          { error: 'Session failed to provision' },
          { status: 500 },
        );
      }
      if (status.status === 'CANCELLED') {
        return NextResponse.json(
          { error: 'Session was cancelled' },
          { status: 500 },
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json(
      { error: 'Session provisioning timed out' },
      { status: 504 },
    );

  } catch (error: any) {
    console.error('Runway API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
