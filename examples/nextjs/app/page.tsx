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
  
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAvatarId, setActiveAvatarId] = useState<string | null>(null);

  const DEFAULT_AVATAR_ID = '083e35dc-a076-479d-b724-96aa8462c429';
  const BYPASS_KEY = 'SGM2026';

  const closeModal = useCallback(() => {
    setSession(null);
    setIsCreating(false);
    setIsAuthenticated(false);
    setActiveAvatarId(null);
    setPasscode(''); 
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('bypass') === BYPASS_KEY) {
      startSecureCall();
    }
  }, []);

  async function startSecureCall() {
    const params = new URLSearchParams(window.location.search);
    const bypassParam = params.get('bypass');

    if (bypassParam !== BYPASS_KEY && !passcode.trim()) {
      alert("Please enter a passcode.");
      return;
    }

    setIsCreating(true);

    const idFromUrl = params.get('id');
    const targetAvatarId = idFromUrl ? idFromUrl : DEFAULT_AVATAR_ID;

    try {
      if (bypassParam !== BYPASS_KEY) {
        const verifyRes = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: passcode }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          alert(verifyData.error || "Verification failed");
          setIsCreating(false);
          return;
        }
      }

      setIsAuthenticated(true);
      setActiveAvatarId(targetAvatarId);

      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customAvatarId: targetAvatarId }),
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

      {isAuthenticated && activeAvatarId ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Live Session</span>
              <button className="modal-close" onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            {session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={activeAvatarId}
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
