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

export function MiniKitProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MiniUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const kit = window.MiniKit;
      if (kit?.user?.username) {
        setUser({
          username: kit.user.username,
          avatarUrl: kit.user.avatarUrl
        });
        kit.ready?.();
        setReady(true);
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
