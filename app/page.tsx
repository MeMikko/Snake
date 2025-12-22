'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomNav from './components/BottomNav';
import LoadingButton from './components/LoadingButton';
import OnboardingModal from './components/OnboardingModal';
import SnakeGame from './components/SnakeGame';
import minikitConfig from '../minikit.config';
import MiniKit from '@base-org/minikit';

type TabKey = 'play' | 'daily' | 'leaderboard' | 'profile';

interface SessionState {
  username: string;
  avatarUrl?: string;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  streak: number;
}

const placeholderLeaderboard: LeaderboardEntry[] = [
  { username: 'Nova', score: 220, streak: 5 },
  { username: 'Orion', score: 195, streak: 4 },
  { username: 'Sol', score: 180, streak: 3 },
  { username: 'Lyra', score: 160, streak: 2 }
];

const STORAGE_KEYS = {
  onboarding: 'base-snake-onboarding',
  checkIn: 'base-snake-last-checkin',
  streak: 'base-snake-streak',
  theme: 'minikit-preferred-theme'
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('play');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [session, setSession] = useState<SessionState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEYS.onboarding);
    setOnboardingOpen(!seen);
    const storedStreak = Number(window.localStorage.getItem(STORAGE_KEYS.streak) ?? 0);
    setStreak(Number.isFinite(storedStreak) ? storedStreak : 0);
    const storedCheckIn = window.localStorage.getItem(STORAGE_KEYS.checkIn);
    setLastCheckIn(storedCheckIn);
    const high = Number(window.localStorage.getItem('snake-high-score') ?? 0);
    setBestScore(Number.isFinite(high) ? high : 0);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const kit = window.MiniKit ?? MiniKit;
    if (!kit) {
      setSession({ username: 'Player One' });
      return;
    }
    const connect = async () => {
      try {
        const existing = await kit.getSession?.();
        if (existing) {
          setSession({ username: existing.username, avatarUrl: existing.avatarUrl });
        } else if (kit.connectWallet) {
          const connected = await kit.connectWallet();
          setSession({ username: connected.username, avatarUrl: connected.avatarUrl });
        } else {
          setSession({ username: 'Player One' });
        }
      } catch (error) {
        setSession({ username: 'Player One' });
      } finally {
        await kit.ready?.(minikitConfig);
      }
    };
    connect();
  }, [isReady]);

  const leaderboardWithUser = useMemo(() => {
    const currentUser = session?.username ?? 'You';
    const merged = [...placeholderLeaderboard];
    const existingIndex = merged.findIndex((entry) => entry.username === currentUser);
    const streakValue = streak || 1;
    const userEntry: LeaderboardEntry = { username: currentUser, score: bestScore || 120, streak: streakValue };
    if (existingIndex >= 0) {
      merged[existingIndex] = userEntry;
    } else {
      merged.push(userEntry);
    }
    return merged.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [session?.username, bestScore, streak]);

  const avatarLetter = (session?.username ?? 'P').slice(0, 2).toUpperCase();

  const hasCheckedInToday = lastCheckIn === new Date().toDateString();

  async function dailyCheckIn() {
    setCheckInLoading(true);
    setCheckInMessage(null);
    try {
      await fakeSponsoredTx('dailyCheckIn');
      const today = new Date().toDateString();
      const previous = window.localStorage.getItem(STORAGE_KEYS.checkIn);
      window.localStorage.setItem(STORAGE_KEYS.checkIn, today);
      setLastCheckIn(today);
      const updatedStreak = today === previous ? streak : streak + 1 || 1;
      setStreak(updatedStreak);
      window.localStorage.setItem(STORAGE_KEYS.streak, String(updatedStreak));
      setCheckInMessage('Daily check-in recorded with a sponsored transaction.');
    } catch (error) {
      setCheckInMessage('Unable to check in right now. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  }

  async function submitScore(score: number) {
    setSubmitLoading(true);
    try {
      await fakeSponsoredTx('submitScore', score);
      setCheckInMessage(`Score ${score} submitted for leaderboard review.`);
    } catch (error) {
      setCheckInMessage('Unable to submit score at the moment.');
    } finally {
      setSubmitLoading(false);
    }
  }

  function handleScoreUpdate(score: number) {
    setLastScore(score);
    if (score > bestScore) {
      setBestScore(score);
    }
  }

  function completeOnboarding() {
    window.localStorage.setItem(STORAGE_KEYS.onboarding, 'true');
    setOnboardingOpen(false);
  }

  function toggleTheme(next: 'light' | 'dark') {
    window.localStorage.setItem(STORAGE_KEYS.theme, next);
    document.documentElement.dataset.theme = next;
  }

  return (
    <>
      <main>
        <header className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className="user-avatar" aria-hidden>{avatarLetter}</div>
          <div>
            <p className="subtle-text" style={{ margin: 0 }}>Signed in</p>
            <strong>{session?.username ?? 'Connecting...'}</strong>
          </div>
        </header>

        {activeTab === 'play' && (
          <section className="game-wrapper">
            <div className="section-card">
              <h2 className="section-title">Daily Snake</h2>
              <p className="subtle-text">Swipe or tap the D-pad to collect pellets without hitting walls.</p>
            </div>
            <SnakeGame onScore={handleScoreUpdate} />
            <div className="section-card">
              <div className="score-row">
                <div className="pill">Latest: {lastScore}</div>
                <div className="pill">Best: {bestScore}</div>
              </div>
              <LoadingButton
                label="Submit score"
                loading={submitLoading}
                onClick={() => submitScore(bestScore || lastScore)}
                disabled={!lastScore && !bestScore}
              />
            </div>
          </section>
        )}

        {activeTab === 'daily' && (
          <section className="section-card">
            <h2 className="section-title">Daily check-in</h2>
            <p className="subtle-text">Keep your streak alive with a single tap.</p>
            <div className="status-card" style={{ marginTop: 12 }}>
              <div>
                <strong>Current streak</strong>
                <p className="subtle-text" style={{ margin: 0 }}>{streak} day(s)</p>
              </div>
              <span className="badge">{hasCheckedInToday ? 'Checked-in' : 'Pending'}</span>
            </div>
            <LoadingButton
              label={hasCheckedInToday ? 'Come back tomorrow' : 'Check in'}
              loading={checkInLoading}
              disabled={hasCheckedInToday}
              style={{ marginTop: 14, width: '100%' }}
              onClick={dailyCheckIn}
            />
          </section>
        )}

        {activeTab === 'leaderboard' && (
          <section className="section-card">
            <h2 className="section-title">Leaderboard</h2>
            <p className="subtle-text">Top daily scores across Base Snake players.</p>
            <ul className="leaderboard-list" style={{ marginTop: 12 }}>
              {leaderboardWithUser.map((entry, idx) => (
                <li className="leaderboard-item" key={entry.username}>
                  <div className="flex-row">
                    <span className="badge">#{idx + 1}</span>
                    <strong>{entry.username}</strong>
                  </div>
                  <div className="flex-row">
                    <span className="pill">Score {entry.score}</span>
                    <span className="subtle-text">Streak {entry.streak}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="section-card">
            <h2 className="section-title">Profile</h2>
            <p className="subtle-text">Update theme preferences and review app basics.</p>
            <div className="score-row" style={{ marginTop: 12 }}>
              <button className="cta" onClick={() => toggleTheme('light')}>Light</button>
              <button className="cta" onClick={() => toggleTheme('dark')}>Dark</button>
            </div>
            <div style={{ marginTop: 16 }}>
              <p className="subtle-text">Sponsored transaction placeholders:</p>
              <code>dailyCheckIn()</code> and <code>submitScore(score)</code>
            </div>
          </section>
        )}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
      <OnboardingModal open={onboardingOpen} onComplete={completeOnboarding} />
      {checkInMessage && (
        <div className="section-card" style={{ position: 'fixed', bottom: 90, left: 16, right: 16 }}>
          <p style={{ margin: 0 }}>{checkInMessage}</p>
        </div>
      )}
    </>
  );
}

async function fakeSponsoredTx(action: 'dailyCheckIn' | 'submitScore', score?: number) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (action === 'submitScore' && typeof score !== 'number') {
    throw new Error('Score missing');
  }
  return { action, score };
}
