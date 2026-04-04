import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

const RUNWAY_BASE_URL = 'https://api.dev.runwayml.com';
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
    let sessionId = '';
    let sessionKey = '';
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      const status = await client.realtimeSessions.retrieve(session.id);
      if (status.status === 'READY') {
        sessionId = status.id;
        sessionKey = status.sessionKey;
        break;
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

    if (!sessionKey) {
      return NextResponse.json(
        { error: 'Session provisioning timed out' },
        { status: 504 },
      );
    }

    // Consume the session to get WebRTC credentials
    const consumeResponse = await fetch(
      `${RUNWAY_BASE_URL}/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionKey}`,
        },
      },
    );

    if (!consumeResponse.ok) {
      const errorText = await consumeResponse.text();
      return NextResponse.json(
        { error: `Failed to consume session: ${consumeResponse.status} ${errorText}` },
        { status: 500 },
      );
    }

    const { url, token, roomName } = await consumeResponse.json();

    // Return SessionCredentials expected by AvatarCall's connectUrl
    return NextResponse.json({
      sessionId,
      serverUrl: url,
      token,
      roomName,
    });

  } catch (error: any) {
    console.error('Runway API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
