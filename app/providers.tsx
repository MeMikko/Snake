'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface MiniUser {
  username?: string;
  avatarUrl?: string;
}

interface MiniKitContextValue {
  user: MiniUser | null;
}

const MiniKitContext = createContext<MiniKitContextValue>({
  user: null
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MiniUser | null>(null);

  // 🔑 TÄMÄ POISTAA SPLASHIN
  useEffect(() => {
    window.MiniKit?.ready?.();
  }, []);

  // 🔑 USER HAETAAN ASYNC, EI BLOKKAA INITIÄ
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
    <MiniKitContext.Provider value={{ user }}>
      {children}
    </MiniKitContext.Provider>
  );
}

export function useMiniKit() {
  return useContext(MiniKitContext);
}
