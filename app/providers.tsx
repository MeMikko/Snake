'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface MiniUser {
  username?: string;
  avatarUrl?: string;
}

interface MiniKitContextValue {
  user: MiniUser | null;
  ready: boolean;
}

const MiniKitContext = createContext<MiniKitContextValue>({
  user: null,
  ready: false
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MiniUser | null>(null);
  const [ready, setReady] = useState(false);

  // 🔑 1. SIGNAL READY IMMEDIATELY
  useEffect(() => {
    window.MiniKit?.ready?.();
    setReady(true);
  }, []);

  // 🔑 2. LOAD USER ASYNC (NO BLOCKING)
  useEffect(() => {
    const interval = setInterval(() => {
      const kit = window.MiniKit;
      if (kit?.user?.username) {
        setUser({
          username: kit.user.username,
          avatarUrl: kit.user.avatarUrl
        });
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <MiniKitContext.Provider value={{ user, ready }}>
      {children}
    </MiniKitContext.Provider>
  );
}

export function useMiniKit() {
  return useContext(MiniKitContext);
}
