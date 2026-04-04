'use client';

import { useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function Home() {
  // Pre-filled with Uncle Peter, but you can type any ID into the box
  const [avatarId, setAvatarId] = useState('083e35dc-a076-479d-b724-96aa8462c429'); 
  const [session, setSession] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  async function connectToAvatar() {
    setIsConnecting(true);
    setError('');
    
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customAvatarId: avatarId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate with Runway API');
      }
      
      setSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', fontFamily: 'sans-serif' }}>
      <h1>Basic Avatar Tester</h1>
      
      {!session ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>Paste any Character ID to test the connection:</p>
          <input 
            value={avatarId} 
            onChange={(e) => setAvatarId(e.target.value)}
            style={{ width: '350px', padding: '12px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <br /><br />
          <button 
            onClick={connectToAvatar} 
            disabled={isConnecting}
            style={{ padding: '12px 24px', fontSize: '1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {isConnecting ? 'Connecting...' : 'Test Connection'}
          </button>
          
          {error && (
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '4px' }}>
              <strong>Connection Failed:</strong> {error}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <button 
            onClick={() => setSession(null)}
            style={{ marginBottom: '1rem', padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Hang Up
          </button>
          
          <div style={{ width: '100%', maxWidth: '800px', height: '600px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Loading Video Feed...</div>}>
              <AvatarCall 
                avatarId={avatarId} 
                sessionId={session.sessionId} 
                sessionKey={session.sessionKey} 
                onEnd={() => setSession(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </main>
  );
}
