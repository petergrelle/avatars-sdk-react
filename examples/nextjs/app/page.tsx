'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
      <AvatarCall 
        avatarId="083e35dc-a076-479d-b724-96aa8462c429" 
        connectUrl="/api/avatar/connect"
      />
    </main>
  );
}
