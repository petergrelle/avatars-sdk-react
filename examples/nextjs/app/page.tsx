'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [activeAvatarId, setActiveAvatarId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Your default Uncle Peter ID for the Goobers
  const DEFAULT_AVATAR_ID = '083e35dc-a076-479d-b724-96aa8462c429';

  const closeModal = useCallback(() => {
    setActiveAvatarId(null);
    setSession(null);
    setIsCreating(false);
  }, []);

  async function startCall() {
    setIsCreating(true);

    // THE TRICK: Check the URL for a special ID when the button is clicked. 
    // If no special ID is found, it defaults to Uncle Peter.
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');
    const finalAvatarId = idFromUrl ? idFromUrl : DEFAULT_AVATAR_ID;

    setActiveAvatarId(finalAvatarId);

    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customAvatarId: finalAvatarId }),
      });
      setSession(await res.json());
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (!activeAvatarId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeAvatarId, closeModal]);

  return (
    <main className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
      
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>Incoming Video Call</h1>
        
        {/* You can replace this src with '/Whisk_trknjlknmy.jpg' if you want your face here */}
        <div style={{ width: '150px', height: '150px', backgroundColor: '#ddd', borderRadius: '50%', margin: '0 auto 1.5rem auto', overflow: 'hidden' }}>
           <img src="/Whisk_trknjlknmy.jpg" alt="Avatar Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <button
          onClick={startCall}
          disabled={isCreating}
          style={{ padding: '12px 32px', fontSize: '1.2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(40, 167, 69, 0.3)' }}
        >
          {isCreating ? 'Connecting...' : 'Accept Call'}
        </button>
      </div>

      {activeAvatarId ? (
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
