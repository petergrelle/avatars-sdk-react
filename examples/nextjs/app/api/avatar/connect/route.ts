import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

const client = new RunwayML();

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 60;

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

    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      const status = await client.realtimeSessions.retrieve(session.id);

      if (status.status === 'READY') {
        return NextResponse.json({
          sessionId: status.id,
          sessionKey: status.sessionKey,
        });
      }

      if (status.status === 'FAILED' || status.status === 'CANCELLED') {
        return NextResponse.json(
          { error: `Session ${status.status.toLowerCase()}` },
          { status: 500 },
        );
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return NextResponse.json({ error: 'Session timed out waiting to become ready' }, { status: 504 });

  } catch (error: any) {
    console.error('Runway API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
