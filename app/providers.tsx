'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface MiniUser {
  username?: string;
  avatarUrl?: string;
}

interface MiniKitContextValue {
  user: MiniUser | null;
  isMiniApp: boolean;
}

const MiniKitContext = createContext<MiniKitContextValue>({
  user: null,
  isMiniApp: false
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MiniUser | null>(null);
  const isMiniApp =
    typeof window !== 'undefined' &&
    typeof (window as any).MiniKit !== 'undefined';

  // 🔑 Only signal ready INSIDE Mini App
  useEffect(() => {
    if (isMiniApp) {
      window.MiniKit?.ready?.();
    }
  }, [isMiniApp]);

  // 🔑 Load user only in Mini App
  useEffect(() => {
    if (!isMiniApp) return;

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
  }, [isMiniApp]);

  return (
    <MiniKitContext.Provider value={{ user, isMiniApp }}>
      {children}
    </MiniKitContext.Provider>
  );
}

export function useMiniKit() {
  return useContext(MiniKitContext);
}
