'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

const PRESETS = [
  {
    id: '083e35dc-a076-479d-b724-96aa8462c429',
    name: 'Peter',
    subtitle: '',
    imageUrl: '/Whisk_trknjlknmy.jpg',
  },
];

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const selectedPreset = PRESETS.find((p) => p.id === activePreset);

  const closeModal = useCallback(() => {
    setActivePreset(null);
    setSession(null);
    setIsCreating(false);
  }, []);

  async function startCall(avatarId: string) {
    setIsCreating(true);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // THE FIX IS HERE: We explicitly tell the backend this is a customAvatarId
        body: JSON.stringify({ customAvatarId: avatarId }), 
      });
      setSession(await res.json());
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  }

  function handlePresetClick(presetId: string) {
    setActivePreset(presetId);
    startCall(presetId);
  }

  useEffect(() => {
    if (!activePreset) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePreset, closeModal]);

  const isModalOpen = activePreset && selectedPreset;

  return (
    <main className="page">
      <header className="header">
        <h1 className="title">Uncle Peter</h1>
        <p className="description">
          Click below to initiate a real-time conversation.
        </p>
      </header>

      <div className="presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="preset"
            onClick={() => handlePresetClick(preset.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preset.imageUrl}
              alt={preset.name}
              width={240}
              height={320}
              className="preset-avatar"
            />
            <div className="preset-info">
              <span className="preset-name">{preset.name}</span>
              <span className="preset-subtitle">{preset.subtitle}</span>
            </div>
          </button>
        ))}
      </div>

      {isModalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {`${selectedPreset?.name} · ${selectedPreset?.subtitle}`}
              </span>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>
            {session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={activePreset}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  avatarImageUrl={selectedPreset?.imageUrl}
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

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
