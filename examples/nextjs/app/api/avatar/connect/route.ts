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

    return NextResponse.json({
      sessionId: session.id,
      sessionKey: session.sessionKey,
    });

  } catch (error: any) {
    console.error('Runway API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
