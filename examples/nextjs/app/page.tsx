'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Security States for our Database Bouncer
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Your specific Uncle Peter Avatar ID
  const AVATAR_ID = '083e35dc-a076-479d-b724-96aa8462c429';

  const closeModal = useCallback(() => {
    setSession(null);
    setIsCreating(false);
    setIsAuthenticated(false);
    setPasscode(''); // Clear the passcode box when they hang up
  }, []);

  // This is our new, secure login function
  async function startSecureCall() {
    if (!passcode.trim()) {
      alert("Please enter a passcode.");
      return;
    }

    setIsCreating(true);

    try {
      // 1. Ask our new secure backend to verify the PIN
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: passcode }),
      });

      const verifyData = await verifyRes.json();

      // 2. If Supabase says no, stop here and show the error
      if (!verifyRes.ok) {
        alert(verifyData.error || "Verification failed");
        setIsCreating(false);
        return;
      }

      // 3. If Supabase says yes, it already burned the PIN! We are clear to connect.
      setIsAuthenticated(true);

      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customAvatarId: AVATAR_ID }),
      });
      setSession(await res.json());

    } catch (err) {
      console.error(err);
      alert("Connection error. Please try again.");
      setIsCreating(false);
      setIsAuthenticated(false);
    }
  }

  return (
    <main className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
      
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        
        {!isAuthenticated ? (
          <>
            <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>Secure Access</h1>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Enter your one-time passcode to connect.</p>
            
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter PIN"
              style={{ padding: '12px', width: '200px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1.2rem', textAlign: 'center', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem auto' }}
              onKeyDown={(e) => { if (e.key === 'Enter') startSecureCall(); }}
            />
            <button
              onClick={startSecureCall}
              disabled={isCreating}
              style={{ padding: '12px 32px', fontSize: '1.1rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isCreating ? 'Verifying...' : 'Unlock'}
            </button>
          </>
        ) : (
          <div>
            <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>Call in Progress</h1>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>Secure connection established.</p>
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Live Session</span>
              <button className="modal-close" onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            {session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={AVATAR_ID}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  onEnd={closeModal}
                  onError={console.error}
                />
              </Suspense>
            ) : isCreating ? (
              <div className="modal-loading">Establishing secure connection...</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
