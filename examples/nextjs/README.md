# Next.js Avatar Example

This example shows how to use `@runwayml/avatars-react` with [Next.js](https://nextjs.org/) App Router.

## Quick Start

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs my-avatar-app
cd my-avatar-app
npm install
```

Copy `.env.example` to `.env.local` and add your Runway API secret from [dev.runwayml.com](https://dev.runwayml.com/):

```bash
cp .env.example .env.local
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### Client Component

```tsx
'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function AvatarPage() {
  return (
    <AvatarCall
      avatarId="eaa8b03d-0a6a-4bd0-83a9-039609b47808"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

### API Route

The API route creates a realtime session with the Runway SDK:

```ts
// app/api/avatar/connect/route.ts
import RunwayML from '@runwayml/sdk';
import { NextResponse } from 'next/server';

const client = new RunwayML();

export async function POST(req: Request) {
  const { avatarId, customAvatarId } = await req.json();
  const id = customAvatarId || avatarId;

  const session = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'custom', avatarId: id },
  });

  return NextResponse.json({
    sessionId: session.id,
    sessionKey: session.sessionKey,
  });
}
```

## Custom Avatars

You can use custom avatars created in the [Runway Developer Portal](https://dev.runwayml.com/):

1. Create a custom avatar in the Developer Portal
2. Copy the avatar ID
3. Pass it to the API route

## Learn More

- [Runway Avatar SDK](https://github.com/runwayml/avatars-sdk-react)
- [Runway Developer Portal](https://dev.runwayml.com/)
- [Next.js Documentation](https://nextjs.org/docs)
