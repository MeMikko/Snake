'use client';

import { useEffect } from 'react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onComplete]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Welcome to Base Snake">
        <h2>Welcome to Base Snake</h2>
        <p className="subtle-text">A daily mini app built for quick, frictionless play.</p>
        <ul>
          <li>Auto-auth with Base MiniKit: no email, phone, or redirects.</li>
          <li>Swipe or use the D-pad to guide your snake without hitting walls.</li>
          <li>Check in daily to keep your streak alive and climb the leaderboard.</li>
        </ul>
        <button className="cta" onClick={onComplete} autoFocus>
          I'm ready to play
        </button>
      </div>
    </div>
  );
}
