'use client';

import React from 'react';

type TabKey = 'play' | 'daily' | 'leaderboard' | 'profile';

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'play', label: 'Play', icon: '🎮' },
  { key: 'daily', label: 'Daily', icon: '🌤️' },
  { key: 'leaderboard', label: 'Leaders', icon: '🏅' },
  { key: 'profile', label: 'Profile', icon: '👤' }
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={active === tab.key ? 'active' : ''}
          aria-pressed={active === tab.key}
        >
          <span className="nav-icon" aria-hidden>
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
