'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
      <AvatarCall 
        avatarId="eaa8b03d-0a6a-4bd0-83a9-039609b47808" 
        connectUrl="/api/avatar/connect"
      />
    </main>
  );
}
