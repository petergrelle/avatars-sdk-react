import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

const client = new RunwayML();

const RUNWAY_BASE_URL = 'https://api.dev.runwayml.com';

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
    let sessionKey: string | undefined;
    while (Date.now() < deadline) {
      const session = await client.realtimeSessions.retrieve(sessionId);
      if (session.status === 'READY') {
        sessionKey = session.sessionKey;
        break;
      }
      if (session.status === 'FAILED') {
        return NextResponse.json({ error: 'Session failed to start' }, { status: 502 });
      }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }

    if (!sessionKey) {
      return NextResponse.json({ error: 'Session creation timed out' }, { status: 504 });
    }

    // Consume the session to get WebRTC credentials
    const consumeRes = await fetch(
      `${RUNWAY_BASE_URL}/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionKey}`,
        },
      },
    );

    if (!consumeRes.ok) {
      const errorText = await consumeRes.text();
      return NextResponse.json(
        { error: `Failed to consume session: ${consumeRes.status} ${errorText}` },
        { status: 502 },
      );
    }

    const { url, token, roomName } = await consumeRes.json();

    return NextResponse.json({ sessionId, serverUrl: url, token, roomName });
  } catch (error: any) {
    console.error('Runway API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
